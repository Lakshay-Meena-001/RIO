import { FiClock } from "react-icons/fi";
import { RiBrainAi3Fill } from "react-icons/ri";

export default function InterviewSessionHeader({ interview, remainingSeconds, formatTime }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#111214]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left — Interview identity */}
          <div className="flex min-w-0 items-center gap-3">
            {/* RIO mark */}
            <div className="hidden h-9 w-9 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.045] shadow-[0_16px_45px_rgba(0,0,0,0.16)] sm:flex">
              <RiBrainAi3Fill size={14} className="text-[#D4D4D8]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-white">
                  {interview.role || "Mock Interview"}
                </p>

                <span className="hidden text-[#52525B] sm:inline">·</span>

                <p className="hidden truncate text-[11px] font-medium uppercase tracking-[0.14em] text-[#71717A] sm:block">
                  {interview.interviewType || "Interview"}
                </p>
              </div>

              <p className="mt-0.5 text-[10px] tracking-wide text-[#52525B]">
                RIO Interview Session
              </p>
            </div>
          </div>

          {/* Center — Question progress */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 md:flex">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#52525B]">
              Question
            </span>

            <span className="font-mono text-sm font-medium tracking-tight text-[#E4E4E7]">
              {Math.min(
                (interview.currentQuestionIndex || 0) + 1,
                interview.questions?.length || 0,
              )}
            </span>

            <span className="text-[#3F3F46]">/</span>

            <span className="font-mono text-sm text-[#71717A]">
              {interview.questions?.length || 0}
            </span>
          </div>

          {/* Right — Timer */}
          <div className="flex items-center gap-2">
            {/* Timer */}
            <div
              className={`flex h-10 items-center gap-2 rounded-xl border px-3 transition-all ${
                remainingSeconds !== null && remainingSeconds <= 60
                  ? "border-white/[0.16] bg-white/[0.045] text-[#E4E4E7]"
                  : "border-white/[0.10] bg-white/[0.045] text-[#D4D4D8]"
              }`}
            >
              <FiClock size={13} className="opacity-70" />

              <span className="font-mono text-[13px] font-medium tracking-tight">
                {formatTime(remainingSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Ultra-subtle progress line */}
        <div className="h-px bg-white/[0.025]">
          <div
            className="h-full bg-white/20 transition-all duration-500"
            style={{
              width: `${
                interview.questions?.length
                  ? (((interview.currentQuestionIndex || 0) + 1) /
                      interview.questions.length) *
                    100
                  : 0
              }%`,
            }}
          />
        </div>
      </header>
  );
}
