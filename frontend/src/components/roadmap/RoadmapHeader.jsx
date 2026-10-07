import {
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiTarget,
  FiTrash2,
} from "react-icons/fi";

const RoadmapHeader = ({
  roadmap,
  onBack,
  onDelete,
  deleteLoading = false,
}) => {
  if (!roadmap) return null;

  const moduleCount = roadmap.modules?.length || 0;

  return (
    <header className="border-b border-white/[0.07] pb-7 sm:pb-8">
      {/* Top navigation / actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 text-xs font-medium text-white/50 transition hover:border-white/[0.13] hover:bg-white/[0.05] hover:text-white/80"
        >
          <FiArrowLeft size={14} />
          <span>Roadmaps</span>
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleteLoading}
            aria-label="Delete roadmap"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/30 transition hover:border-red-400/20 hover:bg-red-400/[0.05] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-3.5"
          >
            {deleteLoading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
            ) : (
              <>
                <FiTrash2 size={14} />

                <span className="ml-2 hidden text-xs sm:inline">Delete</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main identity */}
      <div className="mt-8 max-w-4xl">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300/55">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-300/70" />
          Learning roadmap
        </div>

        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl lg:text-[46px]">
          {roadmap.title}
        </h1>

        {roadmap.description && (
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/40 sm:text-[15px]">
            {roadmap.description}
          </p>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-7 flex flex-wrap gap-2.5">
        <MetaItem
          icon={<FiBriefcase size={14} />}
          label="Role"
          value={roadmap.role}
        />

        <MetaItem
          icon={<FiTarget size={14} />}
          label="Target"
          value={roadmap.targetPackage}
        />

        {roadmap.duration && (
          <MetaItem
            icon={<FiCalendar size={14} />}
            label="Duration"
            value={roadmap.duration}
          />
        )}

        {roadmap.level && <MetaItem label="Level" value={roadmap.level} />}

        <MetaItem label="Modules" value={moduleCount} />
      </div>
    </header>
  );
};

const MetaItem = ({ icon, label, value }) => {
  return (
    <div className="flex min-h-12 items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5">
      {icon && <span className="text-white/25">{icon}</span>}

      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/25">
          {label}
        </p>

        <p className="mt-0.5 max-w-[180px] truncate text-xs font-medium text-white/65">
          {value}
        </p>
      </div>
    </div>
  );
};

export default RoadmapHeader;
