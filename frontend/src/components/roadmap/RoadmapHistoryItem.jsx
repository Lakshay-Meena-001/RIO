import {
  FiArrowRight,
  FiBookOpen,
  FiClock,
  FiTrash2,
} from "react-icons/fi";

const RoadmapHistoryItem = ({
  roadmap,
  onOpen,
  onDelete,
  deleteLoading = false,
}) => {
  if (!roadmap) return null;

  const modules = roadmap.modules || [];
  const completedModules = modules.filter(
    (module) => module.completed === true,
  ).length;

  const totalModules = modules.length;

  const progress =
    totalModules > 0
      ? Math.round((completedModules / totalModules) * 100)
      : 0;

  const createdAt = roadmap.createdAt
    ? formatDate(roadmap.createdAt)
    : null;

  return (
    <article className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/[0.11] hover:bg-white/[0.03] sm:p-5">
      <div className="flex items-start gap-3">
        {/* Roadmap icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.045] text-white/30">
          <FiBookOpen size={16} />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white/70">
            {roadmap.title || "Untitled roadmap"}
          </h3>

          <p className="mt-1 truncate text-xs text-white/30">
            {roadmap.role || "Learning roadmap"}
          </p>

          {/* Metadata */}
          <div className="mt-3 flex flex-wrap gap-2">
            {roadmap.targetPackage && (
              <MetaItem value={roadmap.targetPackage} />
            )}

            {roadmap.duration && (
              <MetaItem
                icon={<FiClock size={10} />}
                value={roadmap.duration}
              />
            )}

            {totalModules > 0 && (
              <MetaItem
                value={`${completedModules}/${totalModules} completed`}
              />
            )}

            {createdAt && <MetaItem value={createdAt} />}
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] text-white/25">Progress</span>

              <span className="text-[10px] font-medium text-white/35">
                {progress}%
              </span>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-violet-300/60 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={() => onOpen?.(roadmap)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/25 transition hover:bg-white/[0.05] hover:text-white/70"
            aria-label="Open roadmap"
          >
            <FiArrowRight size={15} />
          </button>

          <button
            type="button"
            disabled={deleteLoading}
            onClick={() => onDelete?.(roadmap)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/20 transition hover:bg-red-400/[0.06] hover:text-red-300/70 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Delete roadmap"
          >
            {deleteLoading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/10 border-t-white/50" />
            ) : (
              <FiTrash2 size={14} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile actions */}
      <div className="mt-4 flex gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => onOpen?.(roadmap)}
          className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black transition hover:bg-white/90"
        >
          Open roadmap
          <FiArrowRight size={13} />
        </button>

        <button
          type="button"
          disabled={deleteLoading}
          onClick={() => onDelete?.(roadmap)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-white/25 transition hover:border-red-400/10 hover:bg-red-400/[0.05] hover:text-red-300/70 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Delete roadmap"
        >
          {deleteLoading ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/10 border-t-white/50" />
          ) : (
            <FiTrash2 size={14} />
          )}
        </button>
      </div>
    </article>
  );
};

const MetaItem = ({ icon, value }) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-black/10 px-2 py-1 text-[10px] text-white/25">
      {icon}
      {value}
    </span>
  );
};

const formatDate = (date) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default RoadmapHistoryItem;