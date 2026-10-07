import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useRoadmap from "../../hooks/roadmap/useRoadmap";

import CurrentFocus from "../../components/roadmap/CurrentFocus";
import LearningPath from "../../components/roadmap/LearningPath";
import LearningSystem from "../../components/roadmap/LearningSystem";
import ProgressOverview from "../../components/roadmap/ProgressOverview";
import RoadmapEmptyState from "../../components/roadmap/RoadmapEmptyState";
import RoadmapErrorState from "../../components/roadmap/RoadmapErrorState";
import RoadmapHeader from "../../components/roadmap/RoadmapHeader";
import RoadmapOverview from "../../components/roadmap/RoadmapOverview";
import RoadmapSkeleton from "../../components/roadmap/RoadmapSkeleton";

const RoadmapDetailPage = () => {
  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const {
    roadmap,
    loading,
    progressLoading,
    deleteLoading,
    error,
    fetchRoadmap,
    updateProgress,
    removeRoadmap,
    clearError,
  } = useRoadmap();

  useEffect(() => {
    if (!roadmapId) return;

    fetchRoadmap(roadmapId).catch(() => {});
  }, [roadmapId, fetchRoadmap]);

  const handleRetry = useCallback(() => {
    if (!roadmapId) return;

    clearError();

    fetchRoadmap(roadmapId).catch(() => {});
  }, [roadmapId, clearError, fetchRoadmap]);

  const handleToggleModule = useCallback(
    async (module) => {
      if (!roadmapId || !module?.order || progressLoading) return;

      try {
        await updateProgress(
          roadmapId,
          module.order,
          module.completed !== true,
        );
      } catch {
        // useRoadmap already stores the error state.
      }
    },
    [roadmapId, progressLoading, updateProgress],
  );

  const handleContinue = useCallback((module) => {
    if (!module) return;

    const element = document.getElementById(`roadmap-module-${module.order}`);

    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  const handleDelete = useCallback(async () => {
    if (!roadmapId || deleteLoading) return;

    const confirmed = window.confirm(
      "Delete this roadmap? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      await removeRoadmap(roadmapId);
      navigate("/roadmap", { replace: true });
    } catch {
      // useRoadmap already stores the error state.
    }
  }, [roadmapId, deleteLoading, removeRoadmap, navigate]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] px-4 py-6 text-white sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <RoadmapSkeleton />
        </div>
      </main>
    );
  }

  if (error && !roadmap) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] px-4 py-6 text-white sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center">
          <div className="w-full">
            <RoadmapErrorState
              title="Couldn't load this roadmap"
              message={error}
              onRetry={handleRetry}
            />
          </div>
        </div>
      </main>
    );
  }

  if (!roadmap) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] px-4 py-6 text-white sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center">
          <div className="w-full">
            <RoadmapEmptyState
              title="Roadmap not found"
              description="This roadmap may have been deleted or is no longer available."
              actionLabel="Back to roadmaps"
              onAction={() => navigate("/roadmap")}
            />
          </div>
        </div>
      </main>
    );
  }

  const modules = roadmap.modules || [];

  const currentModule =
    modules.find((module) => !module.completed) ||
    modules[modules.length - 1] ||
    null;

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Header */}
        <RoadmapHeader
          roadmap={roadmap}
          onBack={() => navigate("/roadmap")}
          onDelete={handleDelete}
          deleteLoading={deleteLoading}
        />

        {/* Main roadmap content */}
        <div className="mt-6 sm:mt-8">
          <RoadmapOverview roadmap={roadmap} />

          <div className="mt-4">
            <ProgressOverview roadmap={roadmap} />
          </div>

          <CurrentFocus roadmap={roadmap} onContinue={handleContinue} />

          <LearningPath
            roadmap={roadmap}
            onToggleModule={handleToggleModule}
            progressLoading={progressLoading}
          />

          <LearningSystem learningSystem={roadmap.learningSystem} />

          {/* Recoverable error while roadmap is still visible */}
          {error && (
            <div className="mt-6">
              <RoadmapErrorState
                title="Something went wrong"
                message={error}
                onRetry={handleRetry}
                retryLabel="Retry"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default RoadmapDetailPage;
