import express from "express";

import { upload } from "../middlewares/multer.js";

import {
  getResume,
  uploadResume,
  updateResume,
} from "../controllers/resume.controller.js";

const resumeRouter = express.Router();

resumeRouter.post("/upload", upload.single("resume"), uploadResume);

resumeRouter.get("/get-resume", getResume);

resumeRouter.patch("/update", updateResume);

export default resumeRouter;
