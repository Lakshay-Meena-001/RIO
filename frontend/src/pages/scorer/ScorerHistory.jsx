import MobileActionBar from "../../components/MobileActionBar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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

import { Trash2, Clock3 } from "lucide-react";
import {
  getScoredResumes,
  getScoredResumeById,
  deleteScoredResume,
} from "../../api/resume/resume.api";
import ScorerReport from "./ScorerReport";

const getId = (item) => String(item?._id || item?.id || item?.resumeId || "");
const getDate = (item) =>
  item?.analyzedAt || item?.createdAt || item?.updatedAt || null;

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
  "absolute  top-4 bottom-20 left-4 z-50 flex w-[min(282px,calc(100vw-1rem))] flex-col overflow-hidden rounded-[18px] border border-white/[0.11] bg-[#111315]/95 shadow-[0_24px_80px_rgba(0,0,0,.30)] backdrop-blur-xl transition-transform duration-300 lg:inset-y-5 lg:left-5 lg:w-[282px] lg:translate-x-0";

export default function ScorerHistory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const selectedId = searchParams.get("resume") || "";

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = unwrap(await getScoredResumes());
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
    const timer = setTimeout(() => {
      void loadHistory();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadHistory]);
  useEffect(() => {
    if (loading || selectedId || reports.length === 0) return;

    const latestId = getId(reports[0]);

    if (latestId) {
      setSearchParams({ resume: latestId }, { replace: true });
    }
  }, [loading, selectedId, reports, setSearchParams]);

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
        const payload = unwrap(await getScoredResumeById(selectedId));
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

  const pages = Math.max(1, Math.ceil(filteredReports.length / pageSize));

  const safePage = Math.min(page, pages);

  const paginatedReports = useMemo(
    () => filteredReports.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredReports, safePage, pageSize],
  );

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

  const handleDeleteHistory = () => {
    if (!getId(selectedReport) || deleting) return;
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const deleteResumeNow = async () => {
    const resumeId = getId(selectedReport);

    if (!resumeId || deleting) {
      setDeleteError("Unable to identify this resume report.");
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      const result = await deleteScoredResume(resumeId);
      if (result?.success === false) {
        throw new Error(
          result?.message || "Unable to delete this resume report.",
        );
      }

      const remainingReports = reports.filter(
        (report) => getId(report) !== resumeId,
      );

      setReports(remainingReports);
      setSelectedReport(null);
      setShowDeleteModal(false);
      setDeleteError("");

      if (remainingReports.length > 0) {
        setSearchParams(
          { resume: getId(remainingReports[0]) },
          { replace: true },
        );
      } else {
        setSearchParams({}, { replace: true });
      }
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete this resume report.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const closeDelete = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setDeleteError("");
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
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
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
            paginatedReports.map((item, index) => {
              const id = getId(item);
              const active = id === selectedId;
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

        <div className="shrink-0 border-t border-white/[.07] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] text-[#858994]">
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 disabled:opacity-30"
              >
                <FiArrowLeft />
              </button>
              <button
                type="button"
                disabled={page >= pages || loading}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
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
          aria-label="Close resume history"
          onClick={() => setMobileHistoryOpen(false)}
          className="fixed inset-0 z-40 backdrop-blur-xl bg-black/45 lg:hidden"
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
        <div className="rio-history-mobile-header flex h-16 shrink-0 items-center border-b border-white/[0.07] bg-[#111214]/75 px-4 backdrop-blur-xl lg:hidden">
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
          {selectedReport && (
            <button
              type="button"
              onClick={handleDeleteHistory}
              disabled={deleting}
              aria-label="Delete resume report"
              className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] text-white transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            >
              <Trash2 size={16} />
            </button>
          )}
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
              onDeleteHistory={handleDeleteHistory}
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

      <MobileActionBar className="lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMobileHistoryOpen((open) => !open)}
            className="inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-[#D4D4D8] transition-colors duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            <Clock3 size={14} /> My Assessments
          </button>
          <button
            type="button"
            onClick={() => navigate("/scorer")}
            className="inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#17191C] transition-colors duration-200 hover:bg-[#E8E8EB] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <FiBarChart2 size={14} /> New analysis
          </button>
        </div>
      </MobileActionBar>

      {showDeleteModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-resume-title"
          >
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#191B1E]/95 p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="delete-resume-title"
                    className="text-base font-semibold"
                  >
                    Delete resume report?
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-[#858994]">
                    This action cannot be undone. This resume report and its
                    saved analysis will be permanently deleted from your
                    history. Other reports will remain untouched.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDelete}
                  disabled={deleting}
                  aria-label="Close"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#858994] transition hover:bg-white/[.08] disabled:opacity-50"
                >
                  <FiX size={15} />
                </button>
              </div>
              {deleteError && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-white/[.08] px-3 py-2.5 text-xs leading-5 text-[#D4D4D8]"
                >
                  {deleteError}
                </p>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeDelete}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs font-medium hover:bg-white/[.08] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deleteResumeNow}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#111214] hover:bg-[#EDEDEF] disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
