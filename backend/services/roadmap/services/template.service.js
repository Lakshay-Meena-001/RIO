/**
 * RIO Roadmap Template Service
 *
 * Business layer for canonical roadmap templates.
 *
 * Responsibilities:
 * - Load canonical roadmap templates.
 * - Expose safe template metadata.
 * - Provide node/phase/graph lookups.
 * - Validate roadmap knowledge before use.
 *
 * Not responsible for:
 * - User progress.
 * - Resume processing.
 * - Custom roadmap generation.
 * - LLM adaptation.
 * - MongoDB persistence.
 */

import {
  loadRoadmap,
  loadRoadmapNode,
  loadRoadmapPhases,
  loadRoadmapEdges,
  listRoadmaps,
  roadmapExists,
} from "../knowledge/loader.js";

import {
  getIncomingEdges,
  getOutgoingEdges,
  getPrerequisiteIds,
} from "../knowledge/index.js";

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

export class TemplateNotFoundError extends Error {
  constructor(templateId) {
    super(`Roadmap template "${templateId}" was not found.`);

    this.name = "TemplateNotFoundError";
    this.code = "ROADMAP_TEMPLATE_NOT_FOUND";
    this.statusCode = 404;
  }
}

/* -------------------------------------------------------------------------- */
/* Template Lookup                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Check whether a canonical roadmap template exists.
 */
export const hasTemplate = (templateId) => {
  return roadmapExists(templateId);
};

/**
 * Get a complete canonical roadmap template.
 *
 * This is an internal service operation.
 * Consumers that only need metadata should use getTemplateSummary().
 */
export const getTemplate = (templateId) => {
  const template = loadRoadmap(templateId);

  if (!template) {
    throw new TemplateNotFoundError(templateId);
  }

  return template;
};

/* -------------------------------------------------------------------------- */
/* Template Summary                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Return only information needed to display available roadmaps.
 *
 * We intentionally do not expose the complete knowledge graph here.
 */
export const getTemplateSummary = (templateId) => {
  const template = getTemplate(templateId);

  return {
    id: template.id,
    version: template.version,
    type: template.type,

    title: template.title,
    description: template.description,
    goal: template.goal,

    metadata: {
      ...template.metadata,

      // Avoid sending the complete phase objects when a lightweight
      // template summary is requested.
      phases: Array.isArray(template.metadata?.phases)
        ? template.metadata.phases.map((phase) => ({
            id: phase.id,
            order: phase.order,
            title: phase.title,
            description: phase.description,
            goal: phase.goal,
          }))
        : [],
    },

    nodeCount: template.nodes.length,
    edgeCount: template.edges.length,
  };
};

/* -------------------------------------------------------------------------- */
/* Available Templates                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Return all canonical roadmap templates available in RIO.
 *
 * Useful for:
 * - Roadmap builder
 * - Role selection
 * - Standard roadmap discovery
 */
export const getAvailableTemplates = () => {
  return listRoadmaps();
};

/* -------------------------------------------------------------------------- */
/* Phases                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Get phases of a roadmap.
 */
export const getTemplatePhases = (templateId) => {
  return loadRoadmapPhases(templateId);
};

/**
 * Get one phase by id.
 */
export const getTemplatePhase = (templateId, phaseId) => {
  const phases = getTemplatePhases(templateId);

  return phases.find((phase) => phase.id === phaseId) || null;
};

/* -------------------------------------------------------------------------- */
/* Nodes                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Get one canonical knowledge node.
 */
export const getTemplateNode = (templateId, nodeId) => {
  const node = loadRoadmapNode(templateId, nodeId);

  if (!node) {
    return null;
  }

  return node;
};

/**
 * Get all nodes belonging to a particular phase.
 */
export const getPhaseNodes = (templateId, phaseId) => {
  const template = getTemplate(templateId);

  return template.nodes.filter((node) => node.metadata?.phase === phaseId);
};

/* -------------------------------------------------------------------------- */
/* Graph Relationships                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Get all outgoing relationships from a node.
 */
export const getNodeNextSteps = (templateId, nodeId) => {
  const template = getTemplate(templateId);

  return getOutgoingEdges(template, nodeId);
};

/**
 * Get all incoming relationships to a node.
 */
export const getNodeDependencies = (templateId, nodeId) => {
  const template = getTemplate(templateId);

  return getIncomingEdges(template, nodeId);
};

/**
 * Get only hard prerequisites.
 */
export const getNodePrerequisites = (templateId, nodeId) => {
  const template = getTemplate(templateId);

  return getPrerequisiteIds(template, nodeId);
};

/* -------------------------------------------------------------------------- */
/* Template Graph                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Return the canonical graph.
 *
 * Used internally by adaptation/progress logic.
 */
export const getTemplateGraph = (templateId) => {
  const template = getTemplate(templateId);

  return {
    nodes: template.nodes,
    edges: template.edges,
  };
};

/* -------------------------------------------------------------------------- */
/* Standard Roadmap Definition                                                */
/* -------------------------------------------------------------------------- */

/**
 * Build a lightweight standard roadmap representation.
 *
 * This is NOT a user roadmap.
 *
 * It is the canonical structure that can be copied/adapted
 * into a user's roadmap later.
 */
export const getStandardRoadmap = (templateId) => {
  const template = getTemplate(templateId);

  return {
    templateId: template.id,
    templateVersion: template.version,

    title: template.title,
    description: template.description,
    goal: template.goal,

    phases: getTemplatePhases(templateId),

    nodes: template.nodes,

    edges: template.edges,

    alternatives: template.alternatives,

    metadata: template.metadata,
  };
};

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export default {
  hasTemplate,

  getTemplate,
  getTemplateSummary,
  getAvailableTemplates,

  getTemplatePhases,
  getTemplatePhase,

  getTemplateNode,
  getPhaseNodes,

  getNodeNextSteps,
  getNodeDependencies,
  getNodePrerequisites,

  getTemplateGraph,

  getStandardRoadmap,
};
