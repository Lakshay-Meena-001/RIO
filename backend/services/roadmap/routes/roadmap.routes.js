import express from "express";

// ============================================================
// CONTROLLERS
// ============================================================

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
  getTemplates,
  getTemplate,
  getTemplatePhases,
  getTemplateNode,
  getNodeNextSteps,
  getNodeDependencies,
} from "../controllers/template.controller.js";

import {
  createDraft,
  getLatestDraft,
  getDraft,
  updateDraft,
  updateCurrentStep,
  markGenerated,
  deleteDraft,
} from "../controllers/draft.controller.js";

// ============================================================
// ROUTER
// ============================================================

const router = express.Router();

// ============================================================
// TEMPLATE ROUTES
// ============================================================

/**
 * These routes expose the canonical
 * roadmap knowledge base.
 *
 * They do NOT generate a user roadmap.
 *
 * No LLM.
 * No user progress.
 * No user-specific state.
 */

// List available roadmap templates
router.get("/templates", getTemplates);

// Get complete template
router.get("/templates/:templateId", getTemplate);

// Get template phases
router.get("/templates/:templateId/phases", getTemplatePhases);

// Get a canonical node
router.get("/templates/:templateId/nodes/:nodeId", getTemplateNode);

// Get recommended next nodes
router.get("/templates/:templateId/nodes/:nodeId/next", getNodeNextSteps);

// Get node dependencies
router.get(
  "/templates/:templateId/nodes/:nodeId/dependencies",
  getNodeDependencies,
);

// ============================================================
// DRAFT ROUTES
// ============================================================

/**
 * Draft routes MUST come before
 * /:roadmapId routes.
 *
 * Otherwise future route changes can
 * accidentally create collisions.
 */

// Create builder draft
router.post("/drafts", createDraft);

// Get latest unfinished builder draft
router.get("/drafts/latest", getLatestDraft);

// Get specific draft
router.get("/drafts/:draftId", getDraft);

// Update builder draft
router.patch("/drafts/:draftId", updateDraft);

// Update current builder step
router.patch("/drafts/:draftId/step", updateCurrentStep);

// Mark draft as generated
router.post("/drafts/:draftId/generated", markGenerated);

// Delete builder draft
router.delete("/drafts/:draftId", deleteDraft);

// ============================================================
// ROADMAP COLLECTION
// ============================================================

/**
 * Generate a roadmap.
 *
 * Depending on generationMode:
 *
 * standard
 *   → canonical knowledge
 *
 * resume
 *   → canonical knowledge + resume adaptation
 *
 * custom
 *   → canonical knowledge + custom adaptation
 */
router.post("/", generateRoadmap);

// List user's generated roadmaps
router.get("/", getRoadmaps);

// ============================================================
// ROADMAP ITEM
// ============================================================

/**
 * IMPORTANT:
 *
 * Specific nested routes are declared before
 * the generic roadmap item route.
 *
 * This makes the intended API structure
 * obvious and protects us from future
 * route additions.
 */

// ------------------------------------------------------------
// PROGRESS
// ------------------------------------------------------------

router.get("/:roadmapId/progress", getProgress);

// ------------------------------------------------------------
// NODE STATUS
// ------------------------------------------------------------

router.patch("/:roadmapId/nodes/:nodeId/status", updateNodeStatus);

// ------------------------------------------------------------
// NODE ACTIONS
// ------------------------------------------------------------

router.post("/:roadmapId/nodes/:nodeId/start", startNode);

router.post("/:roadmapId/nodes/:nodeId/complete", completeNode);

router.post("/:roadmapId/nodes/:nodeId/reset", resetNode);

router.post("/:roadmapId/nodes/:nodeId/skip", skipNode);

// ------------------------------------------------------------
// ROADMAP ITSELF
// ------------------------------------------------------------

// Get roadmap
router.get("/:roadmapId", getRoadmap);

// Delete roadmap
router.delete("/:roadmapId", deleteRoadmap);

// ============================================================
// EXPORT
// ============================================================

export default router;
