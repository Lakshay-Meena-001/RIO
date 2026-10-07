import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

const RoadmapErrorState = ({
  title = "Something went wrong",
  message = "We couldn't load your roadmap right now. Please try again.",
  onRetry,
  retryLabel = "Try again",
}) => {
  return (
    <section className="flex min-h-[320px] items-center justify-center rounded-3xl border border-red-300/[0.10] bg-red-300/[0.025] px-5 py-10 sm:min-h-[360px] sm:px-8">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/[0.10] bg-red-300/[0.06] text-red-300/60">
          <FiAlertCircle size={21} />
        </div>

        {/* Content */}
        <h2 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-white/75 sm:text-xl">
          {title}
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/30">
          {message}
        </p>

        {/* Retry */}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 text-xs font-semibold text-white/60 transition hover:bg-white/[0.07] hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <FiRefreshCw size={13} />
            {retryLabel}
          </button>
        )}
      </div>
    </section>
  );
};

export default RoadmapErrorState;
