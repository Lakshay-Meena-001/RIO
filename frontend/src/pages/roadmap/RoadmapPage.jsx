import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import useRoadmap from "../../hooks/roadmap/useRoadmap";

import RoadmapErrorState from "../../components/roadmap/RoadmapErrorState";
import RoadmapGenerator from "../../components/roadmap/RoadmapGenerator";
import RoadmapHistory from "../../components/roadmap/RoadmapHistory";

const RoadmapPage = ({ user }) => {
  const navigate = useNavigate();

  const {
    history,
    loading,
    historyLoading,
    deleteLoading,
    deletingId,
    error,
    generate,
    fetchHistory,
    removeRoadmap,
    clearError,
  } = useRoadmap();

  /*
   * Load roadmap history when the page opens.
   */
  useEffect(() => {
    fetchHistory().catch(() => {});
  }, [fetchHistory]);

  /*
   * Generate roadmap and move to its detail page.
   */
  const handleGenerate = useCallback(
    async (payload) => {
      try {
        const roadmap = await generate(payload);

        if (roadmap?._id) {
          navigate(`/roadmap/${roadmap._id}`);
        }

        return roadmap;
      } catch {
        // useRoadmap already stores the error.
        return null;
      }
    },
    [generate, navigate],
  );

  /*
   * Open an existing roadmap.
   */
  const handleOpen = useCallback(
    (roadmap) => {
      if (!roadmap?._id) return;

      navigate(`/roadmap/${roadmap._id}`);
    },
    [navigate],
  );

  /*
   * Delete roadmap after explicit confirmation.
   */
  const handleDelete = useCallback(
    async (roadmap) => {
      if (!roadmap?._id || deleteLoading) return;

      const confirmed = window.confirm(
        `Delete "${roadmap.title || "this roadmap"}"? This action cannot be undone.`,
      );

      if (!confirmed) return;

      try {
        await removeRoadmap(roadmap._id);
      } catch {
        // useRoadmap already stores the error.
      }
    },
    [deleteLoading, removeRoadmap],
  );

  /*
   * Retry loading history after an error.
   */
  const handleRetryHistory = useCallback(() => {
    clearError();

    fetchHistory().catch(() => {});
  }, [clearError, fetchHistory]);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* =========================
            ROADMAP GENERATOR
        ========================== */}
        <RoadmapGenerator
          user={user}
          onGenerate={handleGenerate}
          loading={loading}
        />

        {/* =========================
            ERROR
        ========================== */}
        {error && (
          <div className="mt-6">
            <RoadmapErrorState
              title="Roadmap action failed"
              message={error}
              onRetry={handleRetryHistory}
              retryLabel="Try again"
            />
          </div>
        )}

        {/* =========================
            ROADMAP HISTORY
        ========================== */}
        <RoadmapHistory
          history={history}
          loading={historyLoading}
          onOpen={handleOpen}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      </div>
    </main>
  );
};

export default RoadmapPage;
