import mongoose from "mongoose";

/*
 * AI evaluates the candidate's answer after submission.
 */
const evaluationSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    correctness: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    clarity: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    relevance: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    communication: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    feedback: {
      type: String,
      default: "",
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    betterAnswer: {
      type: String,
      default: "",
    },

    recommendations: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

/*
 * ---------------------------------------------------------
 * Interview Question
 * ---------------------------------------------------------
 * Stores one question asked during the interview.
 */
const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    section: {
      type: String,
      enum: [
        "dsa",
        "dbms",
        "os",
        "cn",
        "sql",
        "oop",
        "development",
        "project",
        "system-design",
        "behavioral",
      ],
    },

    type: {
      type: String,
      enum: ["primary"],
      default: "primary",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    answer: {
      type: String,
      default: "",
    },

    askedAt: {
      type: Date,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    evaluation: {
      type: evaluationSchema,
      default: () => ({}),
    },
  },
  { _id: false },
);

/*
 * ---------------------------------------------------------
 * Interview Schema
 * ---------------------------------------------------------
 * One document represents one complete interview attempt.
 */
const interviewSchema = new mongoose.Schema(
  {
    /*
     * Candidate
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    experienceLevel: {
      type: String,
      enum: ["fresher", "experienced"],
      required: true,
    },

    interviewLevel: {
      type: String,
      enum: ["fresher", "sde-1", "sde-2"],
      required: true,
    },

    /*
     * Interview Configuration
     */
    interviewType: {
      type: String,
      enum: [
        "dsa",
        "core",
        "development",
        "project",
        "system-design",
        "behavioral",
        "full",
      ],
      required: true,
    },

    language: {
      type: String,
      enum: ["english"],
      default: "english",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "adaptive"],
      default: "easy",
    },

    timeLimit: {
      type: Number,
      min: 1,
      default: 30,
    },

    questionCount: {
      type: Number,
      min: 1,
      default: 10,
    },

    techStack: {
      type: [String],
      default: [],
    },

    /*
     * Project / GitHub Context
     */
    projectContext: {
      source: {
        type: String,
        enum: ["resume", "github", "description"],
        default: null,
      },

      projectName: {
        type: String,
        default: "",
      },

      description: {
        type: String,
        default: "",
      },

      githubUrl: {
        type: String,
        default: "",
      },
    },

    /*
     * Interview State
     */
    status: {
      type: String,
      enum: ["created", "in-progress", "paused", "completed", "abandoned"],
      default: "created",
    },

    currentQuestionIndex: {
      type: Number,
      default: 0,
    },

    /*
     * Complete Interview Conversation
     */
    questions: {
      type: [questionSchema],
      default: [],
    },

    /*
     * Final Interview Result
     */
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    sectionScores: {
      type: Map,
      of: Number,
      default: {},
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },

    summary: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
