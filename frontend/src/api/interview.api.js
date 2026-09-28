import api from "../utils/axios";

/*
 * Start a new mock interview.

 * POST /api/interview/start
 */
export const startInterview = async (interviewData) => {
  const response = await api.post("/api/interview/start", interviewData);

  return response.data;
};

/*
 * Submit the candidate's answer for the cuarrent question.

 * POST /api/interview/answer
 */
export const submitAnswer = async (interviewId, answer) => {
  const response = await api.post("/api/interview/answer", {
    interviewId,
    answer,
  });

  return response.data;
};

/*
 * Generate/get the next question.

 * POST /api/interview/:interviewId/next
 */
export const getNextQuestion = async (interviewId) => {
  const response = await api.post(`/api/interview/${interviewId}/next`);

  return response.data;
};

/*
 * Get one complete interview attempt.

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

 * PATCH /api/interview/:interviewId/pause
 */
export const pauseInterview = async (interviewId) => {
  const response = await api.patch(`/api/interview/${interviewId}/pause`);

  return response.data;
};

/*
 * Resume a paused interview.

 * PATCH /api/interview/:interviewId/resume
 */
export const resumeInterview = async (interviewId) => {
  const response = await api.patch(`/api/interview/${interviewId}/resume`);

  return response.data;
};

/*
 * Quit the current interview.
 
 * PATCH /api/interview/:interviewId/quit
 */
export const quitInterview = async (interviewId) => {
  const response = await api.patch(`/api/interview/${interviewId}/quit`);

  return response.data;
};

/*
 * Add more questions to an active interview.
 
 * POST /api/interview/:interviewId/more-questions
 */
export const addMoreQuestions = async (interviewId, count) => {
  const response = await api.post(
    `/api/interview/${interviewId}/more-questions`,
    {
      count,
    },
  );

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
