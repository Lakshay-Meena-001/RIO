import * as interviewService from "../services/interview.service.js";

/*
 * ---------------------------------------------------------
 * START INTERVIEW
 * ---------------------------------------------------------
 */
export const startInterview = async (req, res, next) => {
  try {
    const userId =req.headers["x-user-id"];

    const result = await interviewService.startInterview(
      userId,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * ---------------------------------------------------------
 * SUBMIT ANSWER
 * ---------------------------------------------------------
 */
export const submitAnswer = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];

    const { interviewId, answer } = req.body;

    const result = await interviewService.submitAnswer(
      userId,
      interviewId,
      answer,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * ---------------------------------------------------------
 * GET NEXT QUESTION
 * ---------------------------------------------------------
 */
export const getNextQuestion = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];

    const { interviewId } = req.params;

    const result = await interviewService.getNextQuestion(
      userId,
      interviewId,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * ---------------------------------------------------------
 * GET INTERVIEW
 * ---------------------------------------------------------
 */
export const getInterview = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];

    const { interviewId } = req.params;

    const result = await interviewService.getInterview(
      userId,
      interviewId,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * ---------------------------------------------------------
 * PAUSE INTERVIEW
 * ---------------------------------------------------------
 */
export const pauseInterview = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];

    const { interviewId } = req.params;

    const result = await interviewService.pauseInterview(
      userId,
      interviewId,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * ---------------------------------------------------------
 * RESUME INTERVIEW
 * ---------------------------------------------------------
 */
export const resumeInterview = async (req, res, next) => {
  try {
    const userId =req.headers["x-user-id"];

    const { interviewId } = req.params;

    const result = await interviewService.resumeInterview(
      userId,
      interviewId,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * ---------------------------------------------------------
 * QUIT INTERVIEW
 * ---------------------------------------------------------
 */
export const quitInterview = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];

    const { interviewId } = req.params;

    const result = await interviewService.quitInterview(
      userId,
      interviewId,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * ---------------------------------------------------------
 * INTERVIEW HISTORY
 * ---------------------------------------------------------
 */
export const getInterviewHistory = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];

    const result =
      await interviewService.getInterviewHistory(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * ---------------------------------------------------------
 * ADD MORE QUESTIONS
 * ---------------------------------------------------------
 */
export const addMoreQuestions = async (req, res, next) => {
  try {
    const userId =req.headers["x-user-id"]F;

    const { interviewId } = req.params;

    const count = req.body.count ?? 5;

    const result = await interviewService.addMoreQuestions(
      userId,
      interviewId,
      count,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};