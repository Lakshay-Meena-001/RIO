import mongoose from "mongoose";

/*
 * ---------------------------------------------------------
 * Evaluation Schema
 * ---------------------------------------------------------
 * AI evaluation of one candidate answer/code.
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

    logic: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    complexity: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    edgeCases: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    codeQuality: {
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
  {
    _id: false,
  },
);

/*
 * ---------------------------------------------------------
 * Question Schema
 * ---------------------------------------------------------
 * Stores every question belonging to one interview.
 *
 * IMPORTANT:
 * Questions are generated when the interview is created.
 * Navigation between questions is independent of submission.
 *
 * For Coding interviews, the complete coding problem is
 * permanently stored here so refresh/navigation never causes
 * a different problem to be generated.
 */
const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      trim: true,
    },

    /*
     * Coding problem title.
     *
     * Empty for non-coding interview questions.
     */
    title: {
      type: String,
      default: "",
      trim: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    section: {
      type: String,
      enum: [
        "coding",
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
      required: true,
    },

    type: {
      type: String,
      enum: ["primary"],
      default: "primary",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    /*
     * Coding problem constraints.
     */
    constraints: {
      type: [String],
      default: [],
    },

    /*
     * Coding problem examples.
     */
    examples: {
      type: [
        {
          input: {
            type: String,
            default: "",
          },

          output: {
            type: String,
            default: "",
          },

          explanation: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    starterCode: {
      type: String,
      default: "",
    },

    /*
     * -----------------------------------------------------
     * Candidate Answer
     * -----------------------------------------------------
     *
     * For normal interview questions:
     *   answer = candidate's textual answer.
     *
     * For Coding questions:
     *   answer = candidate's source code.
     */
    answer: {
      type: String,
      default: "",
    },

    /*
     * Explicit question submission state.
     *
     * not-submitted:
     *   Candidate has not successfully submitted this question.
     *
     * submitted:
     *   Evaluation succeeded and the question is locked.
     */
    answerStatus: {
      type: String,
      enum: ["not-submitted", "submitted"],
      default: "not-submitted",
    },

    /*
     * When the question was generated/shown.
     */
    askedAt: {
      type: Date,
      default: null,
    },

    /*
     * Set ONLY after evaluation succeeds.
     *
     * This remains null if evaluation/server processing fails.
     */
    submittedAt: {
      type: Date,
      default: null,
    },

    evaluation: {
      type: evaluationSchema,
      default: () => ({}),
    },
  },
  {
    _id: false,
  },
);

/*
 * ---------------------------------------------------------
 * Interview Schema
 * ---------------------------------------------------------
 * One MongoDB document = one interview attempt/history.
 */
const interviewSchema = new mongoose.Schema(
  {
    /*
     * -----------------------------------------------------
     * Candidate
     * -----------------------------------------------------
     */

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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
     * -----------------------------------------------------
     * Interview Configuration
     * -----------------------------------------------------
     */

    interviewType: {
      type: String,
      enum: [
        "coding",
        "core",
        "development",
        "project",
        "system-design",
        "behavioral",
        "full",
      ],
      required: true,
    },

    subjects: {
      type: [
        {
          type: String,
          enum: ["dbms", "os", "cn", "sql", "oop"],
        },
      ],
      default: [],
    },

    language: {
      type: String,
      enum: ["english"],
      default: "english",
    },

    /*
     * Programming language selected for Coding interview.
     *
     * This is separate from the interview language.
     */
    codingLanguage: {
      type: String,
      enum: ["cpp", "python", "javascript", "typescript", "java"],
      default: null,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "adaptive"],
      default: "easy",
    },

    timeLimit: {
      type: Number,
      min: 1,
      max: 180,
      default: 30,
    },

    questionCount: {
      type: Number,
      min: 1,
      max: 50,
      default: 10,
    },

    techStack: {
      type: [String],
      default: [],
    },

    /*
     * -----------------------------------------------------
     * Project / GitHub Context
     * -----------------------------------------------------
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
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      githubUrl: {
        type: String,
        default: "",
        trim: true,
      },
    },

    /*
     * -----------------------------------------------------
     * Interview State
     * -----------------------------------------------------
     */

    status: {
      type: String,
      enum: [
        "created",
        "in-progress",
        "paused",
        "completed",
        "abandoned",
        "failed",
      ],
      default: "created",
      index: true,
    },

    /*
     * -----------------------------------------------------
     * Interview Lifecycle
     * -----------------------------------------------------
     */

    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    /*
     * Why the interview ended.
     */
    terminationReason: {
      type: String,
      enum: [
        "completed",
        "quit",
        "time-limit",
        "no-answers",
        "server-error",
        "failed",
      ],
      default: null,
    },

    /*
     * -----------------------------------------------------
     * Navigation
     * -----------------------------------------------------
     *
     * This is ONLY the currently viewed question.
     *
     * It is NOT used to determine which question should
     * be generated next.
     */
    currentQuestionIndex: {
      type: Number,
      min: 0,
      default: 0,
    },

    /*
     * -----------------------------------------------------
     * Interview Questions
     * -----------------------------------------------------
     *
     * All configured questions belong to the interview.
     */
    questions: {
      type: [questionSchema],
      default: [],
    },

    /*
     * -----------------------------------------------------
     * Finalization
     * -----------------------------------------------------
     *
     * finalizedAt is set when the interview successfully
     * reaches its final completed state.
     *
     * This helps make finalization idempotent and gives us
     * a reliable lifecycle timestamp separate from the
     * general endedAt field.
     */
    finalizedAt: {
      type: Date,
      default: null,
    },

    /*
     * -----------------------------------------------------
     * Payment Lifecycle
     * -----------------------------------------------------
     *
     * Tracks the coin transaction belonging to this interview.
     *
     * not-charged:
     *   Interview has not consumed coins.
     *
     * charging:
     *   Completion payment is being processed.
     *
     * charged:
     *   Coins were successfully deducted.
     *
     * refunded:
     *   A previously charged transaction was compensated.
     */
    paymentStatus: {
      type: String,
      enum: ["not-charged", "charging", "charged", "refunded"],
      default: "not-charged",
    },

    paymentTransactionId: {
      type: String,
      default: null,
      trim: true,
    },

    /*
     * -----------------------------------------------------
     * Finalization Lock
     * -----------------------------------------------------
     *
     * Prevents concurrent final-submit requests from attempting
     * to finalize the same interview at the same time.
     */
    finalizationKey: {
      type: String,
      default: null,
      trim: true,
    },

    /*
     * -----------------------------------------------------
     * Finalization Lock Timestamp
     * -----------------------------------------------------
     *
     * Stores when the finalization lock was acquired.
     *
     * This allows the service to distinguish:
     * - an active finalization request
     * - a stale lock left behind by a crashed request
     */
    finalizationStartedAt: {
      type: Date,
      default: null,
    },

    finalizationLeaseUntil: {
      type: Date,
      default: null,
    },

    /*
     * -----------------------------------------------------
     * Final Interview Report
     * -----------------------------------------------------
     */

    overallScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },

    sectionScores: {
      type: Map,
      of: {
        type: Number,
        min: 0,
        max: 10,
      },
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

/*
 * ---------------------------------------------------------
 * Indexes
 * ---------------------------------------------------------
 *
 * History is queried by user and sorted by newest first.
 */
interviewSchema.index({
  userId: 1,
  createdAt: -1,
});

/*
 * Only one interview may be active for a user at a time.
 * Completed, abandoned and failed interviews remain unrestricted.
 */
interviewSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ["created", "in-progress"],
      },
    },
  },
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
