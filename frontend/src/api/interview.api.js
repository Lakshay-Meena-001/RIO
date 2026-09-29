import api from "../utils/axios";

/*
 * Start a new mock interview.
 *
 * All interview questions are generated together
 * when the interview starts.
 *
 * POST /api/interview/start
 */
export const startInterview = async (interviewData) => {
  const response = await api.post("/api/interview/start", interviewData);

  return response.data;
};

/*
 * Submit the candidate's answer for a specific question.
 *
 * POST /api/interview/answer
 *
 * The questionId is required because the candidate can
 * submit questions in any order.
 */
export const submitAnswer = async (interviewId, questionId, answer) => {
  const response = await api.post("/api/interview/answer", {
    interviewId,
    questionId,
    answer,
  });

  return response.data;
};

/*
 * Move to the next question.
 *
 * This is navigation only.
 * It does NOT generate a new question.
 *
 * POST /api/interview/:interviewId/next
 */
export const getNextQuestion = async (interviewId) => {
  const response = await api.post(`/api/interview/${interviewId}/next`);

  return response.data;
};

/*
 * Move to the previous question.
 *
 * This is navigation only.
 *
 * POST /api/interview/:interviewId/previous
 */
export const getPreviousQuestion = async (interviewId) => {
  const response = await api.post(`/api/interview/${interviewId}/previous`);

  return response.data;
};

/*
 * Submit the complete interview.
 *
 * The backend evaluates all remaining unsubmitted
 * questions and generates the final interview report.
 *
 * Already submitted questions are not re-evaluated.
 *
 * POST /api/interview/:interviewId/submit
 */
export const submitInterview = async (interviewId) => {
  const response = await api.post(`/api/interview/${interviewId}/submit`);

  return response.data;
};

/*
 * Get one complete interview attempt.
 *
 * GET /api/interview/:interviewId
 */
export const getInterview = async (interviewId) => {
  const response = await api.get(`/api/interview/${interviewId}`);

  return response.data;
};

/*
 * Get the authenticated user's interview history.
 *
 * GET /api/interview/history
 */
export const getInterviewHistory = async () => {
  const response = await api.get("/api/interview/history");

  return response.data;
};

/*
 * Pause an active interview.
 *
 * PATCH /api/interview/:interviewId/pause
 */
export const pauseInterview = async (interviewId) => {
  const response = await api.patch(`/api/interview/${interviewId}/pause`);

  return response.data;
};

/*
 * Resume a paused interview.
 *
 * PATCH /api/interview/:interviewId/resume
 */
export const resumeInterview = async (interviewId) => {
  const response = await api.patch(`/api/interview/${interviewId}/resume`);

  return response.data;
};

/*
 * Quit the current interview.
 *
 * PATCH /api/interview/:interviewId/quit
 */
export const quitInterview = async (interviewId) => {
  const response = await api.patch(`/api/interview/${interviewId}/quit`);

  return response.data;
};

/*
 * Delete one interview attempt.
 *
 * DELETE /api/interview/:interviewId
 */
export const deleteInterview = async (interviewId) => {
  const response = await api.delete(`/api/interview/${interviewId}`);

  return response.data;
};
