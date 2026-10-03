import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import InterviewReport from "./InterviewReport";
import { getInterviewHistory } from "../api/interview.api";

import { FiClock, FiMenu, FiRefreshCw } from "react-icons/fi";

const InterviewHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

      const requestedInterviewId = searchParams.get("interview");

      setSelectedInterviewId((currentSelectedId) => {
        if (
          requestedInterviewId &&
          history.some(
            (interview) => getInterviewId(interview) === requestedInterviewId,
          )
        ) {
          return requestedInterviewId;
        }

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
    navigate(`/mock-interview/history?interview=${interviewId}`, {
      replace: true,
    });
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

    const nextInterviewId =
      getInterviewId(updatedInterviews[nextIndex]) || null;

    setSelectedInterviewId(nextInterviewId);

    if (nextInterviewId) {
      navigate(`/mock-interview/history?interview=${nextInterviewId}`, {
        replace: true,
      });
    } else {
      navigate("/mock-interview/history", { replace: true });
    }
  };

  const selectedInterview = interviews.find(
    (interview) => getInterviewId(interview) === selectedInterviewId,
  );

  return (
    <div className="rio-history-page fixed inset-0 overflow-hidden bg-[#111214] text-white">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
        :focus-visible {
          outline: 2px solid rgba(255,255,255,0.72);
          outline-offset: 3px;
        }
`}</style>
      <style>{`
        @keyframes rioHistoryEnter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes rioHistorySoftFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes rioHistoryModal {
          from { opacity: 0; transform: translateY(12px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .rio-history-page {
          animation: rioHistoryEnter 360ms cubic-bezier(.22,1,.36,1);
        }

        .rio-history-item {
          animation: rioHistoryEnter 320ms cubic-bezier(.22,1,.36,1) both;
        }

        .rio-history-modal {
          animation: rioHistoryModal 220ms cubic-bezier(.22,1,.36,1);
        }

        @media (prefers-reduced-motion: reduce) {
          .rio-history-page,
          .rio-history-item,
          .rio-history-modal {
            animation: none !important;
          }
        }
      `}</style>

      {/* Ambient depth: monochrome only, so semantic colors remain meaningful. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />

      <div className="relative z-10 flex h-full min-h-0">
        {/* History rail */}
        <aside
          className={`absolute inset-y-4 left-4 z-50 flex w-[min(292px,calc(100vw-1rem))] max-w-none flex-col overflow-hidden rounded-[18px] border border-white/[0.10] bg-[#111214] shadow-[0_24px_80px_rgba(0,0,0,.42),inset_0_1px_0_rgba(255,255,255,.035)] backdrop-blur-2xl transition-transform duration-300 lg:inset-y-5 lg:left-5 lg:max-w-none lg:translate-x-0 ${
            mobileHistoryOpen
              ? "translate-x-0"
              : "-translate-x-[calc(100%+1rem)]"
          }`}
        >
          <div className="shrink-0 border-b border-white/[0.065] bg-white/[0.012] px-5 pb-5 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#6B6D73]">
                  Your practice
                </p>
                <h1 className="mt-2 text-[19px] font-semibold tracking-[-0.035em] text-white">
                  Interview history
                </h1>
                <p className="mt-1.5 max-w-[205px] text-[11px] leading-5 text-[#70727A]">
                  A quiet record of the rounds you have completed.
                </p>
              </div>

              <button
                type="button"
                onClick={loadInterviewHistory}
                disabled={loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#9B9DA4] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Refresh interview history"
              >
                <FiRefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>

            {!loading && !error && interviews.length > 0 && (
              <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#52545B]">
                  Completed rounds
                </span>
                <span className="text-xs font-semibold tabular-nums text-[#D4D4D8]">
                  {interviews.length}
                </span>
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {loading && (
              <div className="flex min-h-[300px] items-center justify-center px-5">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-white/80" />
                  <p className="text-[11px] text-[#696B72]">
                    Loading your rounds…
                  </p>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="px-5 py-8">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EAB308]" />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        History is unavailable
                      </p>
                      <p className="mt-2 text-[11px] leading-5 text-[#70727A]">
                        {error}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={loadInterviewHistory}
                    className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-[11px] font-semibold text-white transition-all duration-200 hover:bg-white/[0.09]"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && interviews.length === 0 && (
              <div className="flex min-h-[390px] flex-col justify-center px-6">
                <div className="h-px w-10 bg-white/20" />
                <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#66686F]">
                  First round
                </p>
                <p className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-white">
                  Nothing here yet.
                </p>
                <p className="mt-3 max-w-[220px] text-[11px] leading-5 text-[#70727A]">
                  Complete a mock interview and this becomes your personal
                  practice record.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/mock-interview/new")}
                  className="mt-6 w-fit rounded-xl bg-white px-4 py-2.5 text-[11px] font-semibold text-[#111214] shadow-[0_12px_30px_rgba(0,0,0,.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#EDEDEF]"
                >
                  Start an interview
                </button>
              </div>
            )}

            {!loading && !error && interviews.length > 0 && (
              <div className="py-2">
                {interviews.map((interview, index) => {
                  const interviewId = getInterviewId(interview);
                  const isSelected = interviewId === selectedInterviewId;
                  const interviewDate =
                    interview.createdAt || interview.startedAt;

                  return (
                    <button
                      key={interviewId}
                      type="button"
                      onClick={() => handleSelectInterview(interviewId)}
                      className={`rio-history-item group relative flex w-full items-center gap-3 border-b border-white/[0.045] px-5 py-4 text-left transition-all duration-200 ${
                        isSelected
                          ? "bg-white/[0.065]"
                          : "hover:bg-white/[0.03]"
                      }`}
                      style={{ animationDelay: `${Math.min(index, 8) * 28}ms` }}
                    >
                      {isSelected && (
                        <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-white" />
                      )}

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? "border-white/15 bg-white/[0.08] text-white"
                            : "border-white/[0.08] bg-white/[0.025] text-[#696B72] group-hover:border-white/12 group-hover:text-[#A1A1A5]"
                        }`}
                      >
                        <FiClock size={14} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-xs font-semibold leading-4 tracking-[-0.01em] text-white">
                            {interview.role || "Mock Interview"}
                          </p>
                          <span className="mt-1 block text-[8px] font-medium uppercase tracking-[0.08em] text-[#66686F]">
                            {formatInterviewType(interview.interviewType)}
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#55575E]">
                          <span>{formatDate(interviewDate)}</span>
                          {formatTime(interviewDate) && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{formatTime(interviewDate)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[13px] font-semibold tabular-nums text-[#E4E4E7]">
                          {formatScore(interview.overallScore)}
                        </p>
                        <p className="mt-0.5 text-[8px] uppercase tracking-[0.12em] text-[#4F5157]">
                          score
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Mobile rail backdrop */}
        {mobileHistoryOpen && (
          <button
            type="button"
            aria-label="Close interview history"
            onClick={() => setMobileHistoryOpen(false)}
            className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
          />
        )}

        {/* Report workspace */}
        <main className="min-w-0 flex-1 overflow-hidden pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-[312px]">
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex h-14 shrink-0 items-center border-b border-white/[0.07] bg-[#111214]/80 px-4 backdrop-blur-xl lg:hidden">
              <button
                type="button"
                onClick={() => setMobileHistoryOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#A1A1AA] transition-all duration-200 hover:bg-white/[0.08] hover:text-white"
                aria-label="Open interview history"
              >
                <FiMenu size={16} />
              </button>

              <div className="ml-3 min-w-0">
                <p className="truncate text-xs font-semibold text-white">
                  {selectedInterview?.role || "Interview report"}
                </p>
                <p className="text-[9px] uppercase tracking-[0.14em] text-[#55575E]">
                  Performance review
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {selectedInterview ? (
                <div className="rio-history-item min-h-full">
                  <InterviewReport
                    interviewId={selectedInterviewId}
                    onDeleted={handleInterviewDeleted}
                  />
                </div>
              ) : (
                <div className="flex min-h-full items-center justify-center px-6 py-20">
                  <div className="rio-history-item w-full max-w-lg text-center">
                    <div className="mx-auto h-px w-12 bg-white/20" />

                    <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5F6168]">
                      Review workspace
                    </p>

                    <h2 className="mt-3 text-[25px] font-semibold tracking-[-0.045em] text-white sm:text-[30px]">
                      Your performance has a story.
                    </h2>

                    <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#73757D]">
                      Select a completed interview to see what went well, where
                      you lost ground, and what to work on next.
                    </p>

                    <p className="mt-5 text-xs italic text-[#4F5157]">
                      Practice. Review. Improve.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate("/mock-interview/new")}
                      className="mt-7 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-[#111214] shadow-[0_14px_34px_rgba(0,0,0,.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#EDEDEF]"
                    >
                      Start an interview
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
