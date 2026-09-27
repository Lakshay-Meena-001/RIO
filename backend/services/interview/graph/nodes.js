import { interviewAgent } from "../agents/interview.agent.js";
import { feedbackAgent } from "../agents/feedback.agent.js";
import { summaryAgent } from "../agents/summary.agent.js";

// ==========================================
// 1. INTERVIEW NODE
// ==========================================

export async function interviewNode(state) {
  const question = await interviewAgent({
    role: state.role,
    experienceLevel: state.experienceLevel,
    interviewLevel: state.interviewLevel,
    interviewType: state.interviewType,
    subjects: state.subjects,
    techStack: state.techStack,
    projectContext: state.projectContext,
    difficulty: state.difficulty,
  });

  return {
    currentQuestion: question,
    currentAnswer: "",
    currentEvaluation: null,
    action: "question-generated",
  };
}

// ==========================================
// 2. FEEDBACK NODE
// ==========================================

export async function feedbackNode(state) {
  const evaluation = await feedbackAgent({
    question: state.currentQuestion,
    answer: state.currentAnswer,
    section: state.currentQuestion?.section,
    difficulty: state.currentQuestion?.difficulty,
    role: state.role,
    interviewLevel: state.interviewLevel,
  });

  return {
    currentEvaluation: evaluation,
    action: "answer-evaluated",
  };
}

// ==========================================
// 3. SUMMARY NODE
// ==========================================

export async function summaryNode(state) {
  const report = await summaryAgent({
    role: state.role,
    experienceLevel: state.experienceLevel,
    interviewLevel: state.interviewLevel,
    interviewType: state.interviewType,
    subjects: state.subjects,
    techStack: state.techStack,
    questions: state.questions,
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
