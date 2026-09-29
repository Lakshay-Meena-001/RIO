import express from "express";

import {
  startInterview,
  submitAnswer,
  getInterview,
  getInterviewHistory,
  getNextQuestion,
  getPreviousQuestion,
  submitInterview,
  pauseInterview,
  resumeInterview,
  quitInterview,
} from "../controllers/interview.controller.js";

import { validate } from "../middlewares/validate.js";

import {
  startInterviewSchema,
  submitAnswerSchema,
} from "../validators/interview.schema.js";

import { deleteInterview } from "../services/interview.service.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Interview Creation
|--------------------------------------------------------------------------
*/

router.post("/start", validate(startInterviewSchema), startInterview);

/*
|--------------------------------------------------------------------------
| Individual Answer Submission
|--------------------------------------------------------------------------
*/

router.post("/answer", validate(submitAnswerSchema), submitAnswer);

/*
|--------------------------------------------------------------------------
| Interview History
|--------------------------------------------------------------------------
|
| Keep this before "/:interviewId" so "history" is not treated as an ID.
|
*/

router.get("/history", getInterviewHistory);

/*
|--------------------------------------------------------------------------
| Interview Navigation
|--------------------------------------------------------------------------
|
| Navigation does NOT generate questions.
| All questions are generated when the interview starts.
|
*/

router.post("/:interviewId/next", getNextQuestion);

router.post("/:interviewId/previous", getPreviousQuestion);

/*
|--------------------------------------------------------------------------
| Final Interview Submission
|--------------------------------------------------------------------------
|
| Evaluates all remaining unsubmitted questions and
| generates the final interview report.
|
*/

router.post("/:interviewId/submit", submitInterview);

/*
|--------------------------------------------------------------------------
| Interview Lifecycle
|--------------------------------------------------------------------------
*/

router.patch("/:interviewId/pause", pauseInterview);

router.patch("/:interviewId/resume", resumeInterview);

router.patch("/:interviewId/quit", quitInterview);

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
