import api from "../utils/axios.js";

// ==================== TEMPLATES ====================

export const getRoadmapTemplates = async () => {
  const response = await api.get("/api/roadmaps/templates");
  return response.data;
};

export const getRoadmapTemplate = async (templateId) => {
  const response = await api.get(
    `/api/roadmaps/templates/${encodeURIComponent(templateId)}`,
  );
  return response.data;
};

// ==================== ROADMAP CRUD ====================

export const generateRoadmap = async (payload) => {
  const response = await api.post("/api/roadmaps/", payload);
  return response.data;
};

export const getRoadmap = async (roadmapId) => {
  const response = await api.get(
    `/api/roadmaps/${encodeURIComponent(roadmapId)}`,
  );
  return response.data;
};

export const getRoadmaps = async ({
  page = 1,
  limit = 20,
  status,
  generationMode,
} = {}) => {
  const response = await api.get("/api/roadmaps/", {
    params: { page, limit, status, generationMode },
  });
  return response.data;
};

// Backward-compatible name for existing hook consumers.
export const getRoadmapHistory = getRoadmaps;

export const deleteRoadmap = async (roadmapId) => {
  const response = await api.delete(
    `/api/roadmaps/${encodeURIComponent(roadmapId)}`,
  );
  return response.data;
};

// ==================== NODE PROGRESS ====================

export const updateNodeStatus = async (roadmapId, nodeId, status) => {
  const response = await api.patch(
    `/api/roadmaps/${encodeURIComponent(roadmapId)}/nodes/${encodeURIComponent(nodeId)}/status`,
    { status },
  );
  return response.data;
};

export const startRoadmapNode = async (roadmapId, nodeId) => {
  const response = await api.post(
    `/api/roadmaps/${encodeURIComponent(roadmapId)}/nodes/${encodeURIComponent(nodeId)}/start`,
  );
  return response.data;
};

export const completeRoadmapNode = async (roadmapId, nodeId) => {
  const response = await api.post(
    `/api/roadmaps/${encodeURIComponent(roadmapId)}/nodes/${encodeURIComponent(nodeId)}/complete`,
  );
  return response.data;
};

export const resetRoadmapNode = async (roadmapId, nodeId) => {
  const response = await api.post(
    `/api/roadmaps/${encodeURIComponent(roadmapId)}/nodes/${encodeURIComponent(nodeId)}/reset`,
  );
  return response.data;
};

export const skipRoadmapNode = async (roadmapId, nodeId, reason = null) => {
  const response = await api.post(
    `/api/roadmaps/${encodeURIComponent(roadmapId)}/nodes/${encodeURIComponent(nodeId)}/skip`,
    { reason },
  );
  return response.data;
};

export const getRoadmapProgress = async (roadmapId) => {
  const response = await api.get(
    `/api/roadmaps/${encodeURIComponent(roadmapId)}/progress`,
  );
  return response.data;
};

// ==================== BUILDER DRAFTS ====================

export const createRoadmapDraft = async (payload = {}) => {
  const response = await api.post("/api/roadmaps/drafts", payload);
  return response.data;
};

export const getLatestRoadmapDraft = async () => {
  const response = await api.get("/api/roadmaps/drafts/latest");
  return response.data;
};

export const getRoadmapDraft = async (draftId) => {
  const response = await api.get(
    `/api/roadmaps/drafts/${encodeURIComponent(draftId)}`,
  );
  return response.data;
};

export const updateRoadmapDraft = async (draftId, payload) => {
  const response = await api.patch(
    `/api/roadmaps/drafts/${encodeURIComponent(draftId)}`,
    payload,
  );
  return response.data;
};

export const updateRoadmapDraftStep = async (draftId, currentStep) => {
  const response = await api.patch(
    `/api/roadmaps/drafts/${encodeURIComponent(draftId)}/step`,
    { currentStep },
  );
  return response.data;
};

export const markRoadmapDraftGenerated = async (draftId, roadmapId) => {
  const response = await api.post(
    `/api/roadmaps/drafts/${encodeURIComponent(draftId)}/generated`,
    { roadmapId },
  );
  return response.data;
};

export const deleteRoadmapDraft = async (draftId) => {
  const response = await api.delete(
    `/api/roadmaps/drafts/${encodeURIComponent(draftId)}`,
  );
  return response.data;
};
