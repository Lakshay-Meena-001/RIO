const BASE_SYSTEM_INSTRUCTIONS = `
You are RIO's Roadmap Adaptation Engine.

Your job is NOT to invent a new roadmap.

RIO already has a canonical roadmap knowledge base.
You must adapt that canonical roadmap to the user's current knowledge,
career goal, available time, and requirements.

STRICT RULES:

1. You may ONLY use node IDs that exist in the canonical roadmap.
2. NEVER invent a new node ID.
3. NEVER create a new topic outside the canonical roadmap.
4. NEVER rename a canonical node ID.
5. Preserve prerequisite relationships.
6. Do not remove a prerequisite merely because the user already knows
   a topic. Instead, mark it appropriately for the user's knowledge.
7. If the user already knows a topic strongly, de-emphasize it.
8. If the user partially knows a topic, keep it but emphasize it appropriately.
9. If the user is missing an important topic, keep it in the roadmap.
10. Do not create unnecessary learning work merely to make the roadmap longer.
11. Avoid FOMO.
12. Do not optimize for completing the maximum number of topics.
13. Optimize for the user's stated target and current state.
14. Respect the canonical roadmap progression.
15. Do not break prerequisite order.
16. Do not invent resources.
17. Do not invent certifications.
18. Do not invent companies or job requirements.
19. Do not fabricate facts about the user's experience.
20. Return valid JSON only.
`;

const OUTPUT_SCHEMA = `
Return exactly this JSON structure:

{
  "summary": "Short explanation of how the roadmap was adapted.",
  "nodes": [
    {
      "nodeId": "canonical-node-id",
      "status": "not_started"
    }
  ]
}

Allowed status values:

- "not_started"
- "learning"
- "completed"
- "skipped"

IMPORTANT:

- nodeId MUST exist in the canonical roadmap.
- Do not return duplicate node IDs.
- Do not return unknown node IDs.
- Do not return markdown.
- Do not wrap the JSON in code fences.
`;

function buildResumeInstructions(context) {
  return `
MODE: RESUME-ADAPTIVE ROADMAP

The user's resume is provided as context.

Analyze the user's demonstrated knowledge from the resume.

Classify the user's relationship with canonical topics conceptually as:

- known
- partially_known
- missing

Then adapt the roadmap accordingly.

For topics strongly demonstrated by the resume:

- Prefer "completed" only when the evidence is strong enough.
- Otherwise use "not_started" and allow the application layer to
  determine learning emphasis.
- Do not assume deep mastery merely because a technology appears once.

For partially demonstrated topics:

- Keep them in the roadmap.
- Do not unnecessarily restart from absolute beginner material.

For missing foundational topics:

- Keep them.
- Preserve their prerequisite position.

The resume is evidence, not absolute truth.
Do not claim mastery without sufficient evidence.

RESUME CONTEXT:
${JSON.stringify(context.resume || {}, null, 2)}
`;
}

function buildCustomInstructions(context) {
  return `
MODE: CUSTOM ROADMAP

The user has provided custom requirements.

Adapt the canonical roadmap to those requirements.

Pay attention to:

- target role
- career goals
- technologies
- exclusions
- project preferences
- available time
- compensation target
- current level

If the user asks to include something that does not exist
in the canonical roadmap:

DO NOT invent a new node.

Use the closest relevant canonical node only when it genuinely matches.

If the user asks to exclude a topic:

- Skip it only if doing so does not violate important prerequisites.
- If it is a prerequisite for another required topic, preserve it
  and explain the dependency in the summary.

CUSTOM REQUIREMENTS:
${JSON.stringify(context.customRequirements || {}, null, 2)}
`;
}

function buildUserContext(context) {
  return `
USER CONTEXT:

Role:
${context.user?.role || "Not specified"}

Level:
${context.user?.level || "Not specified"}

Available hours per day:
${context.user?.availableHoursPerDay ?? "Not specified"}

Target:
${JSON.stringify(context.user?.target || {}, null, 2)}

Manual skills:
${JSON.stringify(context.user?.manualSkills || [], null, 2)}
`;
}

function buildCanonicalContext(context) {
  return `
CANONICAL ROADMAP:

Template:
${JSON.stringify(
  {
    id: context.template?.id,
    version: context.template?.version,
    title: context.template?.title,
    description: context.template?.description,
    goal: context.template?.goal,
  },
  null,
  2,
)}

PHASE PROGRESSION:
${JSON.stringify(context.template?.progression || [], null, 2)}

CANONICAL NODES:
${JSON.stringify(
  (context.template?.nodes || []).map((node) => ({
    id: node.id,
    title: node.title,
    category: node.category,
    importance: node.importance,
    description: node.description,
    whyItMatters: node.whyItMatters,
    prerequisites: node.prerequisites,
    enables: node.enables,
    guidance: node.guidance,
  })),
  null,
  2,
)}

CANONICAL EDGES:
${JSON.stringify(context.template?.edges || [], null, 2)}

ALTERNATIVE PATHS:
${JSON.stringify(context.template?.alternatives || [], null, 2)}
`;
}

/**
 * Build the complete prompt sent to the adaptation model.
 */
function buildRoadmapAdaptationPrompt({ mode, context }) {
  if (!context) {
    throw new Error("Roadmap adaptation context is required");
  }

  let modeInstructions = "";

  if (mode === "resume") {
    modeInstructions = buildResumeInstructions(context);
  } else if (mode === "custom") {
    modeInstructions = buildCustomInstructions(context);
  } else {
    throw new Error(`Unsupported roadmap adaptation mode: ${mode}`);
  }

  return `
${BASE_SYSTEM_INSTRUCTIONS}

${modeInstructions}

${buildUserContext(context)}

${buildCanonicalContext(context)}

${OUTPUT_SCHEMA}

FINAL CHECK BEFORE RETURNING:

- Every nodeId exists in the canonical roadmap.
- No duplicate node IDs.
- No invented topics.
- No broken prerequisite order.
- No unsupported assumptions about the user.
- Output is valid JSON.
- Output contains no markdown.
`;
}

export { buildRoadmapAdaptationPrompt };

export default buildRoadmapAdaptationPrompt;
