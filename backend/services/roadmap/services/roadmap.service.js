import mongoose from "mongoose";
import { createHash, randomUUID } from "node:crypto";

import Roadmap from "../models/roadmap.model.js";
import UserRoadmap from "../models/userRoadmap.model.js";
import { getProgress } from "./roadmapProgress.service.js";

import {
  ROADMAP_CACHE_KEY_VERSION,
  ROADMAP_PACKAGE,
  ROADMAP_SCHEMA_VERSION,
  ROADMAP_STATUS,
  USER_ROADMAP_STATUS,
  ROADMAP_NODE_STATUS,
  ROADMAP_GENERATION,
} from "../constants/roadmap.constants.js";

import { getRoadmapById } from "./roadmapCatalog.service.js";

import {
  generateRoadmapBlueprint,
  generateRoadmapPhase as generateAIPhase,
} from "./roadmapAI.service.js";

import { validateRoadmapRequest } from "../validators/roadmap.validator.js";

function createError(message, code, statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

function createCacheKey(catalogRoadmapId, packageId) {
  return createHash("sha256")
    .update(
      [
        `v${ROADMAP_CACHE_KEY_VERSION}`,
        `schema${ROADMAP_SCHEMA_VERSION}`,
        catalogRoadmapId,
        packageId,
      ].join(":"),
    )
    .digest("hex");
}

function createInitialPhaseProgress(phases = []) {
  return phases
    .filter((phase) => phase.generationStatus === "ready")
    .map((phase) => ({
      phaseId: phase.id,
      status: ROADMAP_NODE_STATUS.NOT_STARTED,
      startedAt: null,
      completedAt: null,
      topics: (phase.topics || []).map((topic) => ({
        topicId: topic.id,
        status: ROADMAP_NODE_STATUS.NOT_STARTED,
        completedAt: null,
        notes: "",
      })),
    }));
}

async function createUserRoadmap(userId, canonicalRoadmap) {
  try {
    return await UserRoadmap.findOneAndUpdate(
      {
        userId: String(userId),
        roadmap: canonicalRoadmap._id,
      },
      {
        $setOnInsert: {
          userId: String(userId),
          roadmap: canonicalRoadmap._id,
          catalogRoadmapId: canonicalRoadmap.catalogRoadmapId,
          packageId: canonicalRoadmap.packageId,
          status: USER_ROADMAP_STATUS.ACTIVE,
          startedAt: new Date(),
          lastAccessedAt: new Date(),
          progressPercentage: 0,
          phaseProgress: createInitialPhaseProgress(canonicalRoadmap.phases),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );
  } catch (error) {
    if (error.code === 11000) {
      const existing = await UserRoadmap.findOne({
        userId: String(userId),
        roadmap: canonicalRoadmap._id,
      });

      if (existing) return existing;
    }

    throw error;
  }
}

function getReadyPhaseIds(canonicalRoadmap) {
  return new Set(
    canonicalRoadmap.phases
      .filter((phase) => phase.generationStatus === "ready")
      .map((phase) => phase.id),
  );
}

function assertCanonicalRoadmapComplete(roadmap) {
  const complete =
    roadmap?.status === ROADMAP_STATUS.READY &&
    Array.isArray(roadmap.phases) &&
    roadmap.phases.length > 0 &&
    roadmap.phases.every((phase) => phase.generationStatus === "ready");

  if (!complete) {
    throw createError(
      "Roadmap is not fully generated yet. Please retry.",
      "ROADMAP_NOT_READY",
      409,
    );
  }
}

function assertPrerequisitesReady(phase, canonicalRoadmap) {
  const readyPhaseIds = getReadyPhaseIds(canonicalRoadmap);

  const missing = (phase.prerequisites || []).filter(
    (prerequisiteId) => !readyPhaseIds.has(prerequisiteId),
  );

  if (missing.length > 0) {
    throw createError(
      `Generate prerequisite phases first: ${missing.join(", ")}.`,
      "PHASE_PREREQUISITES_INCOMPLETE",
      409,
    );
  }
}

function synchronizeGeneratedPhaseProgress(userRoadmap, phase) {
  if (!userRoadmap.phaseProgress) {
    userRoadmap.phaseProgress = [];
  }

  let phaseProgress = userRoadmap.phaseProgress.find(
    (item) => item.phaseId === phase.id,
  );

  if (!phaseProgress) {
    userRoadmap.phaseProgress.push({
      phaseId: phase.id,
      status: ROADMAP_NODE_STATUS.NOT_STARTED,
      startedAt: null,
      completedAt: null,
      topics: [],
    });

    phaseProgress = userRoadmap.phaseProgress.find(
      (item) => item.phaseId === phase.id,
    );
  }

  if (!phaseProgress.topics) {
    phaseProgress.topics = [];
  }

  const existingTopicIds = new Set(
    phaseProgress.topics.map((topic) => topic.topicId),
  );

  for (const topic of phase.topics || []) {
    if (!existingTopicIds.has(topic.id)) {
      phaseProgress.topics.push({
        topicId: topic.id,
        status: ROADMAP_NODE_STATUS.NOT_STARTED,
        completedAt: null,
        notes: "",
      });
    }
  }
}

async function updateCompletedGenerationCount(roadmapId) {
  const roadmap = await Roadmap.findById(roadmapId).select("phases");

  if (!roadmap) {
    throw createError(
      "Canonical roadmap no longer exists.",
      "ROADMAP_NOT_FOUND",
      404,
    );
  }

  const completedGenerationPhases = (roadmap.phases || []).filter(
    (phase) => phase.generationStatus === "ready",
  ).length;

  await Roadmap.updateOne(
    { _id: roadmapId },
    { $set: { completedGenerationPhases } },
  );
}

async function getOrCreateCanonicalRoadmap(catalogRoadmap, packageId) {
  const cacheKey = createCacheKey(catalogRoadmap.id, packageId);
  let canonicalRoadmap = await Roadmap.findOne({ cacheKey });
  let created = false;

  if (canonicalRoadmap?.status === ROADMAP_STATUS.READY) {
    const complete =
      canonicalRoadmap.phases?.length > 0 &&
      canonicalRoadmap.phases.every(
        (phase) => phase.generationStatus === "ready",
      );

    if (complete) return { canonicalRoadmap, reused: true };

    // Never reuse a document marked READY when some phases are incomplete.
    canonicalRoadmap.status = ROADMAP_STATUS.FAILED;
    canonicalRoadmap.generationError =
      "Previously published roadmap was incomplete.";
    await canonicalRoadmap.save();
  }

  if (canonicalRoadmap?.status === ROADMAP_STATUS.FAILED) {
    const retried = await Roadmap.findOneAndUpdate(
      { _id: canonicalRoadmap._id, status: ROADMAP_STATUS.FAILED },
      {
        $set: {
          status: ROADMAP_STATUS.GENERATING,
          generationStartedAt: new Date(),
          generationError: null,
        },
      },
      { returnDocument: "after" },
    );

    if (!retried) {
      throw createError(
        "Another request is handling this roadmap. Please retry shortly.",
        "ROADMAP_GENERATION_IN_PROGRESS",
        409,
      );
    }
    canonicalRoadmap = retried;
  } else if (canonicalRoadmap?.status === ROADMAP_STATUS.GENERATING) {
    const startedAt = canonicalRoadmap.generationStartedAt?.getTime() || 0;
    const stale =
      Date.now() - startedAt > ROADMAP_GENERATION.GENERATION_LOCK_TTL_MS;

    if (!stale) {
      throw createError(
        "This roadmap is already being generated. Please retry shortly.",
        "ROADMAP_GENERATION_IN_PROGRESS",
        409,
      );
    }

    const reclaimed = await Roadmap.findOneAndUpdate(
      {
        _id: canonicalRoadmap._id,
        status: ROADMAP_STATUS.GENERATING,
        generationStartedAt: canonicalRoadmap.generationStartedAt,
      },
      { $set: { generationStartedAt: new Date(), generationError: null } },
      { returnDocument: "after" },
    );

    if (!reclaimed) {
      throw createError(
        "Another request is handling this roadmap. Please retry shortly.",
        "ROADMAP_GENERATION_IN_PROGRESS",
        409,
      );
    }
    canonicalRoadmap = reclaimed;
  } else if (!canonicalRoadmap) {
    try {
      canonicalRoadmap = await Roadmap.create({
        roadmapId: new mongoose.Types.ObjectId().toString(),
        catalogRoadmapId: catalogRoadmap.id,
        packageId,
        cacheKey,
        schemaVersion: ROADMAP_SCHEMA_VERSION,
        title: catalogRoadmap.title,
        summary: catalogRoadmap.description,
        package: {
          id: packageId,
          name: packageId,
          description: `Generated roadmap package: ${packageId}`,
        },
        blueprint: null,
        phases: [],
        status: ROADMAP_STATUS.GENERATING,
        totalPhases: 0,
        completedGenerationPhases: 0,
        generationStartedAt: new Date(),
      });
      created = true;
    } catch (error) {
      if (error.code === 11000) {
        throw createError(
          "This roadmap was created by another request. Please retry.",
          "ROADMAP_GENERATION_IN_PROGRESS",
          409,
        );
      }
      throw error;
    }
  }

  try {
    let blueprint = canonicalRoadmap.blueprint;

    if (!blueprint) {
      blueprint = await generateRoadmapBlueprint({
        roadmap: catalogRoadmap,
        packageType: packageId,
        schemaVersion: ROADMAP_SCHEMA_VERSION,
      });

      canonicalRoadmap.blueprint = blueprint;
      canonicalRoadmap.title = blueprint.title;
      canonicalRoadmap.summary = blueprint.summary;
      canonicalRoadmap.package = {
        id: blueprint.packageId,
        name: blueprint.packageId,
        description: `Roadmap package: ${blueprint.packageId}`,
      };
      canonicalRoadmap.learningOutcomes = [];
      canonicalRoadmap.phases = blueprint.phases.map((phase) => ({
        id: phase.id,
        order: phase.order,
        title: phase.title,
        purpose: phase.purpose,
        prerequisites: phase.prerequisites || [],
        learningOutcomes: phase.learningOutcomes || [],
        topics: [],
        projects: [],
        completionCriteria: [],
        generationStatus: "pending",
        generatedAt: null,
        generationError: null,
        generationStartedAt: null,
        generationToken: null,
      }));
      canonicalRoadmap.totalPhases = blueprint.phases.length;
      canonicalRoadmap.completedGenerationPhases = 0;
      await canonicalRoadmap.save();
    }

    if (
      !Array.isArray(canonicalRoadmap.phases) ||
      canonicalRoadmap.phases.length === 0
    ) {
      throw createError(
        "Roadmap blueprint contains no phases.",
        "ROADMAP_GENERATION_FAILED",
        502,
      );
    }

    // Generate every unresolved phase sequentially. The roadmap stays GENERATING
    // and is not returned as reusable until every phase has validated and saved.
    while (true) {
      canonicalRoadmap = await Roadmap.findById(canonicalRoadmap._id);
      if (!canonicalRoadmap) {
        throw createError(
          "Canonical roadmap no longer exists.",
          "ROADMAP_NOT_FOUND",
          404,
        );
      }

      const staleBefore =
        Date.now() - ROADMAP_GENERATION.GENERATION_LOCK_TTL_MS;
      const nextPhase = canonicalRoadmap.phases.find((phase) => {
        if (
          phase.generationStatus === "pending" ||
          phase.generationStatus === "failed"
        )
          return true;
        if (phase.generationStatus !== "generating") return false;
        return (phase.generationStartedAt?.getTime() || 0) < staleBefore;
      });

      if (!nextPhase) {
        const allReady = canonicalRoadmap.phases.every(
          (phase) => phase.generationStatus === "ready",
        );
        if (!allReady) {
          throw createError(
            "A roadmap phase is still being generated. Please retry shortly.",
            "ROADMAP_GENERATION_IN_PROGRESS",
            409,
          );
        }
        break;
      }

      await generateCanonicalPhase({
        canonicalRoadmap,
        catalogRoadmap,
        phaseId: nextPhase.id,
        packageId,
      });
    }

    canonicalRoadmap = await Roadmap.findById(canonicalRoadmap._id);
    const allReady =
      canonicalRoadmap?.phases?.length > 0 &&
      canonicalRoadmap.phases.every(
        (phase) => phase.generationStatus === "ready",
      );

    if (!allReady) {
      throw createError(
        "Roadmap generation is incomplete.",
        "ROADMAP_GENERATION_FAILED",
        502,
      );
    }

    canonicalRoadmap.status = ROADMAP_STATUS.READY;
    canonicalRoadmap.generationError = null;
    canonicalRoadmap.generatedAt = new Date();
    canonicalRoadmap.completedGenerationPhases = canonicalRoadmap.phases.length;
    await canonicalRoadmap.save();
    await updateCompletedGenerationCount(canonicalRoadmap._id);

    return {
      canonicalRoadmap: await Roadmap.findById(canonicalRoadmap._id),
      reused: !created,
    };
  } catch (error) {
    if (error.code === "ROADMAP_GENERATION_IN_PROGRESS") throw error;

    const latestRoadmap = await Roadmap.findById(canonicalRoadmap._id);
    if (latestRoadmap) {
      // A partially generated document is NEVER marked READY.
      latestRoadmap.status = ROADMAP_STATUS.FAILED;
      latestRoadmap.generationError = error.message;
      await latestRoadmap.save();
    }
    throw error;
  }
}
async function generateCanonicalPhase({
  canonicalRoadmap,
  catalogRoadmap,
  phaseId,
  packageId,
}) {
  const roadmapId = canonicalRoadmap._id;
  const now = new Date();

  const staleBefore = new Date(
    now.getTime() - ROADMAP_GENERATION.GENERATION_LOCK_TTL_MS,
  );

  const generationToken = randomUUID();

  const phase = canonicalRoadmap.phases.find((item) => item.id === phaseId);

  if (!phase) {
    throw createError("Phase not found.", "PHASE_NOT_FOUND", 404);
  }

  if (phase.generationStatus === "ready") {
    return phase;
  }

  assertPrerequisitesReady(phase, canonicalRoadmap);

  // Atomically claim a pending/failed phase or reclaim a stale lock.
  const claimedRoadmap = await Roadmap.findOneAndUpdate(
    {
      _id: roadmapId,
      phases: {
        $elemMatch: {
          id: phaseId,
          $or: [
            {
              generationStatus: {
                $in: ["pending", "failed"],
              },
            },
            {
              generationStatus: "generating",
              generationStartedAt: { $lt: staleBefore },
            },
            {
              generationStatus: "generating",
              generationStartedAt: null,
            },
          ],
        },
      },
    },
    {
      $set: {
        "phases.$.generationStatus": "generating",
        "phases.$.generationStartedAt": now,
        "phases.$.generationToken": generationToken,
        "phases.$.generationError": null,
      },
    },
    { new: true },
  );

  if (!claimedRoadmap) {
    const latest = await Roadmap.findById(roadmapId);

    const latestPhase = latest?.phases.find((item) => item.id === phaseId);

    if (latestPhase?.generationStatus === "ready") {
      return latestPhase;
    }

    throw createError(
      "This phase is already being generated. Please retry shortly.",
      "ROADMAP_GENERATION_IN_PROGRESS",
      409,
    );
  }

  try {
    const completedPhases = claimedRoadmap.phases
      .filter((item) => item.generationStatus === "ready")
      .map((item) => ({
        id: item.id,
        order: item.order,
        title: item.title,
        topics: item.topics,
      }));

    const generatedPhase = await generateAIPhase({
      roadmap: catalogRoadmap,
      packageType: packageId,
      blueprint: claimedRoadmap.blueprint,
      phaseId,
      completedPhases,
    });

    // Publish only if this request still owns the generation token.
    const result = await Roadmap.updateOne(
      {
        _id: roadmapId,
        phases: {
          $elemMatch: {
            id: phaseId,
            generationStatus: "generating",
            generationToken,
          },
        },
      },
      {
        $set: {
          "phases.$.topics": generatedPhase.topics,
          "phases.$.projects": generatedPhase.projects || [],
          "phases.$.learningOutcomes": generatedPhase.learningOutcomes || [],
          "phases.$.completionCriteria":
            generatedPhase.completionCriteria || [],
          "phases.$.generationStatus": "ready",
          "phases.$.generatedAt": new Date(),
          "phases.$.generationError": null,
          "phases.$.generationStartedAt": null,
          "phases.$.generationToken": null,
        },
      },
    );

    if (result.modifiedCount !== 1) {
      throw createError(
        "Phase generation ownership expired. Please retry.",
        "ROADMAP_GENERATION_IN_PROGRESS",
        409,
      );
    }

    await updateCompletedGenerationCount(roadmapId);

    const latest = await Roadmap.findById(roadmapId);

    if (!latest) {
      throw createError(
        "Canonical roadmap no longer exists.",
        "ROADMAP_NOT_FOUND",
        404,
      );
    }

    return latest.phases.find((item) => item.id === phaseId);
  } catch (error) {
    // Never overwrite the state of a newer generation owner.
    await Roadmap.updateOne(
      {
        _id: roadmapId,
        phases: {
          $elemMatch: {
            id: phaseId,
            generationStatus: "generating",
            generationToken,
          },
        },
      },
      {
        $set: {
          "phases.$.generationStatus": "failed",
          "phases.$.generationError": error.message,
          "phases.$.generationStartedAt": null,
          "phases.$.generationToken": null,
        },
      },
    );

    await updateCompletedGenerationCount(roadmapId);

    throw error;
  }
}

async function generateRoadmap({ userId, roadmapId, packageId }) {
  if (!userId) {
    throw createError("Authenticated user is required.", "UNAUTHORIZED", 401);
  }

  const validation = validateRoadmapRequest({
    roadmapId,
    packageId,
  });

  if (!validation.valid) {
    throw createError(validation.errors.join(" "), "INVALID_INPUT", 400);
  }

  if (!Object.values(ROADMAP_PACKAGE).includes(packageId)) {
    throw createError("Unsupported roadmap package.", "INVALID_INPUT", 400);
  }

  const catalogRoadmap = getRoadmapById(roadmapId);

  if (!catalogRoadmap) {
    throw createError(
      "The selected roadmap does not exist.",
      "ROADMAP_NOT_FOUND",
      404,
    );
  }

  const { canonicalRoadmap, reused } = await getOrCreateCanonicalRoadmap(
    catalogRoadmap,
    packageId,
  );

  const userRoadmap = await createUserRoadmap(userId, canonicalRoadmap);

  return {
    roadmap: canonicalRoadmap,
    userRoadmap,
    reused,
  };
}

async function generateRoadmapPhaseForUser({ userId, userRoadmapId, phaseId }) {
  if (!userId) {
    throw createError("Authenticated user is required.", "UNAUTHORIZED", 401);
  }

  if (!mongoose.isValidObjectId(userRoadmapId)) {
    throw createError("Invalid user roadmap ID.", "INVALID_INPUT", 400);
  }

  if (typeof phaseId !== "string" || !phaseId.trim()) {
    throw createError("phaseId is required.", "INVALID_INPUT", 400);
  }

  const userRoadmap = await UserRoadmap.findOne({
    _id: userRoadmapId,
    userId: String(userId),
  });

  if (!userRoadmap) {
    throw createError("Roadmap not found.", "ROADMAP_NOT_FOUND", 404);
  }

  const canonicalRoadmap = await Roadmap.findById(userRoadmap.roadmap);

  if (!canonicalRoadmap) {
    throw createError("Canonical roadmap not found.", "ROADMAP_NOT_FOUND", 404);
  }

  assertCanonicalRoadmapComplete(canonicalRoadmap);

  const catalogRoadmap = getRoadmapById(canonicalRoadmap.catalogRoadmapId);

  if (!catalogRoadmap) {
    throw createError("Catalog roadmap not found.", "ROADMAP_NOT_FOUND", 404);
  }

  const phase = canonicalRoadmap.phases.find((item) => item.id === phaseId);

  if (!phase) {
    throw createError("Phase not found.", "PHASE_NOT_FOUND", 404);
  }

  // Reopening an already-generated phase must not invoke the LLM.
  if (phase.generationStatus === "ready") {
    synchronizeGeneratedPhaseProgress(userRoadmap, phase);

    userRoadmap.lastAccessedAt = new Date();

    await userRoadmap.save();

    return {
      roadmap: canonicalRoadmap,
      userRoadmap,
      phase,
    };
  }

  await generateCanonicalPhase({
    canonicalRoadmap,
    catalogRoadmap,
    phaseId,
    packageId: canonicalRoadmap.packageId,
  });

  const refreshedRoadmap = await Roadmap.findById(canonicalRoadmap._id);

  if (!refreshedRoadmap) {
    throw createError(
      "Canonical roadmap no longer exists.",
      "ROADMAP_NOT_FOUND",
      404,
    );
  }

  const generatedPhase = refreshedRoadmap.phases.find(
    (item) => item.id === phaseId,
  );

  if (!generatedPhase || generatedPhase.generationStatus !== "ready") {
    throw createError(
      "Phase generation did not complete.",
      "ROADMAP_GENERATION_FAILED",
      500,
    );
  }

  synchronizeGeneratedPhaseProgress(userRoadmap, generatedPhase);

  userRoadmap.lastAccessedAt = new Date();

  await userRoadmap.save();

  return {
    roadmap: refreshedRoadmap,
    userRoadmap,
    phase: generatedPhase,
  };
}

async function getRoadmapForUser({ userId, userRoadmapId }) {
  if (!userId) {
    throw createError("Authenticated user is required.", "UNAUTHORIZED", 401);
  }

  if (!mongoose.isValidObjectId(userRoadmapId)) {
    throw createError("Invalid user roadmap ID.", "INVALID_INPUT", 400);
  }

  const userRoadmap = await getProgress(userId, userRoadmapId);

  if (!userRoadmap) {
    throw createError("Roadmap not found.", "ROADMAP_NOT_FOUND", 404);
  }

  const roadmap = await Roadmap.findById(userRoadmap.roadmap);

  if (!roadmap) {
    throw createError("Canonical roadmap not found.", "ROADMAP_NOT_FOUND", 404);
  }

  assertCanonicalRoadmapComplete(roadmap);

  // Add newly generated topics without resetting saved user progress.
  for (const phase of roadmap.phases) {
    if (phase.generationStatus === "ready") {
      synchronizeGeneratedPhaseProgress(userRoadmap, phase);
    }
  }

  return { roadmap, userRoadmap };
}

async function deleteRoadmapForUser({ userId, userRoadmapId }) {
  if (!userId) {
    throw createError("Authenticated user is required.", "UNAUTHORIZED", 401);
  }

  if (!mongoose.isValidObjectId(userRoadmapId)) {
    throw createError("Invalid user roadmap ID.", "INVALID_INPUT", 400);
  }

  // Delete only the authenticated user's personal roadmap.
  // Never delete the shared canonical Roadmap document.
  const deletedRoadmap = await UserRoadmap.findOneAndDelete({
    _id: userRoadmapId,
    userId: String(userId),
  });

  if (!deletedRoadmap) {
    throw createError("Roadmap not found.", "ROADMAP_NOT_FOUND", 404);
  }

  return {
    deleted: true,
    userRoadmapId: deletedRoadmap._id,
  };
}

async function getUserRoadmaps({ userId, page = 1, limit = 20 }) {
  if (!userId) {
    throw createError("Authenticated user is required.", "UNAUTHORIZED", 401);
  }

  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
  const filter = { userId: String(userId) };

  const [roadmaps, total] = await Promise.all([
    UserRoadmap.find(filter)
      .populate({
        path: "roadmap",
        select:
          "title summary catalogRoadmapId packageId status totalPhases completedGenerationPhases",
      })
      .sort({ lastAccessedAt: -1, createdAt: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .lean(),

    UserRoadmap.countDocuments(filter),
  ]);

  const roadmapsWithFreshProgress = roadmaps.map((item) => {
    const phases = item.phaseProgress || [];
    const allTopics = phases.flatMap((phase) => phase.topics || []);

    let progressPercentage = 0;

    if (allTopics.length > 0) {
      const completedTopics = allTopics.filter(
        (topic) => topic.status === ROADMAP_NODE_STATUS.COMPLETED,
      ).length;

      progressPercentage = Math.round(
        (completedTopics / allTopics.length) * 100,
      );
    } else if (phases.length > 0) {
      const completedPhases = phases.filter(
        (phase) => phase.status === ROADMAP_NODE_STATUS.COMPLETED,
      ).length;

      progressPercentage = Math.round((completedPhases / phases.length) * 100);
    }

    return {
      ...item,
      progressPercentage,
    };
  });

  return {
    roadmaps: roadmapsWithFreshProgress,
    total,
    page: currentPage,
    limit: pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export {
  generateRoadmap,
  generateRoadmapPhaseForUser,
  getRoadmapForUser,
  deleteRoadmapForUser,
  getUserRoadmaps,
};

export default {
  generateRoadmap,
  generateRoadmapPhaseForUser,
  getRoadmapForUser,
  deleteRoadmapForUser,
  getUserRoadmaps,
};
