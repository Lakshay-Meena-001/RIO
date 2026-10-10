import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import RoadmapDetailPage from "./RoadmapDetailPage.jsx";

import {
  FiArrowRight,
  FiBookOpen,
  FiMenu,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  deleteRoadmap,
  getRoadmap,
  getRoadmaps,
  getRoadmapTemplate,
} from "../../api/roadmap.api";

const unwrap = (response) => response?.data ?? response ?? null;

const getId = (item) => String(item?._id || item?.id || "");

const getProgress = (item) =>
  Math.max(0, Math.min(100, Number(item?.progress?.percentage) || 0));

const formatDate = (value) => {
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

const FLOATING_SIDEBAR =
  "absolute inset-y-5 w-[min(282px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[18px] border border-white/[0.10] bg-[#111214] shadow-[0_24px_80px_rgba(0,0,0,.30)]";

function ProgressRing({ value }) {
  const radius = 28;

  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative h-[72px] w-[72px] shrink-0">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,.08)"
          strokeWidth="5"
        />

        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,.88)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>

      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums text-white">
        {value}%
      </span>
    </div>
  );
}

function FloatingProgressSidebar({
  roadmap,

  template,

  onDelete,

  deleteLoading,
}) {
  const states = Array.isArray(roadmap?.nodes) ? roadmap.nodes : [];

  const nodes = Array.isArray(template?.nodes) ? template.nodes : [];

  const progress = getProgress(roadmap);

  const completed = states.filter((node) => node.status === "completed").length;

  const learning = states.filter((node) => node.status === "learning").length;

  const skipped = states.filter((node) => node.status === "skipped").length;

  const total =
    Number(roadmap?.progress?.total) || nodes.length || states.length;

  const remaining = Math.max(0, total - completed - skipped);

  const focusNode = nodes.find(
    (node) => node.id === roadmap?.currentFocus?.nodeId,
  );

  const hasRoadmap = Boolean(roadmap);

  return (
    <aside
      className={`${FLOATING_SIDEBAR} right-4 z-30 hidden lg:inset-y-5 lg:right-5 lg:flex`}
    >
      <div className="min-h-0 flex-1 overflow-y-auto p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#6B6D73]">
              Your learning
            </p>

            <h2 className="mt-2 text-[17px] font-semibold tracking-[-0.035em] text-white">
              Roadmap progress
            </h2>

            <p className="mt-1.5 text-[11px] leading-5 text-[#70727A]">
              Progress, focus and next steps — in one place.
            </p>
          </div>

          <span
            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${hasRoadmap ? "bg-white/80" : "bg-white/15"}`}
          />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#52545B]">
            Selected roadmap
          </span>

          <span className="text-xs font-semibold tabular-nums text-[#D4D4D8]">
            {hasRoadmap ? "1" : "0"}
          </span>
        </div>

        {!hasRoadmap ? (
          <div className="mt-5 border-t border-white/[0.06] pt-7">
            <div className="h-px w-10 bg-white/20" />

            <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#66686F]">
              A fresh start
            </p>

            <h3 className="mt-2 text-[17px] font-semibold tracking-[-0.03em] text-white">
              No roadmap selected.
            </h3>

            <p className="mt-3 text-[11px] leading-5 text-[#70727A]">
              Choose a roadmap from your history and its progress details will
              appear here.
            </p>

            <div className="mt-6 space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5">
              {[
                "Overall progress",

                "Completed topics",

                "Current focus",

                "Study pace",
              ].map((label) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-[10px] text-[#55575E]">{label}</span>

                  <span className="h-2 w-10 rounded-full bg-white/[0.055]" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 flex items-center gap-4">
              <ProgressRing value={progress} />

              <div>
                <p className="text-2xl font-semibold tracking-[-0.04em] text-white">
                  {progress}%
                </p>

                <p className="mt-1 text-[10px] text-[#858994]">
                  roadmap completed
                </p>
              </div>
            </div>

            <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-white/80 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-5 space-y-3">
              {[
                ["Completed", completed],

                ["In progress", learning],

                ["Remaining", remaining],

                ["Skipped", skipped],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-[#858994]">{label}</span>

                  <span className="font-semibold tabular-nums text-[#E4E4E7]">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-white/[0.07] pt-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#777B85]">
                Current focus
              </p>

              <p className="mt-2 text-sm font-semibold text-white">
                {focusNode?.title ||
                  focusNode?.name ||
                  roadmap.currentFocus?.title ||
                  "Continue your learning path"}
              </p>

              <p className="mt-1 text-[10px] leading-5 text-[#858994]">
                {roadmap.currentFocus?.reason ||
                  "Pick up the next unfinished topic and keep your momentum."}
              </p>

              <button
                type="button"
                onClick={() =>
                  document

                    .getElementById(
                      `roadmap-topic-${roadmap.currentFocus?.nodeId}`,
                    )

                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
                className="mt-4 w-full rounded-xl border border-white/[0.1] bg-white/[0.035] px-3 py-2.5 text-[11px] font-semibold text-[#D4D4D8] transition hover:bg-white/[0.08]"
              >
                Go to current topic{" "}
                <FiArrowRight className="ml-1 inline" size={12} />
              </button>
            </div>

            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#777B85]">
                Roadmap details
              </p>

              <div className="mt-3 space-y-3 text-[11px]">
                <div className="flex justify-between gap-3">
                  <span className="text-[#777B85]">Created</span>

                  <span className="text-right text-[#D4D4D8]">
                    {formatDate(roadmap.createdAt)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#777B85]">Study pace</span>

                  <span className="text-right text-[#D4D4D8]">
                    {roadmap.profile?.availableHoursPerDay || 2} hours / day
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#777B85]">Learning steps</span>

                  <span className="text-right text-[#D4D4D8]">{total}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-white/[0.065] p-4">
        <button
          type="button"
          disabled={!hasRoadmap || deleteLoading}
          onClick={onDelete}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.025] px-4 py-3 text-xs font-semibold text-[#B4B6BD] transition hover:border-red-300/25 hover:bg-red-300/[0.06] hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <FiTrash2 size={14} />{" "}
          {deleteLoading ? "Deleting…" : "Delete roadmap"}
        </button>
      </div>
    </aside>
  );
}

export default function RoadmapHistoryPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [roadmaps, setRoadmaps] = useState([]);

  const [selectedId, setSelectedId] = useState(null);

  const [roadmap, setRoadmap] = useState(null);

  const [template, setTemplate] = useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = unwrap(await getRoadmaps({ page: 1, limit: 100 }));

      const list = Array.isArray(payload)
        ? payload
        : payload?.roadmaps ||
          payload?.items ||
          payload?.data?.roadmaps ||
          payload?.data?.items ||
          [];

      setRoadmaps(list);

      const requestedId = searchParams.get("roadmap");

      setSelectedId((current) => {
        if (requestedId && list.some((item) => getId(item) === requestedId)) {
          return requestedId;
        }

        if (current && list.some((item) => getId(item) === current)) {
          return current;
        }

        return getId(list[0]) || null;
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load your roadmap history.",
      );
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      try {
        const payload = unwrap(await getRoadmaps({ page: 1, limit: 100 }));

        if (cancelled) return;

        const list = Array.isArray(payload)
          ? payload
          : payload?.roadmaps ||
            payload?.items ||
            payload?.data?.roadmaps ||
            payload?.data?.items ||
            [];

        setRoadmaps(list);

        const requestedId = searchParams.get("roadmap");

        setSelectedId((current) => {
          if (requestedId && list.some((item) => getId(item) === requestedId)) {
            return requestedId;
          }

          if (current && list.some((item) => getId(item) === current)) {
            return current;
          }

          return getId(list[0]) || null;
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load your roadmap history.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const loadSelected = async () => {
      if (!selectedId) {
        setRoadmap(null);
        setTemplate(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const full = unwrap(await getRoadmap(selectedId));

        if (cancelled) return;

        if (!full) {
          throw new Error("The roadmap response was empty.");
        }

        setRoadmap(full);
        setTemplate(null);

        if (full.templateId) {
          try {
            const templateResponse = unwrap(
              await getRoadmapTemplate(full.templateId),
            );

            if (cancelled) return;

            setTemplate(templateResponse?.template || templateResponse);
          } catch {
            if (cancelled) return;
            setTemplate(null);
          }
        }

        if (!cancelled) {
          setError("");
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to open this roadmap.",
        );

        setRoadmap(null);
        setTemplate(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadSelected();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);
  const selectRoadmap = (id) => {
    setSelectedId(id);

    setMobileHistoryOpen(false);

    navigate(
      id
        ? `/roadmap/history?roadmap=${encodeURIComponent(id)}`
        : "/roadmap/history",

      { replace: true },
    );
  };

  const removeSelected = async () => {
    if (!selectedId || deleteLoading) return;

    const deletedId = selectedId;

    setDeleteLoading(true);

    setError("");

    try {
      await deleteRoadmap(deletedId);

      const remaining = roadmaps.filter((item) => getId(item) !== deletedId);

      const oldIndex = roadmaps.findIndex((item) => getId(item) === deletedId);

      const nextId =
        getId(
          remaining[Math.min(Math.max(oldIndex, 0), remaining.length - 1)],
        ) || null;

      setRoadmaps(remaining);

      setRoadmap(null);

      setTemplate(null);

      setSelectedId(nextId);

      navigate(
        nextId
          ? `/roadmap/history?roadmap=${encodeURIComponent(nextId)}`
          : "/roadmap/history",

        { replace: true },
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not delete this roadmap.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredRoadmaps = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return roadmaps;

    return roadmaps.filter((item) =>
      [item.title, item.role, item.templateId, item.status].some((value) =>
        String(value || "")
          .toLowerCase()

          .includes(query),
      ),
    );
  }, [roadmaps, search]);

  return (
    <div className="rio-roadmap-history fixed inset-0 overflow-hidden bg-[#111214] text-white">
      <style>{`



        @keyframes roadmapEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }



        .rio-roadmap-history { animation: roadmapEnter 300ms cubic-bezier(.22,1,.36,1); }



        .roadmap-history-item { animation: roadmapEnter 260ms both; }



        @media (prefers-reduced-motion: reduce) { .rio-roadmap-history, .roadmap-history-item { animation: none !important; transition: none !important; } }



      `}</style>

      <div className="relative flex h-full min-h-0">
        <aside
          className={`${FLOATING_SIDEBAR} inset-y-4 left-4 z-50 w-[min(282px,calc(100vw-1rem))] shadow-[0_24px_80px_rgba(0,0,0,.30)] transition-transform duration-300 lg:inset-y-5 lg:left-5 lg:w-[min(282px,calc(100vw-2rem))] lg:translate-x-0 ${mobileHistoryOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"} flex`}
        >
          <div className="shrink-0 border-b border-white/[0.065] bg-white/[0.012] px-5 pb-5 pt-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#6B6D73]">
                  Your learning
                </p>

                <h1 className="mt-2 text-[19px] font-semibold tracking-[-0.035em] text-white">
                  Roadmap history
                </h1>

                <p className="mt-1.5 text-[11px] leading-5 text-[#70727A]">
                  Every path, progress point and next step — in one place.
                </p>
              </div>

              <button
                type="button"
                onClick={loadHistory}
                disabled={loading}
                aria-label="Refresh roadmap history"
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
                Saved roadmaps
              </span>

              <span className="text-xs font-semibold tabular-nums text-[#D4D4D8]">
                {roadmaps.length}
              </span>
            </div>

            <label className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 focus-within:border-white/20">
              <FiSearch size={13} className="shrink-0 text-[#686B74]" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a roadmap…"
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#62656D]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
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
              <div className="flex min-h-[250px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-white/80" />

                  <p className="text-[11px] text-[#696B72]">
                    Loading your roadmaps…
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && filteredRoadmaps.length === 0 && (
              <div className="px-5 py-12">
                <div className="h-px w-10 bg-white/20" />

                <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#66686F]">
                  {search ? "No matches" : "A fresh start"}
                </p>

                <p className="mt-2 text-[17px] font-semibold tracking-[-0.03em] text-white">
                  {search ? "Nothing found." : "No roadmaps yet."}
                </p>

                <p className="mt-3 text-[11px] leading-5 text-[#70727A]">
                  {search
                    ? "Try another title or clear your search."
                    : "Build your first learning path and it will live here."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={() => navigate("/roadmap/new")}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-[11px] font-semibold text-[#111214]"
                  >
                    <FiPlus size={13} /> Build a roadmap
                  </button>
                )}
              </div>
            )}

            {!loading &&
              filteredRoadmaps.map((item, index) => {
                const itemId = getId(item);

                const active = itemId === selectedId;

                return (
                  <button
                    key={itemId}
                    type="button"
                    onClick={() => selectRoadmap(itemId)}
                    className={`roadmap-history-item group relative flex w-full items-start gap-3 border-b border-white/[0.045] px-5 py-4 text-left transition ${active ? "bg-white/[0.065]" : "hover:bg-white/[0.03]"}`}
                    style={{ animationDelay: `${Math.min(index, 8) * 25}ms` }}
                  >
                    {active && (
                      <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-white" />
                    )}

                    <span
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${active ? "border-white/15 bg-white/[0.08] text-white" : "border-white/[0.08] bg-white/[0.025] text-[#696B72] group-hover:text-[#A1A1A5]"}`}
                    >
                      <FiBookOpen size={14} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block text-xs font-semibold leading-4 text-white">
                        {item.title || item.role || "Learning roadmap"}
                      </span>

                      <span className="mt-1 block truncate text-[9px] uppercase tracking-[0.09em] text-[#66686F]">
                        {item.role || item.templateId || "Career path"}
                      </span>

                      <span className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-[#55575E]">
                          {formatDate(item.updatedAt || item.createdAt)}
                        </span>

                        <span className="text-[10px] font-semibold tabular-nums text-[#B8BAC1]">
                          {getProgress(item)}%
                        </span>
                      </span>

                      <span className="mt-2 block h-0.5 overflow-hidden rounded-full bg-white/[0.07]">
                        <span
                          className="block h-full rounded-full bg-white/75"
                          style={{ width: `${getProgress(item)}%` }}
                        />
                      </span>
                    </span>
                  </button>
                );
              })}
          </div>

          <div className="shrink-0 border-t border-white/[0.065] p-4">
            <button
              type="button"
              onClick={() => navigate("/roadmap/new")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition hover:-translate-y-0.5 hover:bg-[#E7E7E7]"
            >
              <FiPlus size={14} /> Build a new roadmap{" "}
              <FiArrowRight size={13} />
            </button>
          </div>
        </aside>

        {mobileHistoryOpen && (
          <button
            type="button"
            aria-label="Close roadmap history"
            onClick={() => setMobileHistoryOpen(false)}
            className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
          />
        )}

        <FloatingProgressSidebar
          roadmap={roadmap}
          template={template}
          onDelete={() => setConfirmDelete(true)}
          deleteLoading={deleteLoading}
        />

        <main className="min-w-0 flex-1 overflow-hidden pb-[env(safe-area-inset-bottom)] lg:pl-[302px] lg:pr-[302px]">
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex h-14 shrink-0 items-center border-b border-white/[0.07] bg-[#111214]/80 px-4 backdrop-blur-xl lg:hidden">
              <button
                type="button"
                onClick={() => setMobileHistoryOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#A1A1AA]"
                aria-label="Open roadmap history"
              >
                <FiMenu size={16} />
              </button>

              <div className="ml-3 min-w-0">
                <p className="truncate text-xs font-semibold text-white">
                  {roadmap?.title || "Roadmap workspace"}
                </p>

                <p className="text-[9px] uppercase tracking-[0.14em] text-[#55575E]">
                  Learning path & progress
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {error && (
                <div className="mx-4 mt-4 flex items-start justify-between gap-3 rounded-xl border border-white/[0.1] bg-white/[0.04] p-3 text-xs text-[#C4C6CC] sm:mx-7">
                  <span>{error}</span>

                  <button
                    type="button"
                    onClick={() => {
                      setError("");

                      loadHistory();
                    }}
                    className="shrink-0 underline underline-offset-4"
                  >
                    Retry
                  </button>
                </div>
              )}

              {loading && !roadmap ? (
                <div className="mx-auto max-w-3xl px-6 py-16">
                  <div className="h-7 w-48 animate-pulse rounded bg-white/[0.06]" />

                  <div className="mt-5 h-24 animate-pulse rounded-2xl bg-white/[0.04]" />

                  <div className="mt-3 h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
                </div>
              ) : selectedId ? (
                <RoadmapDetailPage roadmapId={selectedId} embedded />
              ) : (
                <div className="flex min-h-[60vh] items-center justify-center text-center text-sm text-[#777B85]">
                  Select a roadmap from your history to view its learning path.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-roadmap-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.12] bg-[#17191C] p-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#D4D4D8]">
                <FiTrash2 size={16} />
              </div>

              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg p-2 text-[#777B85] hover:bg-white/[0.06] hover:text-white"
                aria-label="Close confirmation"
              >
                <FiX size={16} />
              </button>
            </div>

            <h3
              id="delete-roadmap-title"
              className="mt-4 text-lg font-semibold text-white"
            >
              Delete this roadmap?
            </h3>

            <p className="mt-2 text-xs leading-5 text-[#858994]">
              This permanently removes this roadmap and its saved progress. This
              action cannot be undone.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-xl border border-white/[0.1] px-3 py-2.5 text-xs font-semibold text-[#D4D4D8] hover:bg-white/[0.05]"
              >
                Keep roadmap
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={async () => {
                  setConfirmDelete(false);

                  await removeSelected();
                }}
                className="flex-1 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-[#17191C] hover:bg-[#E7E7E7] disabled:opacity-50"
              >
                {deleteLoading ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
