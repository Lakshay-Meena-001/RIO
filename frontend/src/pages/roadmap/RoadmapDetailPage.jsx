import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiLayers,
  FiPlay,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import {
  getUserRoadmap,
  generateRoadmapPhase,
  updateRoadmapPhaseStatus,
  updateRoadmapTopicStatus,
} from "../../api/roadmap.api.js";

const STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  SKIPPED: "skipped",
};
const cx = (...values) => values.filter(Boolean).join(" ");
const unwrap = (response) => response?.data ?? response ?? null;
const titleCase = (value = "") =>
  String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
const Surface = ({ children, className = "" }) => (
  <section
    className={cx(
      "relative overflow-hidden rounded-[22px] border border-white/[0.11] bg-[#111315] shadow-[0_22px_60px_rgba(0,0,0,0.18)]",
      className,
    )}
  >
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 70% 95% at 100% 0%, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 38%, transparent 70%), linear-gradient(135deg, rgba(255,255,255,0.025), transparent 48%)",
      }}
    />
    <div className="relative">{children}</div>
  </section>
);

export default function RoadmapDetailPage({
  roadmapId: roadmapIdOverride,
  embedded = false,
  onProgressChange,
}) {
  const { roadmapId: routeRoadmapId } = useParams();
  const roadmapId = roadmapIdOverride || routeRoadmapId;
  const navigate = useNavigate();
  const [canonical, setCanonical] = useState(null);
  const [userRoadmap, setUserRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionErrors, setActionErrors] = useState({});
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [generatingPhaseId, setGeneratingPhaseId] = useState(null);

  const loadRoadmap = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);
      setError("");

      try {
        if (!roadmapId) {
          throw new Error("Roadmap ID is missing.");
        }

        const response = await getUserRoadmap(roadmapId);
        const result = response?.data ?? response;
        const payload = result?.data ?? result;

        if (!payload?.roadmap || !payload?.userRoadmap) {
          throw new Error("The roadmap response is incomplete.");
        }

        setCanonical(payload.roadmap);
        setUserRoadmap(payload.userRoadmap);
        onProgressChange?.(payload.userRoadmap);
        return true;
      } catch (err) {
        setCanonical(null);
        setUserRoadmap(null);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "We couldn't load this roadmap.",
        );
        return false;
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [roadmapId, onProgressChange],
  );

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      if (!cancelled) {
        void loadRoadmap();
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loadRoadmap]);

  const phaseProgress = useMemo(
    () =>
      new Map(
        (userRoadmap?.phaseProgress || []).map((phase) => [
          phase.phaseId,
          phase,
        ]),
      ),
    [userRoadmap],
  );
  const phases = useMemo(
    () =>
      (canonical?.phases || []).map((phase, index) => {
        const saved = phaseProgress.get(phase.id);
        const topics = (phase.topics || []).map((topic, topicIndex) => {
          const topicState = (saved?.topics || []).find(
            (item) => item.topicId === topic.id,
          );
          return {
            ...topic,
            order: topicIndex + 1,
            status: topicState?.status || STATUS.NOT_STARTED,
            notes: topicState?.notes || "",
          };
        });
        return {
          ...phase,
          order: phase.order ?? index + 1,
          topics,
          savedStatus: saved?.status || STATUS.NOT_STARTED,
        };
      }),
    [canonical, phaseProgress],
  );
  const allTopics = useMemo(
    () =>
      phases.flatMap((phase) =>
        phase.topics.map((topic) => ({
          ...topic,
          phaseStatus: phase.savedStatus,
        })),
      ),
    [phases],
  );

  const stats = useMemo(() => {
    const completed = allTopics.filter(
      (topic) =>
        topic.phaseStatus === STATUS.COMPLETED ||
        (topic.phaseStatus !== STATUS.SKIPPED &&
          topic.status === STATUS.COMPLETED),
    ).length;

    const skipped = allTopics.filter(
      (topic) =>
        topic.phaseStatus === STATUS.SKIPPED ||
        (topic.phaseStatus !== STATUS.COMPLETED &&
          topic.status === STATUS.SKIPPED),
    ).length;

    const inProgress = allTopics.filter(
      (topic) =>
        ![STATUS.COMPLETED, STATUS.SKIPPED].includes(topic.phaseStatus) &&
        topic.status === STATUS.IN_PROGRESS,
    ).length;

    return {
      total: allTopics.length,
      completed,
      skipped,
      inProgress,
      percentage: allTopics.length
        ? Math.round((completed / allTopics.length) * 100)
        : 0,
    };
  }, [allTopics]);

  const currentTopic =
    allTopics.find(
      (topic) =>
        topic.id === expandedTopicId &&
        ![STATUS.COMPLETED, STATUS.SKIPPED].includes(topic.status) &&
        ![STATUS.COMPLETED, STATUS.SKIPPED].includes(topic.phaseStatus),
    ) ||
    allTopics.find(
      (topic) =>
        topic.status === STATUS.IN_PROGRESS &&
        ![STATUS.COMPLETED, STATUS.SKIPPED].includes(topic.phaseStatus),
    ) ||
    allTopics.find(
      (topic) =>
        topic.status === STATUS.NOT_STARTED &&
        ![STATUS.COMPLETED, STATUS.SKIPPED].includes(topic.phaseStatus),
    ) ||
    null;

  const refreshFromResult = (response) => {
    const payload = unwrap(response)?.data ?? unwrap(response);
    if (payload?.roadmap) setCanonical(payload.roadmap);
    if (payload?.userRoadmap) setUserRoadmap(payload.userRoadmap);
  };

  const changeTopicStatus = async (phaseId, topicId, status) => {
    if (!roadmapId || savingId) return;

    const errorKey = `topic:${topicId}`;
    setSavingId(topicId);
    setActionErrors((current) => ({
      ...current,
      [errorKey]: "",
    }));

    try {
      await updateRoadmapTopicStatus(roadmapId, phaseId, topicId, status);

      const loaded = await loadRoadmap(false);

      if (!loaded) {
        setActionErrors((current) => ({
          ...current,
          [errorKey]:
            "Saved, but the latest progress could not be loaded. Retry refreshing the roadmap.",
        }));
      }
    } catch (err) {
      setActionErrors((current) => ({
        ...current,
        [errorKey]:
          err?.response?.data?.message ||
          err?.message ||
          "Couldn't save topic progress. Please try again.",
      }));
    } finally {
      setSavingId(null);
    }
  };

  const changePhaseStatus = async (phaseId, status) => {
    if (!roadmapId || savingId) return;

    const errorKey = `phase:${phaseId}`;
    setSavingId(phaseId);
    setActionErrors((current) => ({
      ...current,
      [errorKey]: "",
    }));

    try {
      await updateRoadmapPhaseStatus(roadmapId, phaseId, status);

      const loaded = await loadRoadmap(false);

      if (!loaded) {
        setActionErrors((current) => ({
          ...current,
          [errorKey]:
            "Saved, but the latest progress could not be loaded. Retry refreshing the roadmap.",
        }));
      }
    } catch (err) {
      setActionErrors((current) => ({
        ...current,
        [errorKey]:
          err?.response?.data?.message ||
          err?.message ||
          "Couldn't save phase progress. Please try again.",
      }));
    } finally {
      setSavingId(null);
    }
  };

  const generatePhase = async (phaseId) => {
    if (!roadmapId || generatingPhaseId) return;
    setGeneratingPhaseId(phaseId);
    setError("");
    try {
      refreshFromResult(await generateRoadmapPhase(roadmapId, phaseId));
      await loadRoadmap(false);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Couldn't generate this phase. Please try again.",
      );
    } finally {
      setGeneratingPhaseId(null);
    }
  };

  if (loading)
    return (
      <div
        className={cx(
          "min-h-[60vh] text-white",
          embedded ? "bg-transparent" : "min-h-screen bg-[#17191C]",
        )}
      >
        <div className="mx-auto max-w-5xl space-y-5 px-5 py-16">
          <div className="h-4 w-32 animate-pulse rounded bg-white/[0.08]" />
          <div className="h-10 w-2/3 animate-pulse rounded bg-white/[0.08]" />
          <div className="h-28 animate-pulse rounded-2xl bg-white/[0.05]" />
          <div className="h-44 animate-pulse rounded-2xl bg-white/[0.05]" />
        </div>
      </div>
    );
  if (!canonical || !userRoadmap)
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-5 text-white">
        <Surface className="w-full max-w-lg p-7 text-center">
          <FiLayers className="mx-auto" size={22} />
          <h1 className="mt-4 text-xl font-semibold">Roadmap unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-[#92949B]">
            {error || "This roadmap may have been deleted."}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => navigate("/roadmap/history")}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm"
            >
              View history
            </button>
            <button
              onClick={loadRoadmap}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#17191C]"
            >
              <FiRefreshCw size={14} /> Try again
            </button>
          </div>
        </Surface>
      </main>
    );

  return (
    <div
      className={cx(
        "relative overflow-x-clip text-white",
        embedded ? "min-h-0 bg-transparent" : "min-h-screen bg-[#17191C]",
      )}
    >
      {!embedded && (
        <div className="pointer-events-none fixed inset-0">
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
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='white' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            }}
          />
        </div>
      )}
      <div
        className={cx(
          "mx-auto w-full",
          embedded
            ? "max-w-none px-0 py-0"
            : "max-w-[1600px] px-4 pb-16 pt-5 sm:px-6 sm:pb-12 sm:pt-8 lg:px-10 lg:pt-9",
        )}
      >
        {!embedded && (
          <button
            type="button"
            onClick={() => navigate("/roadmap/history")}
            className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-xs font-semibold text-[#D4D4D8] transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white"
          >
            <FiArrowLeft size={14} /> Back to history
          </button>
        )}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A1A1AA]">
            <span className="h-2 w-2 rounded-full bg-white/80" />
            Your learning roadmap
          </div>
          <h1 className="max-w-4xl text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[44px]">
            {canonical.title || "Your roadmap"}
          </h1>
          {canonical.summary && (
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#A1A1AA] sm:text-[15px]">
              {canonical.summary}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Meta
              label="Package"
              value={titleCase(
                userRoadmap.packageId || canonical.packageId || "standard",
              )}
            />
            <Meta
              label="Status"
              value={titleCase(userRoadmap.status || "active")}
            />
            <Meta
              label="Generated phases"
              value={`${phases.filter((phase) => phase.generationStatus === "ready").length}/${phases.length}`}
            />
            <Meta label="Progress" value={`${stats.percentage}%`} />
          </div>
        </motion.section>
        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-xl border border-red-300/20 bg-red-300/[0.06] p-4 text-sm text-red-100/85"
          >
            <FiX className="mt-0.5 shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}
        <Surface className="mt-8 overflow-hidden border-white/[0.11] bg-[linear-gradient(120deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018)_58%,rgba(255,255,255,0.018))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:mt-9 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A1A1AA]">
                <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                Your next move
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                {currentTopic?.title || "Your learning path is ready"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#92949B]">
                {currentTopic?.description ||
                  "Generate a phase to reveal its topics, resources and practice tasks."}
              </p>
            </div>
            <button
              disabled={!currentTopic}
              onClick={() => {
                setExpandedTopicId(currentTopic.id);
                document
                  .getElementById(`roadmap-topic-${currentTopic.id}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
                if (currentTopic.status === STATUS.NOT_STARTED) {
                  const phase = phases.find((item) =>
                    item.topics.some((topic) => topic.id === currentTopic.id),
                  );
                  if (phase)
                    void changeTopicStatus(
                      phase.id,
                      currentTopic.id,
                      STATUS.IN_PROGRESS,
                    );
                }
              }}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-[#17191C] shadow-[0_5px_22px_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:bg-[#EDEDF0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {currentTopic?.status === STATUS.IN_PROGRESS
                ? "Continue learning"
                : "Start learning"}
              <FiPlay size={13} />
            </button>
          </div>
        </Surface>
        <section className="mt-12 sm:mt-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71747C]">
                The learning path
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-[28px]">
                Phases & topics
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#858994]">
                Generate phases progressively, then track each topic as you
                learn.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] text-[#92949B]">
              {stats.total} topics
            </span>
          </div>
          {phases.length ? (
            <div className="space-y-4">
              {phases.map((phase, index) => {
                const ready = phase.generationStatus === "ready";
                const phaseDone =
                  phase.savedStatus === STATUS.COMPLETED
                    ? phase.topics.length
                    : phase.savedStatus === STATUS.SKIPPED
                      ? 0
                      : phase.topics.filter(
                          (topic) => topic.status === STATUS.COMPLETED,
                        ).length;
                return (
                  <Surface
                    key={phase.id}
                    className="group overflow-hidden border-white/[0.085] bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-colors hover:border-white/[0.14]"
                  >
                    <div className="border-b border-white/[0.07] p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-white/75">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold sm:text-base">
                              {phase.title}
                            </h3>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[9px] font-medium ${ready ? "border-white/[0.10] bg-white/[0.045] text-white/80" : phase.generationStatus === "failed" ? "border-white/[0.12] bg-white/[0.04] text-white/75" : "border-white/[0.09] bg-white/[0.025] text-[#A1A1AA]"}`}
                            >
                              {ready
                                ? `${phaseDone}/${phase.topics.length} done`
                                : titleCase(
                                    phase.generationStatus || "pending",
                                  )}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs leading-5 text-[#858994]">
                            {phase.purpose ||
                              phase.description ||
                              "Work through this phase in sequence."}
                          </p>
                        </div>
                      </div>
                      {ready && (
                        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className="h-full rounded-full bg-white/70 transition-all"
                            style={{
                              width: `${phase.topics.length ? (phaseDone / phase.topics.length) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      )}
                      {!ready && (
                        <button
                          type="button"
                          disabled={Boolean(generatingPhaseId)}
                          onClick={() => void generatePhase(phase.id)}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-semibold text-[#17191C] disabled:opacity-50"
                        >
                          <FiRefreshCw
                            size={13}
                            className={
                              generatingPhaseId === phase.id
                                ? "animate-spin"
                                : ""
                            }
                          />
                          {generatingPhaseId === phase.id
                            ? "Generating phase…"
                            : phase.generationStatus === "failed"
                              ? "Retry phase generation"
                              : "Generate phase topics"}
                        </button>
                      )}
                    </div>
                    {ready && (
                      <div className="divide-y divide-white/[0.06]">
                        {phase.topics.map((topic, topicIndex) => (
                          <TopicCard
                            key={topic.id}
                            topic={{ ...topic, order: topicIndex + 1 }}
                            expanded={expandedTopicId === topic.id}
                            saving={savingId === topic.id}
                            error={actionErrors[`topic:${topic.id}`]}
                            onExpand={() =>
                              setExpandedTopicId((current) =>
                                current === topic.id ? null : topic.id,
                              )
                            }
                            onStatus={(status) =>
                              void changeTopicStatus(phase.id, topic.id, status)
                            }
                          />
                        ))}
                      </div>
                    )}

                    {ready && (
                      <div className="border-t border-white/[0.06] px-4 py-4 sm:px-5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {phase.savedStatus === STATUS.COMPLETED ? (
                              <button
                                disabled={Boolean(savingId)}
                                onClick={() =>
                                  void changePhaseStatus(
                                    phase.id,
                                    STATUS.NOT_STARTED,
                                  )
                                }
                                className="rounded-xl border border-white/10 px-3 py-2 text-[11px] text-white/70 disabled:opacity-50"
                              >
                                Reset phase
                              </button>
                            ) : (
                              <>
                                <button
                                  disabled={Boolean(savingId)}
                                  onClick={() =>
                                    void changePhaseStatus(
                                      phase.id,
                                      STATUS.IN_PROGRESS,
                                    )
                                  }
                                  className={`rounded-xl border px-3 py-2 text-[11px] disabled:opacity-50 ${
                                    phase.savedStatus === STATUS.IN_PROGRESS
                                      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                                      : "border-white/10 text-white/80"
                                  }`}
                                >
                                  In progress
                                </button>

                                <button
                                  disabled={Boolean(savingId)}
                                  onClick={() =>
                                    void changePhaseStatus(
                                      phase.id,
                                      STATUS.SKIPPED,
                                    )
                                  }
                                  className="rounded-xl border border-white/10 px-3 py-2 text-[11px] text-white/70 transition-all duration-200 hover:border-white/25 hover:bg-white/[0.045] hover:text-white hover:shadow-[0_0_12px_rgba(255,255,255,0.06)] disabled:opacity-50"
                                >
                                  Skip phase
                                </button>

                                <button
                                  disabled={Boolean(savingId)}
                                  onClick={() =>
                                    void changePhaseStatus(
                                      phase.id,
                                      STATUS.NOT_STARTED,
                                    )
                                  }
                                 className="rounded-xl border border-white/10 px-3 py-2 text-[11px] text-white/70 transition-all duration-200 hover:border-white/25 hover:bg-white/[0.045] hover:text-white hover:shadow-[0_0_12px_rgba(255,255,255,0.06)] disabled:opacity-50"
                                >
                                  Reset phase
                                </button>
                              </>
                            )}
                          </div>

                          {phase.savedStatus !== STATUS.COMPLETED && (
                            <button
                              disabled={Boolean(savingId)}
                              onClick={() =>
                                void changePhaseStatus(
                                  phase.id,
                                  STATUS.COMPLETED,
                                )
                              }
                              className="ml-auto shrink-0 rounded-xl bg-white px-3 py-2 text-[11px] font-semibold text-[#17191C] disabled:opacity-50"
                            >
                              Complete phase
                            </button>
                          )}
                        </div>

                        {actionErrors[`phase:${phase.id}`] && (
                          <p role="alert" className="pt-2 text-xs text-red-300">
                            {actionErrors[`phase:${phase.id}`]}
                          </p>
                        )}
                      </div>
                    )}
                  </Surface>
                );
              })}
            </div>
          ) : (
            <Surface className="p-6">
              <FiBookOpen className="text-[#92949B]" />
              <p className="mt-3 text-sm text-[#92949B]">
                No phases are available for this roadmap yet.
              </p>
            </Surface>
          )}
        </section>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.085] bg-white/[0.035] px-3.5 py-3 transition-colors hover:bg-white/[0.05]">
      <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#71747C]">
        {label}
      </p>
      <p className="mt-1 max-w-[180px] truncate text-xs font-medium text-[#D4D4D8]">
        {value}
      </p>
    </div>
  );
}
function TopicCard({ topic, expanded, onExpand, onStatus, saving, error }) {
  const startLearning = () => {
    onStatus(STATUS.IN_PROGRESS);

    const firstResourceUrl = topic.resources?.find(
      (resource) =>
        typeof resource.url === "string" && /^https?:\/\//i.test(resource.url),
    )?.url;

    if (firstResourceUrl) {
      window.open(firstResourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  const completed = topic.status === STATUS.COMPLETED;
  const inProgress = topic.status === STATUS.IN_PROGRESS;
  const skipped = topic.status === STATUS.SKIPPED;
  const statusLabel = completed
    ? "Completed"
    : inProgress
      ? "In progress"
      : skipped
        ? "Skipped"
        : "Not started";
  return (
    <article
      id={`roadmap-topic-${topic.id}`}
      className={cx(
        "scroll-mt-24",
        completed && "bg-emerald-400/[0.045]",
        skipped && "bg-amber-300/[0.035]",
      )}
    >
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <div
          className={cx(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold",
            completed
              ? "border-white/20 bg-white text-[#101114]"
              : inProgress
                ? "border-white/20 bg-white/[0.12] text-white"
                : skipped
                  ? "border-white/[0.08] bg-white/[0.025] text-[#858994]"
                  : "border-white/[0.09] bg-white/[0.035] text-[#858994]",
          )}
        >
          {completed ? (
            <FiCheck size={15} />
          ) : (
            String(topic.order).padStart(2, "0")
          )}
        </div>
        <button
          type="button"
          onClick={onExpand}
          aria-expanded={expanded}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold leading-5 text-white/90">
              {topic.title || titleCase(topic.id)}
            </h4>
            <span
              className={cx(
                "rounded-full border px-2 py-0.5 text-[9px]",
                completed
                  ? "border-white/[0.10] bg-white/[0.045] text-white/80"
                  : inProgress
                    ? "border-white/15 bg-white/[0.06] text-white/90"
                    : skipped
                      ? "border-white/[0.08] bg-white/[0.025] text-[#858994]"
                      : "border-white/[0.06] bg-white/[0.025] text-[#858994]",
              )}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#858994]">
            {topic.description || "Open this topic to review its details."}
          </p>
        </button>
        <button
          type="button"
          onClick={onExpand}
          aria-label={expanded ? "Collapse topic" : "Expand topic"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#858994] hover:bg-white/[0.05] hover:text-white"
        >
          <FiChevronDown
            className={cx("transition-transform", expanded && "rotate-180")}
            size={15}
          />
        </button>
      </div>
      {expanded && (
        <div className="border-t border-white/[0.06] bg-black/[0.12] px-4 py-5 sm:px-5 sm:pl-[68px]">
          {topic.importance && (
            <InfoBlock title="Why this matters">{topic.importance}</InfoBlock>
          )}
          {Array.isArray(topic.subtopics) && topic.subtopics.length > 0 && (
            <InfoBlock title="Subtopics">
              <ul className="list-disc space-y-1 pl-4">
                {topic.subtopics.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </InfoBlock>
          )}
          {Array.isArray(topic.practiceTasks) &&
            topic.practiceTasks.length > 0 && (
              <InfoBlock title="Practice tasks">
                <ul className="list-disc space-y-1 pl-4">
                  {topic.practiceTasks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </InfoBlock>
            )}
          {Array.isArray(topic.resources) && topic.resources.length > 0 && (
            <InfoBlock title="Resources">
              <div className="space-y-2">
                {topic.resources.map((resource) => (
                  <a
                    key={`${resource.title}-${resource.url}`}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-white/80 underline decoration-white/20 underline-offset-4 hover:text-white"
                  >
                    {resource.title}
                  </a>
                ))}
              </div>
            </InfoBlock>
          )}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.07] pt-4">
            {!inProgress && !completed && (
              <button
                disabled={saving}
                onClick={startLearning}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-white/80 disabled:opacity-50"
              >
                <FiPlay size={13} /> Start learning
              </button>
            )}
            {!completed && (
              <button
                disabled={saving}
                onClick={() => onStatus(STATUS.COMPLETED)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-[#17191C] disabled:opacity-50"
              >
                <FiCheck size={13} /> Mark complete
              </button>
            )}
            {completed && (
              <button
                disabled={saving}
                onClick={() => onStatus(STATUS.NOT_STARTED)}
                className="rounded-xl border border-white/10 px-3 py-2.5 text-xs text-[#92949B] disabled:opacity-50"
              >
                Reset progress
              </button>
            )}
            {!skipped && !completed && (
              <button
                disabled={saving}
                onClick={() => onStatus(STATUS.SKIPPED)}
                className="rounded-xl border border-white/[0.08] px-3 py-2.5 text-xs text-[#92949B] disabled:opacity-50"
              >
                Skip topic
              </button>
            )}
            {saving && (
              <span className="px-2 text-xs text-[#858994]">Saving…</span>
            )}

            {error && (
              <p role="alert" className="basis-full pt-2 text-xs text-red-300">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
function InfoBlock({ title, children }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#71747C]">
        {title}
      </p>
      <div className="text-xs leading-6 text-[#92949B]">{children}</div>
    </div>
  );
}
