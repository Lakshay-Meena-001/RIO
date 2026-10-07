/**
 * RIO Roadmap Knowledge Loader
 *
 * Responsible for loading and validating canonical roadmap templates.
 *
 * Important:
 * - No database access.
 * - No LLM.
 * - No user-specific data.
 * - No progress.
 * - Only canonical static knowledge.
 */

import {
  getRoadmapTemplate,
  getAllRoadmapTemplates,
  hasRoadmapTemplate,
  validateRoadmapTemplate,
} from "./index.js";

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

export class KnowledgeNotFoundError extends Error {
  constructor(roadmapId) {
    super(`Roadmap knowledge "${roadmapId}" was not found.`);

    this.name = "KnowledgeNotFoundError";
    this.code = "ROADMAP_KNOWLEDGE_NOT_FOUND";
    this.statusCode = 404;
  }
}

export class InvalidKnowledgeError extends Error {
  constructor(roadmapId, errors = []) {
    super(`Roadmap knowledge "${roadmapId}" is invalid.`);

    this.name = "InvalidKnowledgeError";
    this.code = "INVALID_ROADMAP_KNOWLEDGE";
    this.statusCode = 500;
    this.errors = errors;
  }
}

/* -------------------------------------------------------------------------- */
/* Internal Validation                                                        */
/* -------------------------------------------------------------------------- */

const validateTemplateOrThrow = (template) => {
  const validation = validateRoadmapTemplate(template);

  if (!validation.valid) {
    throw new InvalidKnowledgeError(
      template?.id || "unknown",
      validation.errors,
    );
  }

  return template;
};

/* -------------------------------------------------------------------------- */
/* Load One Roadmap                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Load a canonical roadmap template by id.
 */
export const loadRoadmap = (roadmapId) => {
  if (!roadmapId) {
    throw new KnowledgeNotFoundError(roadmapId);
  }

  const template = getRoadmapTemplate(roadmapId);

  if (!template) {
    throw new KnowledgeNotFoundError(roadmapId);
  }

  return validateTemplateOrThrow(template);
};

/* -------------------------------------------------------------------------- */
/* Try Load                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Non-throwing version.
 *
 * Useful when a service wants to check whether a roadmap exists.
 */
export const tryLoadRoadmap = (roadmapId) => {
  if (!roadmapId) {
    return null;
  }

  const template = getRoadmapTemplate(roadmapId);

  if (!template) {
    return null;
  }

  return validateTemplateOrThrow(template);
};

/* -------------------------------------------------------------------------- */
/* Check Existence                                                            */
/* -------------------------------------------------------------------------- */

export const roadmapExists = (roadmapId) => {
  return hasRoadmapTemplate(roadmapId);
};

/* -------------------------------------------------------------------------- */
/* List Roadmaps                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Return lightweight metadata for available roadmap templates.
 *
 * We intentionally do not expose the complete knowledge graph here.
 */
export const listRoadmaps = () => {
  return getAllRoadmapTemplates().map((template) => ({
    id: template.id,
    version: template.version,
    type: template.type,
    title: template.title,
    description: template.description,
    goal: template.goal,
    metadata: {
      category: template.metadata?.category || null,
      domain: template.metadata?.domain || null,
      primaryTechnology: template.metadata?.primaryTechnology || null,
    },
  }));
};

/* -------------------------------------------------------------------------- */
/* Node Access                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Return one node from a canonical roadmap.
 */
export const loadRoadmapNode = (roadmapId, nodeId) => {
  const template = loadRoadmap(roadmapId);

  if (!nodeId) {
    return null;
  }

  return template.nodes.find((node) => node.id === nodeId) || null;
};

/* -------------------------------------------------------------------------- */
/* Phase Access                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Return the phases configured for a roadmap.
 */
export const loadRoadmapPhases = (roadmapId) => {
  const template = loadRoadmap(roadmapId);

  return Array.isArray(template.metadata?.phases)
    ? template.metadata.phases
    : [];
};

/* -------------------------------------------------------------------------- */
/* Graph Access                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Return all relationships of a roadmap.
 */
export const loadRoadmapEdges = (roadmapId) => {
  const template = loadRoadmap(roadmapId);

  return template.edges;
};

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export default {
  loadRoadmap,
  tryLoadRoadmap,
  roadmapExists,
  listRoadmaps,
  loadRoadmapNode,
  loadRoadmapPhases,
  loadRoadmapEdges,
};
