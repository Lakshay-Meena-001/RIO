import draftService from "../services/draft.service.js";
import draftValidator from "../validators/draft.validator.js";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

/**
 * Get authenticated user ID.
 *
 * Depending on the auth middleware/gateway,
 * user information may exist in different places.
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
 * Standard controller error response.
 */
function handleError(res, error) {
  console.error("[DraftController]", error);

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
| Create Draft
|--------------------------------------------------------------------------
*/

/**
 * POST /roadmaps/drafts
 */
async function createDraft(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /*
     * Zod validates and normalizes
     * the incoming builder data.
     */
    const input = draftValidator.validateCreate(req.body);

    const draft = await draftService.createDraft(userId, input);

    return success(res, draft, 201);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Get Latest Draft
|--------------------------------------------------------------------------
*/

/**
 * GET /roadmaps/drafts/latest
 */
async function getLatestDraft(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const draft = await draftService.getLatestDraft(userId);

    if (!draft) {
      return success(res, null);
    }

    return success(res, draft);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Get Draft
|--------------------------------------------------------------------------
*/

/**
 * GET /roadmaps/drafts/:draftId
 */
async function getDraft(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { draftId } = draftValidator.validateDraftId({
      draftId: req.params.draftId,
    });

    const draft = await draftService.getDraft(userId, draftId);

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Draft not found",
      });
    }

    return success(res, draft);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Update Draft
|--------------------------------------------------------------------------
*/

/**
 * PATCH /roadmaps/drafts/:draftId
 */
async function updateDraft(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { draftId } = draftValidator.validateDraftId({
      draftId: req.params.draftId,
    });

    /*
     * Partial Zod schema means the frontend
     * can save only the fields that changed.
     */
    const input = draftValidator.validateUpdate(req.body);

    const draft = await draftService.updateDraft(userId, draftId, input);

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Draft not found",
      });
    }

    return success(res, draft);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Update Current Step
|--------------------------------------------------------------------------
*/

/**
 * PATCH /roadmaps/drafts/:draftId/step
 */
async function updateCurrentStep(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const input = draftValidator.validateCurrentStep({
      draftId: req.params.draftId,

      currentStep: req.body?.currentStep,
    });

    const draft = await draftService.updateCurrentStep(
      userId,

      input.draftId,

      input.currentStep,
    );

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Draft not found",
      });
    }

    return success(res, draft);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Mark Draft As Generated
|--------------------------------------------------------------------------
*/

/**
 * POST /roadmaps/drafts/:draftId/generated
 */
async function markGenerated(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const input = draftValidator.validateMarkGenerated({
      draftId: req.params.draftId,

      generatedRoadmapId: req.body?.generatedRoadmapId,
    });

    const draft = await draftService.markGenerated(
      userId,

      input.draftId,

      input.generatedRoadmapId,
    );

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Draft not found",
      });
    }

    return success(res, draft);
  } catch (error) {
    return handleError(res, error);
  }
}

/*
|--------------------------------------------------------------------------
| Delete Draft
|--------------------------------------------------------------------------
*/

/**
 * DELETE /roadmaps/drafts/:draftId
 */
async function deleteDraft(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { draftId } = draftValidator.validateDraftId({
      draftId: req.params.draftId,
    });

    const deleted = await draftService.deleteDraft(userId, draftId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Draft not found",
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
| Exports
|--------------------------------------------------------------------------
*/

export {
  createDraft,
  getLatestDraft,
  getDraft,
  updateDraft,
  updateCurrentStep,
  markGenerated,
  deleteDraft,
};
