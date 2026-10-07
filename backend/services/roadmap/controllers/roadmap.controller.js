import roadmapService from "../services/roadmap.service.js";
import progressService from "../services/progress.service.js";

import roadmapValidator from "../validators/roadmap.validator.js";

// ============================================================
// HELPERS
// ============================================================

function getUserId(req) {
  return (
    req.user?.id ||
    req.user?._id ||
    req.auth?.userId ||
    req.headers["x-user-id"] ||
    null
  );
}

function requireUserId(req) {
  const userId = getUserId(req);

  if (!userId) {
    const error = new Error("Authentication required");

    error.statusCode = 401;

    throw error;
  }

  return userId;
}

function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

// ============================================================
// GENERATE ROADMAP
// ============================================================

async function generateRoadmap(req, res, next) {
  try {
    const userId = requireUserId(req);

    const input = roadmapValidator.validateGenerate(req.body);

    const roadmap = await roadmapService.generateRoadmap(userId, input);

    return sendSuccess(res, roadmap, 201);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// GET SINGLE ROADMAP
// ============================================================

async function getRoadmap(req, res, next) {
  try {
    const userId = requireUserId(req);

    const { roadmapId } = roadmapValidator.validateRoadmapId(req.params);

    const roadmap = await roadmapService.getRoadmap(userId, roadmapId);

    return sendSuccess(res, roadmap);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// GET ROADMAPS
// ============================================================

async function getRoadmaps(req, res, next) {
  try {
    const userId = requireUserId(req);

    const query = roadmapValidator.validateList(req.query);

    const result = await roadmapService.getRoadmaps(userId, query);

    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// DELETE ROADMAP
// ============================================================

async function deleteRoadmap(req, res, next) {
  try {
    const userId = requireUserId(req);

    const { roadmapId } = roadmapValidator.validateRoadmapId(req.params);

    const result = await roadmapService.deleteRoadmap(userId, roadmapId);

    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// GET PROGRESS
// ============================================================

async function getProgress(req, res, next) {
  try {
    const userId = requireUserId(req);

    const { roadmapId } = roadmapValidator.validateRoadmapId(req.params);

    const progress = await progressService.getProgress(userId, roadmapId);

    return sendSuccess(res, progress);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// UPDATE NODE STATUS
// ============================================================

async function updateNodeStatus(req, res, next) {
  try {
    const userId = requireUserId(req);

    const { roadmapId } = roadmapValidator.validateRoadmapId(req.params);

    const nodeId = req.params.nodeId;

    if (!nodeId) {
      const error = new Error("nodeId is required");

      error.statusCode = 400;

      throw error;
    }

    const { status } = roadmapValidator.validateUpdateNodeStatus(req.body);

    const roadmap = await progressService.updateNodeStatus(
      userId,
      roadmapId,
      nodeId,
      status,
    );

    return sendSuccess(res, roadmap);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// START NODE
// ============================================================

async function startNode(req, res, next) {
  try {
    const userId = requireUserId(req);

    const { roadmapId } = roadmapValidator.validateRoadmapId(req.params);

    const nodeId = req.params.nodeId;

    if (!nodeId) {
      const error = new Error("nodeId is required");

      error.statusCode = 400;

      throw error;
    }

    const roadmap = await progressService.startNode(userId, roadmapId, nodeId);

    return sendSuccess(res, roadmap);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// COMPLETE NODE
// ============================================================

async function completeNode(req, res, next) {
  try {
    const userId = requireUserId(req);

    const { roadmapId } = roadmapValidator.validateRoadmapId(req.params);

    const nodeId = req.params.nodeId;

    if (!nodeId) {
      const error = new Error("nodeId is required");

      error.statusCode = 400;

      throw error;
    }

    const roadmap = await progressService.completeNode(
      userId,
      roadmapId,
      nodeId,
    );

    return sendSuccess(res, roadmap);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// RESET NODE
// ============================================================

async function resetNode(req, res, next) {
  try {
    const userId = requireUserId(req);

    const { roadmapId } = roadmapValidator.validateRoadmapId(req.params);

    const nodeId = req.params.nodeId;

    if (!nodeId) {
      const error = new Error("nodeId is required");

      error.statusCode = 400;

      throw error;
    }

    const roadmap = await progressService.resetNode(userId, roadmapId, nodeId);

    return sendSuccess(res, roadmap);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// SKIP NODE
// ============================================================

async function skipNode(req, res, next) {
  try {
    const userId = requireUserId(req);

    const { roadmapId } = roadmapValidator.validateRoadmapId(req.params);

    const nodeId = req.params.nodeId;

    if (!nodeId) {
      const error = new Error("nodeId is required");

      error.statusCode = 400;

      throw error;
    }

    const { reason } = roadmapValidator.validateSkipNode(req.body);

    const roadmap = await progressService.skipNode(
      userId,
      roadmapId,
      nodeId,
      reason,
    );

    return sendSuccess(res, roadmap);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// EXPORTS
// ============================================================

export {
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
};
