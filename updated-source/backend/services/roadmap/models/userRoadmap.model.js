import mongoose from "mongoose";

import {
  USER_ROADMAP_STATUS,
  ROADMAP_NODE_STATUS,
} from "../constants/roadmap.constants.js";

const { Schema, model, models } = mongoose;

const topicProgressSchema = new Schema(
  {
    topicId: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ROADMAP_NODE_STATUS),
      default: ROADMAP_NODE_STATUS.NOT_STARTED,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
      maxlength: 5000,
    },
  },
  { _id: false },
);

const phaseProgressSchema = new Schema(
  {
    phaseId: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ROADMAP_NODE_STATUS),
      default: ROADMAP_NODE_STATUS.NOT_STARTED,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    topics: {
      type: [topicProgressSchema],
      default: [],
    },
  },
  { _id: false },
);

const userRoadmapSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      immutable: true,
      index: true,
    },

    roadmap: {
      type: Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
      immutable: true,
    },

    // Snapshot IDs make history filtering straightforward.
    catalogRoadmapId: {
      type: String,
      required: true,
      immutable: true,
      index: true,
    },

    packageId: {
      type: String,
      required: true,
      immutable: true,
    },

    status: {
      type: String,
      enum: Object.values(USER_ROADMAP_STATUS),
      default: USER_ROADMAP_STATUS.ACTIVE,
      index: true,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },

    phaseProgress: {
      type: [phaseProgressSchema],
      default: [],
    },

    // User-specific overall progress; recalculated by the progress service.
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

// Prevent duplicate personal entries for the same canonical roadmap.
userRoadmapSchema.index(
  {
    userId: 1,
    roadmap: 1,
  },
  {
    unique: true,
  },
);

userRoadmapSchema.index({
  userId: 1,
  status: 1,
  lastAccessedAt: -1,
});

userRoadmapSchema.index({
  userId: 1,
  catalogRoadmapId: 1,
  packageId: 1,
});

const UserRoadmap =
  models.UserRoadmap || model("UserRoadmap", userRoadmapSchema);

export default UserRoadmap;
