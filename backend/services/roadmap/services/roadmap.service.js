import Roadmap from "../models/roadmap.model.js";

import {
  ROADMAP_GENERATION_MODES,
  ROADMAP_STATUSES,
  ROADMAP_NODE_STATUSES,
  ROADMAP_DEFAULTS,
} from "../constants/roadmap.constants.js";

import {
  ROADMAP_KNOWLEDGE_VERSION,
  getRoadmapTemplateVersion,
} from "../constants/roadmap.version.js";

import { loadRoadmap } from "../knowledge/loader.js";

import personalizationService from "./personalization.service.js";
import resumeContextService from "./resume.context.service.js";

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

  return [...new Set(value.map(normalizeString).filter(Boolean))].sort();
}

function normalizeTarget(target = {}) {
  return {
    compensation: Number(
      target.compensation ?? ROADMAP_DEFAULTS.TARGET_COMPENSATION,
    ),

    currency: normalizeString(target.currency || ROADMAP_DEFAULTS.CURRENCY),

    unit: normalizeString(target.unit || ROADMAP_DEFAULTS.TARGET_UNIT),
  };
}

function normalizeCustomRequirements(value = {}) {
  return {
    prompt: normalizeString(value.prompt),

    goals: normalizeStringArray(value.goals),

    technologies: normalizeStringArray(value.technologies),

    exclusions: normalizeStringArray(value.exclusions),

    projectPreferences: normalizeStringArray(value.projectPreferences),

    notes: normalizeString(value.notes),
  };
}

// ============================================================
// IMPORTANCE → PRIORITY
// ============================================================

function mapImportanceToPriority(importance) {
  switch (importance) {
    case "core":
      return "high";

    case "important":
      return "high";

    case "advanced":
      return "medium";

    case "optional":
      return "low";

    default:
      return "medium";
  }
}

// ============================================================
// VALIDATE INPUT
// ============================================================

function validateGenerationInput(input) {
  if (!input) {
    const error = new Error("Roadmap generation input is required");

    error.statusCode = 400;

    throw error;
  }

  const allowedModes = Object.values(ROADMAP_GENERATION_MODES);

  if (!allowedModes.includes(input.generationMode)) {
    const error = new Error(
      `Invalid roadmap generation mode: ${input.generationMode}`,
    );

    error.statusCode = 400;

    throw error;
  }

  if (!input.templateId) {
    const error = new Error("templateId is required");

    error.statusCode = 400;

    throw error;
  }
}

// ============================================================
// FINGERPRINT
// ============================================================

function createFingerprint({ userId, input }) {
  const customRequirements = normalizeCustomRequirements(
    input.customRequirements,
  );

  const fingerprintPayload = {
    userId: String(userId),

    templateId: input.templateId,

    generationMode: input.generationMode,

    role: normalizeString(input.role),

    level: input.level,

    availableHoursPerDay: input.availableHoursPerDay,

    target: normalizeTarget(input.target),

    resumeId: input.resumeId ? String(input.resumeId) : null,

    resumeVersion: input.resumeVersion ?? null,

    manualSkills: normalizeStringArray(input.manualSkills),

    customRequirements,

    knowledgeVersion: ROADMAP_KNOWLEDGE_VERSION,
  };

  return JSON.stringify(fingerprintPayload);
}

// ============================================================
// INITIALIZE NODES
// ============================================================

function initializeNodes(template, statuses = {}) {
  return template.nodes.map((knowledgeNode) => {
    const status =
      statuses[knowledgeNode.id] || ROADMAP_NODE_STATUSES.NOT_STARTED;

    const now = new Date();

    return {
      nodeId: knowledgeNode.id,

      status,

      startedAt: status === ROADMAP_NODE_STATUSES.LEARNING ? now : null,

      completedAt: status === ROADMAP_NODE_STATUSES.COMPLETED ? now : null,

      skippedReason: null,

      updatedAt: now,
    };
  });
}

// ============================================================
// CALCULATE PROGRESS
// ============================================================

function calculateProgress(nodes = []) {
  const total = nodes.length;

  const completed = nodes.filter(
    (node) => node.status === ROADMAP_NODE_STATUSES.COMPLETED,
  ).length;

  const learning = nodes.filter(
    (node) => node.status === ROADMAP_NODE_STATUSES.LEARNING,
  ).length;

  const skipped = nodes.filter(
    (node) => node.status === ROADMAP_NODE_STATUSES.SKIPPED,
  ).length;

  const remaining = total - completed - skipped;

  const percentage =
    total === 0 ? 0 : Math.round(((completed + skipped) / total) * 100);

  return {
    percentage,

    total,

    completed,

    learning,

    skipped,

    remaining,
  };
}

// ============================================================
// BUILD CURRENT FOCUS
// ============================================================

function buildCurrentFocus(nodes, template) {
  const learningNode = nodes.find(
    (node) => node.status === ROADMAP_NODE_STATUSES.LEARNING,
  );

  const nextNode =
    learningNode ||
    nodes.find((node) => node.status === ROADMAP_NODE_STATUSES.NOT_STARTED);

  if (!nextNode) {
    return null;
  }

  const knowledgeNode = template.nodes.find(
    (node) => node.id === nextNode.nodeId,
  );

  if (!knowledgeNode) {
    return null;
  }

  return {
    nodeId: nextNode.nodeId,

    reason:
      knowledgeNode.whyItMatters ||
      knowledgeNode.description ||
      "This is the next recommended step in your roadmap.",

    priority: mapImportanceToPriority(knowledgeNode.importance),
  };
}

// ============================================================
// BUILD PAYLOAD
// ============================================================

function buildRoadmapPayload({
  userId,
  input,
  template,
  adaptedNodes,
  adaptationSummary = "",
  resume = null,
}) {
  const statusMap = Object.fromEntries(
    adaptedNodes.map((node) => [node.nodeId, node.status]),
  );

  const nodes = initializeNodes(template, statusMap);

  const progress = calculateProgress(nodes);

  const currentFocus = buildCurrentFocus(nodes, template);

  const customRequirements = normalizeCustomRequirements(
    input.customRequirements,
  );

  const inputSource =
    input.inputSource ||
    (input.generationMode === ROADMAP_GENERATION_MODES.RESUME
      ? "resume"
      : input.manualSkills?.length
        ? "manual"
        : "standard");

  return {
    userId,

    templateId: template.id,

    templateVersion: getRoadmapTemplateVersion(template.id),

    knowledgeVersion: ROADMAP_KNOWLEDGE_VERSION,

    title: template.title,

    role: normalizeString(input.role) || template.title,

    description: template.description,

    target: normalizeTarget(input.target),

    profile: {
      level: input.level,

      availableHoursPerDay: input.availableHoursPerDay,

      currentSkills: normalizeStringArray(input.manualSkills),
    },

    generationMode: input.generationMode,

    inputContext: {
      source: inputSource,

      resumeId: resume?.id || input.resumeId || null,

      resumeVersion: resume?.version || input.resumeVersion || null,

      manualSkills: normalizeStringArray(input.manualSkills),

      projectPreferences: customRequirements.projectPreferences,

      customRequirements,
    },

    status:
      progress.remaining === 0
        ? ROADMAP_STATUSES.COMPLETED
        : ROADMAP_STATUSES.ACTIVE,

    nodes,

    progress,

    currentFocus,

    adaptationSummary: normalizeString(adaptationSummary),

    fingerprint: createFingerprint({
      userId,
      input,
    }),
  };
}

// ============================================================
// STANDARD GENERATION
// ============================================================

async function generateStandardRoadmap({ userId, input, template }) {
  /**
   * Standard roadmap:
   *
   * canonical knowledge only
   * no Resume Service
   * no LLM
   */
  const adaptedNodes = template.nodes.map((node) => ({
    nodeId: node.id,

    status: ROADMAP_NODE_STATUSES.NOT_STARTED,
  }));

  return buildRoadmapPayload({
    userId,

    input,

    template,

    adaptedNodes,

    adaptationSummary: "Generated from the canonical roadmap template.",
  });
}

// ============================================================
// ADAPTIVE GENERATION
// ============================================================

async function generateAdaptiveRoadmap({ userId, input, template }) {
  let resume = null;

  // ----------------------------------------------------------
  // RESUME CONTEXT
  // ----------------------------------------------------------

  if (input.generationMode === ROADMAP_GENERATION_MODES.RESUME) {
    resume = await resumeContextService.getResume({
      userId,

      resumeId: input.resumeId || null,
    });
  }

  // ----------------------------------------------------------
  // PERSONALIZATION
  // ----------------------------------------------------------

  const result = await personalizationService.personalize({
    generationMode: input.generationMode,

    templateId: template.id,

    input,

    resume,
  });

  return buildRoadmapPayload({
    userId,

    input,

    template,

    adaptedNodes: result.nodes,

    adaptationSummary: result.adaptationSummary,

    resume,
  });
}

// ============================================================
// GENERATE ROADMAP
// ============================================================

async function generateRoadmap(userId, input) {
  if (!userId) {
    const error = new Error("userId is required");

    error.statusCode = 400;

    throw error;
  }

  validateGenerationInput(input);

  const template = loadRoadmap(input.templateId);

  if (!template) {
    const error = new Error(`Roadmap template not found: ${input.templateId}`);

    error.statusCode = 404;

    throw error;
  }

  // ----------------------------------------------------------
  // STANDARD
  // ----------------------------------------------------------

  if (input.generationMode === ROADMAP_GENERATION_MODES.STANDARD) {
    const payload = await generateStandardRoadmap({
      userId,

      input,

      template,
    });

    return Roadmap.create(payload);
  }

  // ----------------------------------------------------------
  // RESUME / CUSTOM
  // ----------------------------------------------------------

  const payload = await generateAdaptiveRoadmap({
    userId,

    input,

    template,
  });

  return Roadmap.create(payload);
}

// ============================================================
// GET ROADMAP
// ============================================================

async function getRoadmap(userId, roadmapId) {
  if (!userId) {
    const error = new Error("userId is required");

    error.statusCode = 400;

    throw error;
  }

  const roadmap = await Roadmap.findOne({
    _id: roadmapId,

    userId,
  });

  if (!roadmap) {
    const error = new Error("Roadmap not found");

    error.statusCode = 404;

    throw error;
  }

  return roadmap;
}

// ============================================================
// LIST ROADMAPS
// ============================================================

async function getRoadmaps(
  userId,
  { status, generationMode, page = 1, limit = 20 } = {},
) {
  if (!userId) {
    const error = new Error("userId is required");

    error.statusCode = 400;

    throw error;
  }

  const filter = {
    userId,
  };

  if (status) {
    filter.status = status;
  }

  if (generationMode) {
    filter.generationMode = generationMode;
  }

  const safePage = Math.max(1, Number(page));

  const safeLimit = Math.min(100, Math.max(1, Number(limit)));

  const skip = (safePage - 1) * safeLimit;

  const [roadmaps, total] = await Promise.all([
    Roadmap.find(filter)
      .sort({
        updatedAt: -1,
      })
      .skip(skip)
      .limit(safeLimit),

    Roadmap.countDocuments(filter),
  ]);

  return {
    roadmaps,

    pagination: {
      page: safePage,

      limit: safeLimit,

      total,

      pages: Math.ceil(total / safeLimit),
    },
  };
}

// ============================================================
// DELETE ROADMAP
// ============================================================

async function deleteRoadmap(userId, roadmapId) {
  if (!userId) {
    const error = new Error("userId is required");

    error.statusCode = 400;

    throw error;
  }

  const result = await Roadmap.deleteOne({
    _id: roadmapId,

    userId,
  });

  if (result.deletedCount === 0) {
    const error = new Error("Roadmap not found");

    error.statusCode = 404;

    throw error;
  }

  return {
    roadmapId,

    deleted: true,
  };
}

// ============================================================
// EXPORT
// ============================================================

export {
  generateRoadmap,
  getRoadmap,
  getRoadmaps,
  deleteRoadmap,
  createFingerprint,
  calculateProgress,
  buildCurrentFocus,
};

export default {
  generateRoadmap,
  getRoadmap,
  getRoadmaps,
  deleteRoadmap,
};
