import { useState } from "react";
import {
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiLayers,
  FiLock,
  FiTarget,
} from "react-icons/fi";

import ResourceList from "./ResourceList";

const RoadmapModuleCard = ({
  module,
  isCurrent = false,
  onToggle,
  progressLoading = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!module) return null;

  const isCompleted = module.completed === true;

  const resources = module.resources || [];
  const prerequisites = module.prerequisites || [];
  const learningOutcomes = module.learningOutcomes || [];

  return (
    <article
      className={`overflow-hidden rounded-2xl border transition-all duration-200 sm:rounded-3xl ${
        isCompleted
          ? "border-violet-300/[0.08] bg-white/[0.018]"
          : isCurrent
            ? "border-violet-300/15 bg-violet-300/[0.035]"
            : "border-white/[0.07] bg-white/[0.025]"
      }`}
    >
      {/* Main clickable area */}
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="w-full text-left"
        aria-expanded={expanded}
      >
        <div className="p-4 sm:p-5">
          {/* Top row */}
          <div className="flex items-start gap-3">
            {/* Module number */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-semibold sm:h-11 sm:w-11 ${
                isCompleted
                  ? "bg-violet-300/10 text-violet-200/60"
                  : isCurrent
                    ? "bg-white text-black"
                    : "bg-white/[0.045] text-white/25"
              }`}
            >
              {isCompleted ? (
                <FiCheck size={16} />
              ) : (
                String(module.order).padStart(2, "0")
              )}
            </div>

            {/* Title/content */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {isCurrent && (
                  <span className="rounded-full bg-violet-300/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-violet-200/65">
                    Current
                  </span>
                )}

                {isCompleted && (
                  <span className="rounded-full bg-white/[0.045] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-white/30">
                    Completed
                  </span>
                )}
              </div>

              <h3
                className={`mt-1 text-sm font-semibold leading-5 sm:text-[15px] ${
                  isCompleted ? "text-white/50" : "text-white/80"
                }`}
              >
                {module.title}
              </h3>

              {module.description && (
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/30 sm:text-[13px]">
                  {module.description}
                </p>
              )}
            </div>

            {/* Expand */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/25 transition hover:bg-white/[0.04] hover:text-white/50">
              {expanded ? (
                <FiChevronUp size={16} />
              ) : (
                <FiChevronDown size={16} />
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-4 flex flex-wrap gap-2 pl-0 sm:pl-[59px]">
            {module.duration && (
              <ModuleMeta
                icon={<FiClock size={11} />}
                value={module.duration}
              />
            )}

            {module.difficulty && (
              <ModuleMeta
                icon={<FiLayers size={11} />}
                value={module.difficulty}
              />
            )}

            {resources.length > 0 && (
              <ModuleMeta
                icon={<FiBookOpen size={11} />}
                value={`${resources.length} ${
                  resources.length === 1 ? "resource" : "resources"
                }`}
              />
            )}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-white/[0.07]">
          <div className="space-y-6 p-4 sm:p-5 sm:pl-[76px]">
            {/* Why it matters */}
            {module.whyItMatters && (
              <ContentBlock
                icon={<FiTarget size={14} />}
                title="Why this matters"
              >
                <p className="text-xs leading-6 text-white/40 sm:text-[13px]">
                  {module.whyItMatters}
                </p>
              </ContentBlock>
            )}

            {/* Prerequisites */}
            {prerequisites.length > 0 && (
              <ContentBlock icon={<FiLock size={14} />} title="Prerequisites">
                <div className="flex flex-wrap gap-2">
                  {prerequisites.map((item, index) => (
                    <span
                      key={`${module.order}-prerequisite-${index}`}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-[11px] text-white/35"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </ContentBlock>
            )}

            {/* Learning outcomes */}
            {learningOutcomes.length > 0 && (
              <ContentBlock
                icon={<FiCheck size={14} />}
                title="Learning outcomes"
              >
                <div className="space-y-2">
                  {learningOutcomes.map((item, index) => (
                    <div
                      key={`${module.order}-outcome-${index}`}
                      className="flex items-start gap-2.5"
                    >
                      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-300/10 text-violet-200/50">
                        <FiCheck size={9} />
                      </span>

                      <p className="text-xs leading-5 text-white/40 sm:text-[13px]">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </ContentBlock>
            )}

            {/* Resources */}
            {resources.length > 0 && (
              <ContentBlock
                icon={<FiBookOpen size={14} />}
                title="Recommended resources"
              >
                <ResourceList resources={resources} />
              </ContentBlock>
            )}

            {/* Completion */}
            <div className="border-t border-white/[0.06] pt-5">
              <button
                type="button"
                disabled={progressLoading}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle?.();
                }}
                className={`group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition sm:w-auto ${
                  isCompleted
                    ? "border border-white/[0.08] bg-white/[0.025] text-white/50 hover:bg-white/[0.05] hover:text-white/70"
                    : "bg-white text-black hover:bg-white/90"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {progressLoading ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/15 border-t-black" />
                ) : isCompleted ? (
                  <>
                    <FiCheck size={14} />
                    Mark as incomplete
                  </>
                ) : (
                  <>
                    <FiCheck size={14} />
                    Mark module complete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

const ModuleMeta = ({ icon, value }) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-black/10 px-2.5 py-1.5 text-[10px] text-white/25">
      {icon}
      {value}
    </span>
  );
};

const ContentBlock = ({ icon, title, children }) => {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-white/35">
        {icon}

        <p className="text-[10px] font-semibold uppercase tracking-[0.13em]">
          {title}
        </p>
      </div>

      {children}
    </div>
  );
};

export default RoadmapModuleCard;
