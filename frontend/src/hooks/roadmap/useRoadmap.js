import { useCallback, useState } from "react";

import {
  deleteRoadmap as deleteRoadmapApi,
  generateRoadmap as generateRoadmapApi,
  getRoadmap as getRoadmapApi,
  getRoadmapHistory as getRoadmapHistoryApi,
  updateRoadmapProgress as updateRoadmapProgressApi,
} from "../../api/roadmap.api";

const useRoadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generate = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await generateRoadmapApi(payload);

      setRoadmap(response.data);

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to generate roadmap.";

      setError(message);

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoadmap = useCallback(async (roadmapId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getRoadmapApi(roadmapId);

      setRoadmap(response.data);

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to load roadmap.";

      setError(message);

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (options = {}) => {
    setHistoryLoading(true);

    try {
      const response = await getRoadmapHistoryApi(options);

      const roadmaps = response?.data?.roadmaps || [];

      setHistory(roadmaps);

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to load roadmap history.";

      setError(message);

      throw error;
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const updateProgress = useCallback(
    async (roadmapId, moduleOrder, completed) => {
      setProgressLoading(true);
      setError(null);

      try {
        const response = await updateRoadmapProgressApi(
          roadmapId,
          moduleOrder,
          completed,
        );

        setRoadmap(response.data);

        // Keep history progress reasonably fresh too.
        setHistory((currentHistory) =>
          currentHistory.map((item) =>
            item._id === roadmapId ? response.data : item,
          ),
        );

        return response.data;
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          "Failed to update roadmap progress.";

        setError(message);

        throw error;
      } finally {
        setProgressLoading(false);
      }
    },
    [],
  );

  const removeRoadmap = useCallback(async (roadmapId) => {
    if (!roadmapId) return;

    setDeleteLoading(true);
    setDeletingId(roadmapId);
    setError(null);

    try {
      const response = await deleteRoadmapApi(roadmapId);

      setRoadmap((currentRoadmap) =>
        currentRoadmap?._id === roadmapId ? null : currentRoadmap,
      );

      setHistory((currentHistory) =>
        currentHistory.filter((item) => item._id !== roadmapId),
      );

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to delete roadmap.";

      setError(message);

      throw error;
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  }, []);

  const clearRoadmap = useCallback(() => {
    setRoadmap(null);
    setError(null);
  }, []);

  return {
    roadmap,
    history,

    loading,
    historyLoading,
    progressLoading,

    deleteLoading,
    deletingId,

    error,

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
