import mongoose from "mongoose";
import crypto from "crypto";

// ============================================================
// SUB-SCHEMAS
// ============================================================

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, trim: true, default: "" },
    degree: { type: String, trim: true, default: "" },
    field: { type: String, trim: true, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    description: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, trim: true, default: "" },
    role: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    description: { type: String, trim: true, default: "" },
    technologies: { type: [String], default: [] },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    technologies: { type: [String], default: [] },
    url: { type: String, trim: true, default: "" },
    githubUrl: { type: String, trim: true, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
  },
  { _id: false },
);

// ============================================================
// FINGERPRINT HELPER
// ============================================================

const normalizeResumeText = (text = "") =>
  String(text).replace(/\r\n/g, "\n").trim().replace(/\s+/g, " ");

const createResumeFingerprint = (text = "") =>
  crypto.createHash("sha256").update(normalizeResumeText(text)).digest("hex");

// ============================================================
// RESUME SCHEMA
// ============================================================

const resumeSchema = new mongoose.Schema(
  {
    // Multiple resumes can belong to the same user.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Original extracted resume text.
    extractedText: {
      type: String,
      default: "",
    },

    // Stable hash to identify duplicate resume content.
    contentFingerprint: {
      type: String,
      default: "",
      index: true,
    },

    // Archive/soft-delete support.
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    profile: {
      name: { type: String, trim: true, default: "" },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
      },
      phone: { type: String, trim: true, default: "" },
      location: { type: String, trim: true, default: "" },
      linkedIn: { type: String, trim: true, default: "" },
      github: { type: String, trim: true, default: "" },
      portfolio: { type: String, trim: true, default: "" },
      leetcode: { type: String, trim: true, default: "" },
    },

    summary: {
      type: String,
      trim: true,
      default: "",
    },

    education: {
      type: [educationSchema],
      default: [],
    },

    experience: {
      type: [experienceSchema],
      default: [],
    },

    projects: {
      type: [projectSchema],
      default: [],
    },

    skills: {
      type: [String],
      default: [],
    },

    certifications: {
      type: [String],
      default: [],
    },

    achievements: {
      type: [String],
      default: [],
    },

    languages: {
      type: [String],
      default: [],
    },

    analysis: {
      score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      strengths: {
        type: [String],
        default: [],
      },

      weaknesses: {
        type: [String],
        default: [],
      },

      missingSkills: {
        type: [String],
        default: [],
      },

      suggestedRoles: {
        type: [String],
        default: [],
      },

      recommendations: {
        type: [String],
        default: [],
      },
    },

    processing: {
      status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending",
      },

      parser: {
        type: String,
        default: "",
      },

      analyzedAt: {
        type: Date,
        default: null,
      },

      error: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  },
);

// ============================================================
// AUTOMATIC FINGERPRINT
// ============================================================

resumeSchema.pre("validate", function () {
  if (this.isModified("extractedText")) {
    const text = normalizeResumeText(this.extractedText || "");

    this.contentFingerprint = text ? createResumeFingerprint(text) : "";
  }
});

// ============================================================
// INDEXES
// ============================================================

// Efficient lookup for a user's resumes.
resumeSchema.index({ userId: 1, updatedAt: -1 });

// Efficient duplicate lookup.
resumeSchema.index({ userId: 1, contentFingerprint: 1 });

// IMPORTANT:
// Do not add unique: true to userId.
// One user must be able to store multiple resumes.

const Resume = mongoose.models.Resume || mongoose.model("Resume", resumeSchema);

export default Resume;
