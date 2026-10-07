/**
 * RIO Roadmap Draft Model
 *
 * Stores incomplete roadmap-builder state.
 *
 * Important:
 * - Draft != generated roadmap.
 * - Drafts are editable.
 * - Drafts survive refresh/browser close.
 * - A draft can later produce a Roadmap document.
 * - No LLM output is stored here.
 */

import mongoose from "mongoose";

import {
  ROADMAP_GENERATION_MODES,
  ROADMAP_LEVELS,
  ROADMAP_INPUT_SOURCES,
} from "../constants/roadmap.constants.js";

/* -------------------------------------------------------------------------- */
/* Target Schema                                                              */
/* -------------------------------------------------------------------------- */

const targetSchema = new mongoose.Schema(
  {
    compensation: {
      type: Number,
      min: 0,
      default: 12,
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
      uppercase: true,
    },

    unit: {
      type: String,
      default: "LPA",
      trim: true,
      uppercase: true,
    },
  },
  {
    _id: false,
  },
);

/* -------------------------------------------------------------------------- */
/* Custom Requirement Schema                                                  */
/* -------------------------------------------------------------------------- */

const customRequirementSchema = new mongoose.Schema(
  {
    /**
     * Natural-language requirement written by the user.
     *
     * Example:
     *
     * "I want to become a backend engineer..."
     */
    prompt: {
      type: String,
      trim: true,
      maxlength: 10000,
      default: "",
    },

    goals: {
      type: [String],
      default: [],
    },

    technologies: {
      type: [String],
      default: [],
    },

    exclusions: {
      type: [String],
      default: [],
    },

    projectPreferences: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  },
);

/* -------------------------------------------------------------------------- */
/* Main Draft Schema                                                          */
/* -------------------------------------------------------------------------- */

const roadmapDraftSchema = new mongoose.Schema(
  {
    /* ---------------------------------------------------------------------- */
    /* Ownership                                                              */
    /* ---------------------------------------------------------------------- */

    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    /* ---------------------------------------------------------------------- */
    /* Builder Mode                                                           */
    /* ---------------------------------------------------------------------- */

    generationMode: {
      type: String,
      enum: Object.values(ROADMAP_GENERATION_MODES),
      default: ROADMAP_GENERATION_MODES.STANDARD,
      required: true,
    },

    /* ---------------------------------------------------------------------- */
    /* Role                                                                   */
    /* ---------------------------------------------------------------------- */

    role: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    /**
     * Canonical template selected by the builder.
     *
     * Example:
     * "frontend-developer"
     *
     * For a fully custom roadmap this may initially be null
     * until the system determines the appropriate base knowledge.
     */
    templateId: {
      type: String,
      trim: true,
      default: null,
    },

    /* ---------------------------------------------------------------------- */
    /* Target                                                                 */
    /* ---------------------------------------------------------------------- */

    target: {
      type: targetSchema,
      default: () => ({
        compensation: 12,
        currency: "INR",
        unit: "LPA",
      }),
    },

    /* ---------------------------------------------------------------------- */
    /* User Profile                                                           */
    /* ---------------------------------------------------------------------- */

    level: {
      type: String,
      enum: Object.values(ROADMAP_LEVELS),
      default: ROADMAP_LEVELS.BEGINNER,
    },

    availableHoursPerDay: {
      type: Number,
      min: 0.5,
      max: 24,
      default: 2,
    },

    /* ---------------------------------------------------------------------- */
    /* Resume Context                                                         */
    /* ---------------------------------------------------------------------- */

    useResume: {
      type: Boolean,
      default: false,
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    resumeVersion: {
      type: Number,
      default: null,
    },

    /* ---------------------------------------------------------------------- */
    /* Manual Skills                                                          */
    /* ---------------------------------------------------------------------- */

    manualSkills: {
      type: [String],
      default: [],
    },

    /* ---------------------------------------------------------------------- */
    /* Custom Requirements                                                    */
    /* ---------------------------------------------------------------------- */

    customRequirements: {
      type: customRequirementSchema,
      default: null,
    },

    /* ---------------------------------------------------------------------- */
    /* Input Source                                                           */
    /* ---------------------------------------------------------------------- */

    inputSource: {
      type: String,
      enum: Object.values(ROADMAP_INPUT_SOURCES),
      default: ROADMAP_INPUT_SOURCES.STANDARD,
    },

    /* ---------------------------------------------------------------------- */
    /* Draft Lifecycle                                                        */
    /* ---------------------------------------------------------------------- */

    /**
     * Whether the user has completed enough information
     * for generation.
     */
    readyForGeneration: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether this draft has already been converted
     * into a generated roadmap.
     */
    generated: {
      type: Boolean,
      default: false,
    },

    generatedRoadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      default: null,
    },

    /* ---------------------------------------------------------------------- */
    /* Last Saved Step                                                        */
    /* ---------------------------------------------------------------------- */

    /**
     * Useful for restoring the builder exactly where
     * the user left it.
     */
    currentStep: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* -------------------------------------------------------------------------- */
/* Indexes                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * User's drafts.
 */
roadmapDraftSchema.index({
  userId: 1,
  updatedAt: -1,
});

/**
 * Fast lookup of active/generated draft.
 */
roadmapDraftSchema.index({
  userId: 1,
  generated: 1,
});

/**
 * User + template lookup.
 */
roadmapDraftSchema.index({
  userId: 1,
  templateId: 1,
});

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

const RoadmapDraft = mongoose.model("RoadmapDraft", roadmapDraftSchema);

export default RoadmapDraft;
