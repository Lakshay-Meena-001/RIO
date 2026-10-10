import { Router } from "express";

import {
  listRoadmaps,
  listRoadmapCategories,
  getRoadmapCatalogEntry,
  generateRoadmapController,
  generateRoadmapPhaseController,
  getUserRoadmapController,
} from "../controllers/roadmap.controller.js";

/**
 * Pass the existing RIO authentication middleware when creating the router.
 * Public catalog routes do not require authentication.
 */
export function createRoadmapRouter(authMiddleware) {
  if (typeof authMiddleware !== "function") {
    throw new Error(
      "Roadmap router requires the existing RIO authentication middleware.",
    );
  }

  const router = Router();

  // Public catalog metadata; these routes never trigger AI generation.
  router.get("/catalog", listRoadmaps);
  router.get("/catalog/categories", listRoadmapCategories);
  router.get("/catalog/:roadmapId", getRoadmapCatalogEntry);

  // Authenticated roadmap operations.
  router.post("/generate", authMiddleware, generateRoadmapController);

  router.get("/user/:userRoadmapId", authMiddleware, getUserRoadmapController);

  router.post(
    "/user/:userRoadmapId/phases/:phaseId/generate",
    authMiddleware,
    generateRoadmapPhaseController,
  );

  return router;
}

export default createRoadmapRouter;
