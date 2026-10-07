import { FiClock } from "react-icons/fi";
import { MdHistory } from "react-icons/md";

import RoadmapHistoryItem from "./RoadmapHistoryItem";

const RoadmapHistory = ({
  history = [],
  loading = false,
  onOpen,
  onDelete,
  deletingId = null,
}) => {
  return (
    <section className="mt-8 sm:mt-10">
      {/* Header */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
            Your work
          </p>

          <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.025em] text-white sm:text-2xl">
            Roadmap history
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/30">
            Continue a roadmap you created earlier or remove one you no longer
            need.
          </p>
        </div>

        {history.length > 0 && (
          <div className="hidden shrink-0 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] font-medium text-white/30 sm:block">
            {history.length} {history.length === 1 ? "roadmap" : "roadmaps"}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.045]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-white/50" />
            </div>

            <div>
              <p className="text-sm font-medium text-white/55">
                Loading your roadmaps
              </p>

              <p className="mt-1 text-xs text-white/25">
                Fetching your learning history...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && history.length === 0 && (
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-7 text-center sm:p-9">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/25">
            <MdHistory size={19} />
          </div>

          <h3 className="mt-4 text-base font-semibold text-white/65">
            No saved roadmaps yet
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/30">
            Generate your first personalized roadmap and it will appear here so
            you can return to it later.
          </p>
        </div>
      )}

      {/* History list */}
      {!loading && history.length > 0 && (
        <div className="space-y-3">
          {history.map((roadmap) => (
            <RoadmapHistoryItem
              key={roadmap._id}
              roadmap={roadmap}
              onOpen={onOpen}
              onDelete={onDelete}
              deleteLoading={deletingId === roadmap._id}
            />
          ))}
        </div>
      )}

      {/* Small footer hint */}
      {!loading && history.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-white/20">
          <FiClock size={11} />
          Your latest roadmaps appear first.
        </div>
      )}
    </section>
  );
};

export default RoadmapHistory;
