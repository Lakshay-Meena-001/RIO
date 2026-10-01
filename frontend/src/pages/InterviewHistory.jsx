import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InterviewReport from "./InterviewReport";
import { getInterviewHistory } from "../api/interview.api";

import {
  FiArrowLeft,
  FiClock,
  FiMenu,
  FiRefreshCw,
} from "react-icons/fi";

const InterviewHistory = () => {
  const navigate = useNavigate();

  const navigateWithTransition = (path, options) => {
    if (
      typeof document !== "undefined" &&
      typeof document.startViewTransition === "function"
    ) {
      document.startViewTransition(() => {
        navigate(path, options);
      });
      return;
    }

    navigate(path, options);
  };

  const [interviews, setInterviews] = useState([]);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const getInterviewId = (interview) =>
    interview?._id || interview?.id || interview?.interviewId;

  const loadInterviewHistory = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getInterviewHistory();

      if (!result?.success) {
        throw new Error(result?.message || "Failed to load interview history.");
      }

      const history = Array.isArray(result.data) ? result.data : [];

      setInterviews(history);
      setSelectedInterviewId((currentSelectedId) => {
        if (
          currentSelectedId &&
          history.some(
            (interview) => getInterviewId(interview) === currentSelectedId,
          )
        ) {
          return currentSelectedId;
        }

        return getInterviewId(history[0]) || null;
      });

      setError("");
    } catch (err) {
      console.error("Failed to load interview history:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load your interview history.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await loadInterviewHistory();
    };

    load();
  }, [loadInterviewHistory]);

  const formatInterviewType = (type) => {
    const labels = {
      dsa: "DSA",
      core: "Core CS",
      development: "Development",
      project: "Project",
      "system-design": "System Design",
      behavioral: "Behavioral",
      full: "Full Interview",
    };

    return labels[type] || type || "Interview";
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatScore = (score) => {
    const numericScore = Number(score);

    if (!Number.isFinite(numericScore)) {
      return "—";
    }

    return `${numericScore.toFixed(1)}/10`;
  };

  const handleSelectInterview = (interviewId) => {
    if (!interviewId) {
      return;
    }

    setSelectedInterviewId(interviewId);
    setMobileHistoryOpen(false);
  };

  const handleInterviewDeleted = (deletedInterviewId) => {
    const deletedIndex = interviews.findIndex(
      (interview) => getInterviewId(interview) === deletedInterviewId,
    );

    const updatedInterviews = interviews.filter(
      (interview) => getInterviewId(interview) !== deletedInterviewId,
    );

    setInterviews(updatedInterviews);

    if (updatedInterviews.length === 0) {
      setSelectedInterviewId(null);
      return;
    }

    const nextIndex = Math.min(
      Math.max(deletedIndex, 0),
      updatedInterviews.length - 1,
    );

    setSelectedInterviewId(
      getInterviewId(updatedInterviews[nextIndex]) || null,
    );
  };

  const selectedInterview = interviews.find(
    (interview) => getInterviewId(interview) === selectedInterviewId,
  );

  return (
    <div className="rio-history-page fixed inset-0 overflow-hidden bg-[#17191C] text-white">
      <style>{`
        @keyframes rioHistoryEnter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rioSoftFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes rioModalIn {
          from { opacity: 0; transform: translateY(8px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        ::view-transition-old(root) {
          animation: 180ms ease both rioSoftFade;
        }
        ::view-transition-new(root) {
          animation: 260ms ease both rioHistoryEnter;
        }
        .rio-history-page {
          animation: rioHistoryEnter 320ms cubic-bezier(.22,1,.36,1);
        }
        .rio-history-item {
          animation: rioHistoryEnter 260ms cubic-bezier(.22,1,.36,1) both;
        }
        .rio-modal {
          animation: rioModalIn 180ms cubic-bezier(.22,1,.36,1);
        }
        @media (prefers-reduced-motion: reduce) {
          .rio-history-page,
          .rio-history-item,
          .rio-modal {
            animation: none !important;
          }
        }
      `}</style>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 80% 70% at 100% 0%,
              rgba(255,255,255,0.055) 0%,
              rgba(255,255,255,0.018) 36%,
              transparent 72%
            ),
            radial-gradient(
              ellipse 65% 60% at 48% 100%,
              rgba(99,102,241,0.055) 0%,
              transparent 72%
            ),
            linear-gradient(
              120deg,
              #17191c 0%,
              #141619 48%,
              #181a1e 100%
            )
          `,
        }}
      />

      <div className="relative z-10 flex h-full min-h-0">
        {/* Interview history sidebar */}
        <aside
          className={`absolute inset-y-0 left-0 z-50 flex w-[260px] max-w-[88vw] flex-col border-r border-white/[0.08] bg-[#121417]/92 shadow-[20px_0_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition-transform duration-300 lg:relative lg:translate-x-0 ${
            mobileHistoryOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="shrink-0 border-b border-white/[0.07] bg-white/[0.015] px-4 pb-5 pt-5">
            <button
              type="button"
              onClick={() => navigateWithTransition("/mock-interview")}
              className="mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-[#A1A1AA] transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
            >
              <FiArrowLeft size={14} />
              Back to interviews
            </button>

            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#52525B]">
                  Interview Center
                </p>

                <h1 className="mt-1 text-lg font-semibold tracking-[-0.025em]">
                  Interview History
                </h1>
              </div>

              <button
                type="button"
                onClick={loadInterviewHistory}
                disabled={loading}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#A1A1AA] transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Refresh interview history"
              >
                <FiRefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {loading && (
              <div className="flex min-h-[260px] items-center justify-center px-5">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-white" />

                  <p className="text-[11px] text-[#71717A]">
                    Loading history...
                  </p>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="px-5 py-8">
                <div className="rounded-xl border border-red-400/10 bg-red-400/[0.04] p-4">
                  <p className="text-xs font-medium text-red-200">
                    Unable to load history
                  </p>

                  <p className="mt-2 text-[11px] leading-5 text-[#71717A]">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={loadInterviewHistory}
                    className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-medium text-white hover:bg-white/[0.08]"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && interviews.length === 0 && (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.025] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                  <FiClock size={18} className="text-[#A1A1AA]" />
                </div>

                <p className="mt-5 text-sm font-semibold tracking-[-0.01em] text-white">
                  Your interview history starts here
                </p>

                <p className="mt-2 max-w-[210px] text-[11px] leading-5 text-[#71717A]">
                  Complete your first mock interview and your report will stay here for future practice.
                </p>

                <p className="mt-4 text-[10px] italic leading-5 text-[#52525B]">
                  “Every round gives you something to improve.”
                </p>

                <button
                  type="button"
                  onClick={() => navigateWithTransition("/mock-interview/new")}
                  className="mt-5 rounded-xl bg-white px-4 py-2.5 text-[11px] font-semibold text-[#17191C] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F4F4F5]"
                >
                  Start Interview
                </button>
              </div>
            )}

            {!loading && !error && interviews.length > 0 && (
              <div className="py-2">
                {interviews.map((interview) => {
                  const interviewId = getInterviewId(interview);
                  const isSelected = interviewId === selectedInterviewId;
                  const interviewDate =
                    interview.createdAt || interview.startedAt;

                  return (
                    <button
                      key={interviewId}
                      type="button"
                      onClick={() => handleSelectInterview(interviewId)}
                      className={`group relative flex w-full items-center gap-3 border-b border-white/[0.045] px-4 py-4 text-left transition-colors ${
                        isSelected
                          ? "bg-white/[0.075]"
                          : "hover:bg-white/[0.035]"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.25)]" />
                      )}

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                          isSelected
                            ? "border-white/15 bg-white/[0.08] text-white"
                            : "border-white/10 bg-white/[0.035] text-[#71717A]"
                        }`}
                      >
                        <FiClock size={14} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="min-w-0 truncate text-xs font-semibold text-white">
                            {interview.role || "Mock Interview"}
                          </p>

                          <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-0.5 text-[8px] font-medium text-[#71717A]">
                            {formatInterviewType(interview.interviewType)}
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#52525B]">
                          <span>{formatDate(interviewDate)}</span>

                          {formatTime(interviewDate) && (
                            <>
                              <span>•</span>
                              <span>{formatTime(interviewDate)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs font-semibold text-white">
                          {formatScore(interview.overallScore)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Mobile history backdrop */}
        {mobileHistoryOpen && (
          <button
            type="button"
            aria-label="Close interview history"
            onClick={() => setMobileHistoryOpen(false)}
            className="absolute inset-0 z-40 bg-black/60 lg:hidden"
          />
        )}

        {/* Report */}
        <main className="min-w-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex h-14 shrink-0 items-center border-b border-white/[0.07] px-4 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileHistoryOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#A1A1AA] transition-all duration-200 hover:bg-white/[0.08] hover:text-white"
                aria-label="Open interview history"
              >
                <FiMenu size={16} />
              </button>

              <p className="ml-3 text-xs font-semibold text-white">
                Interview Report
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {selectedInterview ? (
                <InterviewReport
                  interviewId={selectedInterviewId}
                  onDeleted={handleInterviewDeleted}
                />
              ) : (
                <div className="flex min-h-full items-center justify-center px-6 py-20">
                  <div className="rio-history-item max-w-md text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.025] shadow-[0_14px_40px_rgba(0,0,0,0.2)]">
                      <FiClock size={24} className="text-[#A1A1AA]" />
                    </div>

                    <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#52525B]">
                      Interview workspace
                    </p>

                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white">
                      No interview selected
                    </h2>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#71717A]">
                      Pick a completed interview from the left to review your performance, or start a new round when you are ready.
                    </p>

                    <p className="mt-4 text-xs italic text-[#52525B]">
                      Practice. Review. Improve.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigateWithTransition("/mock-interview/new")}
                      className="mt-6 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-[#17191C] shadow-[0_10px_28px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F4F4F5]"
                    >
                      Start Interview
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InterviewHistory;
