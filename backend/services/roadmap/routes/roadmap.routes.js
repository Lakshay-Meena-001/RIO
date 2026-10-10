import { Router } from "express";

import {
  listRoadmaps,
  listRoadmapCategories,
  getRoadmapCatalogEntry,
  generateRoadmapController,
  generateRoadmapPhaseController,
  getUserRoadmapController,
  getRoadmapProgressController,
  updateRoadmapPhaseStatusController,
  updateRoadmapTopicStatusController,
} from "../controllers/roadmap.controller.js";

export function createRoadmapRouter(authMiddleware) {
  if (typeof authMiddleware !== "function") {
    throw new Error(
      "Roadmap router requires the existing RIO authentication middleware.",
    );
  }

  const router = Router();

  // Public catalog routes. These do not trigger AI generation.
  router.get("/catalog", listRoadmaps);
  router.get("/catalog/categories", listRoadmapCategories);
  router.get("/catalog/:roadmapId", getRoadmapCatalogEntry);

  // Authenticated roadmap operations.
  router.post("/generate", authMiddleware, generateRoadmapController);

  router.get("/user/:userRoadmapId", authMiddleware, getUserRoadmapController);

  // Generate a phase progressively.
  router.post(
    "/user/:userRoadmapId/phases/:phaseId/generate",
    authMiddleware,
    generateRoadmapPhaseController,
  );

  // Read the user's progress.
  router.get(
    "/user/:userRoadmapId/progress",
    authMiddleware,
    getRoadmapProgressController,
  );

  // Update a phase's status.
  router.patch(
    "/user/:userRoadmapId/phases/:phaseId/status",
    authMiddleware,
    updateRoadmapPhaseStatusController,
  );

  // Update a topic's status and optional notes.
  router.patch(
    "/user/:userRoadmapId/phases/:phaseId/topics/:topicId/status",
    authMiddleware,
    updateRoadmapTopicStatusController,
  );

  return router;
}

export default createRoadmapRouter;
