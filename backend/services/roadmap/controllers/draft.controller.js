import draftService from "../services/draft.service.js";

import draftValidator from "../validators/draft.validator.js";

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

function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

function sendError(res, error) {
  const statusCode = error?.statusCode || 500;

  return res.status(statusCode).json({
    success: false,

    message: error?.message || "Something went wrong",

    ...(error?.code && {
      code: error.code,
    }),
  });
}

// ============================================================
// CREATE DRAFT
// ============================================================

async function createDraft(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const input = draftValidator.validateCreate(req.body);

    const draft = await draftService.createDraft(userId, input);

    return sendSuccess(res, draft, 201);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// GET LATEST DRAFT
// ============================================================

async function getLatestDraft(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const draft = await draftService.getLatestDraft(userId);

    /**
     * No draft is not a server error.
     *
     * Frontend can interpret null as:
     * "start a new builder".
     */
    return sendSuccess(res, draft);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// GET DRAFT
// ============================================================

async function getDraft(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { draftId } = draftValidator.validateDraftId(req.params);

    const draft = await draftService.getDraft(userId, draftId);

    return sendSuccess(res, draft);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// UPDATE DRAFT
// ============================================================

async function updateDraft(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { draftId } = draftValidator.validateDraftId(req.params);

    const updates = draftValidator.validateUpdate(req.body);

    const draft = await draftService.updateDraft(userId, draftId, updates);

    return sendSuccess(res, draft);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// UPDATE CURRENT STEP
// ============================================================

async function updateCurrentStep(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { draftId } = draftValidator.validateDraftId(req.params);

    const { currentStep } = draftValidator.validateCurrentStep(req.body);

    const draft = await draftService.updateCurrentStep(
      userId,
      draftId,
      currentStep,
    );

    return sendSuccess(res, draft);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// MARK GENERATED
// ============================================================

async function markGenerated(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { draftId } = draftValidator.validateDraftId(req.params);

    const { roadmapId } = draftValidator.validateMarkGenerated(req.body);

    const draft = await draftService.markGenerated(userId, draftId, roadmapId);

    return sendSuccess(res, draft);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// DELETE DRAFT
// ============================================================

async function deleteDraft(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { draftId } = draftValidator.validateDraftId(req.params);

    const result = await draftService.deleteDraft(userId, draftId);

    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// EXPORTS
// ============================================================

export {
  createDraft,
  getLatestDraft,
  getDraft,
  updateDraft,
  updateCurrentStep,
  markGenerated,
  deleteDraft,
};
