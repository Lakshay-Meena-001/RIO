import mongoose from "mongoose";

const { Schema } = mongoose;

const resourceSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["youtube", "article", "documentation", "course"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    source: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    durationMinutes: {
      type: Number,
      min: 0,
      default: null,
    },

    viewCount: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  { _id: false },
);

const moduleSchema = new Schema(
  {
    order: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    whyItMatters: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    prerequisites: {
      type: [String],
      default: [],
    },

    learningOutcomes: {
      type: [String],
      default: [],
    },

    resources: {
      type: [resourceSchema],
      default: [],
      validate: {
        validator: (resources) => resources.length <= 4,
        message: "A module cannot contain more than 4 resources.",
      },
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true },
);

const roadmapSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

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
      maxlength: 150,
    },

    targetPackage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    modules: {
      type: [moduleSchema],
      required: true,
      validate: [
        {
          validator: (modules) => modules.length >= 1,
          message: "Roadmap must contain at least one module.",
        },
        {
          validator: (modules) => modules.length <= 20,
          message: "Roadmap cannot contain more than 20 modules.",
        },
      ],
    },

    currentModule: {
      type: Number,
      default: 1,
      min: 1,
    },

    completedModules: {
      type: Number,
      default: 0,
      min: 0,
    },

    version: {
      type: Number,
      default: 1,
      min: 1,
    },

    learningSystemVersion: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

roadmapSchema.index({ userId: 1, createdAt: -1 });

const Roadmap = mongoose.model("Roadmap", roadmapSchema);

export default Roadmap;

