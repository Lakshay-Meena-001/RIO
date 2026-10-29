import express from "express";
import { upload } from "../middlewares/multer.js";
import internalAuth from "../middlewares/internalAuth.js";

import {
  getResume,
  listResumes,
  listScoredResumes,
  getScoredResumeById,
  getResumeById,
  uploadResume,
  createResume,
  updateResume,
  deleteResume,
  deleteScoredResume,
} from "../controllers/resume.controller.js";

const resumeRouter = express.Router();

resumeRouter.use(internalAuth);

resumeRouter.post("/upload", upload.single("resume"), uploadResume);
resumeRouter.post("/create", createResume);
resumeRouter.get("/get-resume", getResume);
// Keep the scored routes before /:resumeId so "scored" is not treated as an ID.
resumeRouter.get("/scored", listScoredResumes);
resumeRouter.get("/scored/:resumeId", getScoredResumeById);
resumeRouter.delete("/scored/:resumeId", deleteScoredResume);
resumeRouter.get("/", listResumes);
resumeRouter.get("/:resumeId", getResumeById);
resumeRouter.patch("/update", updateResume);
resumeRouter.delete("/:resumeId", deleteResume);

export default resumeRouter;
