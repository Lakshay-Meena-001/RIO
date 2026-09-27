import mongoose from "mongoose";
import Interview from "../models/interview.model.js";
import graph from "../graph/graph.js";
import AppError from "../utils/error.js";

/*
 * ---------------------------------------------------------
 * Build Graph State
 * ---------------------------------------------------------
 * Converts MongoDB interview data into the state expected
 * by LangGraph.
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

    difficulty: interview.difficulty,
    timeLimit: interview.timeLimit,
    questionCount: interview.questionCount,

    projectContext: interview.projectContext || null,

    status: interview.status,

    currentQuestionIndex: interview.currentQuestionIndex,
    currentQuestion: extraState.currentQuestion || null,
    currentAnswer: extraState.currentAnswer || "",
    currentEvaluation: extraState.currentEvaluation || null,

    questions: interview.questions || [],

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
 * ---------------------------------------------------------
 * Convert Graph Question
 * ---------------------------------------------------------
 * Removes anything unnecessary before storing the question
 * inside MongoDB.
 */
function createQuestionRecord(question) {
  return {
    questionId: question.questionId,
    text: question.text,
    section: question.section,
    type: question.type || "primary",
    difficulty: question.difficulty,

    answer: "",
    askedAt: new Date(),
    submittedAt: null,

    evaluation: {
      score: 0,
      correctness: 0,
      clarity: 0,
      relevance: 0,
      communication: 0,
      feedback: "",
      strengths: [],
      weaknesses: [],
      betterAnswer: "",
      recommendations: [],
    },
  };
}

/*
 * ---------------------------------------------------------
 * START INTERVIEW
 * ---------------------------------------------------------
 */
export const startInterview = async (userId, interviewData) => {
  const interview = await Interview.create({
    userId,

    role: interviewData.role,
    experienceLevel: interviewData.experienceLevel,
    interviewLevel: interviewData.interviewLevel,
    interviewType: interviewData.interviewType,

    subjects: interviewData.subjects || [],
    language: interviewData.language || "english",

    difficulty: interviewData.difficulty || "easy",
    timeLimit: interviewData.timeLimit || 30,
    questionCount: interviewData.questionCount || 10,

    techStack: interviewData.techStack || [],
    projectContext: interviewData.projectContext || null,

    status: "created",
    currentQuestionIndex: 0,

    questions: [],
  });

  const graphState = buildGraphState(interview, {
    action: "start",
  });

  const result = await graph.invoke(graphState);

  const question = result.currentQuestion;

  if (!question) {
    throw new Error("Failed to generate interview question");
  }

  interview.questions.push(createQuestionRecord(question));

  interview.currentQuestionIndex = 0;
  interview.status = "in-progress";

  await interview.save();

  return {
    interviewId: interview._id,
    status: interview.status,
    currentQuestionIndex: interview.currentQuestionIndex,
    question: interview.questions[0],
  };
};

/*
 * ---------------------------------------------------------
 * SUBMIT ANSWER
 * ---------------------------------------------------------
 */
export const submitAnswer = async (userId, interviewId, answer) => {
  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    throw new AppError("Invalid interview ID.", 400);
  }

  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new AppError("Interview not found.", 404);
  }

  if (interview.status !== "in-progress") {
    throw new AppError("Interview is not active.", 400);
  }

  const currentQuestion = interview.questions[interview.currentQuestionIndex];

  if (!currentQuestion) {
    throw new Error("Current question not found");
  }

  if (currentQuestion.submittedAt) {
    throw new AppError(
      "Answer for this question has already been submitted.",
      400,
    );
  }

  /*
   * Save candidate answer first.
   */
  currentQuestion.answer = answer;
  currentQuestion.submittedAt = new Date();

  /*
   * Ask LangGraph to evaluate the answer.
   */
  const graphState = buildGraphState(interview, {
    action: "submit-answer",

    currentQuestion: {
      questionId: currentQuestion.questionId,
      text: currentQuestion.text,
      section: currentQuestion.section,
      type: currentQuestion.type,
      difficulty: currentQuestion.difficulty,
    },

    currentAnswer: answer,
  });

  const result = await graph.invoke(graphState);

  const evaluation = result.currentEvaluation;

  if (!interview) {
    throw new AppError("Interview not found.", 404);
  }

  /*
   * Save feedback into the current question.
   */
  currentQuestion.evaluation = evaluation;

  await interview.save();

  return {
    interviewId: interview._id,
    questionId: currentQuestion.questionId,
    evaluation,
    currentQuestionIndex: interview.currentQuestionIndex,
  };
};

/*
 * ---------------------------------------------------------
 * NEXT QUESTION
 * ---------------------------------------------------------
 */
export const getNextQuestion = async (userId, interviewId) => {
  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    throw new AppError("Invalid interview ID.", 400);
  }
  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new AppError("Interview not found.", 404);
  }

  if (interview.status !== "in-progress") {
    throw new AppError("Interview is not active.", 400);
  }

  /*
   * Check whether all configured questions
   * have already been completed.
   */
  if (interview.questions.length >= interview.questionCount) {
    return completeInterview(userId, interviewId);
  }

  const nextQuestionIndex = interview.questions.length;

  const graphState = buildGraphState(interview, {
    action: "start",
  });

  graphState.currentQuestionIndex = nextQuestionIndex;

  const result = await graph.invoke(graphState);

  const question = result.currentQuestion;

  if (!interview) {
    throw new AppError("Interview not found.", 404);
  }
  interview.questions.push(createQuestionRecord(question));

  interview.currentQuestionIndex = nextQuestionIndex;

  await interview.save();

  return {
    interviewId: interview._id,
    currentQuestionIndex: nextQuestionIndex,
    question: interview.questions[nextQuestionIndex],
  };
};

/*
 * ---------------------------------------------------------
 * COMPLETE INTERVIEW
 * ---------------------------------------------------------
 */
export const completeInterview = async (userId, interviewId) => {
  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    throw new AppError("Invalid interview ID.", 400);
  }
  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new AppError("Interview not found.", 404);
  }

  const graphState = buildGraphState(interview, {
    action: "summary",
  });

  const result = await graph.invoke(graphState);

  interview.overallScore = result.overallScore ?? 0;
  interview.sectionScores = result.sectionScores || {};
  interview.strengths = result.strengths || [];
  interview.weaknesses = result.weaknesses || [];
  interview.recommendations = result.recommendations || [];
  interview.summary = result.summary || "";

  interview.status = "completed";

  await interview.save();

  return {
    interviewId: interview._id,
    status: interview.status,
    overallScore: interview.overallScore,
    sectionScores: interview.sectionScores,
    strengths: interview.strengths,
    weaknesses: interview.weaknesses,
    recommendations: interview.recommendations,
    summary: interview.summary,
  };
};

/*
 * ---------------------------------------------------------
 * GET INTERVIEW
 * ---------------------------------------------------------
 */
export const getInterview = async (userId, interviewId) => {
  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    throw new AppError("Invalid interview ID.", 400);
  }

  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new AppError("Interview not found.", 404);
  }

  return interview;
};

/*
 * ---------------------------------------------------------
 * PAUSE INTERVIEW
 * ---------------------------------------------------------
 */
export const pauseInterview = async (userId, interviewId) => {
  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    throw new AppError("Invalid interview ID.", 400);
  }
  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new AppError("Interview not found.", 404);
  }

  if (interview.status !== "in-progress") {
    throw new AppError("Interview is not active.", 400);
  }

  interview.status = "paused";

  await interview.save();

  return interview;
};

/*
 * ---------------------------------------------------------
 * RESUME INTERVIEW
 * ---------------------------------------------------------
 */
export const resumeInterview = async (userId, interviewId) => {
  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    throw new AppError("Invalid interview ID.", 400);
  }
  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new AppError("Interview not found.", 404);
  }

  if (interview.status !== "paused") {
    throw new Error("Only a paused interview can be resumed");
  }

  interview.status = "in-progress";

  await interview.save();

  return interview;
};

/*
 * ---------------------------------------------------------
 * QUIT INTERVIEW
 * ---------------------------------------------------------
 */
export const quitInterview = async (userId, interviewId) => {
  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    throw new AppError("Invalid interview ID.", 400);
  }
  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new AppError("Interview not found.", 404);
  }

  if (interview.status === "completed" || interview.status === "abandoned") {
    throw new Error("Interview is already closed");
  }

  interview.status = "abandoned";

  await interview.save();

  return interview;
};

/*
 * ---------------------------------------------------------
 * INTERVIEW HISTORY
 * ---------------------------------------------------------
 */
export const getInterviewHistory = async (userId) => {
  return Interview.find({
    userId,
  }).sort({
    createdAt: -1,
  });
};

/*
 * ---------------------------------------------------------
 * ADD MORE QUESTIONS
 * ---------------------------------------------------------
 */
export const addMoreQuestions = async (userId, interviewId, count = 5) => {
  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    throw new AppError("Invalid interview ID.", 400);
  }
  const interview = await Interview.findOne({
    _id: interviewId,
    userId,
  });

  if (!interview) {
    throw new AppError("Interview not found.", 404);
  }

  if (interview.status !== "in-progress") {
    throw new AppError("Interview is not active.", 400);
  }

  if (!Number.isInteger(count) || count < 1) {
    throw new Error("Question count must be a positive integer");
  }

  interview.questionCount += count;

  await interview.save();

  return {
    interviewId: interview._id,
    questionCount: interview.questionCount,
  };
};
