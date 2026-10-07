import { FiArrowRight, FiCheckCircle, FiClock, FiPlay } from "react-icons/fi";

const CurrentFocus = ({ roadmap, onContinue }) => {
  if (!roadmap) return null;

  const modules = [...(roadmap.modules || [])].sort(
    (a, b) => a.order - b.order,
  );

  if (modules.length === 0) return null;

  const currentModule = modules.find((module) => !module.completed) || null;

  /*
   * All modules are completed.
   */
  if (!currentModule) {
    return (
      <section className="mt-6 sm:mt-8">
        <div className="rounded-3xl border border-violet-300/15 bg-violet-300/[0.04] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-300/10 text-violet-200">
              <FiCheckCircle size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200/50">
                Roadmap complete
              </p>

              <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl">
                You completed the entire roadmap.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">
                Your planned learning path is complete. Review the modules,
                strengthen weak areas, or move on to the next stage of your
                learning journey.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const handleContinue = () => {
    onContinue?.(currentModule);
  };

  return (
    <section className="mt-6 sm:mt-8">
      {/* Section heading */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
          Up next
        </p>

        <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl">
          Your current focus
        </h2>
      </div>

      {/* Current module */}
      <div className="overflow-hidden rounded-3xl border border-violet-300/15 bg-violet-300/[0.035]">
        <div className="p-5 sm:p-6">
          {/* Module identity */}
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-violet-200">
              <FiPlay size={16} fill="currentColor" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-violet-300/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-violet-200/70">
                  Module {currentModule.order}
                </span>

                {currentModule.duration && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-white/25">
                    <FiClock size={11} />
                    {currentModule.duration}
                  </span>
                )}
              </div>

              <h3 className="mt-2.5 text-xl font-semibold tracking-[-0.025em] text-white sm:text-2xl">
                {currentModule.title || "Current module"}
              </h3>

              {currentModule.description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">
                  {currentModule.description}
                </p>
              )}
            </div>
          </div>

          {/* Learning outcomes */}
          {Array.isArray(currentModule.learningOutcomes) &&
            currentModule.learningOutcomes.length > 0 && (
              <div className="mt-6 border-t border-white/[0.06] pt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  What you&apos;ll learn
                </p>

                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {currentModule.learningOutcomes
                    .slice(0, 4)
                    .map((outcome, index) => (
                      <li
                        key={`${currentModule.order}-outcome-${index}`}
                        className="flex items-start gap-2.5 text-xs leading-5 text-white/35"
                      >
                        <FiCheckCircle
                          size={13}
                          className="mt-0.5 shrink-0 text-violet-300/45"
                        />

                        <span>{outcome}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

          {/* Action */}
          <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/25">
              Continue from where you left off.
            </p>

            <button
              type="button"
              onClick={handleContinue}
              className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black transition hover:bg-white/90 active:scale-[0.99] sm:w-auto"
            >
              Continue learning
              <FiArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentFocus;
