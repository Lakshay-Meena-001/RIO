import { Annotation } from "@langchain/langgraph";

const InterviewState = Annotation.Root({
  /*
   * ========================================================
   * INTERVIEW CONFIGURATION
   * ========================================================
   */

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

  /*
   * ========================================================
   * INTERVIEW PROGRESS
   * ========================================================
   */

  status: Annotation(),

  currentQuestionIndex: Annotation(),

  currentQuestion: Annotation(),

  currentAnswer: Annotation(),

  currentEvaluation: Annotation(),

  /*
   * ========================================================
   * INTERVIEW HISTORY
   * ========================================================
   */

  questions: Annotation(),

  /*
   * ========================================================
   * FINAL REPORT
   * ========================================================
   */

  overallScore: Annotation(),

  sectionScores: Annotation(),

  strengths: Annotation(),

  weaknesses: Annotation(),

  recommendations: Annotation(),

  summary: Annotation(),

  /*
   * ========================================================
   * WORKFLOW CONTROL
   * ========================================================
   */

  action: Annotation(),

  completed: Annotation(),

  error: Annotation(),
});

export default InterviewState;
