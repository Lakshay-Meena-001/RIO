import {
  ROADMAP_GENERATION_MODES,
  ROADMAP_NODE_STATUSES,
} from "../constants/roadmap.constants.js";

// ============================================================
// HELPERS
// ============================================================

function safeJson(value) {
  try {
    return JSON.stringify(value, null, 2);
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

function buildCanonicalNodeContext(template) {
  return template.nodes.map((node) => ({
    id: node.id,

    title: node.title,

    category: node.category,

    importance: node.importance,

    description: node.description,

    whyItMatters: node.whyItMatters,

    prerequisites: node.prerequisites || [],

    enables: node.enables || [],

    alternatives: node.alternatives || [],

    guidance: node.guidance || {},
  }));
}

function buildCanonicalEdgeContext(template) {
  return (template.edges || []).map((edge) => ({
    from: edge.from,

    to: edge.to,

    type: edge.type,
  }));
}

// ============================================================
// SYSTEM INSTRUCTIONS
// ============================================================

const SYSTEM_INSTRUCTIONS = `
You are RIO's Roadmap Adaptation Engine.

Your job is NOT to invent a roadmap.

Your job is to adapt an EXISTING CANONICAL ROADMAP
to a user's known skills, experience, goals, and requirements.

The canonical roadmap is the source of truth.

You MUST follow these rules:

1. NEVER invent roadmap nodes.

2. NEVER invent node IDs.

3. NEVER remove canonical nodes from the actual roadmap.

4. NEVER create new technologies, topics, phases, dependencies,
   resources, certifications, projects, or learning paths.

5. ONLY use node IDs explicitly provided in the canonical roadmap.

6. Preserve the canonical roadmap ordering.

7. Preserve canonical prerequisites and dependencies.

8. You may determine whether a canonical node is:
   - completed
   - learning
   - not_started
   - skipped

9. "completed" means the user's evidence strongly indicates
   that they already know or have demonstrated the topic.

10. "learning" means the topic is relevant and the user appears
    to have partial knowledge or should focus on it now.

11. "not_started" means the user should learn it and there is
    insufficient evidence that they already know it.

12. "skipped" should be used sparingly.
    Use it only when the user's context clearly makes the topic
    unnecessary or explicitly excluded.

13. Do NOT mark a topic completed merely because the user
    mentioned the technology once.

14. Distinguish between:
    - mentioned
    - partial knowledge
    - demonstrated knowledge

15. Avoid FOMO.
    Do not force advanced topics merely because they exist
    in the canonical roadmap.

16. The user's target role, level, available time, compensation
    goal, and explicit requirements can affect emphasis.

17. Compensation is a planning signal, NOT a guarantee.
    Never promise salary outcomes.

18. Do not create a completely new roadmap structure.

19. Do not reorder canonical nodes.

20. Return ONLY valid JSON.

21. Do not wrap JSON in markdown.

22. Do not add explanations outside the JSON object.

The final response must have this exact top-level shape:

{
  "nodes": [
    {
      "nodeId": "canonical-node-id",
      "status": "completed|learning|not_started|skipped"
    }
  ],
  "summary": "short adaptation summary"
}

The "nodes" array may contain only canonical node IDs.

The summary must be concise and explain the broad adaptation,
not introduce new roadmap content.
`;

// ============================================================
// USER CONTEXT
// ============================================================

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

    currentSkills,

    manualSkills,

    resume,

    customRequirements,
  };
}

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

  const canonicalEdges = buildCanonicalEdgeContext(template);

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

Description:
${template.description}

Goal:
${template.goal}


------------------------------------------------------------
CANONICAL NODES
------------------------------------------------------------

${safeJson(canonicalNodes)}


------------------------------------------------------------
CANONICAL DEPENDENCIES
------------------------------------------------------------

${safeJson(canonicalEdges)}


============================================================
USER CONTEXT
============================================================

${safeJson(normalizedUserContext)}


============================================================
ADAPTATION TASK
============================================================

Analyze the user's context against the canonical roadmap.

For every canonical node, decide the most appropriate status:

- completed
- learning
- not_started
- skipped

Use evidence conservatively.

If the user clearly demonstrates knowledge:
→ completed

If the user has partial knowledge or the topic is currently
the most relevant next learning area:
→ learning

If the topic is needed but there is not enough evidence
of knowledge:
→ not_started

If the topic is genuinely unnecessary or explicitly excluded:
→ skipped

IMPORTANT:

Do not treat a user's resume keyword as proof of mastery.

Example:

If the resume says:
"Worked with React"

that alone does NOT prove mastery of:
- React architecture
- performance
- testing
- advanced state management

Use reasonable evidence from experience, projects,
responsibilities, and explicit user input.

Respect prerequisites.

If a later topic appears known but its prerequisite is clearly
missing, prefer a conservative status rather than pretending
the prerequisite does not matter.

Do not manufacture missing evidence.

Do not invent roadmap nodes.

Do not modify the canonical graph.

Do not reorder nodes.

The final output must contain canonical node IDs only.


============================================================
OUTPUT
============================================================

Return ONLY this JSON object:

{
  "nodes": [
    {
      "nodeId": "canonical-node-id",
      "status": "completed|learning|not_started|skipped"
    }
  ],
  "summary": "short explanation of how the canonical roadmap was adapted"
}

Return no markdown.
Return no commentary.
Return no additional keys.
`;
}

// ============================================================
// EXPORT
// ============================================================

export { buildRoadmapAdaptationPrompt };

export default {
  buildRoadmapAdaptationPrompt,
};
