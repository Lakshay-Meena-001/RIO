/**
 * RIO Roadmap Model
 *
 * Stores a user's generated roadmap.
 *
 * Three generation modes use the same model:
 *
 * 1. standard
 * 2. resume
 * 3. custom
 *
 * Important:
 *
 * - Canonical roadmap knowledge lives in the knowledge layer.
 * - This model stores the user's roadmap snapshot/state.
 * - User progress lives inside nodes[].
 * - Resume itself remains owned by Resume Service.
 */

import mongoose from "mongoose";

import {
  ROADMAP_GENERATION_MODES,
  ROADMAP_STATUSES,
  ROADMAP_NODE_STATUSES,
  ROADMAP_LEVELS,
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
      default: 12,
    },

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "INR",
    },

    unit: {
      type: String,
      trim: true,
      uppercase: true,
      default: "LPA",
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// PROFILE
// ============================================================

const profileSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: Object.values(ROADMAP_LEVELS),
      default: ROADMAP_LEVELS.BEGINNER,
    },

    availableHoursPerDay: {
      type: Number,
      min: 0,
      max: 24,
      default: 2,
    },

    /**
     * Skills explicitly provided by the user.
     */
    currentSkills: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// ROADMAP NODE
// ============================================================

/**
 * This is the user's state for one canonical knowledge node.
 *
 * Canonical information such as:
 *
 * - description
 * - whyItMatters
 * - prerequisites
 * - alternatives
 *
 * stays inside the knowledge layer.
 *
 * MongoDB only stores user-specific state here.
 */
const roadmapNodeSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(ROADMAP_NODE_STATUSES),
      default: ROADMAP_NODE_STATUSES.NOT_STARTED,
    },

    skippedReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// CUSTOM REQUIREMENTS
// ============================================================

/**
 * Original requirements used for custom/adaptive generation.
 *
 * Keeping these makes the generated roadmap explainable.
 */
const customRequirementSchema = new mongoose.Schema(
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
// INPUT CONTEXT
// ============================================================

/**
 * Describes where the roadmap came from.
 *
 * Resume itself is NOT stored here.
 *
 * Resume Service remains the source of truth.
 */
const inputContextSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: Object.values(ROADMAP_INPUT_SOURCES),
      default: ROADMAP_INPUT_SOURCES.STANDARD,
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    resumeVersion: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    manualSkills: {
      type: [String],
      default: [],
    },

    projectPreferences: {
      type: [String],
      default: [],
    },

    customRequirements: {
      type: customRequirementSchema,
      default: null,
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// PROGRESS
// ============================================================

/**
 * Cached aggregate progress.
 *
 * nodes[] remains the source of truth.
 *
 * This object exists so dashboard queries stay cheap.
 */
const progressSchema = new mongoose.Schema(
  {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    total: {
      type: Number,
      min: 0,
      default: 0,
    },

    completed: {
      type: Number,
      min: 0,
      default: 0,
    },

    learning: {
      type: Number,
      min: 0,
      default: 0,
    },

    skipped: {
      type: Number,
      min: 0,
      default: 0,
    },

    remaining: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// CURRENT FOCUS
// ============================================================

/**
 * "Your Next Move"
 *
 * Priority here is NOT the same thing as knowledge importance.
 *
 * Allowed:
 *
 * low
 * medium
 * high
 */
const currentFocusSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      default: null,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// GENERATION ERROR
// ============================================================

const generationErrorSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      default: null,
      trim: true,
    },

    message: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },

    occurredAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// MAIN ROADMAP SCHEMA
// ============================================================

const roadmapSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // Ownership
    // ----------------------------------------------------------

    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ----------------------------------------------------------
    // Canonical Template
    // ----------------------------------------------------------

    templateId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    templateVersion: {
      type: Number,
      required: true,
      min: 1,
    },

    knowledgeVersion: {
      type: Number,
      required: true,
      min: 1,
    },

    // ----------------------------------------------------------
    // Identity
    // ----------------------------------------------------------

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    // ----------------------------------------------------------
    // Goal
    // ----------------------------------------------------------

    target: {
      type: targetSchema,
      required: true,
    },

    profile: {
      type: profileSchema,
      required: true,
    },

    // ----------------------------------------------------------
    // Generation
    // ----------------------------------------------------------

    generationMode: {
      type: String,
      enum: Object.values(ROADMAP_GENERATION_MODES),
      default: ROADMAP_GENERATION_MODES.STANDARD,
      index: true,
    },

    inputContext: {
      type: inputContextSchema,

      default: () => ({
        source: ROADMAP_INPUT_SOURCES.STANDARD,
      }),
    },

    // ----------------------------------------------------------
    // Lifecycle
    // ----------------------------------------------------------

    status: {
      type: String,
      enum: Object.values(ROADMAP_STATUSES),
      default: ROADMAP_STATUSES.ACTIVE,
      index: true,
    },

    // ----------------------------------------------------------
    // User Roadmap Nodes
    // ----------------------------------------------------------

    nodes: {
      type: [roadmapNodeSchema],
      default: [],
    },

    // ----------------------------------------------------------
    // Progress
    // ----------------------------------------------------------

    progress: {
      type: progressSchema,

      default: () => ({
        percentage: 0,
        total: 0,
        completed: 0,
        learning: 0,
        skipped: 0,
        remaining: 0,
      }),
    },

    // ----------------------------------------------------------
    // Current Focus
    // ----------------------------------------------------------

    currentFocus: {
      type: currentFocusSchema,
      default: null,
    },

    // ----------------------------------------------------------
    // AI Adaptation Explanation
    // ----------------------------------------------------------

    /**
     * Short explanation of how RIO adapted the canonical
     * roadmap for this user.
     *
     * Example:
     *
     * "HTML and CSS were de-emphasized because the resume
     * already demonstrates production frontend experience."
     */
    adaptationSummary: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: null,
    },

    // ----------------------------------------------------------
    // Deduplication
    // ----------------------------------------------------------

    fingerprint: {
      type: String,
      default: null,
      index: true,
    },

    // ----------------------------------------------------------
    // Generation Error
    // ----------------------------------------------------------

    generationError: {
      type: generationErrorSchema,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ============================================================
// INDEXES
// ============================================================

/**
 * User's recently updated roadmaps.
 */
roadmapSchema.index({
  userId: 1,
  updatedAt: -1,
});

/**
 * User's roadmap history.
 */
roadmapSchema.index({
  userId: 1,
  createdAt: -1,
});

/**
 * Exact generation deduplication.
 */
roadmapSchema.index({
  userId: 1,
  fingerprint: 1,
});

/**
 * Active/completed roadmap filtering.
 */
roadmapSchema.index({
  userId: 1,
  status: 1,
});

// ============================================================
// MODEL
// ============================================================

const Roadmap = mongoose.model("Roadmap", roadmapSchema);

export default Roadmap;
