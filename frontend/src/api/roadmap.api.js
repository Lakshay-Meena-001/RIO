import api from "../utils/axios.js";

/**
 * Generate a new roadmap.
 *
 * @param {Object} payload
 * @param {string} payload.role
 * @param {string} payload.targetPackage
 * @param {boolean} payload.useResume
 * @param {string|null} payload.resume
 */
export const generateRoadmap = async ({
  role,
  targetPackage,
  useResume = false,
  resume = null,
}) => {
  const response = await api.post("/api/roadmap/generate", {
    role: role.trim(),
    targetPackage,
    useResume,
    resume: useResume ? resume : null,
  });

  return response.data;
};

/**
 * Get a single roadmap by ID.
 *
 * @param {string} roadmapId
 */
export const getRoadmap = async (roadmapId) => {
  const response = await api.get(`/api/roadmap/${roadmapId}`);

  return response.data;
};

/**
 * Get authenticated user's roadmap history.
 *
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.limit
 */
export const getRoadmapHistory = async ({ page = 1, limit = 20 } = {}) => {
  const response = await api.get("/api/roadmap/history", {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};

/**
 * Update completion status of a roadmap module.
 *
 * @param {string} roadmapId
 * @param {number} moduleOrder
 * @param {boolean} completed
 */
export const updateRoadmapProgress = async (
  roadmapId,
  moduleOrder,
  completed,
) => {
  const response = await api.patch(`/api/roadmap/${roadmapId}/progress`, {
    moduleOrder,
    completed,
  });

  return response.data;
};

/**
 * Delete a roadmap.
 *
 * @param {string} roadmapId
 */
export const deleteRoadmap = async (roadmapId) => {
  const response = await api.delete(`/api/roadmap/${roadmapId}`);

  return response.data;
};
