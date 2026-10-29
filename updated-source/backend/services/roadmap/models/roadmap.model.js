import mongoose from "mongoose";

import {
  ROADMAP_SCHEMA_VERSION,
  ROADMAP_STATUS,
} from "../constants/roadmap.constants.js";

const { Schema, model, models } = mongoose;

const resourceSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: "other",
      trim: true,
    },
    purpose: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const topicOptionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["alternative", "complementary", "specialization"],
      default: "alternative",
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    whenToChoose: {
      type: String,
      default: "",
      trim: true,
    },
    tradeoffs: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const topicSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    importance: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["core", "optional", "advanced", "project", "specialization"],
      default: "core",
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    estimatedHours: {
      type: Number,
      min: 0,
      default: 0,
    },
    subtopics: {
      type: [String],
      default: [],
    },
    practiceTasks: {
      type: [String],
      default: [],
    },
    resources: {
      type: [resourceSchema],
      default: [],
    },
    completionCriteria: {
      type: [String],
      default: [],
    },
    options: {
      type: [topicOptionSchema],
      default: [],
    },
  },
  { _id: false },
);

const projectSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    skillsPracticed: {
      type: [String],
      default: [],
    },
    completionCriteria: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const phaseSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    topics: {
      type: [topicSchema],
      default: [],
    },
    projects: {
      type: [projectSchema],
      default: [],
    },
    completionCriteria: {
      type: [String],
      default: [],
    },
    generationStatus: {
      type: String,
      enum: ["pending", "generating", "ready", "failed"],
      default: "pending",
    },
    generatedAt: {
      type: Date,
      default: null,
    },
    generationError: {
      type: String,
      default: null,
    },

    // Persist the phase-level lock used by atomic generation claims.
    generationStartedAt: {
      type: Date,
      default: null,
    },
    generationToken: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

const learningPathSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    recommendedFor: {
      type: [String],
      default: [],
    },
    topicIds: {
      type: [String],
      default: [],
    },
    nextPathIds: {
      type: [String],
      default: [],
    },
    tradeoffs: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const decisionAlternativeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    whenToChoose: {
      type: String,
      default: "",
      trim: true,
    },
    tradeoffs: {
      type: [String],
      default: [],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const decisionGuideSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    recommendation: {
      type: String,
      required: true,
      trim: true,
    },
    alternatives: {
      type: [decisionAlternativeSchema],
      default: [],
    },
  },
  { _id: false },
);

const capstoneProjectSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    skillsPracticed: {
      type: [String],
      default: [],
    },
    completionCriteria: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const roadmapPackageSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const roadmapSchema = new Schema(
  {
    roadmapId: {
      type: String,
      required: true,
      immutable: true,
      index: true,
    },
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
    cacheKey: {
      type: String,
      required: true,
      immutable: true,
    },
    schemaVersion: {
      type: Number,
      required: true,
      default: ROADMAP_SCHEMA_VERSION,
    },
    blueprint: {
      type: Schema.Types.Mixed,
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    package: {
      type: roadmapPackageSchema,
      required: true,
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    phases: {
      type: [phaseSchema],
      default: [],
    },
    learningPaths: {
      type: [learningPathSchema],
      default: [],
    },
    decisionGuides: {
      type: [decisionGuideSchema],
      default: [],
    },
    capstoneProjects: {
      type: [capstoneProjectSchema],
      default: [],
    },
    finalReadinessChecklist: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(ROADMAP_STATUS),
      default: ROADMAP_STATUS.GENERATING,
      index: true,
    },
    totalPhases: {
      type: Number,
      min: 0,
      default: 0,
    },
    completedGenerationPhases: {
      type: Number,
      min: 0,
      default: 0,
    },
    generationError: {
      type: String,
      default: null,
    },
    generationStartedAt: {
      type: Date,
      default: null,
    },
    generationToken: {
      type: String,
      default: null,
    },
    generatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

// One canonical roadmap per catalog + package + schema version.
roadmapSchema.index(
  {
    cacheKey: 1,
  },
  {
    unique: true,
  },
);

roadmapSchema.index({
  catalogRoadmapId: 1,
  packageId: 1,
  status: 1,
});

roadmapSchema.index({
  status: 1,
  updatedAt: -1,
});

const Roadmap = models.Roadmap || model("Roadmap", roadmapSchema);

export default Roadmap;
