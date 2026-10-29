import mongoose from "mongoose";
import crypto from "node:crypto";

// SUB-SCHEMAS

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

// FINGERPRINT HELPERS

const normalizeResumeText = (text = "") =>
  String(text).replace(/\r\n/g, "\n").trim().replace(/\s+/g, " ");

const createResumeFingerprint = (text = "") =>
  crypto.createHash("sha256").update(normalizeResumeText(text)).digest("hex");

// RESUME SCHEMA

const resumeSchema = new mongoose.Schema(
  {
    // A user can own multiple resumes.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // Extracted source text used for analysis and duplicate detection.
    extractedText: {
      type: String,
      default: "",
    },

    // SHA-256 fingerprint of normalized extracted text.
    contentFingerprint: {
      type: String,
      default: "",
    },

    // Per-user idempotency key. Sparse uniqueness keeps legacy documents
    // without this field valid while preventing concurrent duplicate uploads.
    idempotencyKey: {
      type: String,
      select: false,
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

      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      missingSkills: { type: [String], default: [] },
      suggestedRoles: { type: [String], default: [] },
      recommendations: { type: [String], default: [] },
    },

    processing: {
      status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending",
      },
      stage: {
        type: String,
        enum: [
          "",
          "analyzing",
          "analysis_failed",
          "billing",
          "billing_failed",
          "completed",
        ],
        default: "",
      },

      parser: { type: String, default: "" },
      analyzedAt: { type: Date, default: null },
      error: { type: String, default: "" },
      lockToken: { type: String, default: undefined, select: false },
      lockExpiresAt: { type: Date, default: undefined, select: false },
    },
    billing: {
      status: {
        type: String,
        enum: ["not_required", "pending", "charged", "failed"],
        default: "pending",
        index: false,
      },

      transactionId: {
        type: String,
        default: "",
        trim: true,
      },

      amount: {
        type: Number,
        default: 100,
        min: 0,
      },

      chargedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, value) => {
        delete value.idempotencyKey;
        if (value.processing) {
          delete value.processing.lockToken;
          delete value.processing.lockExpiresAt;
        }
        return value;
      },
    },
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

// INDEXES

// Supports user resume listing sorted by latest update.
resumeSchema.index({ userId: 1, updatedAt: -1 });

// Supports duplicate lookup by user and fingerprint.
resumeSchema.index({ userId: 1, contentFingerprint: 1 });

// Legacy documents do not have this key. New documents use it to make
// concurrent uploads for the same user and resume content idempotent.
resumeSchema.index(
  { idempotencyKey: 1 },
  { unique: true, sparse: true, name: "uniq_resume_idempotency_key" },
);

// Preserve the existing archive index from isArchived: true.

const Resume = mongoose.models.Resume || mongoose.model("Resume", resumeSchema);

export default Resume;
