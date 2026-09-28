import express from "express";

import {
  startInterview,
  submitAnswer,
  getInterview,
  getInterviewHistory,
  getNextQuestion,
  pauseInterview,
  resumeInterview,
  quitInterview,
  addMoreQuestions,
  deleteInterview,
} from "../controllers/interview.controller.js";

import { validate } from "../middlewares/validate.js";

import {
  startInterviewSchema,
  submitAnswerSchema,
  addMoreQuestionsSchema,
} from "../validators/interview.schema.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Interview Creation
|--------------------------------------------------------------------------
*/

router.post("/start", validate(startInterviewSchema), startInterview);

/*
|--------------------------------------------------------------------------
| Answer Submission
|--------------------------------------------------------------------------
*/

router.post("/answer", validate(submitAnswerSchema), submitAnswer);

/*
|--------------------------------------------------------------------------
| Interview History
|--------------------------------------------------------------------------
| Keep this before "/:interviewId" so "history" is not treated as an ID.
*/

router.get("/history", getInterviewHistory);

/*
|--------------------------------------------------------------------------
| Interview Actions
|--------------------------------------------------------------------------
*/

router.post("/:interviewId/next", getNextQuestion);

router.patch("/:interviewId/pause", pauseInterview);

router.patch("/:interviewId/resume", resumeInterview);

router.patch("/:interviewId/quit", quitInterview);

router.post(
  "/:interviewId/more-questions",
  validate(addMoreQuestionsSchema),
  addMoreQuestions,
);

/*
|--------------------------------------------------------------------------
| Delete Interview
|--------------------------------------------------------------------------
*/

router.delete("/:interviewId", deleteInterview);

/*
|--------------------------------------------------------------------------
| Interview Details
|--------------------------------------------------------------------------
*/

router.get("/:interviewId", getInterview);

export default router;
