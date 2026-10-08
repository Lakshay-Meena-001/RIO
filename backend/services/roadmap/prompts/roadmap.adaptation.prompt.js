import { ROADMAP_GENERATION_MODES } from "../constants/roadmap.constants.js";

// ============================================================
// HELPERS
// ============================================================

function safeJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return "{}";
  }
}

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function compactArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value;
}

// ============================================================
// CANONICAL CONTEXT
// ============================================================

/**
 * The LLM only needs enough canonical information to classify
 * the user's relationship with each roadmap node.
 *
 * The full canonical roadmap remains the backend source of truth.
 * We deliberately do NOT send descriptions, resources,
 * guidance, alternatives, metadata, etc.
 */
function buildCanonicalNodeContext(template) {
  return template.nodes.map((node) => ({
    id: node.id,
    title: node.title,
    importance: node.importance,
    prerequisites: compactArray(node.prerequisites),
  }));
}

// ============================================================
// USER CONTEXT
// ============================================================

/**
 * Resume data can become very large.
 *
 * Adaptation only needs evidence of existing knowledge,
 * therefore we keep the useful evidence fields and discard
 * processing/analysis metadata and other unnecessary payload.
 */
function buildCompactResumeContext(resume) {
  if (!resume || typeof resume !== "object") {
    return null;
  }

  return {
    profile: resume.profile || null,
    summary: normalizeText(resume.summary),

    skills: compactArray(resume.skills),
    technologies: compactArray(resume.technologies),

    experience: compactArray(resume.experience),
    projects: compactArray(resume.projects),

    education: compactArray(resume.education),
    certifications: compactArray(resume.certifications),
    achievements: compactArray(resume.achievements),
    languages: compactArray(resume.languages),
  };
}

function buildUserContext({ generationMode, userContext }) {
  const {
    role = "",
    level = "",
    target = {},
    availableHoursPerDay = null,
    currentSkills = [],
    manualSkills = [],
    resume = null,
    customRequirements = {},
  } = userContext || {};

  return {
    generationMode,

    role: normalizeText(role),

    level,

    target,

    availableHoursPerDay,

    currentSkills: compactArray(currentSkills),

    manualSkills: compactArray(manualSkills),

    resume: buildCompactResumeContext(resume),

    customRequirements,
  };
}

// ============================================================
// SYSTEM INSTRUCTIONS
// ============================================================

const SYSTEM_INSTRUCTIONS = `
You are RIO's Roadmap Adaptation Engine.

Your job is to adapt an EXISTING CANONICAL ROADMAP
to a user's known skills, experience, goals, and requirements.

The canonical roadmap is the source of truth.

RULES:

1. NEVER invent roadmap nodes.
2. NEVER invent node IDs.
3. NEVER remove canonical nodes.
4. ONLY use node IDs explicitly provided in the canonical roadmap.
5. Preserve canonical roadmap ordering.
6. Preserve canonical prerequisites.
7. Do not create new technologies, topics, phases,
   dependencies, resources, projects, or learning paths.
8. You may assign only these statuses:
   - completed
   - learning
   - not_started
   - skipped
9. "completed" requires strong evidence that the user
   already knows or has demonstrated the topic.
10. "learning" means partial knowledge or a strong current
    learning focus.
11. "not_started" means the topic is needed but evidence
    of knowledge is insufficient.
12. "skipped" should be rare and only used when the topic
    is genuinely unnecessary or explicitly excluded.
13. A resume keyword alone is NOT proof of mastery.
14. Distinguish between mentioned, partial, and demonstrated
    knowledge.
15. Avoid FOMO.
16. Respect prerequisites.
17. Compensation is a planning signal, NOT a guarantee.
18. Do not reorder the canonical roadmap.
19. Return ONLY valid JSON.
20. Do not return markdown or commentary.

Output shape:

{
  "nodes": [
    {
      "nodeId": "canonical-node-id",
      "status": "completed|learning|not_started|skipped"
    }
  ],
  "summary": "short adaptation summary"
}

The nodes array may contain only canonical node IDs.
`;

// ============================================================
// PROMPT BUILDER
// ============================================================

function buildRoadmapAdaptationPrompt({
  generationMode,
  template,
  userContext = {},
}) {
  if (
    generationMode !== ROADMAP_GENERATION_MODES.RESUME &&
    generationMode !== ROADMAP_GENERATION_MODES.CUSTOM
  ) {
    throw new Error(`Invalid roadmap adaptation mode: ${generationMode}`);
  }

  const canonicalNodes = buildCanonicalNodeContext(template);

  const normalizedUserContext = buildUserContext({
    generationMode,
    userContext,
  });

  return `
${SYSTEM_INSTRUCTIONS}

============================================================
ADAPTATION MODE
============================================================

${generationMode}

============================================================
CANONICAL ROADMAP
============================================================

Template ID:
${template.id}

Template Version:
${template.version}

Title:
${template.title}

Goal:
${template.goal}

CANONICAL NODES:

${safeJson(canonicalNodes)}

============================================================
USER CONTEXT
============================================================

${safeJson(normalizedUserContext)}

============================================================
TASK
============================================================

Compare the user's evidence against every canonical roadmap node.

For each node decide:

completed:
Strong evidence of existing knowledge or demonstrated work.

learning:
Partial knowledge or an important current focus.

not_started:
Needed but insufficient evidence of knowledge.

skipped:
Only when clearly unnecessary or explicitly excluded.

IMPORTANT:

Do not treat resume keywords as mastery.

For example, "Worked with React" does not automatically
prove mastery of React architecture, performance, testing,
or advanced state management.

Use evidence from:
- skills
- technologies
- experience
- projects
- education
- certifications
- achievements
- explicit user requirements

Respect prerequisites.

If evidence is ambiguous, prefer the conservative status.

Return every canonical node exactly once.

Return ONLY JSON:

{
  "nodes": [
    {
      "nodeId": "canonical-node-id",
      "status": "completed|learning|not_started|skipped"
    }
  ],
  "summary": "short explanation of the adaptation"
}
`;
}

// ============================================================
// EXPORT
// ============================================================

export { buildRoadmapAdaptationPrompt };

export default {
  buildRoadmapAdaptationPrompt,
};
