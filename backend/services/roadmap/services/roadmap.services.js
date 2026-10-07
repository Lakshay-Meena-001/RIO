import Roadmap from "../models/roadmap.model.js";
import { compiledRoadmapGraph } from "../graph/roadmap.graph.js";

import {
  LEARNING_SYSTEM,
  LEARNING_SYSTEM_VERSION,
} from "../constants/learning.system.js";

import { getCache, setCache, deleteCache } from "../utils/cache.js";

const CACHE_TTL = 60 * 10;

const getRoadmapCacheKey = (userId, roadmapId) => {
  return `roadmap:${userId}:${roadmapId}`;
};

/*
 * Attach the static RIO Learning System to a roadmap response.
 *
 * The Learning System is not stored repeatedly inside MongoDB.
 * Only its version is stored with the roadmap.
 */
const attachLearningSystem = (roadmap) => {
  if (!roadmap) {
    return roadmap;
  }

  return {
    ...roadmap,

    learningSystem: {
      ...LEARNING_SYSTEM,
      version: roadmap.learningSystemVersion ?? LEARNING_SYSTEM_VERSION,
    },
  };
};

const normalizeRoadmapForStorage = ({
  roadmap,
  userId,
  role,
  targetPackage,
}) => {
  return {
    userId,

    title: roadmap.title,

    role,

    targetPackage,

    level: roadmap.level,

    duration: roadmap.duration,

    modules: roadmap.modules.map((module) => ({
      ...module,

      completed: false,

      completedAt: null,
    })),

    currentModule: 1,

    completedModules: 0,

    version: 1,

    learningSystemVersion: LEARNING_SYSTEM_VERSION,
  };
};

export const generateRoadmapService = async ({
  userId,
  role,
  targetPackage,
  resume = null,
}) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const result = await compiledRoadmapGraph.invoke({
    userId,
    role,
    targetPackage,
    resume,
  });

  if (!result?.roadmap) {
    throw new Error("Roadmap generation failed.");
  }

  const roadmapData = normalizeRoadmapForStorage({
    roadmap: result.roadmap,
    userId,
    role,
    targetPackage,
  });

  const roadmap = await Roadmap.create(roadmapData);

  const roadmapObject = roadmap.toObject();

  const roadmapResponse = attachLearningSystem(roadmapObject);

  const cacheKey = getRoadmapCacheKey(userId, roadmapObject._id.toString());

  await setCache(cacheKey, roadmapResponse, CACHE_TTL);

  return roadmapResponse;
};

export const getRoadmapByIdService = async ({ userId, roadmapId }) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!roadmapId) {
    throw new Error("Roadmap ID is required.");
  }

  const cacheKey = getRoadmapCacheKey(userId, roadmapId);

  const cachedRoadmap = await getCache(cacheKey);

  if (cachedRoadmap) {
    return cachedRoadmap;
  }

  const roadmap = await Roadmap.findOne({
    _id: roadmapId,
    userId,
  }).lean();

  if (!roadmap) {
    throw new Error("Roadmap not found.");
  }

  const roadmapResponse = attachLearningSystem(roadmap);

  await setCache(cacheKey, roadmapResponse, CACHE_TTL);

  return roadmapResponse;
};

export const getRoadmapHistoryService = async ({
  userId,
  page = 1,
  limit = 10,
}) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const safePage = Math.max(Number(page) || 1, 1);

  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

  const skip = (safePage - 1) * safeLimit;

  const [roadmaps, total] = await Promise.all([
    Roadmap.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .select(
        "_id title role targetPackage level duration currentModule completedModules version learningSystemVersion createdAt updatedAt",
      )
      .lean(),

    Roadmap.countDocuments({ userId }),
  ]);

  return {
    roadmaps,

    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const deleteRoadmapService = async ({ userId, roadmapId }) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!roadmapId) {
    throw new Error("Roadmap ID is required.");
  }

  const roadmap = await Roadmap.findOneAndDelete({
    _id: roadmapId,
    userId,
  });

  if (!roadmap) {
    throw new Error("Roadmap not found.");
  }

  const cacheKey = getRoadmapCacheKey(userId, roadmapId);

  await deleteCache(cacheKey);

  return {
    deleted: true,
    roadmapId,
  };
};

export const updateRoadmapProgressService = async ({
  userId,
  roadmapId,
  moduleOrder,
  completed,
}) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!roadmapId) {
    throw new Error("Roadmap ID is required.");
  }

  const updatedRoadmap = await Roadmap.findOneAndUpdate(
    {
      _id: roadmapId,
      userId,
      "modules.order": moduleOrder,
    },
    [
      {
        $set: {
          modules: {
            $map: {
              input: "$modules",
              as: "module",

              in: {
                $cond: [
                  {
                    $eq: ["$$module.order", moduleOrder],
                  },

                  {
                    $mergeObjects: [
                      "$$module",

                      {
                        completed,

                        completedAt: {
                          $cond: [
                            completed,

                            {
                              $ifNull: ["$$module.completedAt", "$$NOW"],
                            },

                            null,
                          ],
                        },
                      },
                    ],
                  },

                  "$$module",
                ],
              },
            },
          },
        },
      },

      {
        $set: {
          completedModules: {
            $size: {
              $filter: {
                input: "$modules",
                as: "module",

                cond: {
                  $eq: ["$$module.completed", true],
                },
              },
            },
          },
        },
      },

      {
        $set: {
          currentModule: {
            $let: {
              vars: {
                incompleteModules: {
                  $filter: {
                    input: "$modules",
                    as: "module",

                    cond: {
                      $eq: ["$$module.completed", false],
                    },
                  },
                },
              },

              in: {
                $ifNull: [
                  {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: "$$incompleteModules",

                          as: "module",

                          in: "$$module.order",
                        },
                      },

                      0,
                    ],
                  },

                  {
                    $size: "$modules",
                  },
                ],
              },
            },
          },
        },
      },
    ],
    {
      returnDocument: "after",
      updatePipeline: true,
      lean:true,
    },
    {
      returnDocument: "after",
      lean: true,
    },
  );

  if (!updatedRoadmap) {
    throw new Error("Roadmap or module not found.");
  }

  const roadmapResponse = attachLearningSystem(updatedRoadmap);

  const cacheKey = getRoadmapCacheKey(userId, roadmapId);

  await setCache(cacheKey, roadmapResponse, CACHE_TTL);

  return roadmapResponse;
};
