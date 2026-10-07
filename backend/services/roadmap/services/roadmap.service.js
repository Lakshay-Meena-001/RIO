import crypto from "crypto";

import Roadmap from "../models/roadmap.model.js";

import {
  ROADMAP_DEFAULTS,
  ROADMAP_GENERATION_MODES,
  ROADMAP_INPUT_SOURCES,
  ROADMAP_NODE_STATUSES,
  ROADMAP_STATUSES,
} from "../constants/roadmap.constants.js";

import {
  ROADMAP_KNOWLEDGE_VERSION,
  getRoadmapTemplateVersion,
} from "../constants/roadmap.version.js";

import { loadRoadmap, roadmapExists } from "../knowledge/loader.js";

import { getStandardRoadmap } from "./template.service.js";

import personalizationService from "./personalization.service.js";

import resumeContextService from "./resume.context.service.js";

class RoadmapService {
  /**
   * Validate roadmap generation input.
   */
  validateGenerationInput(input = {}) {
    const {
      generationMode = ROADMAP_GENERATION_MODES.STANDARD,

      templateId,
    } = input;

    if (!Object.values(ROADMAP_GENERATION_MODES).includes(generationMode)) {
      throw new Error(`Invalid roadmap generation mode: ${generationMode}`);
    }

    if (!templateId) {
      throw new Error("templateId is required");
    }

    if (!roadmapExists(templateId)) {
      throw new Error(`Roadmap template not found: ${templateId}`);
    }

    if (generationMode === ROADMAP_GENERATION_MODES.RESUME && !input.resumeId) {
      throw new Error("resumeId is required for resume roadmap generation");
    }

    return true;
  }

  /**
   * Create deterministic fingerprint for the generation request.
   */
  createFingerprint(input = {}) {
    const normalizedInput = {
      generationMode: input.generationMode || ROADMAP_GENERATION_MODES.STANDARD,

      templateId: input.templateId || null,

      target: {
        compensation: input.target?.compensation ?? null,

        currency: input.target?.currency || "INR",

        unit: input.target?.unit || "LPA",
      },

      level: input.level || ROADMAP_DEFAULTS.LEVEL,

      availableHoursPerDay:
        input.availableHoursPerDay ?? ROADMAP_DEFAULTS.AVAILABLE_HOURS_PER_DAY,

      resumeId: input.resumeId || null,

      resumeVersion: input.resumeVersion ?? null,

      manualSkills: [...(input.manualSkills || [])].sort(),

      customRequirements: {
        prompt: input.customRequirements?.prompt || "",

        goals: [...(input.customRequirements?.goals || [])].sort(),

        technologies: [
          ...(input.customRequirements?.technologies || []),
        ].sort(),

        exclusions: [...(input.customRequirements?.exclusions || [])].sort(),

        projectPreferences: input.customRequirements?.projectPreferences || "",
      },

      knowledgeVersion: ROADMAP_KNOWLEDGE_VERSION,
    };

    return crypto
      .createHash("sha256")
      .update(JSON.stringify(normalizedInput))
      .digest("hex");
  }

  /**
   * Initialize roadmap nodes.
   */
  initializeNodes(template) {
    return template.nodes.map((node) => ({
      nodeId: node.id,

      status: ROADMAP_NODE_STATUSES.NOT_STARTED,

      skippedReason: null,

      startedAt: null,

      completedAt: null,

      updatedAt: new Date(),
    }));
  }

  /**
   * Initialize roadmap progress.
   */
  initializeProgress(nodes) {
    return {
      percentage: 0,

      total: nodes.length,

      completed: 0,

      learning: 0,

      skipped: 0,

      remaining: nodes.length,
    };
  }

  /**
   * Initialize user's first focus.
   */
  initializeCurrentFocus(template) {
    const firstNode = template.nodes[0];

    if (!firstNode) {
      return null;
    }

    return {
      nodeId: firstNode.id,

      reason:
        firstNode.whyItMatters ||
        firstNode.description ||
        "Start with this topic to build the foundation.",

      priority: firstNode.importance || "important",
    };
  }

  /**
   * Build the common Roadmap document.
   */
  buildRoadmapPayload({
    userId,

    input,

    template,

    generationMode,

    fingerprint,

    adaptedNodes = null,

    adaptationSummary = null,
  }) {
    const nodes = adaptedNodes || this.initializeNodes(template);

    const progress = this.initializeProgress(nodes);

    const currentFocus = this.initializeCurrentFocus(template);

    return {
      userId,

      templateId: template.id,

      templateVersion: getRoadmapTemplateVersion(template.id),

      title: input.title || template.title,

      role: input.role || template.title,

      target: {
        compensation:
          input.target?.compensation ?? ROADMAP_DEFAULTS.TARGET_COMPENSATION,

        currency: input.target?.currency || ROADMAP_DEFAULTS.CURRENCY,

        unit: input.target?.unit || ROADMAP_DEFAULTS.TARGET_UNIT,
      },

      profile: {
        level: input.level || ROADMAP_DEFAULTS.LEVEL,

        availableHoursPerDay:
          input.availableHoursPerDay ??
          ROADMAP_DEFAULTS.AVAILABLE_HOURS_PER_DAY,
      },

      generationMode,

      inputContext: {
        source: input.inputSource || ROADMAP_INPUT_SOURCES.STANDARD,

        resumeId: input.resumeId || null,

        resumeVersion: input.resumeVersion ?? null,

        manualSkills: input.manualSkills || [],

        customRequirements: input.customRequirements || {},
      },

      status: ROADMAP_STATUSES.ACTIVE,

      nodes,

      progress,

      currentFocus,

      fingerprint,

      generationError: null,

      adaptationSummary,
    };
  }

  /**
   * Find an already generated roadmap
   * with the same generation fingerprint.
   */
  async findExistingByFingerprint(userId, fingerprint) {
    return Roadmap.findOne({
      userId,

      fingerprint,
    }).sort({
      updatedAt: -1,
    });
  }

  /**
   * Generate a standard roadmap.
   *
   * IMPORTANT:
   * No Resume Service.
   * No LLM.
   */
  async generateStandard(userId, input) {
    const template = getStandardRoadmap(input.templateId);

    const fingerprint = this.createFingerprint({
      ...input,

      generationMode: ROADMAP_GENERATION_MODES.STANDARD,
    });

    const existing = await this.findExistingByFingerprint(userId, fingerprint);

    if (existing) {
      return existing;
    }

    const payload = this.buildRoadmapPayload({
      userId,

      input,

      template,

      generationMode: ROADMAP_GENERATION_MODES.STANDARD,

      fingerprint,
    });

    return Roadmap.create(payload);
  }

  /**
   * Generate a resume-adaptive roadmap.
   */
  async generateFromResume(userId, input) {
    /*
     * Fetch the selected resume from
     * Resume Service.
     */
    const resume = await resumeContextService.getResumeContext({
      userId,

      resumeId: input.resumeId,
    });

    /*
     * Use the actual resume version returned
     * by Resume Service when available.
     */
    const normalizedInput = {
      ...input,

      resumeVersion: resume.version ?? input.resumeVersion ?? null,
    };

    const fingerprint = this.createFingerprint({
      ...normalizedInput,

      generationMode: ROADMAP_GENERATION_MODES.RESUME,
    });

    const existing = await this.findExistingByFingerprint(
      userId,

      fingerprint,
    );

    if (existing) {
      return existing;
    }

    const template = loadRoadmap(input.templateId);

    /*
     * Send canonical roadmap + resume context
     * to the personalization layer.
     */
    const personalized = await personalizationService.adapt({
      generationMode: ROADMAP_GENERATION_MODES.RESUME,

      templateId: input.templateId,

      input: normalizedInput,

      resume,
    });

    const payload = this.buildRoadmapPayload({
      userId,

      input: normalizedInput,

      template,

      generationMode: ROADMAP_GENERATION_MODES.RESUME,

      fingerprint,

      adaptedNodes: personalized.nodes,

      adaptationSummary: personalized.metadata?.adaptationSummary || null,
    });

    return Roadmap.create(payload);
  }

  /**
   * Generate a custom roadmap.
   *
   * Custom roadmap can optionally also use
   * a selected resume as context.
   */
  async generateCustom(userId, input) {
    let resume = null;

    if (input.resumeId) {
      resume = await resumeContextService.getResumeContext({
        userId,

        resumeId: input.resumeId,
      });
    }

    const normalizedInput = {
      ...input,

      resumeVersion: resume?.version ?? input.resumeVersion ?? null,
    };

    const fingerprint = this.createFingerprint({
      ...normalizedInput,

      generationMode: ROADMAP_GENERATION_MODES.CUSTOM,
    });

    const existing = await this.findExistingByFingerprint(
      userId,

      fingerprint,
    );

    if (existing) {
      return existing;
    }

    const template = loadRoadmap(input.templateId);

    const personalized = await personalizationService.adapt({
      generationMode: ROADMAP_GENERATION_MODES.CUSTOM,

      templateId: input.templateId,

      input: normalizedInput,

      resume,
    });

    const payload = this.buildRoadmapPayload({
      userId,

      input: normalizedInput,

      template,

      generationMode: ROADMAP_GENERATION_MODES.CUSTOM,

      fingerprint,

      adaptedNodes: personalized.nodes,

      adaptationSummary: personalized.metadata?.adaptationSummary || null,
    });

    return Roadmap.create(payload);
  }

  /**
   * Main generation entry point.
   */
  async generate(
    userId,

    input = {},
  ) {
    if (!userId) {
      throw new Error("userId is required");
    }

    this.validateGenerationInput(input);

    const mode = input.generationMode || ROADMAP_GENERATION_MODES.STANDARD;

    switch (mode) {
      case ROADMAP_GENERATION_MODES.STANDARD:
        return this.generateStandard(
          userId,

          input,
        );

      case ROADMAP_GENERATION_MODES.RESUME:
        return this.generateFromResume(
          userId,

          input,
        );

      case ROADMAP_GENERATION_MODES.CUSTOM:
        return this.generateCustom(
          userId,

          input,
        );

      default:
        throw new Error(`Unsupported roadmap generation mode: ${mode}`);
    }
  }

  /**
   * Get one roadmap owned by the user.
   */
  async getRoadmap(
    userId,

    roadmapId,
  ) {
    if (!userId) {
      throw new Error("userId is required");
    }

    if (!roadmapId) {
      throw new Error("roadmapId is required");
    }

    return Roadmap.findOne({
      _id: roadmapId,

      userId,
    });
  }

  /**
   * Get all roadmaps owned by the user.
   */
  async getUserRoadmaps(
    userId,

    options = {},
  ) {
    if (!userId) {
      throw new Error("userId is required");
    }

    const limit = Math.min(
      Number(options.limit) || 20,

      100,
    );

    const skip = Math.max(
      Number(options.skip) || 0,

      0,
    );

    return Roadmap.find({
      userId,
    })
      .sort({
        updatedAt: -1,
      })
      .skip(skip)
      .limit(limit);
  }

  /**
   * Delete a roadmap owned by the user.
   */
  async deleteRoadmap(
    userId,

    roadmapId,
  ) {
    if (!userId) {
      throw new Error("userId is required");
    }

    if (!roadmapId) {
      throw new Error("roadmapId is required");
    }

    return Roadmap.findOneAndDelete({
      _id: roadmapId,

      userId,
    });
  }
}

const roadmapService = new RoadmapService();

export default roadmapService;
