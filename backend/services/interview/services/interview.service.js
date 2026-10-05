import mongoose from "mongoose";
import crypto from "node:crypto";

import Interview from "../models/interview.model.js";

import graph from "../graph/graph.js";
import AppError from "../utils/error.js";

/*
 * =========================================================
 * CONSTANTS
 * =========================================================
 */

const INTERVIEW_COMPLETION_COST = 100;
const FINALIZATION_LOCK_TIMEOUT_MS = 30 * 60 * 1000;
const FINALIZATION_LEASE_DURATION_MS = 2 * 60 * 1000;

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:8001";

const refreshFinalizationLease = async (
  userId,
  interviewId,
  finalizationKey,
) => {
  const leaseUntil = new Date(Date.now() + FINALIZATION_LEASE_DURATION_MS);

  return Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
      status: "in-progress",
      finalizationKey,

      /*
       * An expired lease can never be revived by the old owner.
       *
       * If the lease has already expired, the old heartbeat must
       * fail so another request can safely acquire ownership.
       */
      finalizationLeaseUntil: {
        $gt: new Date(),
      },
    },
    {
      $set: {
        finalizationLeaseUntil: leaseUntil,
      },
    },
    {
      returnDocument: "after",
    },
  );
};

const saveFinalizationDocument = async (
  interview,
  userId,
  interviewId,
  finalizationKey,
) => {
  const update = interview.toObject();

  delete update._id;
  delete update.__v;
  delete update.createdAt;
  delete update.updatedAt;

  // Finalization ownership/lease fields are managed separately.
  // Never overwrite the heartbeat-refreshed lease with a stale
  // value from the local interview document.
  delete update.finalizationKey;
  delete update.finalizationStartedAt;
  delete update.finalizationLeaseUntil;

  const updatedInterview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
      status: "in-progress",
      finalizationKey,

      /*
       * The finalization owner must still hold a valid lease
       * when persisting evaluation/report state.
       *
       * A stale owner must never be able to write after its
       * lease has expired.
       */
      finalizationLeaseUntil: {
        $gt: new Date(),
      },
    },
    {
      $set: update,
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!updatedInterview) {
    throw new AppError(
      "Interview finalization ownership was lost. Please retry.",
      409,
    );
  }

  return updatedInterview;
};

const startFinalizationLeaseHeartbeat = (
  userId,
  interviewId,
  finalizationKey,
) => {
  let leaseLost = false;

  const interval = setInterval(async () => {
    try {
      const updatedInterview = await refreshFinalizationLease(
        userId,
        interviewId,
        finalizationKey,
      );

      if (!updatedInterview) {
        leaseLost = true;
        clearInterval(interval);
      }
    } catch (error) {
      console.error("Failed to refresh finalization lease:", error);

      leaseLost = true;
      clearInterval(interval);
    }
  }, 30 * 1000);

  return {
    stop: () => {
      clearInterval(interval);
    },

    isLeaseLost: () => leaseLost,
  };
};

/*
 * =========================================================
 * BUILD GRAPH STATE
 * =========================================================
 *
 * Converts the MongoDB interview document into the state
 * expected by LangGraph.
 *
 * currentQuestion / currentAnswer / currentEvaluation are
 * temporary values used by the feedback node.
 */
function buildGraphState(interview, extraState = {}) {
  return {
    userId: interview.userId.toString(),

    role: interview.role,

    experienceLevel: interview.experienceLevel,

    interviewLevel: interview.interviewLevel,

    interviewType: interview.interviewType,

    subjects: interview.subjects || [],

    techStack: interview.techStack || [],

    language: interview.language,

    codingLanguage: interview.codingLanguage || null,

    difficulty: interview.difficulty,

    timeLimit: interview.timeLimit,

    questionCount: interview.questionCount,

    projectContext: interview.projectContext || null,

    status: interview.status,

    currentQuestionIndex: interview.currentQuestionIndex,

    currentQuestion: extraState.currentQuestion || null,

    currentAnswer: extraState.currentAnswer || "",

    currentEvaluation: extraState.currentEvaluation || null,

    questions:
      extraState.questions !== undefined
        ? extraState.questions
        : interview.questions || [],

    overallScore: interview.overallScore,

    sectionScores: interview.sectionScores,

    strengths: interview.strengths,

    weaknesses: interview.weaknesses,

    recommendations: interview.recommendations,

    summary: interview.summary,

    action: extraState.action || null,

    completed: false,

    error: null,
  };
}

/*
 * =========================================================
 * VALIDATE INTERVIEW ID
 * =========================================================
 */

function validateInterviewId(interviewId) {
  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    throw new AppError("Invalid interview ID.", 400);
  }
}

/*
 * =========================================================
 * GET INTERVIEW DEADLINE
 * =========================================================
 */

function getInterviewDeadline(interview) {
  if (!interview.startedAt) {
    return null;
  }

  return new Date(
    new Date(interview.startedAt).getTime() +
      Number(interview.timeLimit || 30) * 60 * 1000,
  );
}

/*
 * =========================================================
 * CREATE QUESTION RECORD
 * =========================================================
 *
 * The AI generates the question.
 *
 * MongoDB creates the interview-specific questionId so
 * the client can safely identify and submit any question.
 */
function createQuestionRecord(question) {
  if (!question) {
    throw new AppError("Invalid question generated by interview engine.", 502);
  }

  return {
    questionId: crypto.randomUUID(),

    /*
     * Coding problem metadata generated by AI.
     *
     * These fields are persisted with the interview so the
     * same coding problem is shown after refresh/navigation.
     */
    title: question.title || "",

    text: question.text,

    section: question.section,

    type: question.type || "primary",

    difficulty: question.difficulty,

    constraints: Array.isArray(question.constraints)
      ? question.constraints
      : [],

    examples: Array.isArray(question.examples) ? question.examples : [],

    starterCode: question.starterCode || "",

    /*
     * Candidate's answer.
     *
     * For Coding interviews this contains source code.
     */
    answer: "",

    answerStatus: "not-submitted",

    askedAt: new Date(),

    submittedAt: null,

    evaluation: {
      score: 0,
      correctness: 0,
      clarity: 0,
      relevance: 0,
      communication: 0,

      /*
       * Coding-specific evaluation fields.
       */
      logic: 0,
      complexity: 0,
      edgeCases: 0,
      codeQuality: 0,

      feedback: "",
      strengths: [],
      weaknesses: [],
      betterAnswer: "",
      recommendations: [],
    },
  };
}

/*
 * =========================================================
 * GET USER INTERVIEW
 * =========================================================
 */

async function findUserInterview(userId, interviewId) {
  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new AppError("Interview not found.", 404);
  }

  return interview;
}

/*
 * =========================================================
 * EVALUATE ONE QUESTION
 * =========================================================
 *
 * This is the ONLY place where an individual answer goes
 * through LangGraph/LLM evaluation.
 *
 * Navigation never calls this function.
 */
async function evaluateQuestion(interview, question) {
  if (!question) {
    throw new AppError("Interview question not found.", 400);
  }

  if (question.answerStatus === "submitted" || question.submittedAt) {
    return {
      alreadySubmitted: true,
      evaluation: question.evaluation,
    };
  }

  if (!question.answer || !question.answer.trim()) {
    throw new AppError("Answer is required before submission.", 400);
  }

  const graphState = buildGraphState(interview, {
    action: "submit-answer",

    currentQuestion: {
      questionId: question.questionId,

      title: question.title || "",

      text: question.text,

      section: question.section,

      type: question.type,

      difficulty: question.difficulty,

      constraints: Array.isArray(question.constraints)
        ? question.constraints
        : [],

      examples: Array.isArray(question.examples) ? question.examples : [],
      
      starterCode: question.starterCode || "",
    },

    currentAnswer: question.answer,
  });

  const result = await graph.invoke(graphState);

  const evaluation = result.currentEvaluation;

  if (!evaluation) {
    throw new AppError("Failed to evaluate interview answer.", 502);
  }

  return {
    alreadySubmitted: false,
    evaluation,
  };
}

/*
 * =========================================================
 * MARK QUESTION SUBMITTED
 * =========================================================
 */

function markQuestionSubmitted(question, evaluation) {
  question.evaluation = evaluation;

  question.answerStatus = "submitted";

  question.submittedAt = new Date();
}

/*
 * =========================================================
 * ABANDON INTERVIEW ON SERVER ERROR
 * =========================================================
 *
 * Already submitted questions remain preserved.
 *
 * No completion.
 * No coin deduction.
 */
async function abandonForServerError(
  interview,
  userId,
  interviewId,
  finalizationKey,
) {
  /*
   * Never abandon an interview after its payment has
   * already been charged.
   *
   * The caller should recover/finalize such an interview
   * instead of converting it into a failed interview.
   */
  if (
    interview.paymentStatus === "charged" ||
    interview.paymentStatus === "charging"
  ) {
    throw new AppError(
      "Interview payment is already being processed. Finalization must continue.",
      503,
    );
  }

  const abandonedInterview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
      status: "in-progress",
      finalizationKey,
    },
    {
      $set: {
        status: "abandoned",
        endedAt: new Date(),
        terminationReason: "server-error",
        finalizationKey: null,
        finalizationStartedAt: null,
        finalizationLeaseUntil: null,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!abandonedInterview) {
    throw new AppError(
      "Interview finalization ownership was lost. Please retry.",
      409,
    );
  }

  return abandonedInterview;
}

function generateFallbackReport(interview) {
  const evaluatedQuestions = interview.questions.filter(
    (question) =>
      question.answerStatus === "submitted" &&
      question.submittedAt &&
      question.evaluation,
  );

  /*
   * No answers were evaluated.
   */
  if (evaluatedQuestions.length === 0) {
    return {
      overallScore: 0,
      sectionScores: {},
      strengths: [],
      weaknesses: ["No interview answers were evaluated."],
      recommendations: [
        "Attempt the interview questions to receive performance feedback.",
        "Provide complete answers before submitting future interviews.",
        "Focus on explaining your reasoning clearly.",
        "Review the topics covered in the interview.",
        "Practice answering technical questions under time constraints.",
      ],
      summary:
        "The interview was submitted without any evaluated answers. The unanswered questions were preserved as Not Answered and were not included in the performance evaluation.",
    };
  }

  /*
   * Calculate fallback overall score from already
   * evaluated answers.
   */
  const scores = evaluatedQuestions
    .map((question) => Number(question.evaluation?.score))
    .filter((score) => Number.isFinite(score));

  const overallScore =
    scores.length > 0
      ? Number(
          (
            scores.reduce((total, score) => total + score, 0) / scores.length
          ).toFixed(2),
        )
      : 0;

  /*
   * Calculate section scores only from sections
   * that actually have evaluated answers.
   */
  const sectionData = {};

  for (const question of evaluatedQuestions) {
    const section = question.section;
    const score = Number(question.evaluation?.score);

    if (!section || !Number.isFinite(score)) {
      continue;
    }

    if (!sectionData[section]) {
      sectionData[section] = [];
    }

    sectionData[section].push(score);
  }

  const sectionScores = Object.fromEntries(
    Object.entries(sectionData).map(([section, values]) => [
      section,
      Number(
        (
          values.reduce((total, score) => total + score, 0) / values.length
        ).toFixed(2),
      ),
    ]),
  );

  /*
   * Reuse information already produced by individual
   * answer evaluations.
   */
  const strengths = [
    ...new Set(
      evaluatedQuestions.flatMap(
        (question) => question.evaluation?.strengths || [],
      ),
    ),
  ].slice(0, 5);

  const weaknesses = [
    ...new Set(
      evaluatedQuestions.flatMap(
        (question) => question.evaluation?.weaknesses || [],
      ),
    ),
  ].slice(0, 5);

  const recommendations = [
    ...new Set(
      evaluatedQuestions.flatMap(
        (question) => question.evaluation?.recommendations || [],
      ),
    ),
  ].slice(0, 5);

  /*
   * Keep the report structure populated even when
   * individual evaluations contain fewer items.
   */
  while (strengths.length < 3) {
    strengths.push("Continue building consistency in technical explanations.");
  }

  while (weaknesses.length < 3) {
    weaknesses.push("Continue improving depth and clarity of explanations.");
  }

  while (recommendations.length < 5) {
    recommendations.push(
      "Practice explaining technical concepts clearly and concisely.",
    );
  }

  return {
    overallScore,
    sectionScores,
    strengths,
    weaknesses,
    recommendations,
    summary:
      `The interview contained ${evaluatedQuestions.length} evaluated ` +
      `answer(s). The remaining unanswered questions were preserved as ` +
      `"Not Answered" and were not included in the performance evaluation.`,
  };
}

/*
 * =========================================================
 * GENERATE FINAL SUMMARY
 * =========================================================
 */

async function generateInterviewSummary(interview) {
  try {
    const summaryQuestions = interview.questions.map((question) => ({
      questionId: question.questionId,
      text: question.text,
      section: question.section,
      difficulty: question.difficulty,
      answerStatus: question.answerStatus,
      evaluation: question.evaluation,
    }));

    const graphState = buildGraphState(interview, {
      action: "summary",
      questions: summaryQuestions,
    });

    const result = await graph.invoke(graphState);

    if (result.overallScore === undefined) {
      throw new Error("Summary result is incomplete.");
    }

    return {
      overallScore: result.overallScore ?? 0,
      sectionScores: result.sectionScores || {},
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      recommendations: result.recommendations || [],
      summary: result.summary || "",
    };
  } catch (error) {
    /*
     * Summary LLM failure must NOT prevent interview
     * completion.
     *
     * Example:
     * Groq 429 / timeout / malformed summary response
     *
     * We already have individual answer evaluations,
     * so create a deterministic fallback report from
     * those evaluations.
     */
    console.error("Summary generation failed. Using fallback report:", error);

    return generateFallbackReport(interview);
  }
}

/*
 * =========================================================
 * DEDUCT INTERVIEW COINS THROUGH AUTH SERVICE
 * =========================================================
 *
 * Interview Service does not access the Auth User model
 * directly.
 *
 * Auth Service owns:
 * - User
 * - coins
 * - coin deduction
 */

async function getUserBalance(userId) {
  let response;

  try {
    response = await fetch(`${AUTH_SERVICE_URL}/internal/user-balance`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId.toString(),
      },
    });
  } catch (error) {
    console.error("Auth Service balance request failed:", error);

    throw new AppError(
      "Unable to verify your interview balance right now. Please try again.",
      503,
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new AppError(
      data?.message || "Unable to verify your interview balance.",
      response.status >= 500 ? 503 : response.status,
    );
  }

  return Number(data?.coins) || 0;
}

async function deductInterviewCoins(userId, interviewId) {
  let response;

  try {
    response = await fetch(`${AUTH_SERVICE_URL}/internal/user-coins`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId.toString(),
      },

      body: JSON.stringify({
        coin: INTERVIEW_COMPLETION_COST,
        action: "interview-completion",
        transactionId: `interview:${interviewId.toString()}:completion`,
      }),
    });
  } catch (error) {
    console.error("Auth Service coin request failed:", error);

    throw new AppError(
      "Unable to charge interview coins right now. Please try again.",
      503,
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  /*
   * Auth Service returned a business error.
   *
   * Example:
   * - insufficient coins
   * - user not found
   */
  if (!response.ok) {
    const message = data?.message || "Unable to charge interview coins.";

    /*
     * Preserve expected 4xx business errors.
     *
     * submitInterview() will NOT abandon the interview
     * automatically for these errors.
     */
    if (response.status >= 400 && response.status < 500) {
      throw new AppError(message, response.status);
    }

    throw new AppError(message, 502);
  }

  if (!data?.success) {
    throw new AppError("Unable to charge interview coins.", 502);
  }

  return data;
}

/*
 * =========================================================
 * FINALIZE + CHARGE
 * =========================================================
 *
 * IMPORTANT:
 *
 * Interview Service requests the coin deduction from the
 * Auth Service before marking the interview as completed.
 *
 * The Auth Service owns the user's coin balance and handles
 * the deduction/idempotency for the interview transaction.
 */
async function finalizeInterviewWithCharge(
  userId,
  interviewId,
  report,
  terminationReason = "completed",
  lockAlreadyAcquired = false,
  finalizationKey = null,
) {
  /*
   * ---------------------------------------------------------
   * Load the interview.
   * ---------------------------------------------------------
   */
  let finalizationLeaseHeartbeat = null;

  let interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new AppError("Interview not found.", 404);
  }

  /*
   * ---------------------------------------------------------
   * Idempotent retry.
   *
   * If another request already completed the interview,
   * return the existing report.
   *
   * Do NOT charge again here.
   * ---------------------------------------------------------
   */
  if (interview.status === "completed" && interview.finalizedAt) {
    return interview;
  }

  /*
   * ---------------------------------------------------------
   * Acquire finalization lock atomically.
   * ---------------------------------------------------------
   *
   * Only one request can move this interview into the
   * finalization flow.
   *
   * Another simultaneous request will fail to acquire the
   * lock and must retry/read the latest interview state.
   * ---------------------------------------------------------
   */
  if (!lockAlreadyAcquired) {
    finalizationKey = `finalize:${interviewId.toString()}:${crypto.randomUUID()}`;

    const lockedInterview = await Interview.findOneAndUpdate(
      {
        _id: interviewId,
        userId,
        status: "in-progress",
        $or: [
          { finalizationKey: null },
          { finalizationKey: { $exists: false } },
          {
            finalizationKey: { $ne: null },
            $or: [
              { finalizationLeaseUntil: null },
              {
                finalizationLeaseUntil: {
                  $lt: new Date(),
                },
              },
              {
                finalizationLeaseUntil: { $exists: false },
                finalizationStartedAt: {
                  $lt: new Date(Date.now() - FINALIZATION_LOCK_TIMEOUT_MS),
                },
              },
            ],
          },
        ],
      },
      {
        $set: {
          finalizationKey,
          finalizationStartedAt: new Date(),
          finalizationLeaseUntil: new Date(
            Date.now() + FINALIZATION_LEASE_DURATION_MS,
          ),
        },
      },
      {
        returnDocument: "after",
      },
    );

    if (!lockedInterview) {
      const latestInterview = await Interview.findOne({
        _id: interviewId,
        userId,
      });

      if (latestInterview?.status === "completed") {
        return latestInterview;
      }

      throw new AppError(
        "Interview finalization is already in progress. Please retry.",
        409,
      );
    } else {
      interview = lockedInterview;

      finalizationLeaseHeartbeat = startFinalizationLeaseHeartbeat(
        userId,
        interviewId,
        finalizationKey,
      );
    }
  }
  if (interview.status !== "in-progress") {
    throw new AppError("Interview is not active.", 400);
  }

  if (lockAlreadyAcquired) {
    const leaseIsValid =
      interview.finalizationLeaseUntil &&
      new Date(interview.finalizationLeaseUntil) > new Date();

    if (
      !finalizationKey ||
      interview.finalizationKey !== finalizationKey ||
      !leaseIsValid
    ) {
      throw new AppError(
        "Interview finalization ownership could not be verified.",
        409,
      );
    }
  }
  /*
   * ---------------------------------------------------------
   * Payment lifecycle.
   * ---------------------------------------------------------
   *
   * If this interview was already charged during a previous
   * attempt, NEVER call Auth Service again.
   *
   * This makes finalization retry-safe.
   * ---------------------------------------------------------
   */
  if (interview.paymentStatus !== "charged") {
    /*
     * Reuse the existing transaction ID when the interview
     * is already in "charging" state.
     *
     * This guarantees that retries belong to the same
     * payment transaction.
     */
    const paymentTransactionId =
      interview.paymentTransactionId ||
      `interview:${interviewId.toString()}:completion`;

    interview.paymentStatus = "charging";
    interview.paymentTransactionId = paymentTransactionId;

    interview = await saveFinalizationDocument(
      interview,
      userId,
      interviewId,
      finalizationKey,
    );

    /*
     * Auth Service owns the actual coin deduction and
     * transaction idempotency.
     */
    try {
      await deductInterviewCoins(userId, interviewId);

      /*
       * Coins successfully deducted.
       */
      interview.paymentStatus = "charged";
    } catch (error) {
      /*
       * A 4xx response represents a business-level payment
       * failure such as insufficient coins.
       *
       * No successful deduction happened, so the interview
       * must NOT remain stuck in "charging".
       */
      if (
        error instanceof AppError &&
        error.statusCode >= 400 &&
        error.statusCode < 500
      ) {
        interview.paymentStatus = "not-charged";

        interview.paymentTransactionId = null;

        interview.finalizationKey = null;
        interview.finalizationStartedAt = null;
        interview.finalizationLeaseUntil = null;

        const paymentRecoveryInterview = await Interview.findOneAndUpdate(
          {
            _id: interviewId,
            userId,
            status: "in-progress",
            finalizationKey,
          },
          {
            $set: {
              paymentStatus: "not-charged",
              paymentTransactionId: null,
              finalizationKey: null,
              finalizationStartedAt: null,
              finalizationLeaseUntil: null,
            },
          },
          {
            returnDocument: "after",
            runValidators: true,
          },
        );

        if (!paymentRecoveryInterview) {
          throw new AppError(
            "Interview finalization ownership was lost. Please retry.",
            409,
          );
        }

        interview = paymentRecoveryInterview;

        if (finalizationLeaseHeartbeat) {
          finalizationLeaseHeartbeat.stop();
          finalizationLeaseHeartbeat = null;
        }
      }

      throw error;
    }

    /*
     * Coins successfully deducted.
     */
    interview.paymentStatus = "charged";
  }

  /*
   * ---------------------------------------------------------
   * Payment is now complete.
   *
   * From this point onward, finalization must not perform
   * another payment operation.
   * ---------------------------------------------------------
   */
  if (interview.paymentStatus === "charged") {
    interview.paymentTransactionId =
      interview.paymentTransactionId ||
      `interview:${interviewId.toString()}:completion`;
  }

  /*
   * ---------------------------------------------------------
   * Save final report.
   * ---------------------------------------------------------
   */
  interview.overallScore = report.overallScore;

  interview.sectionScores = report.sectionScores;

  interview.strengths = report.strengths;

  interview.weaknesses = report.weaknesses;

  interview.recommendations = report.recommendations;

  interview.summary = report.summary;

  interview.status = "completed";

  interview.endedAt = new Date();

  interview.terminationReason = terminationReason;

  interview.finalizedAt = new Date();

  /*
   * ---------------------------------------------------------
   * Finalization completed successfully.
   *
   * The lock is no longer needed because the interview is
   * now permanently completed.
   * ---------------------------------------------------------
   */
  const completedInterview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
      status: "in-progress",
      finalizationKey,

      /*
       * Completion is allowed only while the current finalizer
       * still owns a valid lease.
       */
      finalizationLeaseUntil: {
        $gt: new Date(),
      },
    },
    {
      $set: {
        overallScore: interview.overallScore,
        sectionScores: interview.sectionScores,
        strengths: interview.strengths,
        weaknesses: interview.weaknesses,
        recommendations: interview.recommendations,
        summary: interview.summary,
        status: "completed",
        endedAt: interview.endedAt,
        terminationReason: interview.terminationReason,
        finalizedAt: interview.finalizedAt,
        finalizationKey: null,
        finalizationStartedAt: null,
        finalizationLeaseUntil: null,
        paymentStatus: interview.paymentStatus,
        paymentTransactionId: interview.paymentTransactionId,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!completedInterview) {
    throw new AppError(
      "Interview finalization ownership was lost. Please retry.",
      409,
    );
  }

  interview = completedInterview;

  if (finalizationLeaseHeartbeat) {
    finalizationLeaseHeartbeat.stop();
    finalizationLeaseHeartbeat = null;
  }

  return interview;
}

/*
 * =========================================================
 * START INTERVIEW
 * =========================================================
 *
 * IMPORTANT:
 *
 * All questions are generated in ONE interview-start
 * operation.
 *
 * No question is generated from Next/Previous.
 */
export const startInterview = async (userId, interviewData) => {
  const questionCount = Number(interviewData.questionCount || 10);

  if (
    !Number.isInteger(questionCount) ||
    questionCount < 1 ||
    questionCount > 50
  ) {
    throw new AppError(
      "Question count must be an integer between 1 and 50.",
      400,
    );
  }
  let activeInterview = await Interview.findOne({
    userId,
    status: {
      $in: ["created", "in-progress"],
    },
  }).sort({
    createdAt: -1,
  });

  if (activeInterview) {
    /*
     * An in-progress interview whose backend deadline has already
     * passed is no longer a genuinely active interview.
     *
     * Process its expiration before deciding whether the user
     * can start a new interview.
     */
    if (activeInterview.status === "in-progress") {
      const deadline = getInterviewDeadline(activeInterview);

      if (deadline && new Date() >= deadline) {
        await expireInterviewIfNeeded(activeInterview);

        activeInterview = await Interview.findOne({
          userId,
          status: {
            $in: ["created", "in-progress"],
          },
        }).sort({
          createdAt: -1,
        });
      }
    }

    if (activeInterview) {
      throw new AppError(
        "You already have an active interview. Starting a new interview will end your current interview and discard its progress.",
        409,
        {
          code: "ACTIVE_INTERVIEW_EXISTS",
          interviewId: activeInterview._id,
        },
      );
    }
  }

  const balance = await getUserBalance(userId);

  if (balance < INTERVIEW_COMPLETION_COST) {
    throw new AppError(
      `Not enough balance. You need at least ${INTERVIEW_COMPLETION_COST} coins to start the interview.`,
      400,
    );
  }

  let interview;

  try {
    interview = await Interview.create({
      userId,

      role: interviewData.role,

      experienceLevel: interviewData.experienceLevel,

      interviewLevel: interviewData.interviewLevel,

      interviewType: interviewData.interviewType,

      subjects: interviewData.subjects || [],

      language: interviewData.language || "english",

      codingLanguage: interviewData.codingLanguage || null,

      difficulty: interviewData.difficulty || "easy",

      timeLimit: interviewData.timeLimit || 30,

      questionCount,

      techStack: interviewData.techStack || [],

      projectContext: interviewData.projectContext || null,

      status: "created",

      startedAt: null,

      endedAt: null,

      terminationReason: null,

      currentQuestionIndex: 0,

      questions: [],
    });
  } catch (error) {
    /*
     * The unique partial index on userId protects against
     * two concurrent requests creating active interviews
     * for the same account.
     */
    if (error?.code === 11000) {
      throw new AppError(
        "You already have an active interview. Starting a new interview will end your current interview and discard its progress.",
        409,
      );
    }

    throw error;
  }

  try {
    const graphState = buildGraphState(interview, {
      action: "start",
    });

    const result = await graph.invoke(graphState);

    if (!result?.questions || result.questions.length === 0) {
      throw new AppError("Failed to generate interview questions.", 502);
    }

    /*
     * The model/prompt must generate exactly the configured
     * number of questions.
     */
    if (result.questions.length !== questionCount) {
      throw new AppError(
        "Generated question count does not match the interview configuration.",
        502,
      );
    }

    const questionRecords = result.questions.map(createQuestionRecord);

    interview.questions = questionRecords;

    interview.currentQuestionIndex = 0;

    interview.status = "created";

    interview.startedAt = null;

    interview.endedAt = null;

    interview.terminationReason = null;

    await interview.save();

    return {
      interviewId: interview._id,

      status: interview.status,

      currentQuestionIndex: interview.currentQuestionIndex,

      questionCount: interview.questions.length,

      questions: interview.questions,
    };
  } catch (error) {
    /*
     * Question generation failed after the interview
     * document was created.
     *
     * Mark the interview as failed so we don't leave
     * an orphaned "created" interview in the database.
     *
     * No coins are charged during interview start.
     */
    try {
      interview.status = "failed";
      interview.endedAt = new Date();
      interview.terminationReason = "server-error";

      await interview.save();
    } catch (updateError) {
      console.error("Failed to mark interview start as failed:", updateError);
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to start interview.", 502);
  }
};

export const replaceActiveInterview = async (userId) => {
  const activeInterview = await Interview.findOneAndDelete({
    userId,
    status: {
      $in: ["created", "in-progress"],
    },

    // Never delete an interview that is being finalized.
    $or: [{ finalizationKey: null }, { finalizationKey: { $exists: false } }],

    // Never delete an interview whose payment lifecycle
    // has already started or completed.
    paymentStatus: {
      $nin: ["charging", "charged"],
    },
  });

  return activeInterview;
};
/*
 * =========================================================
 * BEGIN INTERVIEW
 * =========================================================
 */
export const beginInterview = async (userId, interviewId) => {
  validateInterviewId(interviewId);

  /*
   * Atomically transition created -> in-progress.
   * This prevents concurrent begin requests from starting
   * the same interview twice.
   */
  const interview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
      status: "created",
      "questions.0": { $exists: true },
    },
    {
      $set: {
        status: "in-progress",
        startedAt: new Date(),
        endedAt: null,
        terminationReason: null,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!interview) {
    const existingInterview = await findUserInterview(userId, interviewId);

    if (existingInterview.status !== "created") {
      throw new AppError("Interview cannot be started.", 400);
    }

    throw new AppError("Interview is not ready to begin.", 400);
  }

  return interview;
};

/*
 * =========================================================
 * GET ACTIVE INTERVIEW
 * =========================================================
 */
export const getActiveInterview = async (userId) => {
  let interview = await Interview.findOne({
    userId,
    status: {
      $in: ["created", "in-progress"],
    },
  }).sort({
    createdAt: -1,
  });

  if (!interview) {
    return null;
  }

  /*
   * An in-progress interview is only active while its
   * backend deadline has not expired.
   */
  if (interview.status === "in-progress") {
    const deadline = getInterviewDeadline(interview);

    if (deadline && new Date() >= deadline) {
      await expireInterviewIfNeeded(interview);

      /*
       * Re-read the interview because expireInterviewIfNeeded()
       * may have changed its status.
       */
      interview = await Interview.findOne({
        _id: interview._id,
        userId,
      });

      if (
        !interview ||
        !["created", "in-progress"].includes(interview.status)
      ) {
        return null;
      }
    }
  }

  return interview;
};

/*
 * =========================================================
 * GET RECENTLY TERMINATED INTERVIEW
 * =========================================================
 *
 * Returns only the latest interview that was automatically
 * terminated because the time limit was reached.
 *
 * Dismissed notices are not shown again.
 */
export const getRecentlyTerminatedInterview = async (userId) => {
  const interview = await Interview.findOne({
    userId,
    status: "abandoned",
    terminationReason: "time-limit",
  }).sort({ endedAt: -1 });

  return interview || null;
};
/*
 * =========================================================
 * DISMISS TERMINATION NOTICE
 * =========================================================
 */

export const dismissTerminationNotice = async (userId, interviewId) => {
  validateInterviewId(interviewId);

  const deletedInterview = await Interview.findOneAndDelete({
    _id: interviewId,
    userId,
    status: {
      $in: ["completed", "abandoned"],
    },
    terminationReason: "time-limit",
  });

  if (!deletedInterview) {
    throw new AppError("Termination notice not found.", 404);
  }

  return deletedInterview;
};

/*
 * =========================================================
 * NEXT QUESTION
 * =========================================================
 *
 * Navigation ONLY.
 *
 * No LLM call.
 */
export const getNextQuestion = async (userId, interviewId) => {
  validateInterviewId(interviewId);

  const interview = await findUserInterview(userId, interviewId);

  if (interview.status !== "in-progress") {
    throw new AppError("Interview is not active.", 400);
  }

  const deadline = getInterviewDeadline(interview);

  if (deadline && new Date() >= deadline) {
    await expireInterviewIfNeeded(interview);

    throw new AppError("Interview time has expired.", 400);
  }

  const nextIndex = interview.currentQuestionIndex + 1;

  if (nextIndex >= interview.questions.length) {
    return interview;
  }

  const updatedInterview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
      status: "in-progress",
      currentQuestionIndex: interview.currentQuestionIndex,
    },
    {
      $set: {
        currentQuestionIndex: nextIndex,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedInterview) {
    const latestInterview = await findUserInterview(userId, interviewId);

    if (latestInterview.status !== "in-progress") {
      throw new AppError("Interview is no longer active.", 400);
    }

    return latestInterview;
  }

  return updatedInterview;
};

/*
 * =========================================================
 * PREVIOUS QUESTION
 * =========================================================
 *
 * Navigation ONLY.
 *
 * No LLM call.
 */
export const getPreviousQuestion = async (userId, interviewId) => {
  validateInterviewId(interviewId);

  const interview = await findUserInterview(userId, interviewId);

  if (interview.status !== "in-progress") {
    throw new AppError("Interview is not active.", 400);
  }

  const deadline = getInterviewDeadline(interview);

  if (deadline && new Date() >= deadline) {
    await expireInterviewIfNeeded(interview);

    throw new AppError("Interview time has expired.", 400);
  }

  const previousIndex = interview.currentQuestionIndex - 1;

  if (previousIndex < 0) {
    return interview;
  }

  const updatedInterview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
      status: "in-progress",
      currentQuestionIndex: interview.currentQuestionIndex,
    },
    {
      $set: {
        currentQuestionIndex: previousIndex,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedInterview) {
    const latestInterview = await findUserInterview(userId, interviewId);

    if (latestInterview.status !== "in-progress") {
      throw new AppError("Interview is no longer active.", 400);
    }

    return latestInterview;
  }

  return updatedInterview;
};

/*
 * =========================================================
 * JUMP TO QUESTION
 * =========================================================
 *
 * Navigation only.
 *
 * Keeps frontend question-card navigation
 * synchronized with the persisted interview index.
 */
export const jumpToQuestion = async (userId, interviewId, index) => {
  validateInterviewId(interviewId);

  const interview = await findUserInterview(userId, interviewId);

  if (interview.status !== "in-progress") {
    throw new AppError("Interview is not active.", 400);
  }

  const deadline = getInterviewDeadline(interview);

  if (deadline && new Date() >= deadline) {
    await expireInterviewIfNeeded(interview);

    throw new AppError("Interview time has expired.", 400);
  }

  const targetIndex = Number(index);

  if (
    !Number.isInteger(targetIndex) ||
    targetIndex < 0 ||
    targetIndex >= interview.questions.length
  ) {
    throw new AppError("Invalid question index.", 400);
  }

  const updatedInterview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
      status: "in-progress",
      currentQuestionIndex: interview.currentQuestionIndex,
    },
    {
      $set: {
        currentQuestionIndex: targetIndex,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedInterview) {
    const latestInterview = await findUserInterview(userId, interviewId);

    if (latestInterview.status !== "in-progress") {
      throw new AppError("Interview is no longer active.", 400);
    }

    return latestInterview;
  }

  return updatedInterview;
};

/*
 * =========================================================
 * SAVE DRAFT ANSWER
 * =========================================================
 *
 * Saves the candidate's current answer without evaluating it.
 *
 * Draft saving:
 * - does NOT submit the question
 * - does NOT call LLM
 * - does NOT charge coins
 * - only updates question.answer
 */
export const saveDraftAnswer = async (
  userId,
  interviewId,
  questionId,
  answer,
) => {
  validateInterviewId(interviewId);

  if (typeof questionId !== "string" || !questionId.trim()) {
    throw new AppError("Question ID is required.", 400);
  }

  if (typeof answer !== "string") {
    throw new AppError("Answer must be a string.", 400);
  }

  const interview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
      status: "in-progress",
      startedAt: { $ne: null },

      /*
       * Backend deadline is enforced atomically.
       *
       * This prevents a draft from being written after the
       * interview time limit even if no other request has
       * triggered expiration yet.
       */
      $expr: {
        $gt: [
          {
            $add: [
              "$startedAt",
              {
                $multiply: [{ $ifNull: ["$timeLimit", 30] }, 60 * 1000],
              },
            ],
          },
          new Date(),
        ],
      },

      "questions.questionId": questionId,
      "questions.answerStatus": "not-submitted",
      $or: [{ finalizationKey: null }, { finalizationKey: { $exists: false } }],
    },
    {
      $set: {
        "questions.$[question].answer": answer.trim(),
      },
    },
    {
      arrayFilters: [
        {
          "question.questionId": questionId,
          "question.answerStatus": "not-submitted",
        },
      ],
      returnDocument: "after",
    },
  );

  if (!interview) {
    const existingInterview = await findUserInterview(userId, interviewId);

    if (existingInterview.status !== "in-progress") {
      throw new AppError("Interview is not active.", 400);
    }

    const deadline = getInterviewDeadline(existingInterview);

    if (deadline && new Date() >= deadline) {
      await expireInterviewIfNeeded(existingInterview);

      throw new AppError(
        "Interview time has expired. The interview was finalized automatically.",
        400,
      );
    }

    const question = existingInterview.questions.find(
      (item) => item.questionId === questionId,
    );

    if (!question) {
      throw new AppError("Interview question not found.", 404);
    }

    if (question.answerStatus === "submitted" || question.submittedAt) {
      throw new AppError("This question has already been submitted.", 400);
    }

    throw new AppError("Unable to save answer draft.", 409);
  }

  return interview;
};
/*
 * =========================================================
 * SUBMIT ENTIRE INTERVIEW
 * =========================================================
 *
 * This is the final submission.
 *
 * Already submitted questions:
 *     NEVER evaluated again.
 *
 * Remaining questions:
 *     evaluated one by one.
 *
 * If any remaining evaluation fails:
 *     interview becomes abandoned/server-error.
 *
 * Already successful evaluations remain saved.
 */
export const submitInterview = async (
  userId,
  interviewId,
  draftAnswers = {},
) => {
  validateInterviewId(interviewId);

  let interview = await findUserInterview(userId, interviewId);

  /*
   * -------------------------------------------------------
   * Already completed
   * -------------------------------------------------------
   *
   * Final submission is idempotent.
   *
   * If the frontend submits again after completion,
   * return the existing report instead of throwing
   * "Interview is not active."
   */
  if (interview.status === "completed" && interview.finalizedAt) {
    return {
      interviewId: interview._id,
      status: interview.status,
      terminationReason: interview.terminationReason,
      overallScore: interview.overallScore,
      sectionScores: interview.sectionScores,
      strengths: interview.strengths,
      weaknesses: interview.weaknesses,
      recommendations: interview.recommendations,
      summary: interview.summary,
      alreadyFinalized: true,
    };
  }

  if (interview.status !== "in-progress") {
    throw new AppError("Interview is not active.", 400);
  }

  /*
   * -------------------------------------------------------
   * Time check
   * -------------------------------------------------------
   */
  const deadline = getInterviewDeadline(interview);

  const isTimeExpired = deadline && new Date() >= deadline;

  let finalizationLeaseHeartbeat = null;

  try {
    /*
     * -----------------------------------------------------
     * Evaluate ONLY answered questions.
     *
     * Unanswered questions remain:
     *
     * answerStatus = "not-submitted"
     * submittedAt = null
     *
     * They are NOT sent to the LLM.
     * -----------------------------------------------------
     */

    const finalizationKey = `finalize:${interviewId.toString()}:${crypto.randomUUID()}`;

    const FINALIZATION_WAIT_TIMEOUT_MS = 2 * 60 * 1000;
    const FINALIZATION_POLL_INTERVAL_MS = 1500;

    const finalizationWaitStartedAt = Date.now();

    while (true) {
      const lockedInterview = await Interview.findOneAndUpdate(
        {
          _id: interviewId,
          userId,
          status: "in-progress",
          $or: [
            { finalizationKey: null },
            { finalizationKey: { $exists: false } },
            {
              finalizationKey: { $ne: null },
              $or: [
                { finalizationLeaseUntil: null },
                {
                  finalizationLeaseUntil: {
                    $lt: new Date(),
                  },
                },
                {
                  finalizationLeaseUntil: { $exists: false },
                  finalizationStartedAt: {
                    $lt: new Date(Date.now() - FINALIZATION_LOCK_TIMEOUT_MS),
                  },
                },
              ],
            },
          ],
        },
        {
          $set: {
            finalizationKey,
            finalizationStartedAt: new Date(),
            finalizationLeaseUntil: new Date(
              Date.now() + FINALIZATION_LEASE_DURATION_MS,
            ),
          },
        },
        {
          returnDocument: "after",
        },
      );

      // We successfully acquired the finalization lock.
      if (lockedInterview) {
        interview = lockedInterview;

        finalizationLeaseHeartbeat = startFinalizationLeaseHeartbeat(
          userId,
          interviewId,
          finalizationKey,
        );

        break;
      }

      // Another request is currently finalizing this interview.
      const latestInterview = await Interview.findOne({
        _id: interviewId,
        userId,
      });

      // Another request finished successfully.
      if (latestInterview?.status === "completed") {
        return {
          interviewId: latestInterview._id,
          status: latestInterview.status,
          terminationReason: latestInterview.terminationReason,
          overallScore: latestInterview.overallScore,
          sectionScores: latestInterview.sectionScores,
          strengths: latestInterview.strengths,
          weaknesses: latestInterview.weaknesses,
          recommendations: latestInterview.recommendations,
          summary: latestInterview.summary,
          alreadyFinalized: true,
        };
      }

      // Another request finalized the interview as abandoned.
      if (latestInterview?.status === "abandoned") {
        return {
          interviewId: latestInterview._id,
          status: latestInterview.status,
          terminationReason: latestInterview.terminationReason,
          coinsCharged: 0,
          alreadyFinalized: false,
        };
      }

      // Finalization is still in progress.
      if (
        latestInterview?.status === "in-progress" &&
        latestInterview.finalizationKey
      ) {
        // Don't wait forever if the other request is genuinely stuck.
        if (
          Date.now() - finalizationWaitStartedAt >=
          FINALIZATION_WAIT_TIMEOUT_MS
        ) {
          throw new AppError(
            "Interview finalization is taking longer than expected. Please retry.",
            409,
          );
        }

        await new Promise((resolve) =>
          setTimeout(resolve, FINALIZATION_POLL_INTERVAL_MS),
        );

        continue;
      }

      // Lock disappeared while the interview is still active.
      // Try to acquire it again.
    }

    /*
     * -------------------------------------------------------
     * Persist the current frontend draft before finalization.
     *
     * This is intentionally NOT submitAnswer().
     *
     * Timer expiry must be able to capture the textarea draft
     * without passing through the normal active-answer endpoint.
     * -------------------------------------------------------
     */
    if (draftAnswers && typeof draftAnswers === "object") {
      for (const question of interview.questions) {
        if (question.answerStatus === "submitted" || question.submittedAt) {
          continue;
        }

        const draftAnswer = draftAnswers[question.questionId];

        if (typeof draftAnswer === "string") {
          question.answer = draftAnswer.trim();
        }
      }

      interview = await saveFinalizationDocument(
        interview,
        userId,
        interviewId,
        finalizationKey,
      );
    }
    const pendingAnsweredQuestions = interview.questions.filter(
      (question) =>
        question.answerStatus !== "submitted" &&
        !question.submittedAt &&
        typeof question.answer === "string" &&
        question.answer.trim(),
    );

    for (const question of pendingAnsweredQuestions) {
      /*
       * The finalization lease may have been lost while
       * another request took ownership of this interview.
       *
       * Never start another LLM evaluation after losing ownership.
       */
      if (finalizationLeaseHeartbeat?.isLeaseLost()) {
        throw new AppError(
          "Interview finalization lease was lost. Please retry.",
          409,
        );
      }

      const { evaluation } = await evaluateQuestion(interview, question);

      /*
       * The LLM call may have taken long enough for the
       * finalization lease to expire.
       *
       * Do not persist this evaluation if ownership was lost
       * during the evaluation.
       */
      if (finalizationLeaseHeartbeat?.isLeaseLost()) {
        throw new AppError(
          "Interview finalization lease was lost. Please retry.",
          409,
        );
      }

      markQuestionSubmitted(question, evaluation);

      interview = await saveFinalizationDocument(
        interview,
        userId,
        interviewId,
        finalizationKey,
      );
    }

    /*
     * -----------------------------------------------------
     * Reload latest interview before report generation.
     * -----------------------------------------------------
     */
    interview = await Interview.findOne({
      _id: interviewId,
      userId,
    });

    if (!interview) {
      throw new AppError("Interview not found.", 404);
    }

    /*
     * -----------------------------------------------------
     * IMPORTANT:
     *
     * We DO NOT require every question to be submitted.
     *
     * Example:
     *
     * Q1 submitted
     * Q2 submitted
     * Q3 not answered
     * Q4 not answered
     * Q5 not answered
     *
     * This is a valid completed interview.
     * -----------------------------------------------------
     */

    /*
     * -----------------------------------------------------
     * Generate final report.
     *
     * If the LLM summary fails, generateInterviewSummary()
     * automatically creates a deterministic fallback report.
     * -----------------------------------------------------
     */
    const evaluatedAnswerCount = interview.questions.filter(
      (question) =>
        question.answerStatus === "submitted" &&
        question.submittedAt &&
        question.evaluation,
    ).length;

    /*
     * If the candidate never attempted any answer,
     * the interview is abandoned.
     *
     * It must NOT:
     * - generate a report
     * - charge interview coins
     * - become a completed interview
     * - appear as completed history
     */
    if (evaluatedAnswerCount === 0) {
      interview.status = "abandoned";

      interview.terminationReason = isTimeExpired ? "time-limit" : "no-answers";

      interview.endedAt = new Date();

      /*
       * No answer means no payment.
       * Release the finalization lock before closing
       * the interview as abandoned.
       */
      interview.finalizationKey = null;
      interview.finalizationStartedAt = null;
      interview.finalizationLeaseUntil = null;

      const abandonedInterview = await Interview.findOneAndUpdate(
        {
          _id: interviewId,
          userId,
          status: "in-progress",
          finalizationKey,
        },
        {
          $set: {
            status: "abandoned",
            terminationReason: isTimeExpired ? "time-limit" : "no-answers",
            endedAt: new Date(),
            finalizationKey: null,
            finalizationStartedAt: null,
            finalizationLeaseUntil: null,
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      );

      if (!abandonedInterview) {
        throw new AppError(
          "Interview finalization ownership was lost. Please retry.",
          409,
        );
      }

      if (finalizationLeaseHeartbeat) {
        finalizationLeaseHeartbeat.stop();
        finalizationLeaseHeartbeat = null;
      }

      return {
        interviewId: interview._id,
        status: "abandoned",
        terminationReason: interview.terminationReason,
        coinsCharged: 0,
      };
    }

    if (finalizationLeaseHeartbeat?.isLeaseLost()) {
      throw new AppError(
        "Interview finalization lease was lost. Please retry.",
        409,
      );
    }

    const report = await generateInterviewSummary(interview);

    /*
     * -----------------------------------------------------
     * Finalize interview + charge coins.
     * -----------------------------------------------------
     *
     * The deadline may have been reached while answer
     * evaluation or summary generation was running.
     *
     * Re-check the deadline using the latest interview state
     * instead of relying only on the initial time check.
     */
    const latestDeadline = getInterviewDeadline(interview);

    const finalizationTimeExpired =
      latestDeadline && new Date() >= latestDeadline;

    const terminationReason = finalizationTimeExpired
      ? "time-limit"
      : "completed";

    const finalizedInterview = await finalizeInterviewWithCharge(
      userId,
      interviewId,
      report,
      terminationReason,
      true,
      finalizationKey,
    );

    if (finalizationLeaseHeartbeat) {
      finalizationLeaseHeartbeat.stop();
      finalizationLeaseHeartbeat = null;
    }

    return {
      interviewId: finalizedInterview._id,
      status: finalizedInterview.status,
      terminationReason: finalizedInterview.terminationReason,
      overallScore: finalizedInterview.overallScore,
      sectionScores: finalizedInterview.sectionScores,
      strengths: finalizedInterview.strengths,
      weaknesses: finalizedInterview.weaknesses,
      recommendations: finalizedInterview.recommendations,
      summary: finalizedInterview.summary,
      coinsCharged: INTERVIEW_COMPLETION_COST,
      alreadyFinalized: false,
    };
  } catch (error) {
    console.error("FINAL SUBMIT ROOT ERROR:", error);
    if (finalizationLeaseHeartbeat) {
      finalizationLeaseHeartbeat.stop();
      finalizationLeaseHeartbeat = null;
    }
    /*
     * -----------------------------------------------------
     * Business errors
     * -----------------------------------------------------
     *
     * Insufficient coins, invalid state, etc. should not
     * automatically turn the interview into server-error.
     */
    if (
      error instanceof AppError &&
      error.statusCode >= 400 &&
      error.statusCode < 500
    ) {
      throw error;
    }

    /*
     * -----------------------------------------------------
     * Actual evaluation/server failure
     * -----------------------------------------------------
     *
     * Successful evaluations remain preserved.
     *
     * IMPORTANT:
     * Summary failures are already handled by the fallback
     * report and therefore should normally never reach here.
     */
    try {
      const currentInterview = await Interview.findOne({
        _id: interviewId,
        userId,
      });

      /*
       * -------------------------------------------------------
       * Payment is already charged.
       *
       * NEVER abandon the interview.
       *
       * A later retry must finish the interview without
       * charging the user again.
       * -------------------------------------------------------
       */
      if (currentInterview?.paymentStatus === "charged") {
        throw new AppError(
          "Your interview payment was processed, but finalization is still pending. Please retry.",
          503,
        );
      }

      /*
       * -------------------------------------------------------
       * Payment is currently being processed.
       *
       * Do NOT abandon the interview.
       *
       * The same payment transaction can safely be retried.
       * -------------------------------------------------------
       */
      if (currentInterview?.paymentStatus === "charging") {
        /*
         * Payment may have succeeded remotely.
         * Keep paymentStatus = "charging" and the same
         * transaction ID, but release the interview lock so
         * the next retry can continue the same idempotent
         * payment transaction.
         */
        interview.finalizationKey = null;
        interview.finalizationStartedAt = null;
        interview.finalizationLeaseUntil = null;

        const recoveredInterview = await Interview.findOneAndUpdate(
          {
            _id: interview._id,
            userId,
            status: "in-progress",
            finalizationKey,
          },
          {
            $set: {
              finalizationKey: null,
              finalizationStartedAt: null,
              finalizationLeaseUntil: null,
            },
          },
          {
            returnDocument: "after",
            runValidators: true,
          },
        );

        if (!recoveredInterview) {
          throw new AppError(
            "Interview finalization ownership was lost. Please retry.",
            409,
          );
        }

        interview = recoveredInterview;

        throw new AppError(
          "Your interview is still being finalized. Please retry.",
          503,
        );
      }

      /*
       * -------------------------------------------------------
       * No payment has been processed.
       *
       * A genuine server-side failure can safely abandon the
       * interview without charging coins.
       * -------------------------------------------------------
       */
      if (currentInterview && currentInterview.status === "in-progress") {
        // Release the finalization lock so the user can retry.
        // Do NOT abandon the interview because this was a
        // server/evaluation failure, not a user abandonment.
        currentInterview.finalizationKey = null;
        currentInterview.finalizationStartedAt = null;
        currentInterview.finalizationLeaseUntil = null;

        const recoveredInterview = await Interview.findOneAndUpdate(
          {
            _id: currentInterview._id,
            userId,
            status: "in-progress",
            finalizationKey,
          },
          {
            $set: {
              finalizationKey: null,
              finalizationStartedAt: null,
              finalizationLeaseUntil: null,
            },
          },
          {
            returnDocument: "after",
            runValidators: true,
          },
        );

        if (!recoveredInterview) {
          throw new AppError(
            "Interview finalization ownership was lost. Please retry.",
            409,
          );
        }
      }
    } catch (recoveryError) {
      if (recoveryError instanceof AppError) {
        throw recoveryError;
      }

      console.error(
        "Failed to process interview finalization recovery:",
        recoveryError,
      );
    }

    throw new AppError(
      "We couldn't complete your interview due to a server error. Your interview has been ended without charging coins.",
      502,
    );
  }
};

/*
 * =========================================================
 * EXPIRE INTERVIEW
 * =========================================================
 * Backend is the source of truth for time.
 *
 * When the deadline is reached:
 * - answered pending questions are evaluated
 * - unanswered questions remain Not Answered
 * - an interview with no evaluated answers is abandoned
 * - an interview with evaluated answers is finalized and charged
 */

async function expireInterviewIfNeeded(interview) {
  if (!interview.startedAt || interview.status !== "in-progress") {
    return false;
  }

  const deadline = getInterviewDeadline(interview);

  if (!deadline || new Date() < deadline) {
    return false;
  }

  let finalizationLeaseHeartbeat = null;

  /*
   * The interview has reached its time limit strictly according
   * to the original deadline calculated from startedAt.
   */

  try {
    /*
     * -----------------------------------------------------
     * Acquire the finalization lock BEFORE evaluating any
     * pending answers.
     *
     * This prevents timer expiry and manual final submission
     * from evaluating/finalizing the same interview concurrently.
     * -----------------------------------------------------
     */
    const finalizationKey = `finalize:${interview._id.toString()}:${crypto.randomUUID()}`;

    const lockedInterview = await Interview.findOneAndUpdate(
      {
        _id: interview._id,
        status: "in-progress",
        $or: [
          { finalizationKey: null },
          { finalizationKey: { $exists: false } },
          {
            finalizationKey: { $ne: null },
            $or: [
              { finalizationLeaseUntil: null },
              {
                finalizationLeaseUntil: {
                  $lt: new Date(),
                },
              },
              {
                finalizationLeaseUntil: { $exists: false },
                finalizationStartedAt: {
                  $lt: new Date(Date.now() - FINALIZATION_LOCK_TIMEOUT_MS),
                },
              },
            ],
          },
        ],
      },
      {
        $set: {
          finalizationKey,
          finalizationStartedAt: new Date(),
          finalizationLeaseUntil: new Date(
            Date.now() + FINALIZATION_LEASE_DURATION_MS,
          ),
        },
      },
      {
        returnDocument: "after",
      },
    );

    if (!lockedInterview) {
      const latestInterview = await Interview.findById(interview._id);

      /*
       * Another request already completed the interview.
       */
      if (latestInterview?.status === "completed") {
        return true;
      }

      /*
       * Another request is currently finalizing the interview.
       * Do not start another evaluation/finalization flow.
       *
       * The current request only needs to stop here.
       */
      if (
        latestInterview?.status === "in-progress" &&
        latestInterview.finalizationKey
      ) {
        return true;
      }

      /*
       * The interview changed to another terminal/non-active
       * state while this request was running.
       */
      return true;
    }

    interview = lockedInterview;

    finalizationLeaseHeartbeat = startFinalizationLeaseHeartbeat(
      lockedInterview.userId,
      lockedInterview._id,
      finalizationKey,
    );

    /*
     * -----------------------------------------------------
     * Evaluate only answered questions that have not
     * already been submitted.
     *
     * Unanswered questions remain Not Answered.
     * -----------------------------------------------------
     */
    const pendingQuestions = interview.questions.filter(
      (question) =>
        question.answerStatus !== "submitted" &&
        !question.submittedAt &&
        typeof question.answer === "string" &&
        question.answer.trim(),
    );

    for (const question of pendingQuestions) {
      /*
       * Never start another LLM evaluation after losing
       * finalization ownership.
       */
      if (finalizationLeaseHeartbeat?.isLeaseLost()) {
        throw new AppError(
          "Interview finalization lease was lost. Please retry.",
          409,
        );
      }

      const { evaluation } = await evaluateQuestion(interview, question);

      /*
       * The LLM call may have taken long enough for the
       * finalization lease to expire.
       *
       * Do not persist this evaluation after ownership loss.
       */
      if (finalizationLeaseHeartbeat?.isLeaseLost()) {
        throw new AppError(
          "Interview finalization lease was lost. Please retry.",
          409,
        );
      }

      markQuestionSubmitted(question, evaluation);

      // Persist every successful evaluation immediately.
      // If a later question fails, earlier evaluations remain saved.
      interview = await saveFinalizationDocument(
        interview,
        interview.userId,
        interview._id,
        finalizationKey,
      );
    }

    /*
     * -----------------------------------------------------
     * Reload latest data.
     * -----------------------------------------------------
     */
    const latestInterview = await Interview.findById(interview._id);

    if (!latestInterview) {
      throw new AppError("Interview not found.", 404);
    }

    /*
     * -----------------------------------------------------
     * Generate report.
     * -----------------------------------------------------
     */
    const evaluatedAnswerCount = latestInterview.questions.filter(
      (question) =>
        question.answerStatus === "submitted" &&
        question.submittedAt &&
        question.evaluation,
    ).length;

    /*
     * -----------------------------------------------------
     * Timer expired without any attempted answer.
     *
     * This interview must:
     * - NOT generate a report
     * - NOT charge coins
     * - NOT become completed
     * - NOT appear as completed history
     * -----------------------------------------------------
     */
    if (evaluatedAnswerCount === 0) {
      latestInterview.status = "abandoned";

      latestInterview.terminationReason = "time-limit";

      latestInterview.endedAt = new Date();

      /*
       * No answer means no payment.
       * Release the finalization lock before closing
       * the interview as abandoned.
       */
      latestInterview.finalizationKey = null;
      latestInterview.finalizationStartedAt = null;
      latestInterview.finalizationLeaseUntil = null;

      const abandonedInterview = await Interview.findOneAndUpdate(
        {
          _id: latestInterview._id,
          userId: latestInterview.userId,
          status: "in-progress",
          finalizationKey,
        },
        {
          $set: {
            status: "abandoned",
            endedAt: new Date(),
            terminationReason: "time-limit",
            finalizedAt: new Date(),
            finalizationKey: null,
            finalizationStartedAt: null,
            finalizationLeaseUntil: null,
            overallScore: 0,
            sectionScores: [],
            strengths: [],
            weaknesses: [],
            recommendations: [],
            summary: "Interview ended because the time limit was reached.",
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      );

      if (!abandonedInterview) {
        throw new AppError(
          "Interview finalization ownership was lost. Please retry.",
          409,
        );
      }

      if (finalizationLeaseHeartbeat) {
        finalizationLeaseHeartbeat.stop();
        finalizationLeaseHeartbeat = null;
      }

      return abandonedInterview;
    }

    if (finalizationLeaseHeartbeat?.isLeaseLost()) {
      throw new AppError(
        "Interview finalization lease was lost. Please retry.",
        409,
      );
    }

    const report = await generateInterviewSummary(latestInterview);

    /*
     * -----------------------------------------------------
     * Finalize + charge exactly once.
     * -----------------------------------------------------
     */
    await finalizeInterviewWithCharge(
      latestInterview.userId,
      latestInterview._id,
      report,
      "time-limit",
      true,
      finalizationKey,
    );

    if (finalizationLeaseHeartbeat) {
      finalizationLeaseHeartbeat.stop();
      finalizationLeaseHeartbeat = null;
    }

    return true;
  } catch (error) {
    if (finalizationLeaseHeartbeat) {
      finalizationLeaseHeartbeat.stop();
      finalizationLeaseHeartbeat = null;
    }
    /*
     * Time-limit processing failed.
     *
     * Preserve whatever was already successfully evaluated.
     *
     * Business errors such as insufficient coins are propagated
     * to the caller and are NOT converted into server-error
     * abandonment.
     *
     * Actual evaluation/server failures abandon the interview
     * without charging coins.
     */
    if (
      error instanceof AppError &&
      error.statusCode >= 400 &&
      error.statusCode < 500
    ) {
      throw error;
    }

    try {
      const currentInterview = await Interview.findById(interview._id);

      if (currentInterview && currentInterview.status === "in-progress") {
        /*
         * Payment has already been processed.
         *
         * NEVER abandon the interview.
         * A later retry must finish finalization without
         * charging the user again.
         */
        if (currentInterview.paymentStatus === "charging") {
          const recoveredInterview = await Interview.findOneAndUpdate(
            {
              _id: interview._id,
              userId,
              status: "in-progress",
              finalizationKey,
            },
            {
              $set: {
                finalizationKey: null,
                finalizationStartedAt: null,
                finalizationLeaseUntil: null,
              },
            },
            {
              returnDocument: "after",
            },
          );

          if (!recoveredInterview) {
            throw new AppError(
              "Interview finalization ownership was lost. Please retry.",
              409,
            );
          }

          return true;
        }

        await abandonForServerError(
          currentInterview,
          userId,
          interview._id,
          finalizationKey,
        );
      }
    } catch (abandonError) {
      console.error("Failed to abandon expired interview:", abandonError);
    }

    return true;
  }
}

/*
 * =========================================================
 * GET INTERVIEW
 * =========================================================
 */

export const getInterview = async (userId, interviewId) => {
  validateInterviewId(interviewId);

  const interview = await findUserInterview(userId, interviewId);

  /*
   * If the request happens after the deadline,
   * process expiration before returning state.
   */
  if (interview.status === "in-progress") {
    await expireInterviewIfNeeded(interview);
  }

  return Interview.findOne({
    _id: interviewId,
    userId,
  });
};

/*
 * =========================================================
 * QUIT INTERVIEW
 * =========================================================
 */

export const quitInterview = async (userId, interviewId) => {
  validateInterviewId(interviewId);

  const existingInterview = await findUserInterview(userId, interviewId);

  if (existingInterview.status === "in-progress") {
    const deadline = getInterviewDeadline(existingInterview);

    if (deadline && new Date() >= deadline) {
      await expireInterviewIfNeeded(existingInterview);

      throw new AppError(
        "Interview time limit has ended. The interview was finalized automatically.",
        400,
      );
    }
  }

  const interview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
      status: "in-progress",
      $or: [{ finalizationKey: null }, { finalizationKey: { $exists: false } }],
      paymentStatus: {
        $nin: ["charging", "charged"],
      },
    },
    {
      $set: {
        status: "abandoned",
        endedAt: new Date(),
        terminationReason: "quit",
        finalizationKey: null,
        finalizationStartedAt: null,
        finalizationLeaseUntil: null,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (interview) {
    return interview;
  }

  if (
    existingInterview.status === "completed" ||
    existingInterview.status === "abandoned"
  ) {
    throw new AppError("Interview is already closed.", 400);
  }

  if (
    existingInterview.finalizationKey ||
    existingInterview.paymentStatus === "charging" ||
    existingInterview.paymentStatus === "charged"
  ) {
    throw new AppError(
      "Interview finalization is already in progress. Please wait for it to complete.",
      409,
    );
  }

  throw new AppError("Interview cannot be quit.", 400);
};

/*
 * =========================================================
 * INTERVIEW HISTORY
 * =========================================================
 */

export const getInterviewHistory = async (userId) => {
  return Interview.find({
    userId,
    status: "completed",
  }).sort({
    createdAt: -1,
  });
};

/*
 * =========================================================
 * DELETE INTERVIEW
 * =========================================================
 */

export const deleteInterview = async (userId, interviewId) => {
  validateInterviewId(interviewId);

  const deletedInterview = await Interview.findOneAndDelete({
    _id: interviewId,
    userId,
    status: {
      $in: ["completed", "abandoned"],
    },
  });

  if (deletedInterview) {
    return {
      interviewId,
    };
  }

  const interview = await findUserInterview(userId, interviewId);

  if (
    interview.status === "in-progress" ||
    interview.paymentStatus === "charging" ||
    interview.paymentStatus === "charged" ||
    interview.finalizationKey
  ) {
    throw new AppError(
      "Interview cannot be deleted while it is being finalized.",
      409,
    );
  }

  throw new AppError(
    "Only completed or abandoned interviews can be deleted.",
    400,
  );
};
