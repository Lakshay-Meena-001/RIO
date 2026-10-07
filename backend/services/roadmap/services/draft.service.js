import RoadmapDraft from "../models/roadmapDraft.model.js";
import {
  ROADMAP_GENERATION_MODES,
  ROADMAP_INPUT_SOURCES,
  isValidGenerationMode,
  isValidLevel,
} from "../constants/roadmap.constants.js";
import { hasTemplate } from "./template.service.js";

class DraftService {
  /**
   * Normalize and validate draft input.
   */
  normalizeDraftInput(input = {}) {
    const {
      generationMode = ROADMAP_GENERATION_MODES.STANDARD,
      role,
      templateId,
      target = {},
      level,
      availableHoursPerDay,
      useResume = false,
      resumeId = null,
      resumeVersion = null,
      manualSkills = [],
      customRequirements = {},
      inputSource,
      currentStep,
    } = input;

    // -----------------------------
    // Generation mode
    // -----------------------------
    if (!isValidGenerationMode(generationMode)) {
      throw new Error(`Invalid roadmap generation mode: ${generationMode}`);
    }

    // -----------------------------
    // Template
    // -----------------------------
    if (templateId && !hasTemplate(templateId)) {
      throw new Error(`Roadmap template not found: ${templateId}`);
    }

    // -----------------------------
    // Level
    // -----------------------------
    if (level && !isValidLevel(level)) {
      throw new Error(`Invalid roadmap level: ${level}`);
    }

    // -----------------------------
    // Normalize skills
    // -----------------------------
    const normalizedSkills = Array.isArray(manualSkills)
      ? [
          ...new Set(
            manualSkills
              .filter(Boolean)
              .map((skill) => String(skill).trim())
              .filter(Boolean),
          ),
        ]
      : [];

    // -----------------------------
    // Normalize custom requirements
    // -----------------------------
    const normalizedCustomRequirements = {
      prompt:
        typeof customRequirements.prompt === "string"
          ? customRequirements.prompt.trim()
          : "",

      goals: Array.isArray(customRequirements.goals)
        ? customRequirements.goals.filter(Boolean)
        : [],

      technologies: Array.isArray(customRequirements.technologies)
        ? customRequirements.technologies.filter(Boolean)
        : [],

      exclusions: Array.isArray(customRequirements.exclusions)
        ? customRequirements.exclusions.filter(Boolean)
        : [],

      projectPreferences:
        typeof customRequirements.projectPreferences === "string"
          ? customRequirements.projectPreferences.trim()
          : "",
    };

    // -----------------------------
    // Normalize input source
    // -----------------------------
    let normalizedInputSource = inputSource;

    if (!normalizedInputSource) {
      if (useResume && normalizedSkills.length > 0) {
        normalizedInputSource = ROADMAP_INPUT_SOURCES.RESUME_AND_MANUAL;
      } else if (useResume) {
        normalizedInputSource = ROADMAP_INPUT_SOURCES.RESUME;
      } else if (normalizedSkills.length > 0) {
        normalizedInputSource = ROADMAP_INPUT_SOURCES.MANUAL;
      } else {
        normalizedInputSource = ROADMAP_INPUT_SOURCES.STANDARD;
      }
    }

    return {
      generationMode,
      role: role?.trim?.() || "",
      templateId: templateId || null,

      target: {
        compensation: target.compensation ?? null,
        currency: target.currency || "INR",
        unit: target.unit || "LPA",
      },

      level: level || null,
      availableHoursPerDay:
        availableHoursPerDay != null ? Number(availableHoursPerDay) : null,

      useResume: Boolean(useResume),
      resumeId: resumeId || null,
      resumeVersion: resumeVersion != null ? Number(resumeVersion) : null,

      manualSkills: normalizedSkills,

      customRequirements: normalizedCustomRequirements,

      inputSource: normalizedInputSource,

      currentStep: currentStep != null ? Number(currentStep) : 0,
    };
  }

  /**
   * Create a new draft for a user.
   */
  async createDraft(userId, input = {}) {
    if (!userId) {
      throw new Error("userId is required");
    }

    const normalizedInput = this.normalizeDraftInput(input);

    const draft = await RoadmapDraft.create({
      userId,
      ...normalizedInput,
    });

    return draft;
  }

  /**
   * Get the user's draft.
   *
   * Ownership is enforced through userId.
   */
  async getDraft(userId, draftId) {
    if (!userId) {
      throw new Error("userId is required");
    }

    if (!draftId) {
      throw new Error("draftId is required");
    }

    const draft = await RoadmapDraft.findOne({
      _id: draftId,
      userId,
    });

    return draft;
  }

  /**
   * Get the user's latest draft.
   *
   * Useful when the frontend opens /roadmap/builder.
   */
  async getLatestDraft(userId) {
    if (!userId) {
      throw new Error("userId is required");
    }

    return RoadmapDraft.findOne({
      userId,
      generated: false,
    }).sort({ updatedAt: -1 });
  }

  /**
   * Get an existing draft or create one.
   *
   * This keeps the builder persistent across refreshes.
   */
  async getOrCreateDraft(userId, input = {}) {
    if (!userId) {
      throw new Error("userId is required");
    }

    const existingDraft = await this.getLatestDraft(userId);

    if (existingDraft) {
      return existingDraft;
    }

    return this.createDraft(userId, input);
  }

  /**
   * Update an existing draft.
   *
   * Only fields supplied by the caller are changed.
   */
  async updateDraft(userId, draftId, input = {}) {
    if (!userId) {
      throw new Error("userId is required");
    }

    if (!draftId) {
      throw new Error("draftId is required");
    }

    const normalizedInput = this.normalizeDraftInput(input);

    const update = {};

    for (const [key, value] of Object.entries(normalizedInput)) {
      // Do not overwrite existing values with null unless
      // the caller explicitly needs to clear them.
      if (value !== null && value !== undefined) {
        update[key] = value;
      }
    }

    const draft = await RoadmapDraft.findOneAndUpdate(
      {
        _id: draftId,
        userId,
      },
      {
        $set: update,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return draft;
  }

  /**
   * Update only the current builder step.
   *
   * Keeps step navigation lightweight.
   */
  async updateCurrentStep(userId, draftId, currentStep) {
    if (!userId) {
      throw new Error("userId is required");
    }

    if (!draftId) {
      throw new Error("draftId is required");
    }

    if (!Number.isInteger(Number(currentStep)) || Number(currentStep) < 0) {
      throw new Error("currentStep must be a non-negative integer");
    }

    return RoadmapDraft.findOneAndUpdate(
      {
        _id: draftId,
        userId,
      },
      {
        $set: {
          currentStep: Number(currentStep),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  /**
   * Mark a draft as generated.
   *
   * The draft remains in DB for traceability,
   * but it will no longer be treated as an active builder draft.
   */
  async markGenerated(userId, draftId, generatedRoadmapId) {
    if (!userId) {
      throw new Error("userId is required");
    }

    if (!draftId) {
      throw new Error("draftId is required");
    }

    if (!generatedRoadmapId) {
      throw new Error("generatedRoadmapId is required");
    }

    return RoadmapDraft.findOneAndUpdate(
      {
        _id: draftId,
        userId,
      },
      {
        $set: {
          generated: true,
          generatedRoadmapId,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  /**
   * Delete a draft.
   *
   * Ownership is enforced through userId.
   */
  async deleteDraft(userId, draftId) {
    if (!userId) {
      throw new Error("userId is required");
    }

    if (!draftId) {
      throw new Error("draftId is required");
    }

    return RoadmapDraft.findOneAndDelete({
      _id: draftId,
      userId,
    });
  }
}

const draftService = new DraftService();

export default draftService;
