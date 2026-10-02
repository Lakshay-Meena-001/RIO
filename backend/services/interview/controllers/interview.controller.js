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

/*
|--------------------------------------------------------------------------
| Start Interview
|--------------------------------------------------------------------------
*/

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

export const replaceActiveInterview = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const interview = await interviewService.replaceActiveInterview(userId);

    return res.status(200).json({
      success: true,
      message: interview
        ? "Active interview replaced."
        : "No active interview found.",
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Begin Interview
|--------------------------------------------------------------------------
*/

export const beginInterview = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { interviewId } = req.params;

    const interview = await interviewService.beginInterview(
      userId,
      interviewId,
    );

    return res.status(200).json({
      success: true,
      message: "Interview timer started.",
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Next Question
|--------------------------------------------------------------------------
|
| Navigation only.
| No question generation happens here.
|
*/

export const getNextQuestion = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { interviewId } = req.params;

    const result = await interviewService.getNextQuestion(userId, interviewId);

    return res.status(200).json({
      success: true,
      message: "Moved to next question.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Previous Question
|--------------------------------------------------------------------------
|
| Navigation only.
| No LLM call happens here.
|
*/

export const getPreviousQuestion = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { interviewId } = req.params;

    const result = await interviewService.getPreviousQuestion(
      userId,
      interviewId,
    );

    return res.status(200).json({
      success: true,
      message: "Moved to previous question.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Jump To Question
|--------------------------------------------------------------------------
|
| Navigation only.
| No LLM call happens here.
|
*/

export const jumpToQuestion = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { interviewId } = req.params;
    const { index } = req.body;

    const result = await interviewService.jumpToQuestion(
      userId,
      interviewId,
      index,
    );

    return res.status(200).json({
      success: true,
      message: "Moved to selected question.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Final Submit Interview
|--------------------------------------------------------------------------
|
| Evaluates all remaining unsubmitted questions and
| generates the final interview report.
|
*/

export const submitInterview = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { interviewId } = req.params;
    const { draftAnswers } = req.body;

    const result = await interviewService.submitInterview(
      userId,
      interviewId,
      draftAnswers,
    );

    return res.status(200).json({
      success: true,
      message: "Interview submitted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Interview
|--------------------------------------------------------------------------
*/

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

/*
 * =========================================================
 * GET ACTIVE INTERVIEW
 * =========================================================
 */
export const getActiveInterview = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const interview = await interviewService.getActiveInterview(userId);

    return res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * =========================================================
 * GET RECENTLY TERMINATED INTERVIEW
 * =========================================================
 */

export const getRecentlyTerminatedInterview = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const interview =
      await interviewService.getRecentlyTerminatedInterview(userId);

    return res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * =========================================================
 * DISMISS TERMINATION NOTICE
 * =========================================================
 */

export const dismissTerminationNotice = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { interviewId } = req.params;

    const interview = await interviewService.dismissTerminationNotice(
      userId,
      interviewId,
    );

    return res.status(200).json({
      success: true,
      message: "Termination notice dismissed.",
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Interview History
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Quit Interview
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Delete Interview
|--------------------------------------------------------------------------
*/

export const deleteInterview = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { interviewId } = req.params;

    const result = await interviewService.deleteInterview(userId, interviewId);

    return res.status(200).json({
      success: true,
      message: "Interview deleted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
