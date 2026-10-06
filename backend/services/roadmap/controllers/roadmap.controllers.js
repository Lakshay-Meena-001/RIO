import {
  generateRoadmapSchema,
  roadmapIdSchema,
  updateProgressSchema,
} from "../validators/roadmap.validator.js";

import {
  generateRoadmapService,
  getRoadmapByIdService,
  getRoadmapHistoryService,
  deleteRoadmapService,
  updateRoadmapProgressService,
} from "../services/roadmap.services.js";

const getUserId = (req) => {
  return req.userId || req.headers["x-user-id"];
};

export const generateRoadmapController = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const validation = generateRoadmapSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid roadmap request.",
        errors: validation.error.issues,
      });
    }

    const roadmap = await generateRoadmapService({
      userId,
      ...validation.data,
    });

    return res.status(201).json({
      success: true,
      message: "Roadmap generated successfully.",
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoadmapController = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const validation = roadmapIdSchema.safeParse({
      id: req.params.id,
    });

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid roadmap ID.",
      });
    }

    const roadmap = await getRoadmapByIdService({
      userId,
      roadmapId: validation.data.id,
    });

    return res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoadmapHistoryController = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const result = await getRoadmapHistoryService({
      userId,
      page: req.query.page,
      limit: req.query.limit,
    });

    return res.status(200).json({
      success: true,
      data: result.roadmaps,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRoadmapController = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const validation = roadmapIdSchema.safeParse({
      id: req.params.id,
    });

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid roadmap ID.",
      });
    }

    const result = await deleteRoadmapService({
      userId,
      roadmapId: validation.data.id,
    });

    return res.status(200).json({
      success: true,
      message: "Roadmap deleted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRoadmapProgressController = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const roadmapIdValidation = roadmapIdSchema.safeParse({
      id: req.params.id,
    });

    if (!roadmapIdValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid roadmap ID.",
      });
    }

    const progressValidation = updateProgressSchema.safeParse(req.body);

    if (!progressValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid progress data.",
        errors: progressValidation.error.issues,
      });
    }

    const roadmap = await updateRoadmapProgressService({
      userId,
      roadmapId: roadmapIdValidation.data.id,
      ...progressValidation.data,
    });

    return res.status(200).json({
      success: true,
      message: "Roadmap progress updated successfully.",
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};
