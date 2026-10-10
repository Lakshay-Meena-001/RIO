import { getLLMClient } from "../config/llm.js";
import { ROADMAP_GENERATION } from "../constants/roadmap.constants.js";
import {
  parseAndValidateGeneratedBlueprint,
  parseAndValidateGeneratedPhase,
} from "../validators/roadmap.validator.js";

const BLUEPRINT_MAX_TOKENS = 4000;
const PHASE_MAX_TOKENS = 12000;

function createSystemPrompt() {
  return `
You are a precise technical curriculum architect.

Return only valid JSON when JSON is requested.
Follow the supplied schema exactly.
Never invent resource URLs.
Distinguish required topics from optional alternatives.
Preserve prerequisites and dependency order.
Do not generate the entire detailed curriculum when asked for a blueprint
or a single phase.
`.trim();
}

function createValidationError(message, code = "INVALID_AI_RESPONSE") {
  const error = new Error(message);
  error.code = code;
  return error;
}

function parseAndValidateOrThrow(validation, operation) {
  if (!validation.valid) {
    throw createValidationError(
      `Invalid AI response during ${operation}: ${validation.errors.join(" ")}`,
    );
  }

  return validation.data;
}

function validateBlueprintPrerequisites(blueprint) {
  const phaseIds = new Set(blueprint.phases.map((phase) => phase.id));

  for (const phase of blueprint.phases) {
    for (const prerequisiteId of phase.prerequisites) {
      if (!phaseIds.has(prerequisiteId)) {
        throw createValidationError(
          `Phase "${phase.id}" references unknown prerequisite "${prerequisiteId}".`,
        );
      }

      const prerequisite = blueprint.phases.find(
        (item) => item.id === prerequisiteId,
      );

      if (prerequisite.order >= phase.order) {
        throw createValidationError(
          `Phase "${phase.id}" depends on a later or equal phase.`,
        );
      }
    }
  }

  return blueprint;
}

function validatePhaseEnvelope(result, roadmap, packageType, blueprintPhase) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw createValidationError("Generated phase response must be an object.");
  }

  if (result.roadmapId !== roadmap.id) {
    throw createValidationError(
      "Generated phase belongs to a different roadmap.",
    );
  }

  if (result.packageId !== packageType) {
    throw createValidationError(
      "Generated phase package does not match the request.",
    );
  }

  return parseAndValidateOrThrow(
    validatePhaseResult(result.phase, blueprintPhase),
    `phase ${blueprintPhase.id} generation`,
  );
}

function validatePhaseResult(phase, blueprintPhase) {
  return parseAndValidateGeneratedPhase(JSON.stringify(phase), {
    phaseId: blueprintPhase.id,
    order: blueprintPhase.order,
  });
}

export async function generateRoadmapBlueprint({
  roadmap,
  packageType,
  schemaVersion,
}) {
  if (!roadmap || typeof roadmap.id !== "string" || !roadmap.id.trim()) {
    throw new Error("A valid catalog roadmap is required.");
  }

  if (typeof packageType !== "string" || !packageType.trim()) {
    throw new Error("A valid package type is required.");
  }

  const client = await getLLMClient();

  const prompt = `
Create a compact roadmap blueprint only.

Do not generate detailed topic explanations, exercises, resource lists,
or project implementations.

Return a JSON object with this exact structure:
{
  "roadmapId": "${roadmap.id}",
  "title": "Roadmap title",
  "summary": "Roadmap summary",
  "packageId": "${packageType}",
  "schemaVersion": ${schemaVersion},
  "phases": [
    {
      "id": "phase-0",
      "order": 0,
      "title": "Phase title",
      "purpose": "Phase purpose",
      "prerequisites": [],
      "learningOutcomes": [],
      "topicsOutline": [
        "Topic 1",
        "Topic 2"
      ]
    }
  ],
  "learningPathOutlines": [],
  "decisionGuideOutlines": [],
  "capstoneOutlines": []
}

RULES:
- Create a complete learning sequence appropriate for the selected package.
- Respect the maximum of ${ROADMAP_GENERATION.MAX_PHASES} phases.
- Phase order must start at 0 and increase sequentially.
- Phase IDs must be unique.
- Prerequisites must reference earlier phase IDs only.
- Include foundations before advanced concepts.
- Include relevant technology alternatives and specializations.
- Do not force a single framework when multiple options are appropriate.
- Keep topicsOutline as an array of strings.
- Return JSON only.

Catalog roadmap:
${JSON.stringify(roadmap)}

Selected package:
${packageType}
`.trim();

  const raw = await client.generate(prompt, {
    systemPrompt: createSystemPrompt(),
    maxTokens: BLUEPRINT_MAX_TOKENS,
    responseFormat: "json_object",
  });

  const blueprint = parseAndValidateOrThrow(
    parseAndValidateGeneratedBlueprint(raw, {
      roadmapId: roadmap.id,
      packageId: packageType,
    }),
    "blueprint generation",
  );

  return validateBlueprintPrerequisites(blueprint);
}

export async function generateRoadmapPhase({
  roadmap,
  packageType,
  blueprint,
  phaseId,
  completedPhases = [],
}) {
  if (!roadmap || !blueprint) {
    throw new Error("Roadmap and blueprint are required.");
  }

  if (!Array.isArray(blueprint.phases)) {
    throw new Error("Blueprint phases must be an array.");
  }

  const blueprintPhase = blueprint.phases.find((phase) => phase.id === phaseId);

  if (!blueprintPhase) {
    throw new Error(`Phase "${phaseId}" does not exist in the blueprint.`);
  }

  const completedPhaseIds = new Set(completedPhases.map((phase) => phase.id));

  const missingPrerequisites = blueprintPhase.prerequisites.filter(
    (prerequisiteId) => !completedPhaseIds.has(prerequisiteId),
  );

  if (missingPrerequisites.length > 0) {
    throw createValidationError(
      `Generate prerequisite phases first: ${missingPrerequisites.join(", ")}.`,
      "PHASE_PREREQUISITES_INCOMPLETE",
    );
  }

  const client = await getLLMClient();

  const prompt = `
Generate exactly one detailed phase for this roadmap.

Return only this JSON structure:
{
  "roadmapId": "${roadmap.id}",
  "packageId": "${packageType}",
  "phase": {
    "id": "${blueprintPhase.id}",
    "order": ${blueprintPhase.order},
    "title": "Phase title",
    "purpose": "Phase purpose",
    "prerequisites": [],
    "learningOutcomes": [],
    "topics": [
      {
        "id": "topic-id",
        "title": "Topic title",
        "description": "Detailed explanation of what to learn",
        "importance": "Why it matters",
        "type": "core",
        "prerequisites": [],
        "estimatedHours": 4,
        "subtopics": [],
        "practiceTasks": [],
        "resources": [
          {
            "title": "Resource title",
            "url": "https://official-resource.example",
            "type": "documentation",
            "purpose": "How this resource helps"
          }
        ],
        "completionCriteria": [],
        "options": [
          {
            "id": "option-id",
            "title": "Alternative or specialization",
            "description": "Explanation",
            "type": "alternative",
            "prerequisites": [],
            "whenToChoose": "Decision guidance",
            "tradeoffs": []
          }
        ]
      }
    ],
    "projects": [],
    "completionCriteria": []
  }
}

RULES:
- Follow the blueprint exactly for phase ID, order, purpose and scope.
- Generate only this phase, not the complete roadmap.
- Include practical explanations, exercises, prerequisites and completion criteria.
- Include technology alternatives and decision guidance where relevant.
- Distinguish core topics from optional and advanced topics.
- Use official documentation and genuinely known URLs only.
- Never invent URLs. If a URL cannot be verified from your knowledge, omit that resource.
- Keep topic IDs unique across the complete roadmap.
- Generate at most ${ROADMAP_GENERATION.MAX_TOPICS_PER_PHASE} topics.
- Include no more than ${ROADMAP_GENERATION.MAX_RESOURCES_PER_TOPIC} resources per topic.
- Avoid unnecessary duplication with completed phases.
- Return valid JSON only.

Catalog roadmap:
${JSON.stringify(roadmap)}

Selected package:
${packageType}

Complete blueprint:
${JSON.stringify(blueprint)}

Requested phase:
${JSON.stringify(blueprintPhase)}

Previously generated phases:
${JSON.stringify(completedPhases)}
`.trim();

  const raw = await client.generate(prompt, {
    systemPrompt: createSystemPrompt(),
    maxTokens: PHASE_MAX_TOKENS,
    responseFormat: "json_object",
  });

  let result;

  try {
    result = JSON.parse(raw);
  } catch {
    throw createValidationError(
      `The LLM returned invalid JSON during phase ${phaseId} generation.`,
    );
  }

  return validatePhaseEnvelope(result, roadmap, packageType, blueprintPhase);
}

export default {
  generateRoadmapBlueprint,
  generateRoadmapPhase,
};
