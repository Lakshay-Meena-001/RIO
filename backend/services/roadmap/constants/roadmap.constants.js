/**
 * RIO Roadmap Service
 * Central constants used across roadmap generation,
 * personalization, progress and lifecycle management.
 */

/* -------------------------------------------------------------------------- */
/* Roadmap Types                                                              */
/* -------------------------------------------------------------------------- */

export const ROADMAP_TYPES = Object.freeze({
  ROLE: "role",
  SKILL: "skill",
  CUSTOM: "custom",
});

/* -------------------------------------------------------------------------- */
/* Roadmap Status                                                             */
/* -------------------------------------------------------------------------- */

export const ROADMAP_STATUS = Object.freeze({
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
});

/* -------------------------------------------------------------------------- */
/* Node Progress Status                                                       */
/* -------------------------------------------------------------------------- */

export const NODE_STATUS = Object.freeze({
  NOT_STARTED: "not_started",
  LEARNING: "learning",
  COMPLETED: "completed",
  SKIPPED: "skipped",
});

/* -------------------------------------------------------------------------- */
/* Node Importance                                                            */
/* -------------------------------------------------------------------------- */

export const NODE_IMPORTANCE = Object.freeze({
  CORE: "core",
  IMPORTANT: "important",
  OPTIONAL: "optional",
  ADVANCED: "advanced",
});

/* -------------------------------------------------------------------------- */
/* Knowledge Node Categories                                                   */
/* -------------------------------------------------------------------------- */

export const NODE_CATEGORIES = Object.freeze({
  FOUNDATION: "foundation",
  LANGUAGE: "language",
  FRAMEWORK: "framework",
  LIBRARY: "library",
  DATABASE: "database",
  BACKEND: "backend",
  FRONTEND: "frontend",
  DEVOPS: "devops",
  CLOUD: "cloud",
  SECURITY: "security",
  TESTING: "testing",
  SYSTEM_DESIGN: "system_design",
  ARCHITECTURE: "architecture",
  AI: "ai",
  DATA: "data",
  TOOLS: "tools",
  PROJECT: "project",
  INTERVIEW: "interview",
});

/* -------------------------------------------------------------------------- */
/* Graph Edge Types                                                           */
/* -------------------------------------------------------------------------- */

export const EDGE_TYPES = Object.freeze({
  PREREQUISITE: "prerequisite",
  RECOMMENDED_NEXT: "recommended-next",
  ALTERNATIVE: "alternative",
  RELATED: "related",
  ENABLES: "enables",
});

/* -------------------------------------------------------------------------- */
/* User Experience Levels                                                     */
/* -------------------------------------------------------------------------- */

export const EXPERIENCE_LEVELS = Object.freeze({
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
});

/* -------------------------------------------------------------------------- */
/* Roadmap Input Sources                                                      */
/* -------------------------------------------------------------------------- */

export const ROADMAP_INPUT_SOURCES = Object.freeze({
  STANDARD: "standard",
  RESUME: "resume",
  SKILLS: "skills",
  RESUME_AND_SKILLS: "resume_and_skills",
});

/* -------------------------------------------------------------------------- */
/* Target Units                                                               */
/* -------------------------------------------------------------------------- */

export const TARGET_UNITS = Object.freeze({
  LPA: "LPA",
  INR: "INR",
});

/* -------------------------------------------------------------------------- */
/* Draft Status                                                               */
/* -------------------------------------------------------------------------- */

export const DRAFT_STATUS = Object.freeze({
  ACTIVE: "active",
  GENERATED: "generated",
  ABANDONED: "abandoned",
});

/* -------------------------------------------------------------------------- */
/* Personalization Modes                                                      */
/* -------------------------------------------------------------------------- */

export const PERSONALIZATION_MODES = Object.freeze({
  NONE: "none",
  RULE_BASED: "rule_based",
  LLM: "llm",
});

/* -------------------------------------------------------------------------- */
/* Generation Modes                                                           */
/* -------------------------------------------------------------------------- */

export const GENERATION_MODES = Object.freeze({
  STANDARD: "standard",
  PERSONALIZED: "personalized",
});

/* -------------------------------------------------------------------------- */
/* Pagination Defaults                                                        */
/* -------------------------------------------------------------------------- */

export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

/* -------------------------------------------------------------------------- */
/* Validation Limits                                                          */
/* -------------------------------------------------------------------------- */

export const ROADMAP_LIMITS = Object.freeze({
  ROLE_MIN_LENGTH: 2,
  ROLE_MAX_LENGTH: 100,

  TITLE_MIN_LENGTH: 2,
  TITLE_MAX_LENGTH: 150,

  AVAILABLE_HOURS_MIN: 1,
  AVAILABLE_HOURS_MAX: 16,

  TARGET_COMPENSATION_MIN: 0,
  TARGET_COMPENSATION_MAX: 1000,

  MAX_NODES: 500,

  MAX_SKILLS: 200,
});

/* -------------------------------------------------------------------------- */
/* API Error Codes                                                            */
/* -------------------------------------------------------------------------- */

export const ROADMAP_ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: "ROADMAP_VALIDATION_ERROR",
  ROADMAP_NOT_FOUND: "ROADMAP_NOT_FOUND",
  DRAFT_NOT_FOUND: "ROADMAP_DRAFT_NOT_FOUND",
  TEMPLATE_NOT_FOUND: "ROADMAP_TEMPLATE_NOT_FOUND",
  INVALID_STATUS: "ROADMAP_INVALID_STATUS",
  INVALID_NODE: "ROADMAP_INVALID_NODE",
  UNAUTHORIZED: "ROADMAP_UNAUTHORIZED",
  GENERATION_FAILED: "ROADMAP_GENERATION_FAILED",
  PERSONALIZATION_FAILED: "ROADMAP_PERSONALIZATION_FAILED",
  DUPLICATE_ROADMAP: "ROADMAP_DUPLICATE",
});

/* -------------------------------------------------------------------------- */
/* Cache Keys                                                                 */
/* -------------------------------------------------------------------------- */

export const CACHE_KEYS = Object.freeze({
  TEMPLATE: "roadmap:template",
  DASHBOARD: "roadmap:dashboard",
  USER_ROADMAP: "roadmap:user",
  USER_DRAFT: "roadmap:draft",
});

/* -------------------------------------------------------------------------- */
/* Cache TTL                                                                  */
/* -------------------------------------------------------------------------- */

export const CACHE_TTL = Object.freeze({
  TEMPLATE: 60 * 60 * 24,
  DASHBOARD: 60 * 5,
  USER_ROADMAP: 60 * 10,
  USER_DRAFT: 60 * 30,
});
