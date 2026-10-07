import { FiArrowRight, FiMap } from "react-icons/fi";

const RoadmapEmptyState = ({
  title = "No roadmap yet",
  description = "Create a personalized learning roadmap and get a clear path from where you are to where you want to go.",
  actionLabel = "Create roadmap",
  onAction,
}) => {
  return (
    <section className="flex min-h-[360px] items-center justify-center rounded-3xl border border-white/[0.07] bg-white/[0.02] px-5 py-10 sm:min-h-[420px] sm:px-8">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035] text-white/30">
          <FiMap size={21} />
        </div>

        {/* Content */}
        <h2 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-white/75 sm:text-xl">
          {title}
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/30">
          {description}
        </p>

        {/* Action */}
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-black transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            {actionLabel}
            <FiArrowRight size={14} />
          </button>
        )}
      </div>
    </section>
  );
};

export default RoadmapEmptyState;
