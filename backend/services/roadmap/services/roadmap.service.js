import mongoose from "mongoose";
import { createHash } from "node:crypto";

import Roadmap from "../models/roadmap.model.js";
import UserRoadmap from "../models/userRoadmap.model.js";

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

async function getOrCreateCanonicalRoadmap(catalogRoadmap, packageId) {
  const cacheKey = createCacheKey(catalogRoadmap.id, packageId);

  let canonicalRoadmap = await Roadmap.findOne({ cacheKey });
  let created = false;

  if (canonicalRoadmap?.status === ROADMAP_STATUS.READY) {
    return { canonicalRoadmap, reused: true };
  }

  if (canonicalRoadmap?.status === ROADMAP_STATUS.GENERATING) {
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

    // Reclaim an expired generation lock atomically.
    const reclaimed = await Roadmap.findOneAndUpdate(
      {
        _id: canonicalRoadmap._id,
        status: ROADMAP_STATUS.GENERATING,
        generationStartedAt: canonicalRoadmap.generationStartedAt,
      },
      {
        $set: {
          generationStartedAt: new Date(),
          generationError: null,
        },
      },
      { new: true },
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
  } else {
    // Resume failed generation without discarding an existing blueprint
    // or phases that have already been generated.
    canonicalRoadmap.status = ROADMAP_STATUS.GENERATING;
    canonicalRoadmap.generationError = null;
    canonicalRoadmap.generationStartedAt = new Date();
    await canonicalRoadmap.save();
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
      }));

      canonicalRoadmap.totalPhases = blueprint.phases.length;
      canonicalRoadmap.completedGenerationPhases = 0;
      await canonicalRoadmap.save();
    }

    // Resume the earliest phase that has not been generated.
    const firstPendingPhase = canonicalRoadmap.phases.find(
      (phase) =>
        phase.generationStatus === "pending" ||
        phase.generationStatus === "failed",
    );

    if (!firstPendingPhase) {
      canonicalRoadmap.status = ROADMAP_STATUS.READY;
      canonicalRoadmap.generationError = null;
      canonicalRoadmap.generatedAt = new Date();
      await canonicalRoadmap.save();

      return { canonicalRoadmap, reused: !created };
    }

    await generateCanonicalPhase({
      canonicalRoadmap,
      catalogRoadmap,
      phaseId: firstPendingPhase.id,
      packageId,
    });

    canonicalRoadmap = await Roadmap.findById(canonicalRoadmap._id);

    // The roadmap becomes usable after its first phase is generated.
    // Later phases are generated on demand.
    const hasReadyPhase = canonicalRoadmap.phases.some(
      (phase) => phase.generationStatus === "ready",
    );

    canonicalRoadmap.status = hasReadyPhase
      ? ROADMAP_STATUS.READY
      : ROADMAP_STATUS.FAILED;

    canonicalRoadmap.generationError = hasReadyPhase
      ? null
      : "No phase has been generated successfully.";

    if (hasReadyPhase) {
      canonicalRoadmap.generatedAt = new Date();
    }

    await canonicalRoadmap.save();

    if (!hasReadyPhase) {
      throw createError(
        "Initial roadmap phase could not be generated.",
        "ROADMAP_GENERATION_FAILED",
        500,
      );
    }

    return { canonicalRoadmap, reused: !created };
  } catch (error) {
    canonicalRoadmap = await Roadmap.findById(canonicalRoadmap._id);

    if (canonicalRoadmap) {
      const hasReadyPhase = canonicalRoadmap.phases.some(
        (phase) => phase.generationStatus === "ready",
      );

      canonicalRoadmap.status = hasReadyPhase
        ? ROADMAP_STATUS.READY
        : ROADMAP_STATUS.FAILED;

      canonicalRoadmap.generationError = error.message;
      await canonicalRoadmap.save();
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
  const phase = canonicalRoadmap.phases.find((item) => item.id === phaseId);

  if (!phase) {
    throw createError(
      "Requested phase was not found.",
      "ROADMAP_NOT_FOUND",
      404,
    );
  }

  if (phase.generationStatus === "ready") {
    return phase;
  }

  if (phase.generationStatus === "generating") {
    throw createError(
      "This phase is already being generated. Please retry shortly.",
      "ROADMAP_GENERATION_IN_PROGRESS",
      409,
    );
  }

  assertPrerequisitesReady(phase, canonicalRoadmap);

  phase.generationStatus = "generating";
  phase.generationError = null;
  await canonicalRoadmap.save();

  try {
    const completedPhases = canonicalRoadmap.phases
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
      blueprint: canonicalRoadmap.blueprint,
      phaseId,
      completedPhases,
    });

    const latestRoadmap = await Roadmap.findById(canonicalRoadmap._id);

    if (!latestRoadmap) {
      throw createError(
        "Canonical roadmap no longer exists.",
        "ROADMAP_NOT_FOUND",
        404,
      );
    }

    const latestPhase = latestRoadmap.phases.find(
      (item) => item.id === phaseId,
    );

    if (!latestPhase) {
      throw createError(
        "Requested phase no longer exists.",
        "ROADMAP_NOT_FOUND",
        404,
      );
    }

    latestPhase.topics = generatedPhase.topics;
    latestPhase.projects = generatedPhase.projects || [];
    latestPhase.learningOutcomes = generatedPhase.learningOutcomes || [];
    latestPhase.completionCriteria = generatedPhase.completionCriteria || [];
    latestPhase.generationStatus = "ready";
    latestPhase.generatedAt = new Date();
    latestPhase.generationError = null;

    latestRoadmap.completedGenerationPhases = latestRoadmap.phases.filter(
      (item) => item.generationStatus === "ready",
    ).length;

    await latestRoadmap.save();

    return latestPhase;
  } catch (error) {
    const latestRoadmap = await Roadmap.findById(canonicalRoadmap._id);

    if (latestRoadmap) {
      const failedPhase = latestRoadmap.phases.find(
        (item) => item.id === phaseId,
      );

      if (failedPhase && failedPhase.generationStatus !== "ready") {
        failedPhase.generationStatus = "failed";
        failedPhase.generationError = error.message;
      }

      latestRoadmap.completedGenerationPhases = latestRoadmap.phases.filter(
        (item) => item.generationStatus === "ready",
      ).length;

      await latestRoadmap.save();
    }

    throw error;
  }
}

async function generateRoadmap({ userId, roadmapId, packageId }) {
  if (!userId) {
    throw createError("Authenticated user is required.", "UNAUTHORIZED", 401);
  }

  const validation = validateRoadmapRequest({ roadmapId, packageId });

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

  const catalogRoadmap = getRoadmapById(canonicalRoadmap.catalogRoadmapId);

  if (!catalogRoadmap) {
    throw createError("Catalog roadmap not found.", "ROADMAP_NOT_FOUND", 404);
  }

  const phase = canonicalRoadmap.phases.find((item) => item.id === phaseId);

  if (!phase) {
    throw createError("Phase not found.", "ROADMAP_NOT_FOUND", 404);
  }

  if (phase.generationStatus === "ready") {
    synchronizeGeneratedPhaseProgress(userRoadmap, phase);
    userRoadmap.lastAccessedAt = new Date();
    await userRoadmap.save();

    return { roadmap: canonicalRoadmap, userRoadmap, phase };
  }

  if (phase.generationStatus === "generating") {
    throw createError(
      "This phase is already being generated. Please retry shortly.",
      "ROADMAP_GENERATION_IN_PROGRESS",
      409,
    );
  }

  await generateCanonicalPhase({
    canonicalRoadmap,
    catalogRoadmap,
    phaseId,
    packageId: canonicalRoadmap.packageId,
  });

  const refreshedRoadmap = await Roadmap.findById(canonicalRoadmap._id);
  const generatedPhase = refreshedRoadmap.phases.find(
    (item) => item.id === phaseId,
  );

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

  const userRoadmap = await UserRoadmap.findOne({
    _id: userRoadmapId,
    userId: String(userId),
  });

  if (!userRoadmap) {
    throw createError("Roadmap not found.", "ROADMAP_NOT_FOUND", 404);
  }

  const roadmap = await Roadmap.findById(userRoadmap.roadmap);

  if (!roadmap) {
    throw createError("Canonical roadmap not found.", "ROADMAP_NOT_FOUND", 404);
  }

  // Synchronize progress metadata for phases generated since the user
  // first opened this roadmap, without resetting existing progress.
  for (const phase of roadmap.phases) {
    if (phase.generationStatus === "ready") {
      synchronizeGeneratedPhaseProgress(userRoadmap, phase);
    }
  }

  userRoadmap.lastAccessedAt = new Date();
  await userRoadmap.save();

  return { roadmap, userRoadmap };
}

export { generateRoadmap, generateRoadmapPhaseForUser, getRoadmapForUser };

export default {
  generateRoadmap,
  generateRoadmapPhaseForUser,
  getRoadmapForUser,
};
