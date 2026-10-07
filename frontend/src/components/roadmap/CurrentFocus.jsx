import { FiCheck, FiLock, FiPlay } from "react-icons/fi";

const ProgressOverview = ({ roadmap }) => {
  if (!roadmap) return null;

  const modules = [...(roadmap.modules || [])].sort(
    (a, b) => a.order - b.order,
  );

  if (modules.length === 0) return null;

  const completedCount = modules.filter((module) => module.completed).length;

  const currentModule =
    modules.find((module) => !module.completed) || modules[modules.length - 1];

  const currentIndex = modules.findIndex(
    (module) => module.order === currentModule.order,
  );

  return (
    <section className="mt-6 sm:mt-8">
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
          Your position
        </p>

        <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl">
          Roadmap progress
        </h2>
      </div>

      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
        {/* Progress summary */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-3xl font-semibold tracking-[-0.04em] text-white">
              {completedCount}
              <span className="text-white/20"> / {modules.length}</span>
            </p>

            <p className="mt-1 text-xs text-white/30">modules completed</p>
          </div>

          <div className="max-w-sm sm:text-right">
            <p className="text-xs font-medium text-white/45">
              {currentIndex === modules.length - 1 &&
              completedCount === modules.length
                ? "Roadmap completed"
                : `Module ${currentIndex + 1} of ${modules.length}`}
            </p>

            <p className="mt-1 text-xs leading-5 text-white/25">
              {currentIndex === 0 && completedCount === 0
                ? "Start with the foundation and build forward from there."
                : "Keep following the sequence. Each stage prepares you for the next."}
            </p>
          </div>
        </div>

        {/* Journey */}
        <div className="mt-7">
          <div className="relative">
            {/* Background line */}
            <div className="absolute left-[15px] top-4 h-[calc(100%-32px)] w-px bg-white/[0.08] sm:left-5" />

            <div
              className="absolute left-[15px] top-4 w-px bg-violet-300/55 transition-all duration-700 sm:left-5"
              style={{
                height:
                  modules.length > 1
                    ? `${Math.min(
                        (completedCount / (modules.length - 1)) * 100,
                        100,
                      )}%`
                    : "0%",
              }}
            />

            <div className="space-y-2.5">
              {modules.map((module, index) => {
                const isCompleted = module.completed;
                const isCurrent = !isCompleted && index === currentIndex;

                const isUpcoming = !isCompleted && index !== currentIndex;

                return (
                  <ProgressRow
                    key={module.order}
                    module={module}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    isUpcoming={isUpcoming}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProgressRow = ({ module, isCompleted, isCurrent, isUpcoming }) => {
  return (
    <div
      className={`relative flex items-center gap-3 rounded-2xl p-2 transition sm:gap-4 ${
        isCurrent
          ? "border border-violet-300/15 bg-violet-300/[0.045]"
          : "border border-transparent"
      }`}
    >
      {/* Status node */}
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0A0A0A] bg-[#151515] sm:h-10 sm:w-10">
        {isCompleted && (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-violet-300/15 text-violet-200">
            <FiCheck size={15} />
          </span>
        )}

        {isCurrent && (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-black">
            <FiPlay size={12} fill="currentColor" />
          </span>
        )}

        {isUpcoming && (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-white/[0.045] text-white/20">
            <FiLock size={13} />
          </span>
        )}
      </div>

      {/* Module information */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`truncate text-sm font-medium ${
              isCompleted
                ? "text-white/45"
                : isCurrent
                  ? "text-white/85"
                  : "text-white/30"
            }`}
          >
            {module.title}
          </p>

          {isCurrent && (
            <span className="shrink-0 rounded-full bg-violet-300/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-violet-200/70">
              Current
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2 text-[10px] text-white/20">
          <span>Module {module.order}</span>

          {module.duration && (
            <>
              <span>•</span>
              <span>{module.duration}</span>
            </>
          )}
        </div>
      </div>

      {/* Desktop status */}
      <div className="hidden shrink-0 sm:block">
        {isCompleted && (
          <span className="text-[10px] font-medium text-violet-200/45">
            Completed
          </span>
        )}

        {isCurrent && (
          <span className="text-[10px] font-medium text-white/50">Up next</span>
        )}

        {isUpcoming && (
          <span className="text-[10px] text-white/15">Upcoming</span>
        )}
      </div>
    </div>
  );
};

export default ProgressOverview;
