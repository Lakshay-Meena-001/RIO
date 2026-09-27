import { Annotation } from "@langchain/langgraph";

const InterviewState = Annotation.Root({
  // ==========================================
  // 1. INTERVIEW CONFIGURATION
  // ==========================================

  userId: Annotation(),

  role: Annotation(),

  experienceLevel: Annotation(),

  interviewLevel: Annotation(),

  interviewType: Annotation(),

  subjects: Annotation(),

  techStack: Annotation(),

  language: Annotation(),

  difficulty: Annotation(),

  timeLimit: Annotation(),

  questionCount: Annotation(),

  projectContext: Annotation(),

  // ==========================================
  // 2. INTERVIEW PROGRESS
  // ==========================================

  status: Annotation(),

  currentQuestionIndex: Annotation(),

  currentQuestion: Annotation(),

  currentAnswer: Annotation(),

  currentEvaluation: Annotation(),

  // ==========================================
  // 3. INTERVIEW HISTORY
  // ==========================================

  questions: Annotation(),


  // ==========================================
  // 4. FINAL REPORT
  // ==========================================

  overallScore: Annotation(),

  sectionScores: Annotation(),

  strengths: Annotation(),

  weaknesses: Annotation(),

  recommendations: Annotation(),

  summary: Annotation(),

  // ==========================================
  // 6. WORKFLOW CONTROL
  // ==========================================

  action: Annotation(),

  completed: Annotation(),

  error: Annotation(),
});

export default InterviewState;