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

  /*
   * Programming language selected for Coding interviews.
   *
   * Examples:
   * cpp
   * python
   * javascript
   * typescript
   * java
   */
  codingLanguage: Annotation(),

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

  /*
   * Navigation cursor.
   * It represents which question the candidate is currently viewing.
   */
  currentQuestionIndex: Annotation(),

  /*
   * Used by feedbackNode for the question currently
   * being evaluated.
   */
  currentQuestion: Annotation(),

  currentAnswer: Annotation(),

  currentEvaluation: Annotation(),

  /*
   * ========================================================
   * INTERVIEW HISTORY
   * ========================================================
   *
   * All questions are generated at interview start.
   * Answers and evaluations are stored inside each question
   * as the interview progresses.
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
