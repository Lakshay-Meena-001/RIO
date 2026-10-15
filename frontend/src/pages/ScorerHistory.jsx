import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiFileText,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { getResumes, getResumeById } from "../api/resume.api";
import ScorerReport from "./ScorerReport";

const getId = (item) => String(item?._id || item?.id || item?.resumeId || "");
const getDate = (item) =>
  item?.analyzedAt || item?.createdAt || item?.updatedAt || null;
const getScore = (item) => {
  const raw = item?.analysis?.score ?? item?.score;
  const score = Number(raw);
  return Number.isFinite(score)
    ? Math.max(0, Math.min(100, Math.round(score)))
    : null;
};
const getTitle = (item) =>
  item?.profile?.name ||
  item?.analysis?.candidateName ||
  item?.fileName ||
  item?.originalName ||
  item?.name ||
  "Resume analysis";
const getSubtitle = (item) =>
  item?.profile?.headline ||
  item?.profile?.title ||
  item?.profile?.currentRole ||
  item?.fileName ||
  item?.originalName ||
  "Resume assessment";
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
const unwrap = (response) => response?.data ?? response ?? null;
const FLOATING_PANEL =
  "absolute inset-y-4 left-4 z-50 flex w-[min(282px,calc(100vw-1rem))] flex-col overflow-hidden rounded-[18px] border border-white/[0.11] bg-[#111315]/95 shadow-[0_24px_80px_rgba(0,0,0,.30)] backdrop-blur-xl transition-transform duration-300 lg:inset-y-5 lg:left-5 lg:w-[282px] lg:translate-x-0";

export default function ScorerHistory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const selectedId = searchParams.get("resume") || "";

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = unwrap(await getResumes());
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.resumes)
          ? payload.resumes
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.data?.resumes)
                ? payload.data.resumes
                : [];
      setReports(
        [...list].sort(
          (a, b) =>
            new Date(getDate(b) || 0).getTime() -
            new Date(getDate(a) || 0).getTime(),
        ),
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "We couldn't load your resume history.",
      );
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    let cancelled = false;
    async function loadSelected() {
      if (!selectedId) {
        setSelectedReport(null);
        setDetailLoading(false);
        return;
      }
      const match = reports.find((item) => getId(item) === selectedId);
      if (match?.analysis) {
        setSelectedReport(match);
        setError("");
        setDetailLoading(false);
        return;
      }
      if (loading) return;
      setDetailLoading(true);
      try {
        const payload = unwrap(await getResumeById(selectedId));
        const record =
          payload?.data?.data ??
          payload?.data?.resume ??
          payload?.data ??
          payload?.resume ??
          payload;
        if (
          payload?.success === false ||
          !record ||
          !(getId(record) || record?.analysis)
        ) {
          throw new Error(
            payload?.message || "This resume report could not be found.",
          );
        }
        if (!cancelled) {
          setSelectedReport(record);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setSelectedReport(null);
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "We couldn't load this resume report.",
          );
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }
    void loadSelected();
    return () => {
      cancelled = true;
    };
  }, [selectedId, reports, loading]);

  const filteredReports = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return reports;
    return reports.filter((item) =>
      `${getTitle(item)} ${getSubtitle(item)} ${dateLabel(getDate(item))}`
        .toLowerCase()
        .includes(needle),
    );
  }, [reports, query]);

  const selectReport = (item) => {
    const id = getId(item);
    if (!id) return;
    setError("");
    setSelectedReport(item?.analysis ? item : null);
    setSearchParams({ resume: id });
    setMobileHistoryOpen(false);
  };
  const clearSelection = () => {
    setSelectedReport(null);
    setSearchParams({});
  };

  return (
    <div className="rio-scorer-history fixed inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_48%_0%,rgba(255,255,255,0.055),transparent_38%),#101113] text-white">
      <style>{`
        @keyframes scorerEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .rio-scorer-history { animation: scorerEnter 300ms cubic-bezier(.22,1,.36,1); }
        .scorer-history-item { animation: scorerEnter 260ms both; }
        @media (prefers-reduced-motion: reduce) { .rio-scorer-history, .scorer-history-item { animation: none !important; transition: none !important; } }
      `}</style>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 88% 4%, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 42%, transparent 72%), radial-gradient(ellipse 65% 55% at 0% 92%, rgba(255,255,255,0.035) 0%, transparent 70%), linear-gradient(135deg, #191b1e 0%, #17191c 48%, #141619 100%)",
          }}
        />
      </div>

      <aside
        className={`${FLOATING_PANEL} ${mobileHistoryOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"}`}
      >
        <div className="shrink-0 border-b border-white/[0.065] bg-white/[0.012] px-5 pb-5 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#6B6D73]">
                Your career intelligence
              </p>
              <h1 className="mt-2 text-[19px] font-semibold tracking-[-0.035em]">
                Scorer history
              </h1>
              <p className="mt-1.5 text-[11px] leading-5 text-[#858994]">
                Saved assessments, scores and next steps — all in one place.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadHistory()}
              disabled={loading}
              aria-label="Refresh resume history"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#9B9DA4] transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
            >
              <FiRefreshCw
                size={13}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
            <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#52545B]">
              Saved reports
            </span>
            <span className="text-xs font-semibold tabular-nums text-[#D4D4D8]">
              {reports.length}
            </span>
          </div>
          <label className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 focus-within:border-white/20">
            <FiSearch size={13} className="shrink-0 text-[#686B74]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a report…"
              className="w-full min-w-0 bg-transparent text-xs text-white outline-none placeholder:text-[#62656D]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-[#777B85] hover:text-white"
              >
                <FiX size={13} />
              </button>
            )}
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading && (
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-white/80" />
                <p className="text-[11px] text-[#696B72]">Loading reports…</p>
              </div>
            </div>
          )}
          {!loading && !error && filteredReports.length === 0 && (
            <div className="px-5 py-12">
              <div className="h-px w-10 bg-white/20" />
              <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#66686F]">
                {query ? "No matches" : "A fresh start"}
              </p>
              <h2 className="mt-2 text-[17px] font-semibold tracking-[-0.03em]">
                {query ? "Nothing found." : "No reports yet."}
              </h2>
              <p className="mt-3 text-[11px] leading-5 text-[#70727A]">
                {query
                  ? "Try another name or clear your search."
                  : "Analyze your resume and your saved report will appear here."}
              </p>
              {!query && (
                <button
                  type="button"
                  onClick={() => navigate("/scorer")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-[#17191C]"
                >
                  Analyze a resume <FiArrowRight size={13} />
                </button>
              )}
            </div>
          )}
          {!loading &&
            filteredReports.map((item, index) => {
              const id = getId(item);
              const active = id === selectedId;
              const score = getScore(item);
              return (
                <button
                  key={id || `${getTitle(item)}-${index}`}
                  type="button"
                  onClick={() => selectReport(item)}
                  className={`scorer-history-item group relative flex w-full items-start gap-3 border-b border-white/[0.045] px-5 py-[18px] text-left transition-colors ${active ? "bg-white/[0.065]" : "hover:bg-white/[0.035]"}`}
                  style={{ animationDelay: `${Math.min(index, 8) * 25}ms` }}
                >
                  {active && (
                    <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-white" />
                  )}
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${active ? "border-white/15 bg-white/[0.08] text-white" : "border-white/[0.08] bg-white/[0.025] text-[#777B85] group-hover:text-[#C4C6CC]"}`}
                  >
                    <FiFileText size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block line-clamp-2 text-xs font-semibold leading-4 text-white">
                      {getTitle(item)}
                    </span>
                    <span className="mt-1 block truncate text-[9px] uppercase tracking-[0.09em] text-[#66686F]">
                      {getSubtitle(item)}
                    </span>
                    <span className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[#55575E]">
                        {dateLabel(getDate(item))}
                      </span>
                      
                    </span>
                  </span>
                  <FiArrowRight
                    size={13}
                    className={`mt-1 shrink-0 transition ${active ? "text-white/75" : "text-white/20 group-hover:translate-x-0.5 group-hover:text-white/65"}`}
                  />
                </button>
              );
            })}
        </div>
      </aside>

      {mobileHistoryOpen && (
        <button
          type="button"
          aria-label="Close resume history"
          onClick={() => setMobileHistoryOpen(false)}
          className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <main className="relative z-10 flex h-full min-w-0 flex-1 flex-col overflow-hidden lg:pl-[302px]">
        <div className="mx-6 mt-6 hidden border-b border-white/[0.08] pb-5 lg:block">
          <button
            type="button"
            onClick={() => navigate("/scorer")}
            className="group inline-flex items-center gap-2 text-xs font-medium text-[#71717A] transition hover:text-white"
          >
            <FiArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-0.5"
            />{" "}
            Back to Scorer
          </button>
        </div>
        <div className="flex h-16 shrink-0 items-center border-b border-white/[0.07] bg-[#111214]/75 px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => navigate("/scorer")}
            aria-label="Back to Scorer"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] text-[#D4D4D8]"
          >
            <FiArrowLeft size={15} />
          </button>
          <div className="ml-3 min-w-0 border-l border-white/[0.09] pl-3">
            <p className="truncate text-xs font-semibold text-white">
              {selectedReport ? getTitle(selectedReport) : "Resume workspace"}
            </p>
            <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-[#858994]">
              Resume scoring & insights
            </p>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-5 sm:px-7 sm:py-8 lg:px-9 lg:py-9 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {error && !selectedReport && (
            <div
              role="alert"
              className="mx-auto mb-5 flex max-w-4xl items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-xs leading-5 text-white/70"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void loadHistory()}
                className="shrink-0 underline underline-offset-4"
              >
                Retry
              </button>
            </div>
          )}
          {detailLoading ? (
            <div className="mx-auto max-w-4xl py-20 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-white/80" />
              <h2 className="mt-4 text-lg font-semibold">Loading report…</h2>
              <p className="mt-2 text-xs text-[#858994]">
                Retrieving your saved assessment.
              </p>
            </div>
          ) : selectedReport ? (
            <ScorerReport
              key={getId(selectedReport)}
              resume={selectedReport}
              onBackToScorer={() => navigate("/scorer")}
            />
          ) : selectedId && error ? (
            <div className="mx-auto mt-12 max-w-lg rounded-[22px] border border-white/[0.10] bg-[#111315]/80 p-8 text-center">
              <FiFileText size={24} className="mx-auto text-[#858994]" />
              <h2 className="mt-4 text-lg font-semibold">Report unavailable</h2>
              <p className="mt-2 text-sm leading-6 text-[#858994]">{error}</p>
              <button
                type="button"
                onClick={clearSelection}
                className="mt-5 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold"
              >
                Back to history
              </button>
            </div>
          ) : (
            <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 py-10 text-center">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.035] text-[#D4D4D8]">
                <FiBarChart2 size={19} />
              </div>
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#858994]">
                Your assessment workspace
              </p>
              <h2 className="text-[25px] font-semibold leading-[1.15] tracking-[-0.045em] sm:text-3xl">
                {reports.length
                  ? "Your resume journey, in one place."
                  : "Make your next move count."}
              </h2>
              <p className="mt-4 max-w-md text-[13px] leading-6 text-[#A1A1AA]">
                {reports.length
                  ? "Choose a saved assessment from your history to review its score, strengths, gaps and recommended next steps."
                  : "Analyze your resume to get a score breakdown and practical suggestions. Your saved reports will stay available here."}
              </p>
              {!reports.length && !loading && (
                <button
                  type="button"
                  onClick={() => navigate("/scorer")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C]"
                >
                  Analyze a resume <FiArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/[0.08] bg-[#111315]/90 px-3 pt-3 backdrop-blur-xl pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMobileHistoryOpen((open) => !open)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-semibold text-[#D4D4D8]"
          >
            <FiArrowLeft size={14} /> History
          </button>
          <button
            type="button"
            onClick={() => navigate("/scorer")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-[#17191C]"
          >
            <FiBarChart2 size={14} /> New analysis
          </button>
        </div>
      </div>
    </div>
  );
}
