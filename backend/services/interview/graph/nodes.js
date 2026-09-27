import { interviewAgent } from "../agents/interviewAgent.js";
import { feedbackAgent } from "../agents/feedbackAgent.js";
import { summaryAgent } from "../agents/summaryAgent.js";

/*
 * ========================================================
 * INTERVIEW NODE
 * ========================================================
 * Generates exactly one interview question.
 */
export async function interviewNode(state) {
  const question = await interviewAgent({
    role: state.role,
    experienceLevel: state.experienceLevel,
    interviewLevel: state.interviewLevel,
    interviewType: state.interviewType,

    subjects: state.subjects || [],

    techStack: state.techStack || [],

    projectContext: state.projectContext || null,

    difficulty: state.difficulty,

    currentQuestionIndex: state.currentQuestionIndex ?? 0,

    questions: state.questions || [],
  });

  return {
    currentQuestion: question,
    currentAnswer: "",
    currentEvaluation: null,

    action: "question-generated",
  };
}

/*
 * ========================================================
 * FEEDBACK NODE
 * ========================================================
 * Evaluates the candidate's answer.
 */
export async function feedbackNode(state) {
  if (!state.currentQuestion) {
    throw new Error("Current question is required for evaluation.");
  }

  if (!state.currentAnswer) {
    throw new Error("Candidate answer is required for evaluation.");
  }

  const evaluation = await feedbackAgent({
    question: state.currentQuestion,

    answer: state.currentAnswer,

    section: state.currentQuestion.section,

    difficulty: state.currentQuestion.difficulty,

    role: state.role,

    interviewLevel: state.interviewLevel,
  });

  return {
    currentEvaluation: evaluation,

    action: "answer-evaluated",
  };
}

/*
 * ========================================================
 * SUMMARY NODE
 * ========================================================
 * Generates the final interview report.
 */
export async function summaryNode(state) {
  const report = await summaryAgent({
    role: state.role,

    experienceLevel: state.experienceLevel,

    interviewLevel: state.interviewLevel,

    interviewType: state.interviewType,

    subjects: state.subjects || [],

    techStack: state.techStack || [],

    questions: state.questions || [],
  });

  return {
    overallScore: report.overallScore,

    sectionScores: report.sectionScores,

    strengths: report.strengths,

    weaknesses: report.weaknesses,

    recommendations: report.recommendations,

    summary: report.summary,

    completed: true,

    status: "completed",

    action: "completed",
  };
}
