import express from "express";

import {
  startInterview,
  submitAnswer,
  getNextQuestion,
  getInterview,
  pauseInterview,
  resumeInterview,
  quitInterview,
  getInterviewHistory,
  addMoreQuestions,
} from "../controllers/interview.controller.js";

import { validate } from "../middlewares/validate.js";

import {
  startInterviewSchema,
  submitAnswerSchema,
} from "../validators/interview.schema.js";

const router = express.Router();

/*
 * ---------------------------------------------------------
 * Start Interview
 * ---------------------------------------------------------
 */
router.post("/start", validate(startInterviewSchema), startInterview);

/*
 * ---------------------------------------------------------
 * Submit Answer
 * ---------------------------------------------------------
 */
router.post("/answer", validate(submitAnswerSchema), submitAnswer);

/*
 * ---------------------------------------------------------
 * Get Interview History
 * ---------------------------------------------------------
 */
router.get("/history", getInterviewHistory);

/*
 * ---------------------------------------------------------
 * Get Single Interview
 * ---------------------------------------------------------
 */
router.get("/:interviewId", getInterview);

/*
 * ---------------------------------------------------------
 * Get Next Question
 * ---------------------------------------------------------
 */
router.post("/:interviewId/next", getNextQuestion);

/*
 * ---------------------------------------------------------
 * Pause Interview
 * ---------------------------------------------------------
 */
router.patch("/:interviewId/pause", pauseInterview);

/*
 * ---------------------------------------------------------
 * Resume Interview
 * ---------------------------------------------------------
 */
router.patch("/:interviewId/resume", resumeInterview);

/*
 * ---------------------------------------------------------
 * Quit Interview
 * ---------------------------------------------------------
 */
router.patch("/:interviewId/quit", quitInterview);

/*
 * ---------------------------------------------------------
 * Add More Questions
 * ---------------------------------------------------------
 */
router.post("/:interviewId/more-questions", addMoreQuestions);

export default router;
