import roadmapService from "../services/roadmap.service.js";
import roadmapValidator from "../validators/roadmap.validator.js";
import progressService from "../services/progress.service.js";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

/**
 * Get authenticated user ID.
 *
 * Your gateway/auth middleware may expose the user
 * in a different property. Keep this helper isolated
 * so only one place needs changing if required.
 */
function getUserId(req) {
  return (
    req.user?.id ||
    req.user?._id ||
    req.auth?.userId ||
    req.headers["x-user-id"] ||
    null
  );
}

/**
 * Standard success response.
 */
function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Standard controller error handler.
 *
 * Central error middleware can later take over this
 * responsibility. For now controllers remain predictable.
 */
function handleError(res, error) {
  console.error("[RoadmapController]", error);

  return res.status(error.statusCode || 500).json({
    success: false,

    message: error.message || "Something went wrong",

    ...(error.details
      ? {
          details: error.details,
        }
      : {}),
  });
}

/*
|--------------------------------------------------------------------------
| Generate Roadmap
|--------------------------------------------------------------------------
*/

/**
 * POST /roadmaps
 */
async function generateRoadmap(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /*
     * Zod validates + normalizes the input.
     */
    const input = roadmapValidator.validateGenerate(req.body);

    const roadmap = await roadmapService.generate(userId, input);

    return success(res, roadmap, 201);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Get One Roadmap
|--------------------------------------------------------------------------
*/

/**
 * GET /roadmaps/:roadmapId
 */
async function getRoadmap(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { roadmapId } = roadmapValidator.validateRoadmapId({
      roadmapId: req.params.roadmapId,
    });

    const roadmap = await roadmapService.getRoadmap(userId, roadmapId);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return success(res, roadmap);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Get User Roadmaps
|--------------------------------------------------------------------------
*/

/**
 * GET /roadmaps
 */
async function getRoadmaps(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { limit, skip } = roadmapValidator.validateList(req.query);

    const roadmaps = await roadmapService.getUserRoadmaps(userId, {
      limit,
      skip,
    });

    return success(res, roadmaps);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Delete Roadmap
|--------------------------------------------------------------------------
*/

/**
 * DELETE /roadmaps/:roadmapId
 */
async function deleteRoadmap(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { roadmapId } = roadmapValidator.validateRoadmapId({
      roadmapId: req.params.roadmapId,
    });

    const deleted = await roadmapService.deleteRoadmap(userId, roadmapId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return success(res, {
      id: deleted._id,
      deleted: true,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Get Progress
|--------------------------------------------------------------------------
*/

/**
 * GET /roadmaps/:roadmapId/progress
 */
async function getProgress(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { roadmapId } = roadmapValidator.validateRoadmapId({
      roadmapId: req.params.roadmapId,
    });

    const progress = await progressService.getProgress(userId, roadmapId);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return success(res, progress);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Update Node Status
|--------------------------------------------------------------------------
*/

/**
 * PATCH /roadmaps/:roadmapId/nodes/:nodeId/status
 */
async function updateNodeStatus(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { roadmapId, nodeId, status } = roadmapValidator.validateNodeStatus({
      roadmapId: req.params.roadmapId,

      nodeId: req.params.nodeId,

      status: req.body?.status,
    });

    const roadmap = await progressService.updateNodeStatus(
      userId,
      roadmapId,
      nodeId,
      status,
    );

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return success(res, roadmap);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Complete Node
|--------------------------------------------------------------------------
*/

/**
 * POST /roadmaps/:roadmapId/nodes/:nodeId/complete
 */
async function completeNode(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { roadmapId, nodeId } = roadmapValidator.validateNodeStatus({
      roadmapId: req.params.roadmapId,

      nodeId: req.params.nodeId,

      status: "completed",
    });

    const roadmap = await progressService.completeNode(
      userId,
      roadmapId,
      nodeId,
    );

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return success(res, roadmap);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Start Node
|--------------------------------------------------------------------------
*/

/**
 * POST /roadmaps/:roadmapId/nodes/:nodeId/start
 */
async function startNode(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { roadmapId, nodeId } = roadmapValidator.validateNodeStatus({
      roadmapId: req.params.roadmapId,

      nodeId: req.params.nodeId,

      status: "learning",
    });

    const roadmap = await progressService.startNode(userId, roadmapId, nodeId);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return success(res, roadmap);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Reset Node
|--------------------------------------------------------------------------
*/

/**
 * POST /roadmaps/:roadmapId/nodes/:nodeId/reset
 */
async function resetNode(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { roadmapId, nodeId } = roadmapValidator.validateNodeStatus({
      roadmapId: req.params.roadmapId,

      nodeId: req.params.nodeId,

      status: "not_started",
    });

    const roadmap = await progressService.resetNode(userId, roadmapId, nodeId);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return success(res, roadmap);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Skip Node
|--------------------------------------------------------------------------
*/

/**
 * POST /roadmaps/:roadmapId/nodes/:nodeId/skip
 */
async function skipNode(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { roadmapId, nodeId, reason } = roadmapValidator.validateSkipNode({
      roadmapId: req.params.roadmapId,

      nodeId: req.params.nodeId,

      reason: req.body?.reason,
    });

    const roadmap = await progressService.skipNode(
      userId,
      roadmapId,
      nodeId,
      reason,
    );

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return success(res, roadmap);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

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
