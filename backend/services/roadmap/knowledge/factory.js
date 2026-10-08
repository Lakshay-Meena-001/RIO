/**
 * Pure constructors for canonical roadmap knowledge.
 *
 * IMPORTANT:
 * This module must never import the roadmap registry.
 */

export const createKnowledgeNode = ({
  id,
  title,
  category,
  importance = "important",
  description = "",
  whyItMatters = "",
  prerequisites = [],
  enables = [],
  alternatives = [],
  related = [],
  guidance = {},
  practice = {},
  metadata = {},
}) => {
  if (!id) {
    throw new Error("Knowledge node requires an id.");
  }

  if (!title) {
    throw new Error(`Knowledge node "${id}" requires a title.`);
  }

  return {
    id,
    title,
    category,
    importance,
    description,
    whyItMatters,
    prerequisites,
    enables,
    alternatives,
    related,

    guidance: {
      beginner: guidance.beginner || "",
      alreadyKnown: guidance.alreadyKnown || "",
      partialKnowledge: guidance.partialKnowledge || "",
      nextStep: guidance.nextStep || "",
    },

    practice: {
      learn: practice.learn || [],
      practice: practice.practice || [],
      build: practice.build || [],
      validate: practice.validate || [],
    },

    metadata: {
      ...metadata,
    },
  };
};

export const createKnowledgeEdge = ({
  source,
  target,
  type = "recommended-next",
  reason = "",
}) => {
  if (!source || !target) {
    throw new Error("Knowledge edge requires source and target.");
  }

  return {
    source,
    target,
    type,
    reason,
  };
};

export const createRoadmapTemplate = ({
  id,
  version = 1,
  type = "role",
  title,
  description = "",
  goal = "",
  nodes = [],
  edges = [],
  alternatives = [],
  metadata = {},
}) => {
  if (!id) {
    throw new Error("Roadmap template requires an id.");
  }

  if (!title) {
    throw new Error(`Roadmap template "${id}" requires a title.`);
  }

  return {
    id,
    version,
    type,
    title,
    description,
    goal,
    nodes,
    edges,
    alternatives,
    metadata: {
      ...metadata,
    },
  };
};
