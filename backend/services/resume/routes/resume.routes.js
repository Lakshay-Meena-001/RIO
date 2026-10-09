import express from "express";
import { upload } from "../middlewares/multer.js";

import {
  getResume,
  listResumes,
  getResumeById,
  uploadResume,
  updateResume,
} from "../controllers/resume.controller.js";

const resumeRouter = express.Router();

resumeRouter.post("/upload", upload.single("resume"), uploadResume);

resumeRouter.get("/get-resume", getResume);
resumeRouter.get("/", listResumes);
resumeRouter.get("/:resumeId", getResumeById);

resumeRouter.patch("/update", updateResume);

export default resumeRouter;
