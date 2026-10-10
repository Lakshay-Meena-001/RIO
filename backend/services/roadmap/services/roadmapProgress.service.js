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
  const allTopics = phases.flatMap((phase) => phase.topics || []);

  if (allTopics.length > 0) {
    const resolvedTopics = allTopics.filter(
      (topic) =>
        topic.status === ROADMAP_NODE_STATUS.COMPLETED ||
        topic.status === ROADMAP_NODE_STATUS.SKIPPED,
    ).length;

    return Math.round((resolvedTopics / allTopics.length) * 100);
  }

  if (phases.length === 0) {
    return 0;
  }

  const resolvedPhases = phases.filter(
    (phase) =>
      phase.status === ROADMAP_NODE_STATUS.COMPLETED ||
      phase.status === ROADMAP_NODE_STATUS.SKIPPED,
  ).length;

  return Math.round((resolvedPhases / phases.length) * 100);
}

function synchronizePhaseStatus(phase) {
  // Preserve an explicitly skipped phase during synchronization.
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

  const allUnstarted = topics.every(
    (topic) => topic.status === ROADMAP_NODE_STATUS.NOT_STARTED,
  );

  if (allCompleted) {
    phase.status = ROADMAP_NODE_STATUS.COMPLETED;
    phase.completedAt = phase.completedAt || new Date();
    return;
  }

  phase.completedAt = null;

  if (allUnstarted) {
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

async function loadUserRoadmap(userId, userRoadmapId) {
  if (!userId) {
    throw createError("Authenticated user is required.", "UNAUTHORIZED", 401);
  }

  validateObjectId(userRoadmapId, "userRoadmapId");

  const userRoadmap = await UserRoadmap.findOne({
    _id: userRoadmapId,
    userId: String(userId),
  });

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

  userRoadmap.lastAccessedAt = new Date();

  await userRoadmap.save();

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

  const userRoadmap = await loadUserRoadmap(userId, userRoadmapId);

  await syncProgressStructure(userRoadmap);

  const phase = userRoadmap.phaseProgress.find(
    (item) => item.phaseId === phaseId,
  );

  if (!phase) {
    throw createError("Phase not found.", "PHASE_NOT_FOUND", 404);
  }

  const topic = phase.topics.find((item) => item.topicId === topicId);

  if (!topic) {
    throw createError("Topic not found.", "TOPIC_NOT_FOUND", 404);
  }

  const now = new Date();

  topic.status = status;

  topic.completedAt =
    status === ROADMAP_NODE_STATUS.COMPLETED ? topic.completedAt || now : null;

  if (typeof notes === "string") {
    topic.notes = notes;
  }

  // Editing a topic means the phase is no longer skipped.
  if (phase.status === ROADMAP_NODE_STATUS.SKIPPED) {
    phase.status = ROADMAP_NODE_STATUS.NOT_STARTED;
    phase.completedAt = null;
  }

  phase.startedAt = phase.startedAt || now;

  synchronizePhaseStatus(phase);
  synchronizeRoadmapStatus(userRoadmap);

  userRoadmap.lastAccessedAt = now;

  await userRoadmap.save();

  return userRoadmap;
}

async function updatePhaseStatus({ userId, userRoadmapId, phaseId, status }) {
  if (!VALID_NODE_STATUSES.has(status)) {
    throw createError("Invalid phase status.");
  }

  const userRoadmap = await loadUserRoadmap(userId, userRoadmapId);

  await syncProgressStructure(userRoadmap);

  const phase = userRoadmap.phaseProgress.find(
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

  if (status === ROADMAP_NODE_STATUS.COMPLETED) {
    const allTopicsCompleted =
      phase.topics.length > 0 &&
      phase.topics.every(
        (topic) => topic.status === ROADMAP_NODE_STATUS.COMPLETED,
      );

    if (!allTopicsCompleted) {
      throw createError(
        "Complete all topics before completing this phase.",
        "PHASE_TOPICS_INCOMPLETE",
        409,
      );
    }

    phase.status = ROADMAP_NODE_STATUS.COMPLETED;
    phase.completedAt = phase.completedAt || now;
    phase.startedAt = phase.startedAt || now;
  } else if (status === ROADMAP_NODE_STATUS.SKIPPED) {
    phase.status = ROADMAP_NODE_STATUS.SKIPPED;
    phase.completedAt = null;
  } else if (status === ROADMAP_NODE_STATUS.NOT_STARTED) {
    phase.status = ROADMAP_NODE_STATUS.NOT_STARTED;
    phase.startedAt = null;
    phase.completedAt = null;

    for (const topic of phase.topics) {
      topic.status = ROADMAP_NODE_STATUS.NOT_STARTED;
      topic.completedAt = null;
    }
  } else if (status === ROADMAP_NODE_STATUS.IN_PROGRESS) {
    phase.status = ROADMAP_NODE_STATUS.IN_PROGRESS;
    phase.startedAt = phase.startedAt || now;
    phase.completedAt = null;
  }

  synchronizeRoadmapStatus(userRoadmap);

  userRoadmap.lastAccessedAt = now;

  await userRoadmap.save();

  return userRoadmap;
}

export { getProgress, updateTopicStatus, updatePhaseStatus };

export default {
  getProgress,
  updateTopicStatus,
  updatePhaseStatus,
};
