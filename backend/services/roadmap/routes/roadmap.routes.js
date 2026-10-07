import { Router } from "express";

import {
  generateRoadmap,
  getRoadmap,
  getRoadmaps,
  deleteRoadmap,
  getProgress,
  updateNodeStatus,
  completeNode,
  startNode,
  resetNode,
  skipNode,
} from "../controllers/roadmap.controller.js";

import {
  createDraft,
  getLatestDraft,
  getDraft,
  updateDraft,
  updateCurrentStep,
  markGenerated,
  deleteDraft,
} from "../controllers/draft.controller.js";

import {
  getTemplates,
  getTemplate,
  getTemplatePhases,
  getTemplateNode,
  getNodeNextSteps,
  getNodeDependencies,
} from "../controllers/template.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Template Routes
|--------------------------------------------------------------------------
|
| These routes expose the canonical roadmap knowledge base.
| They must appear before /:roadmapId because /:roadmapId
| is a generic route.
|
*/

/**
 * Get all available roadmap templates.
 *
 * GET /api/roadmaps/templates
 */
router.get("/templates", getTemplates);

/**
 * Get one roadmap template.
 *
 * GET /api/roadmaps/templates/:templateId
 */
router.get("/templates/:templateId", getTemplate);

/**
 * Get all phases of a template.
 *
 * GET /api/roadmaps/templates/:templateId/phases
 */
router.get("/templates/:templateId/phases", getTemplatePhases);

/**
 * Get one canonical node.
 *
 * GET /api/roadmaps/templates/:templateId/nodes/:nodeId
 */
router.get("/templates/:templateId/nodes/:nodeId", getTemplateNode);

/**
 * Get recommended next steps for a node.
 *
 * GET /api/roadmaps/templates/:templateId/nodes/:nodeId/next
 */
router.get("/templates/:templateId/nodes/:nodeId/next", getNodeNextSteps);

/**
 * Get dependencies/prerequisites for a node.
 *
 * GET /api/roadmaps/templates/:templateId/nodes/:nodeId/dependencies
 */
router.get(
  "/templates/:templateId/nodes/:nodeId/dependencies",
  getNodeDependencies,
);

/*
|--------------------------------------------------------------------------
| Draft Routes
|--------------------------------------------------------------------------
*/

/**
 * Create a builder draft.
 *
 * POST /api/roadmaps/drafts
 */
router.post("/drafts", createDraft);

/**
 * Get the latest builder draft.
 *
 * IMPORTANT:
 * This must come before /drafts/:draftId.
 */
router.get("/drafts/latest", getLatestDraft);

/**
 * Get one builder draft.
 *
 * GET /api/roadmaps/drafts/:draftId
 */
router.get("/drafts/:draftId", getDraft);

/**
 * Update a builder draft.
 *
 * PATCH /api/roadmaps/drafts/:draftId
 */
router.patch("/drafts/:draftId", updateDraft);

/**
 * Update current builder step.
 *
 * PATCH /api/roadmaps/drafts/:draftId/step
 */
router.patch("/drafts/:draftId/step", updateCurrentStep);

/**
 * Mark a draft as generated.
 *
 * POST /api/roadmaps/drafts/:draftId/generated
 */
router.post("/drafts/:draftId/generated", markGenerated);

/**
 * Delete a builder draft.
 *
 * DELETE /api/roadmaps/drafts/:draftId
 */
router.delete("/drafts/:draftId", deleteDraft);

/*
|--------------------------------------------------------------------------
| Roadmap Collection Routes
|--------------------------------------------------------------------------
*/

/**
 * Generate a new roadmap.
 *
 * POST /api/roadmaps
 */
router.post("/", generateRoadmap);

/**
 * Get all roadmaps belonging to the user.
 *
 * GET /api/roadmaps
 */
router.get("/", getRoadmaps);

/*
|--------------------------------------------------------------------------
| Roadmap Item Routes
|--------------------------------------------------------------------------
*/

/**
 * Get one roadmap.
 *
 * GET /api/roadmaps/:roadmapId
 *
 * Keep this AFTER specific routes such as:
 * /templates
 * /drafts
 */
router.get("/:roadmapId", getRoadmap);

/**
 * Delete one roadmap.
 *
 * DELETE /api/roadmaps/:roadmapId
 */
router.delete("/:roadmapId", deleteRoadmap);

/*
|--------------------------------------------------------------------------
| Progress Routes
|--------------------------------------------------------------------------
*/

/**
 * Get roadmap progress.
 *
 * GET /api/roadmaps/:roadmapId/progress
 */
router.get("/:roadmapId/progress", getProgress);

/**
 * Update node status.
 *
 * PATCH /api/roadmaps/:roadmapId/nodes/:nodeId/status
 */
router.patch("/:roadmapId/nodes/:nodeId/status", updateNodeStatus);

/**
 * Start a node.
 *
 * POST /api/roadmaps/:roadmapId/nodes/:nodeId/start
 */
router.post("/:roadmapId/nodes/:nodeId/start", startNode);

/**
 * Complete a node.
 *
 * POST /api/roadmaps/:roadmapId/nodes/:nodeId/complete
 */
router.post("/:roadmapId/nodes/:nodeId/complete", completeNode);

/**
 * Reset a node.
 *
 * POST /api/roadmaps/:roadmapId/nodes/:nodeId/reset
 */
router.post("/:roadmapId/nodes/:nodeId/reset", resetNode);

/**
 * Skip a node.
 *
 * POST /api/roadmaps/:roadmapId/nodes/:nodeId/skip
 */
router.post("/:roadmapId/nodes/:nodeId/skip", skipNode);

export default router;
