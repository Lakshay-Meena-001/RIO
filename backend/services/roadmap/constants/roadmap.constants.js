export const ROADMAP_SCHEMA_VERSION = 1;

export const ROADMAP_STATUS = Object.freeze({
  GENERATING: "generating",
  READY: "ready",
  FAILED: "failed",
});

export const USER_ROADMAP_STATUS = Object.freeze({
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
  GENERATING: "generating",
  READY: "ready",
  FAILED: "failed",
});

export const ROADMAP_NODE_STATUS = Object.freeze({
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  SKIPPED: "skipped",
});

export const ROADMAP_PACKAGE = Object.freeze({
  FOUNDATION: "foundation",
  STANDARD: "standard",
  COMPREHENSIVE: "comprehensive",
});

export const DEFAULT_ROADMAP_PACKAGE = ROADMAP_PACKAGE.COMPREHENSIVE;

export const ROADMAP_GENERATION = Object.freeze({
  MAX_RETRIES: 2,
  GENERATION_LOCK_TTL_MS: 120_000,
  MAX_PHASES: 20,
  MAX_TOPICS_PER_PHASE: 30,
  MAX_RESOURCES_PER_TOPIC: 8,
});

export const ROADMAP_CACHE_KEY_VERSION = 1;

export const ROADMAP_ERROR_CODES = Object.freeze({
  INVALID_INPUT: "INVALID_INPUT",
  ROADMAP_NOT_FOUND: "ROADMAP_NOT_FOUND",
  GENERATION_FAILED: "ROADMAP_GENERATION_FAILED",
  GENERATION_IN_PROGRESS: "ROADMAP_GENERATION_IN_PROGRESS",
  INVALID_AI_RESPONSE: "INVALID_AI_RESPONSE",
  RESOURCE_LIMIT_EXCEEDED: "RESOURCE_LIMIT_EXCEEDED",
});
