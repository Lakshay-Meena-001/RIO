import * as interviewService from "../services/interview.service.js";

const getUserId = (req) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    const error = new Error("User authentication required.");
    error.statusCode = 401;
    throw error;
  }

  return userId;
};

export const startInterview = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const interview = await interviewService.startInterview(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Interview started successfully.",
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { interviewId, answer } = req.body;

    const interview = await interviewService.submitAnswer(
      userId,
      interviewId,
      answer,
    );

    return res.status(200).json({
      success: true,
      message: "Answer submitted successfully.",
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const getNextQuestion = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { interviewId } = req.params;

    const result = await interviewService.getNextQuestion(userId, interviewId);

    return res.status(200).json({
      success: true,
      message: "Next question generated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterview = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { interviewId } = req.params;

    const interview = await interviewService.getInterview(userId, interviewId);

    return res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewHistory = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const interviews = await interviewService.getInterviewHistory(userId);

    return res.status(200).json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    next(error);
  }
};

export const pauseInterview = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { interviewId } = req.params;

    const interview = await interviewService.pauseInterview(
      userId,
      interviewId,
    );

    return res.status(200).json({
      success: true,
      message: "Interview paused successfully.",
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const resumeInterview = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { interviewId } = req.params;

    const interview = await interviewService.resumeInterview(
      userId,
      interviewId,
    );

    return res.status(200).json({
      success: true,
      message: "Interview resumed successfully.",
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const quitInterview = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { interviewId } = req.params;

    const interview = await interviewService.quitInterview(userId, interviewId);

    return res.status(200).json({
      success: true,
      message: "Interview quit successfully.",
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const addMoreQuestions = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { interviewId } = req.params;
    const { count } = req.body;

    const interview = await interviewService.addMoreQuestions(
      userId,
      interviewId,
      count,
    );

    return res.status(200).json({
      success: true,
      message: "More questions added successfully.",
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};
