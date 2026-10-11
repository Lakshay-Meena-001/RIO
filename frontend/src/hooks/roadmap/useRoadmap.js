import { useCallback, useState } from "react";

import {
  getRoadmapCatalog as getRoadmapCatalogApi,
  getRoadmapCategories as getRoadmapCategoriesApi,
  getRoadmapCatalogEntry as getRoadmapCatalogEntryApi,
  generateRoadmap as generateRoadmapApi,
  getUserRoadmap as getUserRoadmapApi,
  generateRoadmapPhase as generateRoadmapPhaseApi,
  getRoadmapProgress as getRoadmapProgressApi,
  updateRoadmapPhaseStatus as updateRoadmapPhaseStatusApi,
  updateRoadmapTopicStatus as updateRoadmapTopicStatusApi,
} from "../../api/roadmap.api";

// Supported backend statuses.
const VALID_STATUSES = new Set([
  "not_started",
  "in_progress",
  "completed",
  "skipped",
]);

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

// API helpers return Axios response.data.
// Some endpoints return { success, data }, while catalogue
// endpoints return { success, roadmaps } or { success, roadmap }.
const unwrapResponse = (response) => response?.data ?? response ?? null;

const getPayload = (response) => {
  const payload = unwrapResponse(response);

  if (payload?.success === false) {
    throw new Error(payload.message || "The request failed.");
  }

  return payload;
};

const getWorkspace = (payload) => {
  if (!payload) {
    throw new Error("The server returned an empty roadmap response.");
  }

  // Generate and user-roadmap endpoints return both objects.
  if (payload.roadmap || payload.userRoadmap) {
    return {
      ...payload,
      roadmap: payload.roadmap ?? null,
      userRoadmap: payload.userRoadmap ?? null,
    };
  }

  // Fallback for an endpoint returning the user roadmap directly.
  if (payload._id || payload.id) {
    return {
      roadmap: null,
      userRoadmap: payload,
    };
  }

  throw new Error("The server returned an invalid roadmap response.");
};

const requireId = (value, name) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required.`);
  }

  return value.trim();
};

const requireStatus = (status) => {
  if (!VALID_STATUSES.has(status)) {
    throw new Error(
      `Invalid status. Allowed values: ${[...VALID_STATUSES].join(", ")}.`,
    );
  }

  return status;
};

const sameId = (first, second) => String(first ?? "") === String(second ?? "");

const useRoadmap = () => {
  // Current workspace:
  // {
  //   roadmap: canonical roadmap,
  //   userRoadmap: user's generated roadmap,
  //   reused?: boolean
  // }
  const [roadmap, setRoadmap] = useState(null);

  // Catalogue data used by the existing Builder.
  const [catalog, setCatalog] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catalogEntry, setCatalogEntry] = useState(null);

  // History stays separate from the public catalogue.
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [phaseGenerationLoading, setPhaseGenerationLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  // Update the active workspace without losing the canonical roadmap.
  const mergeUserRoadmap = useCallback((updatedUserRoadmap) => {
    if (!updatedUserRoadmap) return;

    setRoadmap((current) => ({
      ...(current || {}),
      userRoadmap: updatedUserRoadmap,
    }));

    setHistory((currentHistory) =>
      currentHistory.map((item) => {
        const itemId = item.userRoadmap?._id || item._id || item.id;
        const updatedId = updatedUserRoadmap._id || updatedUserRoadmap.id;

        if (!sameId(itemId, updatedId)) return item;

        return {
          ...item,
          userRoadmap: updatedUserRoadmap,
          ...updatedUserRoadmap,
        };
      }),
    );
  }, []);

  // --------------------------------------------------
  // 1. PUBLIC ROADMAP CATALOGUE
  // --------------------------------------------------

  const fetchCatalog = useCallback(
    async (options = {}) => {
      setCatalogLoading(true);
      clearError();

      try {
        const response = await getRoadmapCatalogApi(options);
        const result = getPayload(response);

        const roadmaps = Array.isArray(result?.roadmaps) ? result.roadmaps : [];

        setCatalog(roadmaps);

        return result;
      } catch (error) {
        setError(getErrorMessage(error, "Failed to load roadmap catalogue."));
        setErrorType("catalog");
        throw error;
      } finally {
        setCatalogLoading(false);
      }
    },
    [clearError],
  );

  const fetchCategories = useCallback(async () => {
    clearError();

    try {
      const response = await getRoadmapCategoriesApi();
      const result = getPayload(response);

      const roadmapCategories = Array.isArray(result?.categories)
        ? result.categories
        : [];

      setCategories(roadmapCategories);

      return roadmapCategories;
    } catch (error) {
      setError(getErrorMessage(error, "Failed to load roadmap categories."));
      setErrorType("categories");
      throw error;
    }
  }, [clearError]);

  const fetchCatalogEntry = useCallback(
    async (roadmapId) => {
      const id = requireId(roadmapId, "roadmapId");

      clearError();

      try {
        const response = await getRoadmapCatalogEntryApi(id);
        const result = getPayload(response);

        if (!result?.roadmap) {
          throw new Error("The catalogue roadmap was not found.");
        }

        setCatalogEntry(result.roadmap);

        return result.roadmap;
      } catch (error) {
        setError(getErrorMessage(error, "Failed to load catalogue roadmap."));
        setErrorType("catalog-entry");
        throw error;
      }
    },
    [clearError],
  );

  // --------------------------------------------------
  // 2. GENERATE A USER ROADMAP
  // --------------------------------------------------

  const generate = useCallback(
    async (payload) => {
      setLoading(true);
      clearError();

      try {
        if (!payload?.roadmapId) {
          throw new Error("roadmapId is required.");
        }

        if (!payload?.packageId) {
          throw new Error("packageId is required.");
        }

        const response = await generateRoadmapApi({
          roadmapId: payload.roadmapId,
          packageId: payload.packageId,
        });

        const result = getPayload(response);

        // The backend returns:
        // { success, data: { roadmap, userRoadmap, reused } }
        const workspace = getWorkspace(result.data ?? result);

        setRoadmap(workspace);

        return workspace;
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

  // --------------------------------------------------
  // 3. FETCH A USER ROADMAP
  // --------------------------------------------------

  const fetchRoadmap = useCallback(
    async (userRoadmapId) => {
      const id = requireId(userRoadmapId, "userRoadmapId");

      setLoading(true);
      clearError();

      try {
        const response = await getUserRoadmapApi(id);
        const result = getPayload(response);

        const workspace = getWorkspace(result.data ?? result);

        setRoadmap(workspace);

        return workspace;
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

  // --------------------------------------------------
  // 4. GENERATE A ROADMAP PHASE
  // --------------------------------------------------

  const generatePhase = useCallback(
    async (userRoadmapId, phaseId) => {
      const roadmapId = requireId(userRoadmapId, "userRoadmapId");
      const id = requireId(phaseId, "phaseId");

      setPhaseGenerationLoading(true);
      clearError();

      try {
        const response = await generateRoadmapPhaseApi(roadmapId, id);
        const result = getPayload(response);

        // Phase generation returns the updated workspace and phase.
        if (result.data?.userRoadmap || result.data?.roadmap) {
          const workspace = getWorkspace(result.data);
          setRoadmap(workspace);
          return workspace;
        }

        // If only the phase is returned, retain the current workspace.
        return result.data ?? result;
      } catch (error) {
        setError(getErrorMessage(error, "Failed to generate roadmap phase."));
        setErrorType("phase-generation");
        throw error;
      } finally {
        setPhaseGenerationLoading(false);
      }
    },
    [clearError],
  );

  // --------------------------------------------------
  // 5. FETCH PROGRESS
  // --------------------------------------------------

  const fetchProgress = useCallback(
    async (userRoadmapId) => {
      const id = requireId(userRoadmapId, "userRoadmapId");

      setProgressLoading(true);
      clearError();

      try {
        const response = await getRoadmapProgressApi(id);
        const result = getPayload(response);
        const userRoadmap = result.data ?? result;

        if (!userRoadmap) {
          throw new Error("The server returned an empty progress response.");
        }

        mergeUserRoadmap(userRoadmap);

        return userRoadmap;
      } catch (error) {
        setError(getErrorMessage(error, "Failed to load roadmap progress."));
        setErrorType("progress");
        throw error;
      } finally {
        setProgressLoading(false);
      }
    },
    [clearError, mergeUserRoadmap],
  );

  // --------------------------------------------------
  // 6. UPDATE PHASE STATUS
  // --------------------------------------------------

  const updatePhaseStatus = useCallback(
    async (userRoadmapId, phaseId, status) => {
      const roadmapId = requireId(userRoadmapId, "userRoadmapId");
      const id = requireId(phaseId, "phaseId");
      const validStatus = requireStatus(status);

      setProgressLoading(true);
      clearError();

      try {
        const response = await updateRoadmapPhaseStatusApi(
          roadmapId,
          id,
          validStatus,
        );

        const result = getPayload(response);
        const userRoadmap = result.data ?? result;

        if (!userRoadmap) {
          throw new Error("The server returned an empty progress response.");
        }

        mergeUserRoadmap(userRoadmap);

        return userRoadmap;
      } catch (error) {
        setError(getErrorMessage(error, "Failed to update phase status."));
        setErrorType("phase-progress");
        throw error;
      } finally {
        setProgressLoading(false);
      }
    },
    [clearError, mergeUserRoadmap],
  );

  // --------------------------------------------------
  // 7. UPDATE TOPIC STATUS
  // --------------------------------------------------

  const updateTopicStatus = useCallback(
    async (userRoadmapId, phaseId, topicId, status, notes) => {
      const roadmapId = requireId(userRoadmapId, "userRoadmapId");
      const id = requireId(phaseId, "phaseId");
      const topic = requireId(topicId, "topicId");
      const validStatus = requireStatus(status);

      setProgressLoading(true);
      clearError();

      try {
        const response = await updateRoadmapTopicStatusApi(
          roadmapId,
          id,
          topic,
          validStatus,
          notes,
        );

        const result = getPayload(response);
        const userRoadmap = result.data ?? result;

        if (!userRoadmap) {
          throw new Error("The server returned an empty progress response.");
        }

        mergeUserRoadmap(userRoadmap);

        return userRoadmap;
      } catch (error) {
        setError(getErrorMessage(error, "Failed to update topic status."));
        setErrorType("topic-progress");
        throw error;
      } finally {
        setProgressLoading(false);
      }
    },
    [clearError, mergeUserRoadmap],
  );

  // Compatibility name for components that previously used updateProgress.
  // New signature:
  // updateProgress(userRoadmapId, phaseId, topicId, status, notes?)
  const updateProgress = updateTopicStatus;

  // --------------------------------------------------
  // 8. HISTORY
  // --------------------------------------------------

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    clearError();

    try {
      // Intentionally no API request here.
      // The reviewed backend does not currently expose an endpoint
      // to list the authenticated user's roadmaps.
      throw new Error(
        "Roadmap history requires a user-roadmap listing endpoint on the backend.",
      );
    } catch (error) {
      setHistory([]);
      setError(getErrorMessage(error, "Failed to load roadmap history."));
      setErrorType("history");
      throw error;
    } finally {
      setHistoryLoading(false);
    }
  }, [clearError]);

  // --------------------------------------------------
  // 9. DELETE ROADMAP
  // --------------------------------------------------

  const removeRoadmap = useCallback(
    async (userRoadmapId) => {
      const id = requireId(userRoadmapId, "userRoadmapId");

      setDeleteLoading(true);
      setDeletingId(id);
      clearError();

      try {
        // Intentionally no API request here.
        // The reviewed backend does not currently expose a DELETE route.
        throw new Error(
          "Roadmap deletion requires a DELETE endpoint on the backend.",
        );
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

  // --------------------------------------------------
  // 10. RESET STATE
  // --------------------------------------------------

  const clearRoadmap = useCallback(() => {
    setRoadmap(null);
    clearError();
  }, [clearError]);

  const clearCatalogEntry = useCallback(() => {
    setCatalogEntry(null);
    clearError();
  }, [clearError]);

  return {
    // Current roadmap workspace
    roadmap,
    history,

    // Catalogue
    catalog,
    categories,
    catalogEntry,

    // Loading states
    loading,
    catalogLoading,
    historyLoading,
    progressLoading,
    phaseGenerationLoading,
    deleteLoading,
    deletingId,

    // Error state
    error,
    errorType,

    // Catalogue actions
    fetchCatalog,
    fetchCategories,
    fetchCatalogEntry,

    // Roadmap actions
    generate,
    fetchRoadmap,
    generatePhase,
    fetchProgress,

    // Progress actions
    updatePhaseStatus,
    updateTopicStatus,
    updateProgress,

    // History and deletion
    fetchHistory,
    removeRoadmap,

    // Reset actions
    clearRoadmap,
    clearCatalogEntry,
    clearError,
  };
};

export default useRoadmap;
