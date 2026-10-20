import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiMap,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import Sidebar from "../components/SideBar";
import { getUserRoadmaps } from "../api/roadmap.api.js";
import { getInterviewHistory } from "../api/interview.api.js";
import { getResumes } from "../api/resume.api.js";

const GOLD = "#e4e4e7";
const unwrap = (r) => r?.data?.data ?? r?.data ?? r ?? {};
const arrayFrom = (payload, keys) => {
  for (const key of keys)
    if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload)) return payload;
  return [];
};
const dateLabel = (value) => {
  if (!value) return "Date unavailable";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "Date unavailable"
    : d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};
const Surface = ({ children, className = "" }) => (
  <section
    className={`relative overflow-hidden rounded-[22px] border border-white/[.09] bg-[#111214] shadow-[0_18px_55px_rgba(0,0,0,.16)] ${className}`}
  >
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,.045),transparent_48%)]" />
    <div className="relative">{children}</div>
  </section>
);
const ProgressBar = ({ value = 0 }) => (
  <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]">
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{
        width: `${Math.max(0, Math.min(100, value))}%`,
        background: `linear-gradient(90deg,${GOLD},#ffffff)`,
      }}
    />
  </div>
);

export default function ProgressPage({ user, setUser }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roadmaps, setRoadmaps] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      getUserRoadmaps({ page: 1, limit: 50 }),
      getInterviewHistory(),
      getResumes(),
    ]);
    const failures = [];
    if (results[0].status === "fulfilled") {
      const p = unwrap(results[0].value);
      setRoadmaps(arrayFrom(p, ["roadmaps", "items", "results"]));
    } else {
      setRoadmaps([]);
      failures.push("roadmap progress");
    }
    if (results[1].status === "fulfilled") {
      const p = unwrap(results[1].value);
      setInterviews(
        arrayFrom(p, ["interviews", "history", "items", "results"]),
      );
    } else {
      setInterviews([]);
      failures.push("interview history");
    }
    if (results[2].status === "fulfilled") {
      const p = unwrap(results[2].value);
      setResumes(arrayFrom(p, ["resumes", "items", "results"]));
    } else {
      setResumes([]);
      failures.push("resume data");
    }
    if (failures.length === 3)
      setError(
        "Progress data could not be loaded. Check your connection and try again.",
      );
    else if (failures.length)
      setError(
        `Some sections could not load: ${failures.join(", ")}. Available data is still shown.`,
      );
    setLoading(false);
  }, []);
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const roadmapStats = useMemo(
    () =>
      roadmaps.map((item) => {
        const meta =
          item?.roadmap && typeof item.roadmap === "object"
            ? item.roadmap
            : item?.catalogRoadmap || {};
        const phases = Array.isArray(item?.phaseProgress)
          ? item.phaseProgress
          : Object.values(item?.phaseProgress || {});
        const topics = phases.flatMap((phase) =>
          Array.isArray(phase?.topics) ? phase.topics : [],
        );
        const resolvedTopics = phases.reduce((sum, phase) => {
          const ts = Array.isArray(phase?.topics) ? phase.topics : [];
          return (
            sum +
            (["completed", "skipped"].includes(phase?.status)
              ? ts.length
              : ts.filter((t) => ["completed", "skipped"].includes(t?.status))
                  .length)
          );
        }, 0);
        const phasePercent = phases.length
          ? Math.round(
              (phases.filter((p) =>
                ["completed", "skipped"].includes(p?.status),
              ).length /
                phases.length) *
                100,
            )
          : 0;
        const computed = topics.length
          ? Math.round((resolvedTopics / topics.length) * 100)
          : phasePercent;
        const supplied = Number(item?.progressPercentage);
        return {
          id: item?._id || item?.userRoadmapId || item?.id,
          title: meta?.title || item?.title || "Learning roadmap",
          category:
            meta?.category || meta?.domain || item?.category || "Learning path",
          progress: Number.isFinite(supplied)
            ? Math.max(0, Math.min(100, supplied))
            : computed,
          done: phases.filter((p) => p?.status === "completed").length,
          total: Number(meta?.totalPhases) || phases.length,
          updated: item?.lastAccessedAt || item?.updatedAt || item?.createdAt,
        };
      }),
    [roadmaps],
  );
  const completedRoadmaps = roadmapStats.filter(
    (r) => r.progress >= 100,
  ).length;
  const avgProgress = roadmapStats.length
    ? Math.round(
        roadmapStats.reduce((sum, r) => sum + r.progress, 0) /
          roadmapStats.length,
      )
    : 0;
  const completedInterviews = interviews.filter((i) =>
    ["completed", "submitted", "evaluated"].includes(
      String(i?.status || "").toLowerCase(),
    ),
  ).length;
  const scored = interviews
    .map((i) => Number(i?.overallScore))
    .filter((n) => Number.isFinite(n) && n >= 0);
  const avgScore = scored.length
    ? (scored.reduce((a, b) => a + b, 0) / scored.length).toFixed(1)
    : null;
  const recent = [
    ...roadmapStats.map((r) => ({
      type: "roadmap",
      title: r.title,
      detail: `${r.progress}% complete`,
      date: r.updated,
      path: "/roadmap/history",
      icon: FiMap,
    })),
    ...interviews.map((i) => ({
      type: "interview",
      title: i?.title || i?.interviewType || "Mock interview",
      detail:
        i?.status ||
        (i?.overallScore != null
          ? `Score ${i.overallScore}/10`
          : "Interview activity"),
      date: i?.updatedAt || i?.completedAt || i?.createdAt || i?.startedAt,
      path: "/mock-interview/history",
      icon: FiActivity,
    })),
    ...resumes.map((r) => ({
      type: "resume",
      title: r?.title || r?.name || r?.profile?.name || "Resume updated",
      detail: "Resume workspace",
      date: r?.updatedAt || r?.createdAt,
      path: "/builder/history",
      icon: FiFileText,
    })),
  ]
    .filter((x) => x.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "there";
  const stats = [
    {
      label: "Learning paths",
      value: roadmapStats.length,
      note: `${completedRoadmaps} completed`,
      icon: FiMap,
    },
    {
      label: "Overall roadmap progress",
      value: `${avgProgress}%`,
      note: "Across your learning paths",
      icon: FiTrendingUp,
    },
    {
      label: "Interviews completed",
      value: completedInterviews,
      note: `${interviews.length} total attempts`,
      icon: FiActivity,
    },
    {
      label: "Average interview score",
      value: avgScore == null ? "—" : `${avgScore}/10`,
      note: scored.length
        ? "From saved interview reports"
        : "No scored reports yet",
      icon: FiTarget,
    },
  ];

  return (
    <div className="min-h-screen bg-[#090A0B] text-white">
      <Sidebar
        user={user}
        setUser={setUser}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main
        className={`min-h-screen px-4 pb-12 pt-5 transition-[margin] duration-300 sm:px-7 lg:px-10 ${sidebarOpen ? "lg:ml-[260px]" : "lg:ml-[88px]"}`}
      >
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.24em] text-white/40">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: GOLD }}
                />{" "}
                Career intelligence <span className="text-white/20">/</span>{" "}
                Progress
              </div>
              <h1 className="text-3xl font-semibold tracking-[-.045em] sm:text-[42px]">
                Your progress<span style={{ color: GOLD }}>.</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                A clear view of the work you’ve put in, the skills you’re
                building, and what to focus on next.
              </p>
            </div>
            <button
              onClick={loadProgress}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-4 py-2.5 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:text-white disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
              data
            </button>
          </div>
          <Surface className="mb-6">
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.4fr_.8fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.15em] text-white">
                  <FiZap /> Your learning snapshot
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-.035em] sm:text-3xl">
                  Small steps.{" "}
                  <span style={{ color: GOLD }}>Real momentum.</span>
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/45">
                  Hey {firstName}, keep your momentum going by finishing a
                  phase, reviewing an interview, or polishing your resume.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate("/roadmap")}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#e4e4e7] px-4 py-2.5 text-xs font-bold text-[#17140A] transition hover:bg-[#ffffff]"
                  >
                    Continue learning <FiArrowRight />
                  </button>
                  <button
                    onClick={() => navigate("/mock-interview")}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-white/70 hover:border-white/20 hover:text-white"
                  >
                    Practice interview
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-white/[.08] bg-black/20 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">
                    Learning progress average
                  </span>
                  <FiTrendingUp style={{ color: GOLD }} />
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-.06em]">
                    {loading ? "—" : `${avgProgress}%`}
                  </span>
                  <span className="mb-1 text-xs text-white/35">
                    across active roadmaps
                  </span>
                </div>
                <div className="mt-4">
                  <ProgressBar value={avgProgress} />
                </div>
                <p className="mt-3 text-[11px] leading-5 text-white/35">
                  Calculated from saved roadmap progress. No placeholder scores.
                </p>
              </div>
            </div>
          </Surface>
          {error && (
            <div className="mb-5 rounded-xl border border-white/20 bg-white/[.06] px-4 py-3 text-xs leading-5 text-white">
              {error}
            </div>
          )}
          <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((s, index) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Surface className="h-full">
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/45">{s.label}</span>
                        <span
                          className="rounded-xl border border-white/15 bg-white/[.06] p-2"
                          style={{ color: GOLD }}
                        >
                          <Icon size={16} />
                        </span>
                      </div>
                      <div className="mt-5 text-3xl font-semibold tracking-[-.045em]">
                        {loading ? "—" : s.value}
                      </div>
                      <p className="mt-2 text-[11px] text-white/35">
                        {loading ? "Loading saved data…" : s.note}
                      </p>
                    </div>
                  </Surface>
                </motion.div>
              );
            })}
          </div>
          <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
            <Surface>
              <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4 sm:px-6">
                <div>
                  <h3 className="text-sm font-semibold">Learning paths</h3>
                  <p className="mt-1 text-[11px] text-white/35">
                    Progress from your saved roadmaps
                  </p>
                </div>
                <button
                  onClick={() => navigate("/roadmap")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white"
                >
                  Open roadmaps <FiArrowRight />
                </button>
              </div>
              <div className="p-5 sm:p-6">
                {loading ? (
                  <div className="py-8 text-center text-xs text-white/40">
                    Loading your learning paths…
                  </div>
                ) : roadmapStats.length ? (
                  <div className="space-y-5">
                    {roadmapStats.slice(0, 5).map((r) => (
                      <div key={r.id || r.title}>
                        <div className="mb-2.5 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white/85">
                              {r.title}
                            </p>
                            <p className="mt-1 text-[10px] text-white/35">
                              {r.category} ·{" "}
                              {r.total
                                ? `${r.done}/${r.total} phases complete`
                                : "Phase progress not available"}
                            </p>
                          </div>
                          <span
                            className="shrink-0 text-sm font-semibold"
                            style={{ color: GOLD }}
                          >
                            {r.progress}%
                          </span>
                        </div>
                        <ProgressBar value={r.progress} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
                    <FiBookOpen
                      className="mx-auto mb-3 text-white/30"
                      size={22}
                    />
                    <p className="text-sm text-white/70">
                      Your learning journey starts here
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      Create a roadmap to see real progress in this space.
                    </p>
                    <button
                      onClick={() => navigate("/roadmap")}
                      className="mt-4 text-xs font-semibold text-white"
                    >
                      Explore roadmaps <FiArrowRight className="ml-1 inline" />
                    </button>
                  </div>
                )}
              </div>
            </Surface>
            <Surface>
              <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4 sm:px-6">
                <div>
                  <h3 className="text-sm font-semibold">Recent activity</h3>
                  <p className="mt-1 text-[11px] text-white/35">
                    Latest saved work across your workspace
                  </p>
                </div>
                <FiClock className="text-white/35" />
              </div>
              <div className="p-5 sm:p-6">
                {loading ? (
                  <div className="py-8 text-center text-xs text-white/40">
                    Loading activity…
                  </div>
                ) : recent.length ? (
                  <div className="space-y-4">
                    {recent.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={`${item.type}-${item.title}-${index}`}
                          onClick={() => navigate(item.path)}
                          className="group flex w-full items-start gap-3 text-left"
                        >
                          <span className="mt-0.5 rounded-xl border border-white/[.08] bg-white/[.035] p-2.5 text-white">
                            <Icon size={15} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-medium text-white/80 group-hover:text-white">
                              {item.title}
                            </span>
                            <span className="mt-1 block truncate text-[10px] capitalize text-white/35">
                              {String(item.detail).replaceAll("_", " ")}
                            </span>
                            <span className="mt-1.5 block text-[10px] text-white/25">
                              {dateLabel(item.date)}
                            </span>
                          </span>
                          <FiArrowRight className="mt-2 shrink-0 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-white" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <FiActivity
                      className="mx-auto mb-3 text-white/25"
                      size={22}
                    />
                    <p className="text-xs text-white/60">
                      No recent activity found
                    </p>
                    <p className="mt-1 text-[10px] text-white/30">
                      Activity will appear as you use RIO.
                    </p>
                  </div>
                )}
              </div>
            </Surface>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => navigate("/builder/dashboard")}
              className="group flex items-center gap-4 rounded-2xl border border-white/[.08] bg-[#111214] p-5 text-left transition hover:border-white/25"
            >
              <span className="rounded-xl border border-white/15 bg-white/[.06] p-3 text-white">
                <FiFileText size={18} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">
                  Resume workspace
                </span>
                <span className="mt-1 block text-xs text-white/35">
                  {resumes.length} saved resume{resumes.length === 1 ? "" : "s"}{" "}
                  found
                </span>
              </span>
              <FiArrowRight className="text-white/25 transition group-hover:text-white" />
            </button>
            <button
              onClick={() => navigate("/mock-interview/history")}
              className="group flex items-center gap-4 rounded-2xl border border-white/[.08] bg-[#111214] p-5 text-left transition hover:border-white/25"
            >
              <span className="rounded-xl border border-white/15 bg-white/[.06] p-3 text-white">
                <FiCheckCircle size={18} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">
                  Interview reports
                </span>
                <span className="mt-1 block text-xs text-white/35">
                  Review completed practice sessions
                </span>
              </span>
              <FiArrowRight className="text-white/25 transition group-hover:text-white" />
            </button>
          </div>
          <p className="mt-7 text-center text-[10px] tracking-wide text-white/20">
            RIO · CAREER INTELLIGENCE · YOUR DATA, YOUR PROGRESS
          </p>
        </div>
      </main>
    </div>
  );
}
