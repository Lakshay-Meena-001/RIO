import mongoose from "mongoose";

import UserRoadmap from "../models/userRoadmap.model.js";
import Roadmap from "../models/roadmap.model.js";

import {
  ROADMAP_NODE_STATUS,
  USER_ROADMAP_STATUS,
} from "../constants/roadmap.constants.js";

const VALID_NODE_STATUSES = new Set(Object.values(ROADMAP_NODE_STATUS));

function createError(message, code = "INVALID_INPUT") {
  const error = new Error(message);
  error.code = code;
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

  // Prefer topic-level progress when topics exist.
  if (allTopics.length > 0) {
    const completedTopics = allTopics.filter(
      (topic) => topic.status === ROADMAP_NODE_STATUS.COMPLETED,
    ).length;

    return Math.round((completedTopics / allTopics.length) * 100);
  }

  if (phases.length === 0) {
    return 0;
  }

  const completedPhases = phases.filter(
    (phase) => phase.status === ROADMAP_NODE_STATUS.COMPLETED,
  ).length;

  return Math.round((completedPhases / phases.length) * 100);
}

function synchronizePhaseStatus(phase) {
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
    return;
  }

  phase.status = ROADMAP_NODE_STATUS.IN_PROGRESS;
  phase.startedAt = phase.startedAt || new Date();
}

function synchronizeRoadmapStatus(userRoadmap) {
  const phases = userRoadmap.phaseProgress || [];

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
    throw createError("Authenticated user is required.", "UNAUTHORIZED");
  }

  validateObjectId(userRoadmapId, "userRoadmapId");

  const userRoadmap = await UserRoadmap.findOne({
    _id: userRoadmapId,
    userId: String(userId),
  });

  if (!userRoadmap) {
    throw createError("User roadmap not found.", "ROADMAP_NOT_FOUND");
  }

  return userRoadmap;
}

async function syncProgressStructure(userRoadmap) {
  const canonicalRoadmap = await Roadmap.findById(userRoadmap.roadmap).select(
    "status phases",
  );

  if (!canonicalRoadmap) {
    throw createError("Canonical roadmap not found.", "ROADMAP_NOT_FOUND");
  }

  if (canonicalRoadmap.status !== "ready") {
    throw createError(
      "Roadmap generation is not complete yet.",
      "ROADMAP_NOT_READY",
    );
  }

  // Only phases whose content has actually been generated
  // should be available for user progress tracking.
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
    throw createError("Phase not found.", "PHASE_NOT_FOUND");
  }

  const topic = phase.topics.find((item) => item.topicId === topicId);

  if (!topic) {
    throw createError("Topic not found.", "TOPIC_NOT_FOUND");
  }

  topic.status = status;

  if (status === ROADMAP_NODE_STATUS.COMPLETED) {
    topic.completedAt = topic.completedAt || new Date();
  } else {
    topic.completedAt = null;
  }

  if (typeof notes === "string") {
    topic.notes = notes;
  }

  phase.startedAt = phase.startedAt || new Date();

  synchronizePhaseStatus(phase);
  synchronizeRoadmapStatus(userRoadmap);

  userRoadmap.lastAccessedAt = new Date();

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
    );
  }

  const now = new Date();

  if (status === ROADMAP_NODE_STATUS.COMPLETED) {
    // A phase can be completed only when all its topics
    // have been completed.
    const allTopicsCompleted =
      phase.topics.length > 0 &&
      phase.topics.every(
        (topic) => topic.status === ROADMAP_NODE_STATUS.COMPLETED,
      );

    if (!allTopicsCompleted) {
      throw createError(
        "Complete all topics before completing this phase.",
        "PHASE_TOPICS_INCOMPLETE",
      );
    }

    phase.completedAt = phase.completedAt || now;
  } else {
    phase.completedAt = null;

    if (status === ROADMAP_NODE_STATUS.NOT_STARTED) {
      phase.startedAt = null;

      for (const topic of phase.topics) {
        topic.status = ROADMAP_NODE_STATUS.NOT_STARTED;
        topic.completedAt = null;
      }
    } else if (status === ROADMAP_NODE_STATUS.IN_PROGRESS) {
      phase.startedAt = phase.startedAt || now;
    }
  }

  phase.status = status;

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
