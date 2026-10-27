import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RoadmapDetailPage from "./RoadmapDetailPage.jsx";
import { FiArrowLeft, FiPlay } from "react-icons/fi";

import {
  FiArrowRight,
  FiBookOpen,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  deleteUserRoadmap,
  getUserRoadmap,
  getUserRoadmaps,
} from "../../api/roadmap/roadmap.api.js";

import { Clock3 } from "lucide-react";

const unwrap = (response) => response?.data ?? response ?? null;

const getId = (item) =>
  String(item?._id || item?.id || item?.userRoadmapId || "");

const calculateProgressFromTopics = (item) => {
  const phases = Array.isArray(item?.phaseProgress)
    ? item.phaseProgress
    : Object.values(item?.phaseProgress || {});

  const topics = phases.flatMap((phase) =>
    Array.isArray(phase?.topics) ? phase.topics : [],
  );

  if (topics.length) {
    const completedTopics = phases.reduce((total, phase) => {
      const phaseTopics = Array.isArray(phase?.topics) ? phase.topics : [];

      if (phase?.status === "completed") {
        return total + phaseTopics.length;
      }

      if (phase?.status === "skipped") {
        return total;
      }

      return (
        total +
        phaseTopics.filter((topic) => topic?.status === "completed").length
      );
    }, 0);

    return Math.round((completedTopics / topics.length) * 100);
  }

  if (phases.length) {
    const completedPhases = phases.filter(
      (phase) => phase?.status === "completed",
    ).length;

    return Math.round((completedPhases / phases.length) * 100);
  }

  return 0;
};

const getProgress = (item) => {
  const phases = Array.isArray(item?.phaseProgress)
    ? item.phaseProgress
    : Object.values(item?.phaseProgress || {});

  const hasPhaseProgress = phases.length > 0;

  const value = hasPhaseProgress
    ? calculateProgressFromTopics(item)
    : Number(item?.progress?.percentage ?? item?.progressPercentage ?? 0);

  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
};

const normalizeHistoryItem = (item) => {
  return {
    ...item,
    title: item?.roadmap?.title || item?.title || "Learning roadmap",
    role:
      item?.roadmap?.catalogRoadmapId ||
      item?.catalogRoadmapId ||
      "Career path",
    templateId: item?.packageId || item?.roadmap?.packageId || "standard",
    progressPercentage: getProgress(item),
  };
};

const getCurrentFocusTopic = (topics, roadmapId) => {
  const savedTopicId = roadmapId
    ? localStorage.getItem(`roadmap:last-opened-topic:${roadmapId}`)
    : null;

  // Priority 1: Last-opened topic, even if it is already completed.
  const lastOpenedTopic = topics.find(
    (topic) => topic.id === savedTopicId || topic.nodeId === savedTopicId,
  );

  if (lastOpenedTopic) return lastOpenedTopic;

  // Priority 2: An unfinished topic currently in progress.
  const inProgressTopic = topics.find(
    (topic) =>
      !["completed", "skipped"].includes(topic.phaseStatus) &&
      ["in_progress", "learning"].includes(topic.status),
  );

  if (inProgressTopic) return inProgressTopic;

  // Priority 3: First unfinished topic.
  return (
    topics.find(
      (topic) =>
        !["completed", "skipped"].includes(topic.phaseStatus) &&
        !["completed", "skipped"].includes(topic.status),
    ) || null
  );
};

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
  "absolute inset-y-5 w-[min(282px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[24px] border border-white/[.10] bg-[#111315]/95 shadow-[0_24px_80px_rgba(0,0,0,.32)] backdrop-blur-xl";

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
      className={`${FLOATING_SIDEBAR}   border border-white/[.09] !bg-transparent !shadow-none right-4 z-30 hidden lg:inset-y-5 lg:right-5 lg:flex`}
    >
      <div className="min-h-0 flex-1 overflow-y-auto p-5  [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/40 px-4 py-3 text-xs font-semibold text-white transition hover:border-white-300/25 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
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

  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 5;

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const [selectedRoadmapData, setSelectedRoadmapData] = useState(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = unwrap(await getUserRoadmaps({ page: 1, limit: 100 }));

      const list = Array.isArray(payload)
        ? payload
        : payload?.roadmaps ||
          payload?.items ||
          payload?.data?.roadmaps ||
          payload?.data?.items ||
          [];

      const normalizedList = list.map(normalizeHistoryItem);
      setRoadmaps(normalizedList);

      const requestedId = searchParams.get("roadmap");

      setSelectedId((current) => {
        if (
          requestedId &&
          normalizedList.some((item) => getId(item) === requestedId)
        ) {
          return requestedId;
        }

        if (current && normalizedList.some((item) => getId(item) === current)) {
          return current;
        }

        return getId(normalizedList[0]) || null;
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
      await loadHistory();
    };

    if (!cancelled) {
      void fetchHistory();
    }

    return () => {
      cancelled = true;
    };
  }, [loadHistory]);

  useEffect(() => {
    let cancelled = false;
    const loadSelected = async () => {
      if (!selectedId) {
        setRoadmap(null);
        setTemplate(null);
        setSelectedRoadmapData(null);
        return;
      }
      try {
        const response = unwrap(await getUserRoadmap(selectedId));
        const payload = response?.data ?? response;
        if (cancelled) return;
        const canonical = payload?.roadmap;
        const personal = payload?.userRoadmap;
        if (!canonical || !personal)
          throw new Error("The roadmap response is incomplete.");
        const phaseProgress = Array.isArray(personal.phaseProgress)
          ? personal.phaseProgress
          : [];
        const topics = (canonical.phases || [])
          .filter((phase) => phase.generationStatus === "ready")
          .flatMap((phase) => {
            const savedPhase = phaseProgress.find(
              (item) => item.phaseId === phase.id,
            );

            return (phase.topics || []).map((topic) => {
              const savedTopic = savedPhase?.topics?.find(
                (item) => item.topicId === topic.id,
              );

              let status = savedTopic?.status || "not_started";

              if (savedPhase?.status === "completed") {
                status = "completed";
              } else if (savedPhase?.status === "skipped") {
                status = "skipped";
              }

              return {
                ...topic,
                nodeId: topic.id,
                status,
                phaseId: phase.id,
                phaseStatus: savedPhase?.status || "not_started",
              };
            });
          });
        const total = topics.length;

        setSelectedRoadmapData({
          id: getId(personal),
          roadmap: canonical,
          userRoadmap: personal,
        });

        const completed = topics.filter(
          (topic) =>
            topic.phaseStatus !== "skipped" && topic.status === "completed",
        ).length;

        const skipped = topics.filter(
          (topic) =>
            topic.phaseStatus === "skipped" || topic.status === "skipped",
        ).length;

        const inProgress = topics.filter(
          (topic) =>
            topic.phaseStatus !== "completed" &&
            topic.phaseStatus !== "skipped" &&
            topic.status === "in_progress",
        ).length;

        const focus = getCurrentFocusTopic(topics, getId(personal));

        setRoadmaps((current) =>
          current.map((item) =>
            getId(item) === getId(personal)
              ? {
                  ...item,
                  phaseProgress,
                  progressPercentage: calculateProgressFromTopics({
                    ...item,
                    phaseProgress,
                  }),
                }
              : item,
          ),
        );

        setRoadmap({
          ...personal,
          ...canonical,
          _id: personal._id,
          title: canonical.title,
          nodes: topics.map((topic) => ({
            ...topic,
            nodeId: topic.id,
            status: topic.status === "in_progress" ? "learning" : topic.status,
          })),
          progress: {
            total,
            completed,
            skipped,
            learning: inProgress,
            percentage: total ? Math.round((completed / total) * 100) : 0,
          },
          currentFocus: focus
            ? {
                nodeId: focus.id,
                title: focus.title,
                reason: focus.description,
              }
            : null,
          profile: { availableHoursPerDay: 2 },
        });
        setTemplate({
          nodes: topics,
          metadata: { phases: canonical.phases || [] },
        });
        setError("");
      } catch (err) {
        if (cancelled) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to open this roadmap.",
        );
        setRoadmap(null);
        setTemplate(null);
        setSelectedRoadmapData(null);
      }
    };
    void loadSelected();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleProgressChange = useCallback((userRoadmap) => {
    if (!userRoadmap) return;

    const phases = Array.isArray(userRoadmap.phaseProgress)
      ? userRoadmap.phaseProgress
      : [];

    const phaseMap = new Map(phases.map((phase) => [phase.phaseId, phase]));

    const roadmapId = getId(userRoadmap);

    setRoadmap((current) => {
      if (!current || getId(current) !== roadmapId) {
        return current;
      }

      const nodes = (current.nodes || []).map((node) => {
        const phase = phaseMap.get(node.phaseId);
        const savedTopic = phase?.topics?.find(
          (topic) => topic.topicId === node.id,
        );

        let status = savedTopic?.status || "not_started";

        if (phase?.status === "completed") {
          status = "completed";
        } else if (phase?.status === "skipped") {
          status = "skipped";
        } else if (status === "in_progress") {
          status = "learning";
        }

        return {
          ...node,
          status,
          phaseStatus: phase?.status || "not_started",
        };
      });

      const total = nodes.length;

      const completed = nodes.filter(
        (node) =>
          node.phaseStatus !== "skipped" &&
          (node.phaseStatus === "completed" || node.status === "completed"),
      ).length;

      const skipped = nodes.filter(
        (node) =>
          node.phaseStatus === "skipped" ||
          (node.phaseStatus !== "completed" && node.status === "skipped"),
      ).length;

      const learning = nodes.filter(
        (node) =>
          !["completed", "skipped"].includes(node.phaseStatus) &&
          node.status === "learning",
      ).length;

      const focus = getCurrentFocusTopic(nodes, roadmapId);

      return {
        ...current,
        ...userRoadmap,
        _id: current._id,
        title: current.title,
        nodes,
        progress: {
          ...current.progress,
          total,
          completed,
          skipped,
          learning,
          percentage: total ? Math.round((completed / total) * 100) : 0,
        },
        currentFocus: focus
          ? {
              nodeId: focus.id,
              title: focus.title,
              reason: focus.description,
            }
          : null,
      };
    });

    setRoadmaps((current) =>
      current.map((item) => {
        if (getId(item) !== roadmapId) return item;

        return {
          ...item,
          ...userRoadmap,
          _id: item._id,
          title: item.title,
          phaseProgress: phases,
          progressPercentage: calculateProgressFromTopics({
            ...item,
            phaseProgress: phases,
          }),
        };
      }),
    );
  }, []);

  const selectRoadmap = (id) => {
    setSelectedId(id);
    setSelectedRoadmapData(null);
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
      await deleteUserRoadmap(deletedId);

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
      setSelectedRoadmapData(null);
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

  const historyPageCount = Math.max(
    1,
    Math.ceil(filteredRoadmaps.length / historyPageSize),
  );

  const safeHistoryPage = Math.min(historyPage, historyPageCount);

  const paginatedRoadmaps = filteredRoadmaps.slice(
    (safeHistoryPage - 1) * historyPageSize,
    safeHistoryPage * historyPageSize,
  );

  return (
    <div className="rio-roadmap-history fixed inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_48%_0%,rgba(255,255,255,0.055),transparent_38%),#101113] text-white">
      <style>{`
        @keyframes roadmapEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .rio-roadmap-history { animation: roadmapEnter 300ms cubic-bezier(.22,1,.36,1); }
        .roadmap-history-item { animation: roadmapEnter 260ms both; }
        @media (prefers-reduced-motion: reduce) { .rio-roadmap-history, .roadmap-history-item { animation: none !important; transition: none !important; } }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 88% 4%, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 42%, transparent 72%), radial-gradient(ellipse 65% 55% at 0% 92%, rgba(255,255,255,0.035) 0%, transparent 70%), linear-gradient(135deg, #191b1e 0%, #17191c 48%, #141619 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.018] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>
      <div className="relative z-10 flex h-full min-h-0">
        <aside
          className={`${FLOATING_SIDEBAR} top-4 bottom-20 left-4 z-50 w-[min(282px,calc(100vw-1rem))] shadow-[0_24px_80px_rgba(0,0,0,.32)]  backdrop-blur-2xl transition-transform duration-300 lg:inset-y-5 lg:left-5 lg:w-[min(282px,calc(100vw-2rem))] lg:translate-x-0 ${mobileHistoryOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"} flex`}
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

            <label className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 ">
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
              </div>
            )}

            {!loading &&
              paginatedRoadmaps.map((item, index) => {
                const itemId = getId(item);

                const active = itemId === selectedId;

                return (
                  <button
                    key={itemId}
                    type="button"
                    onClick={() => selectRoadmap(itemId)}
                    className={`roadmap-history-item group relative flex w-full items-start gap-3 border-b border-white/[0.045] px-5 py-[18px] text-left transition-colors ${active ? "bg-white/[0.065]" : "hover:bg-white/[0.035]"}`}
                    style={{ animationDelay: `${Math.min(index, 8) * 25}ms` }}
                  >
                    {active && (
                      <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-white" />
                    )}

                    <span
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${active ? "border-white/15 bg-white/[0.08] text-white" : "border-white/[0.08] bg-white/[0.025] text-[#777B85] group-hover:text-[#C4C6CC]"}`}
                    >
                      <FiBookOpen size={14} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block whitespace-nowrap text-xs font-semibold leading-4 text-white">
                        {item.title || item.role || "Learning roadmap"}
                      </span>

                      <span className="mt-1 block truncate text-[9px] uppercase tracking-[0.09em] text-[#66686F]">
                        {item.role || item.templateId || "Career path"}
                      </span>

                      <span className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-[#55575E]">
                          {formatDate(item.updatedAt || item.createdAt)}
                        </span>

                        <span
                          className={`text-[10px] font-semibold tabular-nums ${active ? "text-white" : "text-[#B8BAC1]"}`}
                        >
                          {getProgress(item)}%
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-white/[0.065] bg-white/[0.012] px-4 py-3">
            <span className="text-[10px] text-[#858994]">
              Page {Math.min(historyPage, historyPageCount)} of{" "}
              {historyPageCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous page"
                disabled={historyPage <= 1 || loading}
                onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] text-[#858994] transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <FiArrowLeft size={13} />
              </button>
              <button
                type="button"
                aria-label="Next page"
                disabled={historyPage >= historyPageCount || loading}
                onClick={() =>
                  setHistoryPage((page) => Math.min(historyPageCount, page + 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] text-[#D4D4D8] transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <FiArrowRight size={13} />
              </button>
            </div>
          </div>
        </aside>

        {mobileHistoryOpen && (
          <button
            type="button"
            aria-label="Close roadmap history"
            onClick={() => setMobileHistoryOpen(false)}
            className="absolute inset-0 z-40 backdrop-blur-xl bg-black/45 lg:hidden"
          />
        )}

        <FloatingProgressSidebar
          roadmap={roadmap}
          template={template}
          onDelete={() => setConfirmDelete(true)}
          deleteLoading={deleteLoading}
        />

        <main className="min-w-0 flex-1 overflow-hidden pb-[env(safe-area-inset-bottom)] lg:mx-[302px] lg:px-0">
          <div className="flex h-full min-h-0 flex-col">
            <div className="mt-6 mx-6 hidden border-b border-white/[0.08] pb-5 lg:block">
              <button
                type="button"
                onClick={() => navigate("/roadmap")}
                className="group inline-flex items-center gap-2 text-xs font-medium text-[#71717A] transition-colors duration-200 hover:text-white"
                aria-label="Back to roadmaps"
              >
                <FiArrowLeft
                  size={14}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
                Back to roadmaps
              </button>
            </div>
            <div className="rio-history-mobile-header flex h-16 shrink-0 items-center border-b border-white/[0.07] bg-[#111214]/75 px-4 backdrop-blur-xl lg:hidden">
              <button
                type="button"
                onClick={() => navigate("/roadmap")}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] p-0 text-[#D4D4D8] transition hover:bg-white/[0.08]"
                aria-label="Back to roadmaps"
                title="Back to roadmaps"
              >
                <FiArrowLeft size={15} />
              </button>

              <div className="ml-3 min-w-0 border-l border-white/[0.09] pl-3">
                <p className="truncate text-xs font-semibold text-white">
                  {roadmap?.title || "Roadmap workspace"}
                </p>

                <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-[#858994]">
                  Learning path & progress
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={deleteLoading}
                aria-label="Delete interview"
                className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] text-white transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              >
                <FiTrash2 size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-18 sm:px-7 sm:py-8 lg:px-9 lg:py-9 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {error && (
                <div className="mx-1 mb-5 flex items-start justify-between gap-3 rounded-2xl border border-rose-300/15 bg-rose-300/[0.055] p-4 text-xs leading-5 text-rose-100/90 sm:mx-0">
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
              ) : selectedId && selectedRoadmapData?.id === selectedId ? (
                <RoadmapDetailPage
                  key={selectedId}
                  roadmapId={selectedId}
                  embedded
                  initialData={selectedRoadmapData}
                  onProgressChange={handleProgressChange}
                />
              ) : selectedId ? (
                <div className="mx-auto max-w-3xl px-6 py-16">
                  <div className="h-7 w-48 animate-pulse rounded bg-white/[0.06]" />
                  <div className="mt-5 h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
                  <div className="mt-3 h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
                </div>
              ) : (
                <section className="flex min-h-[calc(100dvh-13rem)] items-center justify-center px-5 py-10 text-center lg:min-h-[60vh] lg:px-4 lg:py-12">
                  <div className="mx-auto flex w-full max-w-xl flex-col items-center">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.035] text-[#D4D4D8] shadow-[0_10px_32px_rgba(0,0,0,.16)]">
                      <FiBookOpen size={19} strokeWidth={1.6} />
                    </div>

                    <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#858994] sm:text-[10px]">
                      Your learning workspace
                    </p>

                    <h2 className="max-w-sm text-[25px] font-semibold leading-[1.15] tracking-[-0.045em] text-[#F4F4F5] sm:max-w-lg sm:text-3xl">
                      Every big goal starts with a path.
                    </h2>

                    <p className="mt-4 max-w-[19rem] text-[13px] leading-6 text-[#A1A1AA] sm:max-w-md sm:text-[15px]">
                      Choose a roadmap from your history to pick up where you
                      left off, or create a new one to plan your next step.
                    </p>

                    <p className="mt-5 text-[10px] leading-5 text-[#686C75] sm:text-[11px]">
                      Your progress and next steps will live here.
                    </p>
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile actions stay anchored at the bottom, outside the scrollable content. */}
      <div className="rio-history-mobile-bottom-bar fixed inset-x-0 bottom-0 z-[60] border-t border-white/[0.08] bg-[linear-gradient(160deg,rgba(35,37,42,0.97)_0%,rgba(20,22,25,0.98)_55%,rgba(15,16,18,0.99)_100%)] px-4 pt-3 backdrop-blur-xl pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
        {selectedId ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMobileHistoryOpen((open) => !open)}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-[#D4D4D8] transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label="Open roadmap history"
            >
              <Clock3 size={14} />
              My Learnings
            </button>
            <button
              type="button"
              onClick={() => navigate("/roadmap/new")}
              disabled={deleteLoading}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] shadow-[0_10px_30px_rgba(255,255,255,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(255,255,255,0.12)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <FiPlay size={14} />
              New Roadmap
              <FiArrowRight size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/roadmap/new")}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] shadow-[0_10px_30px_rgba(255,255,255,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111214]"
          >
            <FiPlus size={16} />
            Build a roadmap
            <FiArrowRight size={14} />
          </button>
        )}
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
