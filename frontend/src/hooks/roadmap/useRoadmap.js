import { useCallback, useState } from "react";

import {
  deleteRoadmap as deleteRoadmapApi,
  generateRoadmap as generateRoadmapApi,
  getRoadmap as getRoadmapApi,
  getRoadmapHistory as getRoadmapHistoryApi,
  updateNodeStatus as updateNodeStatusApi,
} from "../../api/roadmap.api";

// API helpers return Axios response.data, which contains:
// { success: true, data: actualPayload }
const unwrapResponse = (response) => response?.data ?? null;

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const sameId = (first, second) => String(first ?? "") === String(second ?? "");

const useRoadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  const generate = useCallback(
    async (payload) => {
      setLoading(true);
      clearError();

      try {
        const response = await generateRoadmapApi(payload);
        const generatedRoadmap = unwrapResponse(response);

        if (!generatedRoadmap) {
          throw new Error("The server returned an empty roadmap response.");
        }

        setRoadmap(generatedRoadmap);

        return generatedRoadmap;
      } catch (error) {
        setError(getErrorMessage(error, "Failed to generate roadmap."));
        setErrorType("generate");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clearError],
  );

  const fetchRoadmap = useCallback(
    async (roadmapId) => {
      if (!roadmapId) {
        throw new Error("A roadmap ID is required.");
      }

      setLoading(true);
      clearError();

      try {
        const response = await getRoadmapApi(roadmapId);
        const fetchedRoadmap = unwrapResponse(response);

        if (!fetchedRoadmap) {
          throw new Error("The server returned an empty roadmap response.");
        }

        setRoadmap(fetchedRoadmap);

        return fetchedRoadmap;
      } catch (error) {
        setError(getErrorMessage(error, "Failed to load roadmap."));
        setErrorType("roadmap");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clearError],
  );

  const fetchHistory = useCallback(
    async (options = {}) => {
      setHistoryLoading(true);
      clearError();

      try {
        const response = await getRoadmapHistoryApi(options);
        const result = unwrapResponse(response);

        const roadmaps = Array.isArray(result?.roadmaps) ? result.roadmaps : [];

        setHistory(roadmaps);

        return result;
      } catch (error) {
        setError(getErrorMessage(error, "Failed to load roadmap history."));
        setErrorType("history");
        throw error;
      } finally {
        setHistoryLoading(false);
      }
    },
    [clearError],
  );

  // Update a node using the backend's nodeId + status contract.
  // Supported statuses: not_started, learning, completed, skipped.
  const updateProgress = useCallback(
    async (roadmapId, nodeId, status) => {
      if (!roadmapId || !nodeId || !status) {
        throw new Error("Roadmap ID, node ID and status are required.");
      }

      setProgressLoading(true);
      clearError();

      try {
        const response = await updateNodeStatusApi(roadmapId, nodeId, status);

        const updatedRoadmap = unwrapResponse(response);

        if (!updatedRoadmap) {
          throw new Error("The server returned an empty progress response.");
        }

        setRoadmap(updatedRoadmap);

        setHistory((currentHistory) =>
          currentHistory.map((item) =>
            sameId(item._id || item.id, roadmapId)
              ? { ...item, ...updatedRoadmap }
              : item,
          ),
        );

        return updatedRoadmap;
      } catch (error) {
        setError(getErrorMessage(error, "Failed to update roadmap progress."));
        setErrorType("progress");
        throw error;
      } finally {
        setProgressLoading(false);
      }
    },
    [clearError],
  );

  const removeRoadmap = useCallback(
    async (roadmapId) => {
      if (!roadmapId) {
        throw new Error("A roadmap ID is required.");
      }

      setDeleteLoading(true);
      setDeletingId(roadmapId);
      clearError();

      try {
        const response = await deleteRoadmapApi(roadmapId);
        const result = unwrapResponse(response);

        setRoadmap((currentRoadmap) =>
          sameId(currentRoadmap?._id || currentRoadmap?.id, roadmapId)
            ? null
            : currentRoadmap,
        );

        setHistory((currentHistory) =>
          currentHistory.filter(
            (item) => !sameId(item._id || item.id, roadmapId),
          ),
        );

        return result;
      } catch (error) {
        setError(getErrorMessage(error, "Failed to delete roadmap."));
        setErrorType("delete");
        throw error;
      } finally {
        setDeleteLoading(false);
        setDeletingId(null);
      }
    },
    [clearError],
  );

  const clearRoadmap = useCallback(() => {
    setRoadmap(null);
    clearError();
  }, [clearError]);

  return {
    roadmap,
    history,

    loading,
    historyLoading,
    progressLoading,

    deleteLoading,
    deletingId,

    error,
    errorType,

    generate,
    fetchRoadmap,
    fetchHistory,
    updateProgress,
    removeRoadmap,

    clearRoadmap,
    clearError,
  };
};

export default useRoadmap;
