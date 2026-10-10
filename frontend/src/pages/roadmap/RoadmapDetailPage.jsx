import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiLayers,
  FiMenu,
  FiPlay,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

import Sidebar from "../../components/SideBar";
import {
  getRoadmap,
  getRoadmapTemplate,
  updateNodeStatus,
} from "../../api/roadmap.api.js";

const STATUS = {
  NOT_STARTED: "not_started",
  LEARNING: "learning",
  COMPLETED: "completed",
  SKIPPED: "skipped",
};

const cx = (...values) => values.filter(Boolean).join(" ");
const unwrap = (response) => response?.data ?? null;
const titleCase = (value = "") =>
  String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatTarget = (target) => {
  if (!target || target.compensation == null) return "Not set";
  const amount = Number(target.compensation);
  const label = amount >= 100 ? "1 Cr+" : `${amount} LPA`;
  return `${target.currency || "INR"} ${label}`;
};

const Surface = ({ children, className = "" }) => (
  <section
    className={cx(
      "rounded-2xl border border-white/[0.09] bg-[#111315]",
      className,
    )}
  >
    {children}
  </section>
);

export default function RoadmapDetailPage({
  user,
  setUser,
  roadmapId: roadmapIdOverride,
  embedded = false,
}) {
  const { roadmapId: routeRoadmapId } = useParams();
  const roadmapId = roadmapIdOverride || routeRoadmapId;
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingNodeId, setSavingNodeId] = useState(null);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedNodeId, setExpandedNodeId] = useState(null);

  const loadRoadmap = useCallback(async () => {
    try {
      const response = await getRoadmap(roadmapId);
      const result = unwrap(response);
      if (!result) throw new Error("The roadmap response was empty.");
      setRoadmap(result);

      if (result.templateId) {
        try {
          const templateResponse = await getRoadmapTemplate(result.templateId);
          setTemplate(unwrap(templateResponse));
        } catch {
          // The roadmap can still be displayed with its saved node states.
          setTemplate(null);
        }
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "We couldn't load this roadmap.",
      );
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  }, [roadmapId]);

  useEffect(() => {
    let cancelled = false;

    const fetchRoadmap = async () => {
      if (!roadmapId) {
        setError("Roadmap ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await getRoadmap(roadmapId);
        const result = unwrap(response);

        if (!result) {
          throw new Error("The roadmap response was empty.");
        }

        if (cancelled) return;
        setRoadmap(result);

        if (result.templateId) {
          try {
            const templateResponse = await getRoadmapTemplate(
              result.templateId,
            );

            if (cancelled) return;
            setTemplate(unwrap(templateResponse));
          } catch {
            if (cancelled) return;
            setTemplate(null);
          }
        } else {
          setTemplate(null);
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "We couldn't load this roadmap.",
        );

        setRoadmap(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRoadmap();

    return () => {
      cancelled = true;
    };
  }, [roadmapId]);

  const knowledgeNodes = useMemo(() => {
    const nodes = Array.isArray(template?.nodes) ? template.nodes : [];
    const stateById = new Map(
      (roadmap?.nodes || []).map((node) => [node.nodeId, node]),
    );
    return nodes
      .map((node, index) => ({
        ...node,
        order: index + 1,
        status: stateById.get(node.id)?.status || STATUS.NOT_STARTED,
        state: stateById.get(node.id) || null,
      }))
      .filter((node) => stateById.has(node.id));
  }, [template, roadmap]);

  const phases = useMemo(() => {
    const sourcePhases = Array.isArray(template?.metadata?.phases)
      ? template.metadata.phases
      : [];
    const phaseById = new Map(sourcePhases.map((phase) => [phase.id, phase]));
    const groups = new Map();

    knowledgeNodes.forEach((node) => {
      const phaseId = node.metadata?.phase || "learning-path";
      if (!groups.has(phaseId)) groups.set(phaseId, []);
      groups.get(phaseId).push(node);
    });

    return [...groups.entries()]
      .map(([phaseId, nodes], index) => {
        const phase = phaseById.get(phaseId);
        return {
          id: phaseId,
          order: phase?.order || index + 1,
          title: phase?.title || titleCase(phaseId),
          description:
            phase?.description ||
            phase?.goal ||
            "Work through these topics in sequence.",
          nodes,
        };
      })
      .sort((a, b) => a.order - b.order);
  }, [template, knowledgeNodes]);

  const stats = useMemo(() => {
    const nodes = roadmap?.nodes || [];
    const total = nodes.length;
    const completed = nodes.filter(
      (node) => node.status === STATUS.COMPLETED,
    ).length;
    const skipped = nodes.filter(
      (node) => node.status === STATUS.SKIPPED,
    ).length;
    const learning = nodes.filter(
      (node) => node.status === STATUS.LEARNING,
    ).length;
    const percentage = total
      ? Math.round(((completed + skipped) / total) * 100)
      : 0;
    return {
      total,
      completed,
      skipped,
      learning,
      remaining: Math.max(0, total - completed - skipped),
      percentage,
    };
  }, [roadmap]);

  const currentNode = useMemo(() => {
    const learning = knowledgeNodes.find(
      (node) => node.status === STATUS.LEARNING,
    );
    return (
      learning ||
      knowledgeNodes.find((node) => node.status === STATUS.NOT_STARTED) ||
      null
    );
  }, [knowledgeNodes]);

  const changeStatus = useCallback(
    async (nodeId, status) => {
      if (!roadmapId || !nodeId || savingNodeId) return;
      const previousRoadmap = roadmap;
      setSavingNodeId(nodeId);
      setError("");
      setRoadmap((current) => ({
        ...current,
        nodes: (current?.nodes || []).map((node) =>
          node.nodeId === nodeId
            ? { ...node, status, updatedAt: new Date().toISOString() }
            : node,
        ),
      }));
      try {
        const response = await updateNodeStatus(roadmapId, nodeId, status);
        const updated = unwrap(response);
        if (updated) setRoadmap(updated);
      } catch (err) {
        setRoadmap(previousRoadmap);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Couldn't save progress. Please try again.",
        );
      } finally {
        setSavingNodeId(null);
      }
    },
    [roadmapId, roadmap, savingNodeId],
  );

  const continueLearning = () => {
    if (!currentNode) return;
    setExpandedNodeId(currentNode.id);
    document
      .getElementById(`roadmap-node-${currentNode.id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (currentNode.status === STATUS.NOT_STARTED)
      changeStatus(currentNode.id, STATUS.LEARNING);
  };

  const firstName = user?.name?.split(" ")?.[0] || "there";

  if (loading) {
    return (
      <div
        className={cx(
          "min-h-screen text-white",
          embedded ? "bg-transparent" : "bg-[#17191C] ",
        )}
      >
        <div className="mx-auto max-w-5xl space-y-5 px-5 py-24">
          <div className="h-4 w-32 animate-pulse rounded bg-white/[0.08]" />
          <div className="h-10 w-2/3 animate-pulse rounded bg-white/[0.08]" />
          <div className="h-28 animate-pulse rounded-2xl bg-white/[0.05]" />
          <div className="h-44 animate-pulse rounded-2xl bg-white/[0.05]" />
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <main
        className={cx(
          "flex min-h-screen items-center justify-center px-5 text-white",
          embedded ? "bg-transparent" : "bg-[#17191C]",
        )}
      >
        <Surface className="w-full max-w-lg p-7 text-center sm:p-9">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <FiLayers size={20} />
          </div>
          <h1 className="mt-4 text-xl font-semibold">Roadmap unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-[#92949B]">
            {error ||
              "This roadmap may have been deleted or is no longer available."}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => navigate("/roadmap/history")}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/75"
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
  }

  const overallStatus =
    roadmap.status === "completed"
      ? "Completed"
      : roadmap.status === "archived"
        ? "Archived"
        : "In progress";

  return (
    <div
      className={cx(
        "relative overflow-x-clip text-white",
        embedded ? "min-h-0 bg-transparent" : "min-h-screen bg-[#17191C]",
      )}
    >
      {!embedded && (
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 88% 4%, rgba(255,255,255,0.065) 0%, transparent 72%), linear-gradient(135deg,#191b1e 0%,#17191c 50%,#141619 100%)",
          }}
        />
      )}

      {!embedded && (
        <header className="fixed left-3 right-3 top-3 z-40 flex h-14 items-center justify-between rounded-2xl border border-white/[0.1] bg-[#17191C]/85 px-3 backdrop-blur-xl md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055]"
            aria-label="Open navigation"
          >
            <FiMenu size={18} />
          </button>
          <span
            className="text-[16px] tracking-tight"
            style={{ fontFamily: '"Zen Dots", sans-serif' }}
          >
            RIO
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-xs font-semibold">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </header>
      )}

      <div
        className={cx(
          "relative z-10 flex",
          embedded ? "min-h-0 w-full" : "min-h-screen",
        )}
      >
        {!embedded && (
          <Sidebar
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            user={user}
            setUser={setUser}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        )}

        <main
          className={cx(
            "min-w-0 flex-1",
            !embedded && "transition-[margin-left] duration-300",
            !embedded && (sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"),
          )}
        >
          <div
            className={cx(
              "mx-auto w-full",
              embedded
                ? "max-w-none px-0 py-0"
                : "max-w-[1600px] px-4 pb-12 pt-[88px] sm:px-6 lg:px-8 lg:pt-10",
            )}
          >
            <div className="grid grid-cols-1 gap-7">
              <div className="min-w-0">
                {!embedded && (
                  <button
                    type="button"
                    onClick={() => navigate("/roadmap/history")}
                    className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-[#92949B] transition hover:text-white"
                  >
                    <FiArrowLeft size={14} /> Back to history
                  </button>
                )}

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8F9198]">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/80" />{" "}
                    Your learning roadmap
                  </div>
                  <h1 className="max-w-4xl text-[34px] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-[44px] lg:text-[52px]">
                    {roadmap.title || roadmap.role || "Your roadmap"}
                  </h1>
                  {roadmap.description && (
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-[#92949B] sm:text-[15px]">
                      {roadmap.description}
                    </p>
                  )}
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Meta
                      label="Role"
                      value={roadmap.role || "Learning path"}
                    />
                    <Meta
                      label="Target package"
                      value={formatTarget(roadmap.target)}
                    />
                    <Meta
                      label="Level"
                      value={titleCase(roadmap.profile?.level || "beginner")}
                    />
                    <Meta
                      label="Daily time"
                      value={`${roadmap.profile?.availableHoursPerDay || 2} hours`}
                    />
                    <Meta label="Status" value={overallStatus} />
                  </div>
                </motion.section>

                {error && (
                  <div
                    role="alert"
                    className="mt-6 flex items-start gap-3 rounded-xl border border-red-300/20 bg-red-300/[0.06] p-4 text-sm text-red-100/85"
                  >
                    <FiX className="mt-0.5 shrink-0" /> <span>{error}</span>
                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="ml-auto text-xs underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <Surface className="mt-8 p-5 sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="max-w-xl">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71747C]">
                        Your next move
                      </p>
                      <h2 className="mt-2 text-xl font-semibold tracking-tight">
                        {currentNode?.title || "You've reached the end"}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[#92949B]">
                        {currentNode?.whyItMatters ||
                          currentNode?.description ||
                          "All roadmap topics are complete. Review your progress or explore your next learning path."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={continueLearning}
                      disabled={!currentNode}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {currentNode?.status === STATUS.LEARNING
                        ? "Continue learning"
                        : "Start learning"}
                      <FiArrowRight size={14} />
                    </button>
                  </div>
                </Surface>

                <section className="mt-10">
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71747C]">
                        The learning path
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
                        Phases & topics
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#858994]">
                        Follow the path in order. Open a topic to review its
                        details and update your progress.
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] text-[#92949B]">
                      {stats.total} topics
                    </span>
                  </div>

                  {phases.length ? (
                    <div className="space-y-4">
                      {phases.map((phase, phaseIndex) => {
                        const phaseCompleted = phase.nodes.filter((node) =>
                          [STATUS.COMPLETED, STATUS.SKIPPED].includes(
                            node.status,
                          ),
                        ).length;
                        return (
                          <Surface key={phase.id} className="overflow-hidden">
                            <div className="border-b border-white/[0.07] p-4 sm:p-5">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-white/75">
                                  {String(phaseIndex + 1).padStart(2, "0")}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm font-semibold sm:text-base">
                                      {phase.title}
                                    </h3>
                                    <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[9px] text-[#858994]">
                                      {phaseCompleted}/{phase.nodes.length} done
                                    </span>
                                  </div>
                                  <p className="mt-1.5 text-xs leading-5 text-[#858994]">
                                    {phase.description}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                                <div
                                  className="h-full rounded-full bg-white/70 transition-all"
                                  style={{
                                    width: `${phase.nodes.length ? (phaseCompleted / phase.nodes.length) * 100 : 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="divide-y divide-white/[0.06]">
                              {phase.nodes.map((node) => (
                                <NodeCard
                                  key={node.id}
                                  node={node}
                                  expanded={expandedNodeId === node.id}
                                  onExpand={() =>
                                    setExpandedNodeId((current) =>
                                      current === node.id ? null : node.id,
                                    )
                                  }
                                  onStatus={changeStatus}
                                  saving={savingNodeId === node.id}
                                />
                              ))}
                            </div>
                          </Surface>
                        );
                      })}
                    </div>
                  ) : (
                    <Surface className="p-6">
                      <div className="flex items-start gap-3">
                        <FiBookOpen className="mt-0.5 text-[#92949B]" />
                        <div>
                          <h3 className="text-sm font-semibold">
                            Topic details aren't available
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-[#858994]">
                            Your saved roadmap and progress are available, but
                            RIO couldn't load the canonical topic list. Try
                            refreshing the page.
                          </p>
                          <button
                            type="button"
                            onClick={loadRoadmap}
                            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white"
                          >
                            <FiRefreshCw size={13} /> Refresh roadmap
                          </button>
                        </div>
                      </div>
                    </Surface>
                  )}
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#71747C]">
        {label}
      </p>
      <p className="mt-1 max-w-[180px] truncate text-xs font-medium text-[#D4D4D8]">
        {value}
      </p>
    </div>
  );
}

function ProgressRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 text-[#858994]">
        <span className="text-xs">{icon}</span>
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-semibold text-white/80">{value}</span>
    </div>
  );
}

function NodeCard({ node, expanded, onExpand, onStatus, saving }) {
  const completed = node.status === STATUS.COMPLETED;
  const learning = node.status === STATUS.LEARNING;
  const skipped = node.status === STATUS.SKIPPED;
  const statusLabel = completed
    ? "Completed"
    : learning
      ? "In progress"
      : skipped
        ? "Skipped"
        : "Not started";
  const prerequisites = Array.isArray(node.prerequisites)
    ? node.prerequisites
    : [];
  const enables = Array.isArray(node.enables) ? node.enables : [];
  const alternatives = Array.isArray(node.alternatives)
    ? node.alternatives
    : [];

  return (
    <article id={`roadmap-node-${node.id}`} className="scroll-mt-24">
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <div
          className={cx(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold",
            completed
              ? "border-white/15 bg-white text-[#17191C]"
              : learning
                ? "border-white/20 bg-white/[0.12] text-white"
                : "border-white/[0.08] bg-white/[0.035] text-[#858994]",
          )}
        >
          {completed ? (
            <FiCheck size={15} />
          ) : (
            String(node.order).padStart(2, "0")
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
              {node.title || titleCase(node.id)}
            </h4>
            <span
              className={cx(
                "rounded-full px-2 py-0.5 text-[9px] font-medium",
                completed
                  ? "bg-white/[0.08] text-white/65"
                  : learning
                    ? "bg-blue-300/10 text-blue-100/75"
                    : skipped
                      ? "bg-amber-300/10 text-amber-100/70"
                      : "bg-white/[0.04] text-[#858994]",
              )}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#858994]">
            {node.description || "Open this topic to review its details."}
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
          {node.whyItMatters && (
            <InfoBlock title="Why this matters">{node.whyItMatters}</InfoBlock>
          )}
          {prerequisites.length > 0 && (
            <InfoBlock title="Prerequisites">
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11px] text-[#92949B]"
                  >
                    {titleCase(item)}
                  </span>
                ))}
              </div>
            </InfoBlock>
          )}
          {enables.length > 0 && (
            <InfoBlock title="Unlocks next">
              <div className="flex flex-wrap gap-2">
                {enables.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11px] text-[#92949B]"
                  >
                    {titleCase(item)}
                  </span>
                ))}
              </div>
            </InfoBlock>
          )}
          {alternatives.length > 0 && (
            <InfoBlock title="Related alternatives">
              <div className="flex flex-wrap gap-2">
                {alternatives.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11px] text-[#92949B]"
                  >
                    {titleCase(item)}
                  </span>
                ))}
              </div>
            </InfoBlock>
          )}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.07] pt-4">
            {!completed && (
              <button
                type="button"
                disabled={saving}
                onClick={() => onStatus(node.id, STATUS.LEARNING)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/[0.08] disabled:opacity-50"
              >
                <FiPlay size={13} /> Start learning
              </button>
            )}
            {!completed && (
              <button
                type="button"
                disabled={saving}
                onClick={() => onStatus(node.id, STATUS.COMPLETED)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-[#17191C] hover:bg-white/90 disabled:opacity-50"
              >
                <FiCheck size={13} /> Mark complete
              </button>
            )}
            {completed && (
              <button
                type="button"
                disabled={saving}
                onClick={() => onStatus(node.id, STATUS.NOT_STARTED)}
                className="rounded-xl border border-white/10 px-3 py-2.5 text-xs font-semibold text-[#92949B] hover:bg-white/[0.05] disabled:opacity-50"
              >
                Reset progress
              </button>
            )}
            {!skipped && !completed && (
              <button
                type="button"
                disabled={saving}
                onClick={() => onStatus(node.id, STATUS.SKIPPED)}
                className="rounded-xl border border-white/[0.08] px-3 py-2.5 text-xs font-medium text-[#92949B] hover:bg-white/[0.05] disabled:opacity-50"
              >
                Skip topic
              </button>
            )}
            {saving && (
              <span className="inline-flex items-center gap-2 px-2 text-xs text-[#858994]">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />{" "}
                Saving
              </span>
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
