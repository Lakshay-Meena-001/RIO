import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiTrendingUp,
} from "react-icons/fi";

const RoadmapOverview = ({ roadmap }) => {
  if (!roadmap) return null;

  const modules = roadmap.modules || [];

  const totalModules = modules.length;

  const completedModules = modules.filter(
    (module) => module.completed === true,
  ).length;

  const remainingModules = Math.max(totalModules - completedModules, 0);

  const progress =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <section className="mt-6 sm:mt-8">
      {/* Section heading */}
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
            At a glance
          </p>

          <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl">
            Your learning journey
          </h2>
        </div>

        <span className="shrink-0 text-sm font-medium text-white/45">
          {progress}%
        </span>
      </div>

      {/* Main overview card */}
      <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]">
        {/* Progress strip */}
        <div className="h-1 w-full bg-white/[0.05]">
          <div
            className="h-full rounded-r-full bg-violet-300/70 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-5 sm:p-6">
          {/* Summary */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="text-sm leading-6 text-white/45">
                {completedModules === 0
                  ? "Your roadmap is ready. Start with the first module and build your foundation step by step."
                  : completedModules === totalModules
                    ? "You have completed this roadmap. Take a moment to review what you have built and learned."
                    : `You have completed ${completedModules} of ${totalModules} modules. Keep moving through the path one step at a time.`}
              </p>
            </div>

            {/* Progress number */}
            <div className="shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-black/20 sm:h-[72px] sm:w-[72px]">
                <div className="text-center">
                  <p className="text-xl font-semibold tracking-[-0.04em] text-white">
                    {progress}
                  </p>

                  <p className="text-[9px] uppercase tracking-[0.12em] text-white/25">
                    percent
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <OverviewStat
              icon={<FiLayers size={15} />}
              label="Modules"
              value={totalModules}
            />

            <OverviewStat
              icon={<FiCheckCircle size={15} />}
              label="Completed"
              value={completedModules}
            />

            <OverviewStat
              icon={<FiBookOpen size={15} />}
              label="Remaining"
              value={remainingModules}
            />

            <OverviewStat
              icon={<FiClock size={15} />}
              label="Duration"
              value={roadmap.duration || "—"}
            />
          </div>

          {/* Bottom context */}
          <div className="mt-5 flex items-start gap-2.5 border-t border-white/[0.06] pt-4">
            <FiTrendingUp
              size={14}
              className="mt-0.5 shrink-0 text-violet-300/45"
            />

            <p className="text-xs leading-5 text-white/25">
              Follow the modules in order. The roadmap is designed around
              dependencies, so later topics build on earlier ones.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const OverviewStat = ({ icon, label, value }) => {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.06] bg-black/15 p-3.5 sm:p-4">
      <div className="flex items-center gap-2 text-white/25">
        {icon}

        <span className="truncate text-[10px] font-medium uppercase tracking-[0.1em]">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-semibold text-white/70">
        {value}
      </p>
    </div>
  );
};

export default RoadmapOverview;
