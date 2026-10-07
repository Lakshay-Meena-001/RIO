import {
  FiBookOpen,
  FiClock,
  FiExternalLink,
  FiFileText,
  FiPlay,
  FiStar,
} from "react-icons/fi";

const RESOURCE_META = {
  youtube: {
    label: "YouTube",
    icon: FiPlay,
  },
  documentation: {
    label: "Documentation",
    icon: FiBookOpen,
  },
  article: {
    label: "Article",
    icon: FiFileText,
  },
  course: {
    label: "Course",
    icon: FiBookOpen,
  },
};

const ResourceCard = ({ resource }) => {
  if (!resource) return null;

  const {
    type,
    title,
    url,
    source,
    isPrimary,
    reason,
    durationMinutes,
    viewCount,
  } = resource;

  const meta = RESOURCE_META[type] || {
    label: source || "Resource",
    icon: FiBookOpen,
  };

  const Icon = meta.icon;

  const duration =
    Number.isFinite(Number(durationMinutes)) && Number(durationMinutes) > 0
      ? `${durationMinutes} min`
      : null;

  const views =
    Number.isFinite(Number(viewCount)) && Number(viewCount) > 0
      ? formatViewCount(Number(viewCount))
      : null;

  return (
    <article
      className={`group rounded-2xl border p-3.5 transition sm:p-4 ${
        isPrimary
          ? "border-violet-300/[0.12] bg-violet-300/[0.035]"
          : "border-white/[0.06] bg-white/[0.018] hover:border-white/[0.10] hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Resource icon */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isPrimary
              ? "bg-violet-300/10 text-violet-200/65"
              : "bg-white/[0.045] text-white/30"
          }`}
        >
          <Icon size={15} />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/25">
              {meta.label}
            </span>

            {isPrimary && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-300/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-violet-200/65">
                <FiStar size={8} />
                Primary
              </span>
            )}
          </div>

          <h4 className="mt-1.5 text-xs font-semibold leading-5 text-white/70 sm:text-[13px]">
            {title || "Untitled resource"}
          </h4>

          {reason && (
            <p className="mt-1.5 text-[11px] leading-5 text-white/30">
              {reason}
            </p>
          )}

          {(duration || views) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-3">
              {duration && (
                <span className="inline-flex items-center gap-1.5 text-[10px] text-white/25">
                  <FiClock size={10} />
                  {duration}
                </span>
              )}

              {views && (
                <span className="text-[10px] text-white/25">{views} views</span>
              )}
            </div>
          )}
        </div>

        {/* Open resource */}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${title || "resource"}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/25 transition hover:bg-white/[0.06] hover:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <FiExternalLink size={15} />
          </a>
        )}
      </div>
    </article>
  );
};

const formatViewCount = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(count >= 10000000 ? 0 : 1)}M`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(count >= 100000 ? 0 : 1)}K`;
  }

  return count.toString();
};

export default ResourceCard;
