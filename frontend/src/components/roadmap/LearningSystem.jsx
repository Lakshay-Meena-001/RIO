import {
  FiAlertCircle,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiFlag,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";

const LEARNING_STEPS = [
  {
    icon: FiBookOpen,
    title: "Learn",
    description:
      "Study the concept using the recommended resources. Focus on understanding instead of simply finishing content.",
  },
  {
    icon: FiCheckCircle,
    title: "Understand",
    description:
      "Make sure you can explain the concept in your own words and understand why it works.",
  },
  {
    icon: FiTarget,
    title: "Practice",
    description:
      "Solve representative problems or exercises. Focus on patterns and application rather than volume.",
  },
  {
    icon: FiTrendingUp,
    title: "Apply",
    description:
      "Use what you learned in code, projects, or realistic tasks so the knowledge becomes practical.",
  },
  {
    icon: FiRefreshCw,
    title: "Revise",
    description:
      "Return to important concepts using active recall instead of repeatedly consuming the same content.",
  },
  {
    icon: FiFlag,
    title: "Move Forward",
    description:
      "Once you can apply the core ideas confidently, continue to the next module instead of chasing perfection.",
  },
];

const HABITS = [
  {
    icon: FiEdit3,
    title: "Keep a learning record",
    description:
      "Track what you learned, what you can explain, what you can implement, and where you are still weak.",
  },
  {
    icon: FiAlertCircle,
    title: "Record mistakes",
    description:
      "Keep track of recurring mistakes and weak areas so revision stays targeted.",
  },
  {
    icon: FiClock,
    title: "Use the stuck protocol",
    description:
      "Identify the exact blocker, fix that blocker, and continue. Do not restart the entire learning path.",
  },
];

const LearningSystem = ({ learningSystem }) => {
  if (!learningSystem) return null;

  return (
    <section className="mt-10 sm:mt-12">
      {/* Header */}
      <div className="rounded-3xl border border-violet-300/[0.10] bg-violet-300/[0.025] p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-300/10 text-violet-200/60">
            <FiTarget size={17} />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200/45">
              RIO learning system
            </p>

            <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.025em] text-white sm:text-2xl">
              How to actually follow this roadmap
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">
              The roadmap tells you what to learn. This system tells you how to
              turn that learning into skills.
            </p>
          </div>
        </div>

        {/* Learning cycle */}
        <div className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="rounded-2xl border border-white/[0.06] bg-black/10 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.045] text-white/35">
                    <Icon size={14} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-semibold text-white/20">
                      0{index + 1}
                    </span>

                    <h3 className="text-xs font-semibold text-white/65">
                      {step.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-3 text-[11px] leading-5 text-white/30">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Supporting habits */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {HABITS.map((habit) => {
          const Icon = habit.icon;

          return (
            <div
              key={habit.title}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.045] text-white/30">
                <Icon size={14} />
              </div>

              <h3 className="mt-3 text-xs font-semibold text-white/60">
                {habit.title}
              </h3>

              <p className="mt-1.5 text-[11px] leading-5 text-white/28">
                {habit.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LearningSystem;
