import express from "express";

import {
  generateRoadmapController,
  getRoadmapController,
  getRoadmapHistoryController,
  deleteRoadmapController,
  updateRoadmapProgressController,
} from "../controllers/roadmap.controllers.js";

const router = express.Router();

// Generate a new personalized roadmap.
router.post("/generate", generateRoadmapController);

// Get the user's roadmap history.
router.get("/history", getRoadmapHistoryController);

// Update completion status of a roadmap module.
router.patch("/:id/progress", updateRoadmapProgressController);

// Get one roadmap by ID.
router.get("/:id", getRoadmapController);

// Delete one roadmap by ID.
router.delete("/:id", deleteRoadmapController);

export default router;
