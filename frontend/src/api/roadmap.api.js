import api from "../utils/axios.js";

// ==================================================
// HELPERS
// ==================================================

const encodeId = (id, name = "id") => {
  if (typeof id !== "string" || !id.trim()) {
    throw new Error(`${name} is required.`);
  }

  return encodeURIComponent(id.trim());
};

const USER_ROADMAP = (userRoadmapId) =>
  `/api/roadmaps/user/${encodeId(userRoadmapId, "userRoadmapId")}`;

const PHASE = (userRoadmapId, phaseId) =>
  `${USER_ROADMAP(userRoadmapId)}/phases/${encodeId(phaseId, "phaseId")}`;

const validateStatus = (status) => {
  const allowedStatuses = [
    "not_started",
    "in_progress",
    "completed",
    "skipped",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      `Invalid status. Allowed statuses: ${allowedStatuses.join(", ")}`,
    );
  }

  return status;
};

// ==================================================
// ROADMAP CATALOG
// ==================================================

/**
 * Get available catalogue roadmaps.
 *
 * GET /api/roadmaps/catalog
 *
 * Optional filters:
 * category, search
 */
export const getRoadmapCatalog = async ({ category, search } = {}) => {
  const response = await api.get("/api/roadmaps/catalog", {
    params: {
      ...(category ? { category } : {}),
      ...(search ? { search } : {}),
    },
  });

  return response.data;
};

/**
 * Get available catalogue categories.
 *
 * GET /api/roadmaps/catalog/categories
 */
export const getRoadmapCategories = async () => {
  const response = await api.get("/api/roadmaps/catalog/categories");

  return response.data;
};

/**
 * Get one catalogue roadmap.
 *
 * GET /api/roadmaps/catalog/:roadmapId
 */
export const getRoadmapCatalogEntry = async (roadmapId) => {
  const id = encodeId(roadmapId, "roadmapId");

  const response = await api.get(`/api/roadmaps/catalog/${id}`);

  return response.data;
};

// ==================================================
// GENERATE / OPEN PERSONAL ROADMAP
// ==================================================

/**
 * Generate or retrieve the user's roadmap.
 *
 * POST /api/roadmaps/generate
 *
 * Payload:
 * {
 *   roadmapId: "mern-stack",
 *   packageId: "comprehensive"
 * }
 */
export const generateRoadmap = async ({ roadmapId, packageId }) => {
  const id = encodeId(roadmapId, "roadmapId");

  const allowedPackages = ["foundation", "standard", "comprehensive"];

  if (!allowedPackages.includes(packageId)) {
    throw new Error(
      `Invalid packageId. Allowed packages: ${allowedPackages.join(", ")}`,
    );
  }

  const response = await api.post("/api/roadmaps/generate", {
    roadmapId: id,
    packageId,
  });

  return response.data;
};

// ==================================================
// PERSONAL ROADMAP DETAILS
// ==================================================

/**
 * Get the user's personal roadmap and its content.
 *
 * GET /api/roadmaps/user/:userRoadmapId
 *
 * IMPORTANT:
 * Pass userRoadmap._id, not the catalogue roadmap ID.
 */
export const getUserRoadmap = async (userRoadmapId) => {
  const response = await api.get(USER_ROADMAP(userRoadmapId));

  return response.data;
};

// ==================================================
// PHASE GENERATION
// ==================================================

/**
 * Generate one phase progressively.
 *
 * POST /api/roadmaps/user/:userRoadmapId/phases/:phaseId/generate
 */
export const generateRoadmapPhase = async (userRoadmapId, phaseId) => {
  const response = await api.post(`${PHASE(userRoadmapId, phaseId)}/generate`);

  return response.data;
};

// ==================================================
// PROGRESS
// ==================================================

/**
 * Get saved progress.
 *
 * GET /api/roadmaps/user/:userRoadmapId/progress
 */
export const getRoadmapProgress = async (userRoadmapId) => {
  const response = await api.get(`${USER_ROADMAP(userRoadmapId)}/progress`);

  return response.data;
};

// ==================================================
// UPDATE PHASE STATUS
// ==================================================

/**
 * PATCH /api/roadmaps/user/:userRoadmapId/phases/:phaseId/status
 */
export const updateRoadmapPhaseStatus = async (
  userRoadmapId,
  phaseId,
  status,
) => {
  const response = await api.patch(`${PHASE(userRoadmapId, phaseId)}/status`, {
    status: validateStatus(status),
  });

  return response.data;
};

// ==================================================
// UPDATE TOPIC STATUS
// ==================================================

/**
 * PATCH /api/roadmaps/user/:userRoadmapId/phases/:phaseId/topics/:topicId/status
 *
 * Notes are optional.
 */
export const updateRoadmapTopicStatus = async (
  userRoadmapId,
  phaseId,
  topicId,
  status,
  notes,
) => {
  const encodedTopicId = encodeId(topicId, "topicId");

  const response = await api.patch(
    `${PHASE(userRoadmapId, phaseId)}/topics/${encodedTopicId}/status`,
    {
      status: validateStatus(status),
      ...(typeof notes === "string" ? { notes } : {}),
    },
  );

  return response.data;
};
