import {
  ROADMAP_GENERATION_MODES,
  NODE_STATUS,
} from "../constants/roadmap.constants.js";

import { loadRoadmap } from "../knowledge/loader.js";

import { getLLMClient } from "../config/llm.js";

import { adapt, setLLM } from "../agents/roadmap.adaptation.agent.js";

// ============================================================
// HELPERS
// ============================================================

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map(normalizeString).filter(Boolean))];
}

// ============================================================
// BUILD RESUME CONTEXT
// ============================================================

function buildResumeContext(resume) {
  if (!resume) {
    return null;
  }

  return {
    id: resume.id || null,

    version: resume.version || null,

    profile: resume.profile || null,

    summary: normalizeString(resume.summary),

    skills: normalizeStringArray(resume.skills),

    technologies: normalizeStringArray(resume.technologies),

    experience: Array.isArray(resume.experience) ? resume.experience : [],

    projects: Array.isArray(resume.projects) ? resume.projects : [],

    education: Array.isArray(resume.education) ? resume.education : [],

    certifications: Array.isArray(resume.certifications)
      ? resume.certifications
      : [],

    achievements: Array.isArray(resume.achievements) ? resume.achievements : [],

    languages: Array.isArray(resume.languages) ? resume.languages : [],

    analysis: resume.analysis || null,
  };
}

// ============================================================
// BUILD CUSTOM CONTEXT
// ============================================================

function buildCustomContext(customRequirements = {}) {
  return {
    prompt: normalizeString(customRequirements.prompt),

    goals: normalizeStringArray(customRequirements.goals),

    technologies: normalizeStringArray(customRequirements.technologies),

    exclusions: normalizeStringArray(customRequirements.exclusions),

    projectPreferences: normalizeStringArray(
      customRequirements.projectPreferences,
    ),

    notes: normalizeString(customRequirements.notes),
  };
}

// ============================================================
// BUILD USER CONTEXT
// ============================================================

function buildAdaptationContext({ input, resume }) {
  return {
    role: normalizeString(input.role),

    level: input.level,

    target: input.target || {},

    availableHoursPerDay: input.availableHoursPerDay ?? null,

    currentSkills: normalizeStringArray(input.profile?.currentSkills),

    manualSkills: normalizeStringArray(input.manualSkills),

    resume: buildResumeContext(resume),

    customRequirements: buildCustomContext(input.customRequirements),
  };
}

// ============================================================
// VALIDATE MODE
// ============================================================

function validateAdaptationMode(generationMode) {
  if (
    generationMode !== ROADMAP_GENERATION_MODES.RESUME &&
    generationMode !== ROADMAP_GENERATION_MODES.CUSTOM
  ) {
    const error = new Error(
      `Unsupported personalization mode: ${generationMode}`,
    );

    error.statusCode = 400;

    throw error;
  }
}

// ============================================================
// VALIDATE ADAPTED NODES
// ============================================================

function validateAdaptedNodes({ template, nodes }) {
  if (!Array.isArray(nodes)) {
    throw new Error("Personalization result must contain a nodes array");
  }

  const canonicalIds = new Set(template.nodes.map((node) => node.id));

  const seenIds = new Set();

  for (const node of nodes) {
    if (!node || typeof node !== "object") {
      throw new Error("Invalid personalized roadmap node");
    }

    if (typeof node.nodeId !== "string" || !node.nodeId.trim()) {
      throw new Error("Personalized roadmap node is missing nodeId");
    }

    if (!canonicalIds.has(node.nodeId)) {
      throw new Error(`Personalization returned unknown node: ${node.nodeId}`);
    }

    if (seenIds.has(node.nodeId)) {
      throw new Error(`Duplicate personalized node: ${node.nodeId}`);
    }

    seenIds.add(node.nodeId);

    if (!Object.values(NODE_STATUS).includes(node.status)) {
      throw new Error(`Invalid personalized node status: ${node.status}`);
    }
  }
}

// ============================================================
// NORMALIZE NODE ORDER
// ============================================================

function normalizeNodeOrder({ template, nodes }) {
  const byId = new Map(nodes.map((node) => [node.nodeId, node]));

  /**
   * Canonical template controls ordering.
   *
   * Personalization can change state,
   * never graph order.
   */
  return template.nodes.map((canonicalNode) => {
    const personalized = byId.get(canonicalNode.id);

    if (!personalized) {
      return {
        nodeId: canonicalNode.id,

        status: NODE_STATUS.NOT_STARTED,
      };
    }

    return {
      nodeId: canonicalNode.id,

      status: personalized.status,
    };
  });
}

// ============================================================
// SETUP LLM
// ============================================================

async function ensureLLM() {
  const client = await getLLMClient();

  setLLM(client);

  return client;
}

// ============================================================
// PERSONALIZE
// ============================================================

async function personalize({
  generationMode,
  templateId,
  input = {},
  resume = null,
}) {
  validateAdaptationMode(generationMode);

  // ----------------------------------------------------------
  // LOAD CANONICAL TEMPLATE
  // ----------------------------------------------------------

  const template = loadRoadmap(templateId);

  if (!template) {
    const error = new Error(`Roadmap template not found: ${templateId}`);

    error.statusCode = 404;

    throw error;
  }

  // ----------------------------------------------------------
  // BUILD CONTEXT
  // ----------------------------------------------------------

  const userContext = buildAdaptationContext({
    input,
    resume,
  });

  // ----------------------------------------------------------
  // INITIALIZE LLM
  // ----------------------------------------------------------

  await ensureLLM();

  // ----------------------------------------------------------
  // ADAPT
  // ----------------------------------------------------------

  const result = await adapt({
    generationMode,

    templateId,

    userContext,
  });

  // ----------------------------------------------------------
  // VALIDATE
  // ----------------------------------------------------------

  validateAdaptedNodes({
    template,

    nodes: result.nodes,
  });

  // ----------------------------------------------------------
  // NORMALIZE
  // ----------------------------------------------------------

  const nodes = normalizeNodeOrder({
    template,

    nodes: result.nodes,
  });

  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------

  return {
    nodes,

    adaptationSummary: result.summary || "",

    metadata: {
      templateId,

      generationMode,

      personalized: true,

      llm: true,
    },
  };
}

// ============================================================
// STANDARD PASSTHROUGH
// ============================================================

/**
 * Standard roadmaps never need the LLM.
 *
 * This helper is useful for callers that want
 * one unified personalization interface.
 */
function getStandardNodes(templateId) {
  const template = loadRoadmap(templateId);

  if (!template) {
    const error = new Error(`Roadmap template not found: ${templateId}`);

    error.statusCode = 404;

    throw error;
  }

  return template.nodes.map((node) => ({
    nodeId: node.id,

    status: NODE_STATUS.NOT_STARTED,
  }));
}

// ============================================================
// EXPORTS
// ============================================================

export {
  personalize,
  getStandardNodes,
  buildResumeContext,
  buildCustomContext,
  buildAdaptationContext,
  validateAdaptedNodes,
  normalizeNodeOrder,
};

export default {
  personalize,
  getStandardNodes,
};
