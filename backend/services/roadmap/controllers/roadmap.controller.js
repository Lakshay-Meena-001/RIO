import {
  generateRoadmap,
  generateRoadmapPhaseForUser,
  getRoadmapForUser,
} from "../services/roadmap.service.js";

import {
  getAllRoadmaps,
  getRoadmapsByCategory,
  getRoadmapById,
  getRoadmapCategories,
  searchRoadmaps,
} from "../services/roadmapCatalog.service.js";

function sendError(res, error) {
  const statusCode =
    error.statusCode ||
    {
      UNAUTHORIZED: 401,
      ROADMAP_NOT_FOUND: 404,
      PHASE_PREREQUISITES_INCOMPLETE: 409,
      ROADMAP_GENERATION_IN_PROGRESS: 409,
      INVALID_INPUT: 400,
      INVALID_AI_RESPONSE: 502,
      ROADMAP_GENERATION_FAILED: 502,
    }[error.code] ||
    500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500 && statusCode !== 502
        ? "An unexpected roadmap service error occurred."
        : error.message,
    code: error.code || "INTERNAL_SERVER_ERROR",
  });
}

function getAuthenticatedUserId(req) {
  const userId = req.user?.id || req.user?._id || req.user?.uid;

  if (!userId) {
    const error = new Error("Authentication is required.");
    error.code = "UNAUTHORIZED";
    error.statusCode = 401;
    throw error;
  }

  return String(userId);
}

export async function listRoadmaps(req, res) {
  try {
    const { category, search } = req.query;
    let roadmaps;

    if (typeof search === "string" && search.trim()) {
      roadmaps = searchRoadmaps(search.trim());
    } else if (typeof category === "string" && category.trim()) {
      roadmaps = getRoadmapsByCategory(category.trim());
    } else {
      roadmaps = getAllRoadmaps();
    }

    return res.status(200).json({
      success: true,
      roadmaps,
      total: roadmaps.length,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function listRoadmapCategories(req, res) {
  try {
    return res.status(200).json({
      success: true,
      categories: getRoadmapCategories(),
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getRoadmapCatalogEntry(req, res) {
  try {
    const roadmap = getRoadmapById(req.params.roadmapId);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap catalog entry not found.",
        code: "ROADMAP_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      roadmap,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function generateRoadmapController(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    const { roadmapId, packageId } = req.body || {};

    const result = await generateRoadmap({
      userId,
      roadmapId,
      packageId,
    });

    return res.status(200).json({
      success: true,
      message: result.reused
        ? "Existing roadmap opened successfully."
        : "Roadmap generated successfully.",
      data: {
        roadmap: result.roadmap,
        userRoadmap: result.userRoadmap,
        reused: result.reused,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function generateRoadmapPhaseController(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    const { userRoadmapId, phaseId } = req.params;

    const result = await generateRoadmapPhaseForUser({
      userId,
      userRoadmapId,
      phaseId,
    });

    return res.status(200).json({
      success: true,
      message: "Roadmap phase is ready.",
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getUserRoadmapController(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);

    const result = await getRoadmapForUser({
      userId,
      userRoadmapId: req.params.userRoadmapId,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export default {
  listRoadmaps,
  listRoadmapCategories,
  getRoadmapCatalogEntry,
  generateRoadmapController,
  generateRoadmapPhaseController,
  getUserRoadmapController,
};
