import mongoose from "mongoose";

import RoadmapDraft from "../models/roadmapDraft.model.js";

import {
  ROADMAP_GENERATION_MODES,
  ROADMAP_INPUT_SOURCES,
  EXPERIENCE_LEVELS,
} from "../constants/roadmap.constants.js";

// ============================================================
// HELPERS
// ============================================================

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeNullableString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = normalizeString(value);

  return normalized || null;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map(normalizeString).filter(Boolean))];
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
// SERVICE
// ============================================================

class DraftService {
  // ==========================================================
  // NORMALIZE CREATE INPUT
  // ==========================================================

  normalizeDraftInput(input = {}) {
    return {
      generationMode: input.generationMode || ROADMAP_GENERATION_MODES.STANDARD,

      role: normalizeString(input.role),

      templateId: normalizeNullableString(input.templateId),

      target: {
        compensation: Number(input.target?.compensation ?? 12),

        currency: normalizeString(input.target?.currency || "INR"),

        unit: normalizeString(input.target?.unit || "LPA"),
      },

      level: input.level || EXPERIENCE_LEVELS.BEGINNER,

      availableHoursPerDay: Number(input.availableHoursPerDay ?? 2),

      useResume: Boolean(input.useResume),

      resumeId: normalizeNullableString(input.resumeId),

      resumeVersion: input.resumeVersion ?? null,

      manualSkills: normalizeStringArray(input.manualSkills),

      customRequirements: normalizeCustomRequirements(input.customRequirements),

      inputSource: input.inputSource || ROADMAP_INPUT_SOURCES.STANDARD,

      currentStep: Number(input.currentStep ?? 0),

      readyForGeneration: Boolean(input.readyForGeneration),
    };
  }

  // ==========================================================
  // OWNERSHIP
  // ==========================================================

  async getOwnedDraft(userId, draftId) {
    if (!userId) {
      const error = new Error("userId is required");

      error.statusCode = 400;

      throw error;
    }

    if (!draftId) {
      const error = new Error("draftId is required");

      error.statusCode = 400;

      throw error;
    }

    const draft = await RoadmapDraft.findOne({
      _id: draftId,
      userId,
    });

    if (!draft) {
      const error = new Error("Roadmap draft not found");

      error.statusCode = 404;

      throw error;
    }

    return draft;
  }

  // ==========================================================
  // CREATE
  // ==========================================================

  async createDraft(userId, input = {}) {
    if (!userId) {
      const error = new Error("userId is required");

      error.statusCode = 400;

      throw error;
    }

    const normalized = this.normalizeDraftInput(input);

    const draft = await RoadmapDraft.create({
      userId,

      ...normalized,

      generated: false,

      generatedRoadmapId: null,
    });

    return draft;
  }

  // ==========================================================
  // GET
  // ==========================================================

  async getDraft(userId, draftId) {
    return this.getOwnedDraft(userId, draftId);
  }

  // ==========================================================
  // GET LATEST
  // ==========================================================

  async getLatestDraft(userId) {
    if (!userId) {
      const error = new Error("userId is required");

      error.statusCode = 400;

      throw error;
    }

    return RoadmapDraft.findOne({
      userId,

      /**
       * Generated drafts are no longer
       * active builder sessions.
       *
       * Prefer the latest unfinished draft.
       */
      generated: false,
    }).sort({
      updatedAt: -1,
    });
  }

  // ==========================================================
  // GET OR CREATE
  // ==========================================================

  async getOrCreateDraft(userId, input = {}) {
    const existing = await this.getLatestDraft(userId);

    if (existing) {
      return existing;
    }

    return this.createDraft(userId, input);
  }

  // ==========================================================
  // UPDATE
  // ==========================================================

  async updateDraft(userId, draftId, updates = {}) {
    const draft = await this.getOwnedDraft(userId, draftId);

    /**
     * Once a draft has generated a roadmap,
     * it becomes historical information.
     *
     * Do not silently mutate it.
     */
    if (draft.generated) {
      const error = new Error("Generated roadmap drafts cannot be modified");

      error.statusCode = 409;

      throw error;
    }

    const normalized = this.normalizeDraftInput({
      ...draft.toObject(),
      ...updates,

      /**
       * Nested objects need explicit merging.
       * Otherwise updating target.compensation
       * could accidentally remove currency/unit.
       */
      target: {
        ...draft.target?.toObject?.(),
        ...updates.target,
      },

      customRequirements: {
        ...draft.customRequirements?.toObject?.(),
        ...updates.customRequirements,
      },
    });

    // --------------------------------------------------------
    // APPLY
    // --------------------------------------------------------

    Object.assign(draft, normalized);

    // --------------------------------------------------------
    // SAFETY
    // --------------------------------------------------------

    /**
     * If resume usage is disabled,
     * remove stale resume information.
     */
    if (!draft.useResume) {
      draft.resumeId = null;

      draft.resumeVersion = null;
    }

    /**
     * If the user switches to standard mode,
     * custom requirements should not remain
     * semantically active.
     *
     * We don't delete them because the user
     * may switch back to custom mode later.
     */
    if (draft.generationMode !== ROADMAP_GENERATION_MODES.RESUME) {
      /**
       * No mutation required here.
       * Historical builder input remains available.
       */
    }

    await draft.save();

    return draft;
  }

  // ==========================================================
  // UPDATE CURRENT STEP
  // ==========================================================

  async updateCurrentStep(userId, draftId, currentStep) {
    const draft = await this.getOwnedDraft(userId, draftId);

    if (draft.generated) {
      const error = new Error("Generated roadmap drafts cannot be modified");

      error.statusCode = 409;

      throw error;
    }

    draft.currentStep = Number(currentStep);

    await draft.save();

    return draft;
  }

  // ==========================================================
  // MARK GENERATED
  // ==========================================================

  async markGenerated(userId, draftId, roadmapId) {
    const draft = await this.getOwnedDraft(userId, draftId);

    if (draft.generated) {
      /**
       * Idempotency:
       *
       * If the same request reaches the service
       * twice, don't break the existing relation.
       */
      if (
        draft.generatedRoadmapId &&
        String(draft.generatedRoadmapId) === String(roadmapId)
      ) {
        return draft;
      }

      const error = new Error(
        "Draft is already linked to another generated roadmap",
      );

      error.statusCode = 409;

      throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(roadmapId)) {
      const error = new Error("Invalid roadmapId");

      error.statusCode = 400;

      throw error;
    }

    draft.generated = true;

    draft.generatedRoadmapId = roadmapId;

    draft.readyForGeneration = false;

    await draft.save();

    return draft;
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  async deleteDraft(userId, draftId) {
    const draft = await this.getOwnedDraft(userId, draftId);

    await RoadmapDraft.deleteOne({
      _id: draft._id,
      userId,
    });

    return {
      success: true,

      draftId: draft._id,
    };
  }
}

// ============================================================
// EXPORT
// ============================================================

const draftService = new DraftService();

export default draftService;
