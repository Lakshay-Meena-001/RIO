import MobileActionBar from "../../components/MobileActionBar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import InterviewReport from "./InterviewReport";
import {
  FiArrowLeft,
  FiArrowRight,
  FiClock,
  FiRefreshCw,
  FiTrash2,
  FiSearch,
  FiX,
  FiActivity,
  FiCheckCircle,
  FiTarget,
  FiPlay,
  FiPlus,
} from "react-icons/fi";

import { getInterviewHistory } from "../../api/interview/interview.api";
import useDrawerSwipe from "../../hooks/useDrawerSwipe";

const getId = (item) => item?._id || item?.id || item?.interviewId || null;
const dateOf = (item) => item?.createdAt || item?.startedAt || item?.updatedAt;
const dateLabel = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};
const timeLabel = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};
const typeLabel = (type) =>
  ({
    dsa: "DSA",
    coding: "Coding",
    core: "Core CS",
    development: "Development",
    project: "Project",
    "system-design": "System Design",
    behavioral: "Behavioral",
    full: "Full Interview",
  })[type] ||
  type ||
  "Mock Interview";
const scoreLabel = (value) =>
  Number.isFinite(Number(value)) && value !== null && value !== ""
    ? `${Number(value).toFixed(1)}/10`
    : "—";

const Sidebar = ({ interview }) => {
  const questions = Array.isArray(interview?.questions)
    ? interview.questions
    : [];
  const answered = questions.filter(
    (q) => q?.submittedAt || q?.answer?.trim(),
  ).length;
  const evaluated = questions.filter(
    (q) => q?.evaluation && Number.isFinite(Number(q.evaluation.score)),
  );
  const score = Number(interview?.overallScore);
  const validScore =
    interview?.overallScore !== null &&
    interview?.overallScore !== "" &&
    Number.isFinite(score);
  const percent = validScore ? Math.max(0, Math.min(100, score * 10)) : 0;
  const status = interview?.status || "unknown";
  return (
    <aside className="hidden xl:flex absolute inset-y-5 right-5 z-20 w-[260px] flex-col overflow-hidden rounded-[18px] border border-white/[.09] bg-white/[.018]">
      <div className="min-h-0 flex-1 overflow-y-auto p-5 [scrollbar-width:none]">
        <p className="text-[9px] font-semibold uppercase tracking-[.22em] text-[#6B6D73]">
          Your practice
        </p>
        <h2 className="mt-2 text-[17px] font-semibold tracking-[-.035em]">
          Interview highlights
        </h2>
        <p className="mt-1.5 text-[11px] leading-5 text-[#70727A]">
          A concise snapshot of this interview and its key takeaways.
        </p>
        <div className="mt-5 border-t border-white/[.07] pt-4 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[.16em] text-[#66686F]">
            Selected interview
          </span>
          <span className="text-xs font-semibold text-[#D4D4D8]">
            {interview ? "1" : "0"}
          </span>
        </div>
        {interview ? (
          <>
            <div className="mt-5 flex items-center gap-3">
              <div className="relative h-[68px] w-[68px] shrink-0">
                <svg viewBox="0 0 68 68" className="h-full w-full -rotate-90">
                  <circle
                    cx="34"
                    cy="34"
                    r="27"
                    fill="none"
                    stroke="rgba(255,255,255,.09)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="34"
                    cy="34"
                    r="27"
                    fill="none"
                    stroke="rgba(255,255,255,.88)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 27}
                    strokeDashoffset={2 * Math.PI * 27 * (1 - percent / 100)}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                  {validScore ? `${Math.round(percent)}%` : "—"}
                </span>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-[-.04em]">
                  {validScore ? score.toFixed(1) : "—"}
                  <span className="ml-1 text-xs font-normal text-[#777B85]">
                    / 10
                  </span>
                </p>
                <p className="mt-1 text-[10px] text-[#858994]">Overall score</p>
              </div>
            </div>
            <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[.08]">
              <div
                className="h-full rounded-full bg-white/80"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-5 space-y-3">
              {[
                ["Questions", questions.length, <FiTarget key="i" size={13} />],
                ["Answered", answered, <FiCheckCircle key="i" size={13} />],
                [
                  "Evaluated",
                  evaluated.length,
                  <FiActivity key="i" size={13} />,
                ],
                [
                  "Status",
                  String(status).replace(/[-_]/g, " "),
                  <FiClock key="i" size={13} />,
                ],
              ].map(([label, value, icon]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="flex items-center gap-2 text-[#858994]">
                    {icon}
                    {label}
                  </span>
                  <span className="max-w-[110px] truncate text-right font-semibold capitalize text-[#D4D4D8]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-white/[.07] pt-4">
              <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#777B85]">
                Interview details
              </p>
              <div className="mt-3 space-y-3 text-[11px]">
                <div className="flex justify-between gap-3">
                  <span className="text-[#777B85]">Type</span>
                  <span className="text-right text-[#D4D4D8]">
                    {typeLabel(interview.interviewType)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#777B85]">Date</span>
                  <span className="text-right text-[#D4D4D8]">
                    {dateLabel(dateOf(interview))}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#777B85]">Time limit</span>
                  <span className="text-right text-[#D4D4D8]">
                    {interview.timeLimit ? `${interview.timeLimit} min` : "—"}
                  </span>
                </div>
              </div>
            </div>
            {Array.isArray(interview.strengths) &&
              interview.strengths.length > 0 && (
                <div className="mt-5 border-t border-white/[.07] pt-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#777B85]">
                    Strongest takeaway
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#D4D4D8]">
                    {interview.strengths[0]}
                  </p>
                </div>
              )}
          </>
        ) : (
          <p className="mt-6 text-xs leading-6 text-[#70727A]">
            Select an interview to see its score, completion and review
            highlights.
          </p>
        )}
      </div>
    </aside>
  );
};

export default function InterviewHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [interviews, setInterviews] = useState([]);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  useDrawerSwipe(mobileHistoryOpen, setMobileHistoryOpen, "left");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 10;
  const [deleteRequest, setDeleteRequest] = useState(false);

  const loadInterviewHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getInterviewHistory();

      if (!result?.success) {
        throw new Error(result?.message || "Failed to load interview history.");
      }

      const history = Array.isArray(result.data) ? result.data : [];
      setInterviews(history);

      const requested = searchParams.get("interview");

      setSelectedInterviewId((current) => {
        if (requested && history.some((item) => getId(item) === requested)) {
          return requested;
        }

        if (current && history.some((item) => getId(item) === current)) {
          return current;
        }

        return getId(history[0]);
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load your interview history.",
      );
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getInterviewHistory();

        if (cancelled) return;

        if (!result?.success) {
          throw new Error(
            result?.message || "Failed to load interview history.",
          );
        }

        const history = Array.isArray(result.data) ? result.data : [];
        setInterviews(history);

        const requested = searchParams.get("interview");

        setSelectedInterviewId((current) => {
          if (requested && history.some((item) => getId(item) === requested)) {
            return requested;
          }

          if (current && history.some((item) => getId(item) === current)) {
            return current;
          }

          return getId(history[0]);
        });

        setError("");
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load your interview history.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const selectedInterview =
    interviews.find((item) => getId(item) === selectedInterviewId) || null;
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return !query
      ? interviews
      : interviews.filter((item) =>
          [item.role, item.interviewType, item.status].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query),
          ),
        );
  }, [interviews, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedInterviews = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const selectInterview = (id) => {
    if (!id) return;
    setSelectedInterviewId(id);
    setMobileHistoryOpen(false);
    navigate(`/mock-interview/history?interview=${encodeURIComponent(id)}`, {
      replace: true,
    });
  };
  const handleDeleted = (deletedId) => {
    const remaining = interviews.filter((item) => getId(item) !== deletedId);
    setInterviews(remaining);
    const next = getId(remaining[0]) || null;
    setSelectedInterviewId(next);
    navigate(
      next
        ? `/mock-interview/history?interview=${encodeURIComponent(next)}`
        : "/mock-interview/history",
      { replace: true },
    );
  };

  return (
    <div className="rio-interview-history fixed inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_48%_0%,rgba(255,255,255,.055),transparent_38%),#101113] text-white">
      <style>{`
      @keyframes rioInterviewEnter {from{opacity:0}to{opacity:1}}
      .rio-interview-history{animation:rioInterviewEnter 280ms cubic-bezier(.22,1,.36,1)}
      .rio-interview-item{animation:rioInterviewEnter 260ms both}
      @media(prefers-reduced-motion:reduce){.rio-interview-history,.rio-interview-item{animation:none!important;transition:none!important}}
    `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 88% 4%,rgba(255,255,255,.075),transparent 72%),radial-gradient(ellipse 65% 55% at 0% 92%,rgba(255,255,255,.035),transparent 70%),linear-gradient(135deg,#191b1e 0%,#17191c 48%,#141619 100%)",
        }}
      />
      <div className="relative z-10 flex h-full min-h-0">
        <aside
          className={`absolute top-4 bottom-20 left-4 z-50 flex w-[80vw] max-w-[360px] flex-col overflow-hidden rounded-[24px] border border-white/[.10] bg-[#111315]/95 shadow-[0_24px_80px_rgba(0,0,0,.32)] backdrop-blur-xl transition-transform duration-300 lg:inset-y-5 lg:left-5 lg:w-[min(282px,calc(100vw-2rem))] lg:translate-x-0 ${mobileHistoryOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"}`}
        >
          <div className="shrink-0 border-b border-white/[.065] bg-white/[.012] px-5 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[.22em] text-[#6B6D73]">
                  Your practice
                </p>
                <h1 className="mt-2 text-[19px] font-semibold tracking-[-.035em]">
                  My Interviews
                </h1>
                <p className="mt-1.5 max-w-[205px] text-[11px] leading-5 text-[#70727A]">
                  Every round, result and next step — in one place.
                </p>
              </div>
              <button
                type="button"
                onClick={loadInterviewHistory}
                disabled={loading}
                aria-label="Refresh interview history"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[.045] text-[#9B9DA4] transition hover:bg-white/[.08] hover:text-white disabled:opacity-50"
              >
                <FiRefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/[.06] pt-3">
              <span className="text-[9px] font-medium uppercase tracking-[.16em] text-[#52545B]">
                Saved interviews
              </span>
              <span className="text-xs font-semibold tabular-nums text-[#D4D4D8]">
                {interviews.length}
              </span>
            </div>
            <label className="mt-3 flex items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.025] px-3 py-2.5 ">
              <FiSearch size={13} className="shrink-0 text-[#686B74]" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Find an interview…"
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#62656D]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                >
                  <FiX size={13} />
                </button>
              )}
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none]">
            {loading && (
              <div className="flex min-h-[200px] items-center justify-center">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/80" />
              </div>
            )}
            {!loading && error && (
              <div className="px-5 py-6">
                <p className="text-xs font-semibold">History is unavailable</p>
                <p className="mt-2 text-[11px] leading-5 text-[#858994]">
                  {error}
                </p>
                <button
                  onClick={loadInterviewHistory}
                  className="mt-4 rounded-xl border border-white/10 px-3 py-2 text-xs"
                >
                  Try again
                </button>
              </div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div className="px-5 py-10">
                <div className="h-px w-10 bg-white/20" />
                <p className="mt-5 text-[9px] uppercase tracking-[.2em] text-[#66686F]">
                  {search ? "No matches" : "First round"}
                </p>
                <p className="mt-2 text-[17px] font-semibold">
                  {search ? "Nothing found." : "Nothing here yet."}
                </p>
                <p className="mt-2 text-[11px] leading-5 text-[#70727A]">
                  {search
                    ? "Try a different search."
                    : "Complete a mock interview and your review will appear here."}
                </p>
                {!search && (
                  <button
                    onClick={() => navigate("/mock-interview/new")}
                    className="mt-5 rounded-xl bg-white px-4 py-2.5 text-[11px] font-semibold text-[#111214]"
                  >
                    Start an interview{" "}
                    <FiPlay className="ml-1 inline" size={12} />
                  </button>
                )}
              </div>
            )}
            {!loading &&
              paginatedInterviews.map((item, index) => {
                const id = getId(item),
                  active = id === selectedInterviewId,
                  date = dateOf(item);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectInterview(id)}
                    className={`rio-interview-item group relative flex w-full items-start gap-3 border-b border-white/[.045] px-5 py-4 text-left transition-colors ${active ? "bg-white/[.065]" : "hover:bg-white/[.03]"}`}
                    style={{ animationDelay: `${Math.min(index, 8) * 24}ms` }}
                  >
                    {active && (
                      <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-white" />
                    )}
                    <span
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${active ? "border-white/15 bg-white/[.08] text-white" : "border-white/[.08] bg-white/[.025] text-[#777B85]"}`}
                    >
                      <FiClock size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block line-clamp-2 text-xs font-semibold leading-4 text-white">
                        {item.role || "Mock Interview"}
                      </span>
                      <span className="mt-1 block truncate text-[8px] uppercase tracking-[.08em] text-[#66686F]">
                        {typeLabel(item.interviewType)}
                      </span>
                      <span className="mt-2 flex flex-wrap items-center gap-x-2 text-[10px] text-[#62656D]">
                        <span>{dateLabel(date)}</span>
                        {timeLabel(date) && <span>· {timeLabel(date)}</span>}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[13px] font-semibold tabular-nums text-[#E4E4E7]">
                        {scoreLabel(item.overallScore)}
                      </span>
                      <span className="mt-0.5 block text-[8px] uppercase tracking-[.12em] text-[#4F5157]">
                        score
                      </span>
                    </span>
                  </button>
                );
              })}
          </div>
          <div className="shrink-0 border-t border-white/[.07] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-[#858994]">
                Page {page} of {pages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  aria-label="Previous page"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 disabled:opacity-30"
                >
                  <FiArrowLeft />
                </button>
                <button
                  type="button"
                  disabled={page >= pages || loading}
                  onClick={() =>
                    setPage((current) => Math.min(pages, current + 1))
                  }
                  aria-label="Next page"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 disabled:opacity-30"
                >
                  <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        </aside>
        {mobileHistoryOpen && (
          <button
            type="button"
            aria-label="Close interview history"
            onClick={() => setMobileHistoryOpen(false)}
            className="fixed inset-0 z-40 backdrop-blur-xl bg-black/45 lg:hidden"
          />
        )}
        <Sidebar interview={selectedInterview} />
        <main className="min-w-0 flex-1 overflow-hidden pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-[300px] xl:pr-[292px]">
          <div className="flex h-full min-h-0 flex-col">
            <div className="mt-6 mx-6 hidden border-b border-white/[.08] pb-5 lg:block">
              <button
                type="button"
                onClick={() => navigate("/mock-interview")}
                className="group inline-flex items-center gap-2 text-xs font-medium text-[#71717A] transition hover:text-white"
              >
                <FiArrowLeft
                  size={14}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
                Back to mock interviews
              </button>
            </div>

            <div className="rio-history-mobile-header flex h-16 shrink-0 items-center justify-between border-b border-white/[.07] bg-[#111214]/75 px-4 backdrop-blur-xl lg:hidden">
              <button
                type="button"
                onClick={() => navigate("/mock-interview")}
                aria-label="Back to mock interviews"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] text-[#D4D4D8]"
              >
                <FiArrowLeft size={15} />
              </button>
              <div className="ml-3 min-w-0 border-l border-white/[0.09] pl-3">
                <p className="truncate text-xs font-semibold">
                  {selectedInterview?.role || "Interview workspace"}
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-[#858994]">
                  Performance review
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteRequest(true)}
                disabled={!selectedInterviewId}
                aria-label="Delete interview"
                className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] text-white transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              >
                <FiTrash2 size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none]">
              {selectedInterviewId ? (
                <InterviewReport
                  interviewId={selectedInterviewId}
                  initialInterview={selectedInterview}
                  onDeleted={handleDeleted}
                  embedded
                  deleteRequest={deleteRequest}
                  onDeleteRequestHandled={() => setDeleteRequest(false)}
                />
              ) : (
                <div className="flex min-h-full items-center justify-center px-6 py-16">
                  <div className="max-w-lg text-center">
                    <div className="mx-auto h-px w-12 bg-white/25" />
                    <p className="mt-6 text-[9px] font-semibold uppercase tracking-[.22em] text-[#66686F]">
                      Review workspace
                    </p>
                    <h2 className="mt-3 text-[26px] font-semibold tracking-[-.045em] sm:text-3xl">
                      {loading
                        ? "Preparing your interview history…"
                        : "Your performance has a story."}
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#858994]">
                      {loading
                        ? "Your saved rounds and reports will appear here."
                        : "Select a completed interview to review your score, answers and what to improve next."}
                    </p>
                    {!loading && !interviews.length && (
                      <button
                        onClick={() => navigate("/mock-interview/new")}
                        className="mt-6 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-[#111214]"
                      >
                        Start an interview{" "}
                        <FiPlay className="ml-1 inline" size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <MobileActionBar className="lg:hidden">
        <div className="mx-auto grid w-full grid-cols-2 gap-2 md:grid-cols-3">
          <button
            type="button"
            onClick={() => setMobileHistoryOpen((open) => !open)}
            className="inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[.035] px-2 text-xs font-semibold text-[#D4D4D8]"
          >
            <FiClock size={14} /> My Interviews
          </button>
          <button
            type="button"
            onClick={() => setDeleteRequest(true)}
            disabled={!selectedInterviewId}
            className="hidden h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/[.07] px-2 text-xs font-semibold text-rose-200 disabled:opacity-40 md:inline-flex"
          >
            <FiTrash2 size={14} /> Delete
          </button>
          <button
            type="button"
            onClick={() => navigate("/mock-interview/new")}
            className="inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full bg-white px-2 text-xs font-semibold text-[#17191C]"
          >
            <FiPlus size={14} /> Start an Interview
          </button>
        </div>
      </MobileActionBar>
    </div>
  );
}
