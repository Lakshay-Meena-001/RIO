import mongoose from "mongoose";

import {
  ROADMAP_GENERATION_MODES,
  EXPERIENCE_LEVELS,
  ROADMAP_INPUT_SOURCES,
} from "../constants/roadmap.constants.js";

// ============================================================
// TARGET
// ============================================================

const targetSchema = new mongoose.Schema(
  {
    compensation: {
      type: Number,
      min: 0,
      max: 1000,
      default: 12,
    },

    currency: {
      type: String,
      trim: true,
      default: "INR",
    },

    unit: {
      type: String,
      trim: true,
      default: "LPA",
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// CUSTOM REQUIREMENTS
// ============================================================

const customRequirementsSchema = new mongoose.Schema(
  {
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

    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// ROADMAP DRAFT
// ============================================================

const roadmapDraftSchema = new mongoose.Schema(
  {
    // --------------------------------------------------------
    // OWNER
    // --------------------------------------------------------

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // --------------------------------------------------------
    // GENERATION MODE
    // --------------------------------------------------------

    generationMode: {
      type: String,

      enum: Object.values(ROADMAP_GENERATION_MODES),

      default: ROADMAP_GENERATION_MODES.STANDARD,

      required: true,
    },

    // --------------------------------------------------------
    // ROLE
    // --------------------------------------------------------

    role: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    // --------------------------------------------------------
    // TEMPLATE
    // --------------------------------------------------------

    templateId: {
      type: String,
      trim: true,
      default: null,
    },

    // --------------------------------------------------------
    // TARGET
    // --------------------------------------------------------

    target: {
      type: targetSchema,
      default: () => ({}),
    },

    // --------------------------------------------------------
    // LEVEL
    // --------------------------------------------------------

    level: {
      type: String,

      enum: Object.values(EXPERIENCE_LEVELS),

      default: EXPERIENCE_LEVELS.BEGINNER,
    },

    // --------------------------------------------------------
    // AVAILABLE TIME
    // --------------------------------------------------------

    availableHoursPerDay: {
      type: Number,

      min: 0,

      max: 24,

      default: 2,
    },

    // --------------------------------------------------------
    // RESUME
    // --------------------------------------------------------

    useResume: {
      type: Boolean,
      default: false,
    },

    resumeId: {
      type: String,
      trim: true,
      default: null,
    },

    resumeVersion: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // --------------------------------------------------------
    // MANUAL SKILLS
    // --------------------------------------------------------

    manualSkills: {
      type: [String],
      default: [],
    },

    // --------------------------------------------------------
    // CUSTOM REQUIREMENTS
    // --------------------------------------------------------

    customRequirements: {
      type: customRequirementsSchema,

      default: () => ({}),
    },

    // --------------------------------------------------------
    // INPUT SOURCE
    // --------------------------------------------------------

    inputSource: {
      type: String,

      enum: Object.values(ROADMAP_INPUT_SOURCES),

      default: ROADMAP_INPUT_SOURCES.STANDARD,
    },

    // --------------------------------------------------------
    // BUILDER PROGRESS
    // --------------------------------------------------------

    currentStep: {
      type: Number,

      min: 0,

      max: 100,

      default: 0,
    },

    readyForGeneration: {
      type: Boolean,

      default: false,
    },

    // --------------------------------------------------------
    // GENERATION RESULT
    // --------------------------------------------------------

    generated: {
      type: Boolean,

      default: false,
    },

    generatedRoadmapId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Roadmap",

      default: null,
    },
  },

  {
    timestamps: true,
  },
);

// ============================================================
// INDEXES
// ============================================================

/**
 * Fast lookup for the user's latest draft.
 */
roadmapDraftSchema.index({
  userId: 1,
  updatedAt: -1,
});

/**
 * Fast lookup when checking whether
 * a draft generated a particular roadmap.
 */
roadmapDraftSchema.index({
  userId: 1,
  generatedRoadmapId: 1,
});

/**
 * Useful when recovering drafts for
 * a specific roadmap template.
 */
roadmapDraftSchema.index({
  userId: 1,
  templateId: 1,
});

// ============================================================
// MODEL
// ============================================================

const RoadmapDraft = mongoose.model("RoadmapDraft", roadmapDraftSchema);

export default RoadmapDraft;
