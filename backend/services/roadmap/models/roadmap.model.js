/**
 * RIO Roadmap Model
 *
 * Stores a user's generated roadmap.
 *
 * Important:
 * - Standard, resume-adaptive, and custom roadmaps use the same model.
 * - The roadmap is a snapshot of canonical knowledge at generation time.
 * - User progress belongs here.
 * - Canonical knowledge itself does NOT belong in MongoDB.
 */

import mongoose from "mongoose";

import {
  ROADMAP_GENERATION_MODES,
  ROADMAP_STATUSES,
  ROADMAP_NODE_STATUSES,
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
/* Profile Schema                                                             */
/* -------------------------------------------------------------------------- */

const profileSchema = new mongoose.Schema(
  {
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
  },
  {
    _id: false,
  },
);

/* -------------------------------------------------------------------------- */
/* Roadmap Node Schema                                                        */
/* -------------------------------------------------------------------------- */

/**
 * This is a USER snapshot of a canonical knowledge node.
 *
 * We intentionally keep the stored node lightweight.
 *
 * The canonical content can still be resolved from the template,
 * while user-specific status is stored here.
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

    /**
     * Used when a user explicitly skips a topic.
     */
    skippedReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
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

/* -------------------------------------------------------------------------- */
/* Custom Requirement Schema                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Stores the user's original custom requirement.
 *
 * This is useful because a custom roadmap should remain explainable:
 *
 * "Why did RIO create this roadmap?"
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
  },
  {
    _id: false,
  },
);

/* -------------------------------------------------------------------------- */
/* Input Context Schema                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Stores how the roadmap was created.
 *
 * We do NOT store the complete resume here.
 * Resume remains owned by Resume Service.
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
      type: Number,
      default: null,
    },

    manualSkills: {
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

/* -------------------------------------------------------------------------- */
/* Progress Snapshot Schema                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Cached aggregate progress.
 *
 * Individual truth lives in nodes[].
 * This object exists so dashboards do not have to recalculate
 * everything for every request.
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

/* -------------------------------------------------------------------------- */
/* Main Roadmap Schema                                                        */
/* -------------------------------------------------------------------------- */

const roadmapSchema = new mongoose.Schema(
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
    /* Canonical Template Snapshot                                            */
    /* ---------------------------------------------------------------------- */

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

    /* ---------------------------------------------------------------------- */
    /* Basic Identity                                                         */
    /* ---------------------------------------------------------------------- */

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

    /* ---------------------------------------------------------------------- */
    /* User Goal                                                              */
    /* ---------------------------------------------------------------------- */

    target: {
      type: targetSchema,
      required: true,
    },

    profile: {
      type: profileSchema,
      required: true,
    },

    /* ---------------------------------------------------------------------- */
    /* Generation                                                             */
    /* ---------------------------------------------------------------------- */

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

    /* ---------------------------------------------------------------------- */
    /* Lifecycle                                                              */
    /* ---------------------------------------------------------------------- */

    status: {
      type: String,
      enum: Object.values(ROADMAP_STATUSES),
      default: ROADMAP_STATUSES.ACTIVE,
      index: true,
    },

    /* ---------------------------------------------------------------------- */
    /* User Roadmap                                                           */
    /* ---------------------------------------------------------------------- */

    nodes: {
      type: [roadmapNodeSchema],
      default: [],
    },

    /* ---------------------------------------------------------------------- */
    /* Progress                                                               */
    /* ---------------------------------------------------------------------- */

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

    /* ---------------------------------------------------------------------- */
    /* Current Focus / Next Move                                              */
    /* ---------------------------------------------------------------------- */

    currentFocus: {
      nodeId: {
        type: String,
        default: null,
      },

      reason: {
        type: String,
        default: "",
        trim: true,
        maxlength: 1000,
      },

      priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
    },

    /* ---------------------------------------------------------------------- */
    /* Deduplication                                                          */
    /* ---------------------------------------------------------------------- */

    fingerprint: {
      type: String,
      default: null,
      index: true,
    },

    /* ---------------------------------------------------------------------- */
    /* Error / Generation Metadata                                            */
    /* ---------------------------------------------------------------------- */

    generationError: {
      code: {
        type: String,
        default: null,
      },

      message: {
        type: String,
        default: null,
        maxlength: 2000,
      },

      occurredAt: {
        type: Date,
        default: null,
      },
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
 * Most important ownership query:
 *
 * "Give me this user's roadmap."
 */
roadmapSchema.index({
  userId: 1,
  updatedAt: -1,
});

/**
 * User history query.
 */
roadmapSchema.index({
  userId: 1,
  createdAt: -1,
});

/**
 * Fast lookup for an exact generated roadmap.
 */
roadmapSchema.index({
  userId: 1,
  fingerprint: 1,
});

/**
 * Useful for active-roadmap queries.
 */
roadmapSchema.index({
  userId: 1,
  status: 1,
});

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

const Roadmap = mongoose.model("Roadmap", roadmapSchema);

export default Roadmap;
