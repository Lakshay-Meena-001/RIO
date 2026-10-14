import mongoose from "mongoose";

import UserRoadmap from "../models/userRoadmap.model.js";
import Roadmap from "../models/roadmap.model.js";

import {
  ROADMAP_NODE_STATUS,
  USER_ROADMAP_STATUS,
} from "../constants/roadmap.constants.js";

const VALID_NODE_STATUSES = new Set(Object.values(ROADMAP_NODE_STATUS));

function createError(message, code = "INVALID_INPUT", statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

function validateObjectId(id, fieldName = "roadmapId") {
  if (!mongoose.isValidObjectId(id)) {
    throw createError(`Invalid ${fieldName}.`);
  }
}

function getProgressPercentage(userRoadmap) {
  const phases = userRoadmap.phaseProgress || [];

  const allTopics = phases.flatMap((phase) =>
    phase.status === ROADMAP_NODE_STATUS.SKIPPED ? [] : phase.topics || [],
  );

  // Only completed topics count toward completion percentage.
  // Skipped topics and skipped phases do not increase progress.
  if (allTopics.length > 0) {
    const completedTopics = allTopics.filter(
      (topic) => topic.status === ROADMAP_NODE_STATUS.COMPLETED,
    ).length;

    return Math.round((completedTopics / allTopics.length) * 100);
  }

  // Fallback for phases without topics.
  if (phases.length === 0) {
    return 0;
  }

  const completedPhases = phases.filter(
    (phase) => phase.status === ROADMAP_NODE_STATUS.COMPLETED,
  ).length;

  return Math.round((completedPhases / phases.length) * 100);
}
function synchronizePhaseStatus(phase) {
  // Preserve an explicitly skipped phase.
  if (phase.status === ROADMAP_NODE_STATUS.SKIPPED) {
    return;
  }

  const topics = phase.topics || [];

  if (topics.length === 0) {
    return;
  }

  const allCompleted = topics.every(
    (topic) => topic.status === ROADMAP_NODE_STATUS.COMPLETED,
  );

  const allSkipped = topics.every(
    (topic) => topic.status === ROADMAP_NODE_STATUS.SKIPPED,
  );

  const allUnstarted = topics.every(
    (topic) => topic.status === ROADMAP_NODE_STATUS.NOT_STARTED,
  );

  if (allCompleted) {
    phase.status = ROADMAP_NODE_STATUS.COMPLETED;
    phase.completedAt = phase.completedAt || new Date();
    return;
  }
  phase.completedAt = null;

  if (allSkipped) {
    phase.status = ROADMAP_NODE_STATUS.SKIPPED;
    phase.completedAt = null;
    return;
  }

  if (allUnstarted) {
    // Preserve an explicit Mark Phase In Progress action.
    if (phase.status === ROADMAP_NODE_STATUS.IN_PROGRESS) {
      phase.startedAt = phase.startedAt || new Date();
      return;
    }

    phase.status = ROADMAP_NODE_STATUS.NOT_STARTED;
    phase.startedAt = null;
    return;
  }

  phase.status = ROADMAP_NODE_STATUS.IN_PROGRESS;
  phase.startedAt = phase.startedAt || new Date();
}

function synchronizeRoadmapStatus(userRoadmap) {
  const phases = userRoadmap.phaseProgress || [];

  // Skipped phases count toward progress, but not toward
  // the roadmap's fully-completed status.
  if (
    phases.length > 0 &&
    phases.every((phase) => phase.status === ROADMAP_NODE_STATUS.COMPLETED)
  ) {
    userRoadmap.status = USER_ROADMAP_STATUS.COMPLETED;
    userRoadmap.completedAt = userRoadmap.completedAt || new Date();
    userRoadmap.progressPercentage = 100;
    return;
  }

  userRoadmap.status = USER_ROADMAP_STATUS.ACTIVE;
  userRoadmap.completedAt = null;
  userRoadmap.progressPercentage = getProgressPercentage(userRoadmap);
}

async function loadUserRoadmap(userId, userRoadmapId, session = null) {
  if (!userId) {
    throw createError("Authenticated user is required.", "UNAUTHORIZED", 401);
  }

  validateObjectId(userRoadmapId, "userRoadmapId");

  let query = UserRoadmap.findOne({
    _id: userRoadmapId,
    userId: String(userId),
  });

  if (session) {
    query = query.session(session);
  }

  const userRoadmap = await query;

  if (!userRoadmap) {
    throw createError("User roadmap not found.", "ROADMAP_NOT_FOUND", 404);
  }

  return userRoadmap;
}

async function syncProgressStructure(userRoadmap) {
  const canonicalRoadmap = await Roadmap.findById(userRoadmap.roadmap).select(
    "status phases",
  );

  if (!canonicalRoadmap) {
    throw createError("Canonical roadmap not found.", "ROADMAP_NOT_FOUND", 404);
  }

  if (canonicalRoadmap.status !== "ready") {
    throw createError(
      "Roadmap generation is not complete yet.",
      "ROADMAP_NOT_READY",
      409,
    );
  }

  const readyPhases = canonicalRoadmap.phases.filter(
    (phase) => phase.generationStatus === "ready",
  );

  const existingPhaseProgress = new Map(
    (userRoadmap.phaseProgress || []).map((phase) => [phase.phaseId, phase]),
  );

  const nextPhaseProgress = readyPhases.map((phase) => {
    const existingPhase = existingPhaseProgress.get(phase.id);

    const existingTopicProgress = new Map(
      (existingPhase?.topics || []).map((topic) => [topic.topicId, topic]),
    );

    const topics = (phase.topics || []).map((topic) => {
      const existingTopic = existingTopicProgress.get(topic.id);

      return {
        topicId: topic.id,
        status: existingTopic?.status || ROADMAP_NODE_STATUS.NOT_STARTED,
        completedAt: existingTopic?.completedAt || null,
        notes: existingTopic?.notes || "",
      };
    });

    return {
      phaseId: phase.id,
      status: existingPhase?.status || ROADMAP_NODE_STATUS.NOT_STARTED,
      startedAt: existingPhase?.startedAt || null,
      completedAt: existingPhase?.completedAt || null,
      topics,
    };
  });

  userRoadmap.phaseProgress = nextPhaseProgress;

  for (const phase of userRoadmap.phaseProgress) {
    synchronizePhaseStatus(phase);
  }

  synchronizeRoadmapStatus(userRoadmap);

  return userRoadmap;
}

async function getProgress(userId, userRoadmapId) {
  const userRoadmap = await loadUserRoadmap(userId, userRoadmapId);

  await syncProgressStructure(userRoadmap);

  return userRoadmap;
}

async function updateTopicStatus({
  userId,
  userRoadmapId,
  phaseId,
  topicId,
  status,
  notes,
}) {
  if (!VALID_NODE_STATUSES.has(status)) {
    throw createError("Invalid topic status.");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const currentRoadmap = await loadUserRoadmap(
        userId,
        userRoadmapId,
        session,
      );

      const currentPhase = currentRoadmap.phaseProgress.find(
        (item) => item.phaseId === phaseId,
      );

      if (!currentPhase) {
        throw createError("Phase not found.", "PHASE_NOT_FOUND", 404);
      }

      const currentTopic = currentPhase.topics.find(
        (item) => item.topicId === topicId,
      );

      if (!currentTopic) {
        throw createError("Topic not found.", "TOPIC_NOT_FOUND", 404);
      }

      const now = new Date();

      const topicUpdate = {
        "phaseProgress.$[phase].topics.$[topic].status": status,
        "phaseProgress.$[phase].topics.$[topic].completedAt":
          status === ROADMAP_NODE_STATUS.COMPLETED
            ? currentTopic.completedAt || now
            : null,
        lastAccessedAt: now,
      };

      if (typeof notes === "string") {
        topicUpdate["phaseProgress.$[phase].topics.$[topic].notes"] = notes;
      }

      const topicResult = await UserRoadmap.updateOne(
        {
          _id: userRoadmapId,
          userId: String(userId),
          "phaseProgress.phaseId": phaseId,
        },
        { $set: topicUpdate },
        {
          session,
          arrayFilters: [
            { "phase.phaseId": phaseId },
            { "topic.topicId": topicId },
          ],
        },
      );

      if (topicResult.matchedCount === 0) {
        throw createError("Topic not found.", "TOPIC_NOT_FOUND", 404);
      }

      const userRoadmap = await loadUserRoadmap(userId, userRoadmapId, session);

      const phase = userRoadmap.phaseProgress.find(
        (item) => item.phaseId === phaseId,
      );

      if (!phase) {
        throw createError("Phase not found.", "PHASE_NOT_FOUND", 404);
      }

      if (
        phase.status === ROADMAP_NODE_STATUS.SKIPPED ||
        phase.status === ROADMAP_NODE_STATUS.COMPLETED
      ) {
        phase.status = ROADMAP_NODE_STATUS.NOT_STARTED;
        phase.completedAt = null;
      }

      phase.startedAt = phase.startedAt || now;

      synchronizePhaseStatus(phase);
      synchronizeRoadmapStatus(userRoadmap);

      const summaryResult = await UserRoadmap.updateOne(
        {
          _id: userRoadmapId,
          userId: String(userId),
          "phaseProgress.phaseId": phaseId,
        },
        {
          $set: {
            "phaseProgress.$[phase].status": phase.status,
            "phaseProgress.$[phase].startedAt": phase.startedAt,
            "phaseProgress.$[phase].completedAt": phase.completedAt,
            status: userRoadmap.status,
            completedAt: userRoadmap.completedAt,
            progressPercentage: userRoadmap.progressPercentage,
            lastAccessedAt: now,
          },
        },
        {
          session,
          arrayFilters: [{ "phase.phaseId": phaseId }],
        },
      );

      if (summaryResult.matchedCount === 0) {
        throw createError("Roadmap not found.", "ROADMAP_NOT_FOUND", 404);
      }
    });
  } finally {
    await session.endSession();
  }

  return loadUserRoadmap(userId, userRoadmapId);
}

async function updatePhaseStatus({ userId, userRoadmapId, phaseId, status }) {
  if (!VALID_NODE_STATUSES.has(status)) {
    throw createError("Invalid phase status.");
  }

  // Validate ownership and confirm that the requested phase exists.
  // Do not rebuild or save the complete roadmap document here.
  const userRoadmap = await loadUserRoadmap(userId, userRoadmapId);

  const phase = (userRoadmap.phaseProgress || []).find(
    (item) => item.phaseId === phaseId,
  );

  if (!phase) {
    throw createError(
      "Phase not found or not generated yet.",
      "PHASE_NOT_FOUND",
      404,
    );
  }

  const now = new Date();

  const filter = {
    _id: userRoadmapId,
    userId: String(userId),
    "phaseProgress.phaseId": phaseId,
  };

  let update;
  let arrayFilters = [{ "phase.phaseId": phaseId }];

  if (status === ROADMAP_NODE_STATUS.COMPLETED) {
    update = {
      $set: {
        "phaseProgress.$[phase].status": ROADMAP_NODE_STATUS.COMPLETED,
        "phaseProgress.$[phase].completedAt": phase.completedAt || now,
        "phaseProgress.$[phase].startedAt": phase.startedAt || now,

        "phaseProgress.$[phase].topics.$[].status":
          ROADMAP_NODE_STATUS.COMPLETED,
        "phaseProgress.$[phase].topics.$[].completedAt": now,

        lastAccessedAt: now,
      },
    };
  } else if (status === ROADMAP_NODE_STATUS.SKIPPED) {
    update = {
      $set: {
        "phaseProgress.$[phase].status": ROADMAP_NODE_STATUS.SKIPPED,
        "phaseProgress.$[phase].completedAt": null,

        "phaseProgress.$[phase].topics.$[].status": ROADMAP_NODE_STATUS.SKIPPED,
        "phaseProgress.$[phase].topics.$[].completedAt": null,

        lastAccessedAt: now,
      },
    };
  } else if (status === ROADMAP_NODE_STATUS.NOT_STARTED) {
    update = {
      $set: {
        "phaseProgress.$[phase].status": ROADMAP_NODE_STATUS.NOT_STARTED,
        "phaseProgress.$[phase].startedAt": null,
        "phaseProgress.$[phase].completedAt": null,

        "phaseProgress.$[phase].topics.$[].status":
          ROADMAP_NODE_STATUS.NOT_STARTED,
        "phaseProgress.$[phase].topics.$[].completedAt": null,

        lastAccessedAt: now,
      },
    };
  } else if (status === ROADMAP_NODE_STATUS.IN_PROGRESS) {
    update = {
      $set: {
        "phaseProgress.$[phase].status": ROADMAP_NODE_STATUS.IN_PROGRESS,
        "phaseProgress.$[phase].startedAt": phase.startedAt || now,
        "phaseProgress.$[phase].completedAt": null,

        "phaseProgress.$[phase].topics.$[topic].status":
          ROADMAP_NODE_STATUS.NOT_STARTED,
        "phaseProgress.$[phase].topics.$[topic].completedAt": null,

        lastAccessedAt: now,
      },
    };

    // Reopen only completed topics in this phase.
    // Do not modify skipped topics or any other phase.
    arrayFilters = [
      { "phase.phaseId": phaseId },
      { "topic.status": ROADMAP_NODE_STATUS.COMPLETED },
    ];
  }

  // Atomic, phase-scoped database update.
  const result = await UserRoadmap.updateOne(filter, update, {
    arrayFilters,
    runValidators: true,
  });

  if (result.matchedCount === 0) {
    throw createError(
      "Phase not found or not generated yet.",
      "PHASE_NOT_FOUND",
      404,
    );
  }

  // Re-read fresh data and calculate overall roadmap progress.
  const freshRoadmap = await loadUserRoadmap(userId, userRoadmapId);

  synchronizeRoadmapStatus(freshRoadmap);

  // Update only summary fields. Never save the whole stale document.
  await UserRoadmap.updateOne(
    {
      _id: userRoadmapId,
      userId: String(userId),
    },
    {
      $set: {
        status: freshRoadmap.status,
        completedAt: freshRoadmap.completedAt,
        progressPercentage: freshRoadmap.progressPercentage,
      },
    },
  );

  return loadUserRoadmap(userId, userRoadmapId);
}

export { getProgress, updateTopicStatus, updatePhaseStatus };

export default {
  getProgress,
  updateTopicStatus,
  updatePhaseStatus,
};
