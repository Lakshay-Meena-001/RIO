import express from "express";
import { upload } from "../middlewares/multer.js";
import internalAuth from "../middlewares/internalAuth.js";

import {
  getResume,
  listResumes,
  getResumeById,
  uploadResume,
  updateResume,
  deleteResume,
} from "../controllers/resume.controller.js";

const resumeRouter = express.Router();

resumeRouter.use(internalAuth);

resumeRouter.post("/upload", upload.single("resume"), uploadResume);
resumeRouter.get("/get-resume", getResume);
resumeRouter.get("/", listResumes);
resumeRouter.get("/:resumeId", getResumeById);
resumeRouter.patch("/update", updateResume);
resumeRouter.delete("/:resumeId", deleteResume);

export default resumeRouter;