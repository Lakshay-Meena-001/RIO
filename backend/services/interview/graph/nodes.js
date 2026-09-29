import { interviewAgent } from "../agents/interviewAgent.js";
import { feedbackAgent } from "../agents/feedbackAgent.js";
import { summaryAgent } from "../agents/summaryAgent.js";

/*
 * ========================================================
 * INTERVIEW NODE
 * ========================================================
 * Generates the complete interview question set.
 */
export async function interviewNode(state) {
  const result = await interviewAgent({
    role: state.role,
    experienceLevel: state.experienceLevel,
    interviewLevel: state.interviewLevel,
    interviewType: state.interviewType,

    subjects: state.subjects || [],

    techStack: state.techStack || [],

    projectContext: state.projectContext || null,

    difficulty: state.difficulty,

    questionCount: state.questionCount,
  });

  if (!result?.questions || result.questions.length === 0) {
    throw new Error("Interview question set could not be generated.");
  }

  return {
    questions: result.questions,

    currentQuestion: null,
    currentAnswer: "",
    currentEvaluation: null,

    action: "questions-generated",
  };
}

/*
 * ========================================================
 * FEEDBACK NODE
 * ========================================================
 * Evaluates the candidate's selected answer.
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
