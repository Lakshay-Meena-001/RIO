import { FiArrowDown, FiLayers } from "react-icons/fi";

import RoadmapModuleCard from "./RoadmapModuleCard";

const LearningPath = ({ roadmap, onToggleModule, progressLoading = false }) => {
  if (!roadmap) return null;

  const modules = [...(roadmap.modules || [])].sort(
    (a, b) => a.order - b.order,
  );

  const currentModule = modules.find((module) => !module.completed);

  if (modules.length === 0) {
    return (
      <section className="mt-8">
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 text-center sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/25">
            <FiLayers size={19} />
          </div>

          <h2 className="mt-4 text-base font-semibold text-white/70">
            No learning modules yet
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/30">
            This roadmap does not contain any learning modules.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 sm:mt-10">
      {/* Section heading */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
            The path
          </p>

          <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.025em] text-white sm:text-2xl">
            Your learning path
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/30">
            Work through these stages in order. Each module builds the
            foundation needed for what comes next.
          </p>
        </div>

        <div className="hidden shrink-0 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] font-medium text-white/30 sm:block">
          {modules.length} modules
        </div>
      </div>

      {/* Mobile module count */}
      <div className="mb-4 sm:hidden">
        <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] font-medium text-white/30">
          {modules.length} modules
        </span>
      </div>

      {/* Modules */}
      <div className="relative">
        {/* Timeline line */}
        <div className="pointer-events-none absolute bottom-6 left-[15px] top-6 w-px bg-white/[0.07] sm:left-[19px]" />

        <div className="relative space-y-3 sm:space-y-4">
          {modules.map((module, index) => {
            const isCurrent = module.order === currentModule?.order;

            return (
              <div
                key={module.order}
                id={`roadmap-module-${module.order}`}
                className="relative scroll-mt-24 pl-9 sm:pl-12"
              >
                {/* Timeline node */}
                <div className="absolute left-0 top-6 z-10 flex h-8 w-8 items-center justify-center sm:h-10 sm:w-10">
                  <div
                    className={`h-3 w-3 rounded-full border-2 border-[#0A0A0A] ${
                      module.completed
                        ? "bg-violet-300/70"
                        : isCurrent
                          ? "bg-white"
                          : "bg-white/15"
                    }`}
                  />
                </div>

                {/* Module */}
                <RoadmapModuleCard
                  module={module}
                  isCurrent={isCurrent}
                  onToggle={() => onToggleModule?.(module)}
                  progressLoading={progressLoading}
                />

                {/* Connector hint */}
                {index < modules.length - 1 && (
                  <div className="flex h-4 items-center justify-center text-white/[0.08]">
                    <FiArrowDown size={12} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LearningPath;
