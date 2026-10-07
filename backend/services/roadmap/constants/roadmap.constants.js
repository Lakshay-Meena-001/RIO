const NODE_STATUS = Object.freeze({
  NOT_STARTED: "not_started",
  LEARNING: "learning",
  COMPLETED: "completed",
  SKIPPED: "skipped",
});

const IMPORTANCE = Object.freeze({
  CORE: "core",
  IMPORTANT: "important",
  OPTIONAL: "optional",
  ADVANCED: "advanced",
});

const EDGE_TYPE = Object.freeze({
  PREREQUISITE: "prerequisite",
  RECOMMENDED_NEXT: "recommended_next",
  ALTERNATIVE: "alternative",
  RELATED: "related",
});

const ROADMAP_TYPE = Object.freeze({
  ROLE: "role",
  SKILL: "skill",
  CUSTOM: "custom",
});

const ROADMAP_STATUS = Object.freeze({
  DRAFT: "draft",
  GENERATING: "generating",
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
  FAILED: "failed",
});

const PROFILE_LEVEL = Object.freeze({
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
});

export {
  NODE_STATUS,
  IMPORTANCE,
  EDGE_TYPE,
  ROADMAP_TYPE,
  ROADMAP_STATUS,
  PROFILE_LEVEL,
};
