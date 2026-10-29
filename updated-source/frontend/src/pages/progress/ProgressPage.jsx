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
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import Sidebar from "../../components/SideBar.jsx";
import MobileHeader from "../../components/MobileHeader";
import Surface from "../../components/ui/Surface";
import { getUserRoadmaps } from "../../api/roadmap/roadmap.api.js";
import { getInterviewHistory } from "../../api/interview/interview.api.js";
import { getResumes } from "../../api/resume/resume.api.js";
import PageEyebrow from "../../components/ui/PageEyebrow";

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

const ProgressBar = ({ value = 0 }) => (
  <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]">
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{
        width: `${Math.max(0, Math.min(100, value))}%`,
        background: "linear-gradient(90deg, #D4D4D8, #FFFFFF)",
      }}
    />
  </div>
);

export default function ProgressPage({ user, setUser }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => localStorage.getItem("rio-sidebar-open") !== "false",
  );
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
    const timer = setTimeout(() => {
      loadProgress();
    }, 0);

    return () => clearTimeout(timer);
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
    <div className="rio-progress relative min-h-screen overflow-x-clip bg-[#17191C] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 50% at 85% 0%, rgba(255,255,255,0.045), transparent 70%), radial-gradient(ellipse 55% 40% at 0% 100%, rgba(255,255,255,0.02), transparent 72%)",
        }}
      />
      <div className="relative z-20">
        <Sidebar
          user={user}
          setUser={setUser}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>
      {/* mx-auto w-full max-w-[1480px] px-5 pb-6 pt-[88px] sm:px-7 lg:px-10 lg:pb-12 lg:pt-10 */}
      <main
        className={`relative z-10 min-h-screen px-5 pb-6 pt-[88px] transition-[margin] duration-300 sm:px-7 sm:pb-10 lg:px-10 lg:pb-12 lg:pt-10 ${sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"}`}
      >
        <MobileHeader
          onOpenNavigation={() => setMobileOpen(true)}
          user={user}
        />
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <PageEyebrow className="mb-3">Progress</PageEyebrow>
              <h1 className="text-[35px] font-semibold leading-[1.03] tracking-[-0.055em] sm:text-[47px] lg:text-[56px]">
                Your progress,
                <span className="mt-1 block font-serif font-normal italic tracking-[-0.055em] text-[#A1A1AA]">
                  steadily building.
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#92949B]">
                A clear view of the work you’ve put in, the skills you’re
                building, and what to focus on next.
              </p>
            </div>
          </div>
          <Surface className="mb-6">
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.4fr_.8fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.055] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.15em] text-[#D4D4D8]">
                  <FiZap /> Your learning snapshot
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-.035em] sm:text-3xl">
                  Small steps.{" "}
                  <span className="font-serif font-normal italic text-[#A1A1AA]">
                    Real momentum.
                  </span>
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-[#92949B]">
                  Hey {firstName}, keep your momentum going by finishing a
                  phase, reviewing an interview, or polishing your resume.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextRoadmap = [...roadmapStats]
                        .filter((roadmap) => roadmap.progress < 100)
                        .sort((a, b) => {
                          if (a.updated && b.updated) {
                            return new Date(b.updated) - new Date(a.updated);
                          }
                          return 0;
                        })[0];

                      navigate(
                        nextRoadmap?.id
                          ? `/roadmap/${nextRoadmap.id}`
                          : "/roadmap",
                      );
                    }}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-white/90"
                  >
                    {roadmapStats.some((roadmap) => roadmap.progress < 100)
                      ? "Continue Learning"
                      : "Start Learning"}
                    <FiArrowRight size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/roadmap")}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-[#D4D4D8] transition hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white"
                  >
                    {roadmapStats.length ? "My Roadmaps" : "Start Roadmap"}
                    <FiArrowRight size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        interviews.length
                          ? "/mock-interview/history"
                          : "/mock-interview/new",
                      )
                    }
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-[#D4D4D8] transition hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white"
                  >
                    {interviews.length ? "View Interviews" : "Start Interview"}
                    <FiArrowRight size={14} />
                  </button>
                </div>
              </div>
              <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.015] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">
                    Learning progress average
                  </span>
                  <FiTrendingUp className="text-[#D4D4D8]" />
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-.06em]">
                    {loading ? "—" : `${avgProgress}%`}
                  </span>
                  <span className="mb-1 text-xs text-[#777A82]">
                    across active roadmaps
                  </span>
                </div>
                <div className="mt-4">
                  <ProgressBar value={avgProgress} />
                </div>
                <p className="mt-3 text-[11px] leading-5 text-[#777A82]">
                  Calculated from saved roadmap progress. No placeholder scores.
                </p>
              </div>
            </div>
          </Surface>
          {error && (
            <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs leading-5 text-[#D4D4D8]">
              {error}
            </div>
          )}
          <div className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
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
                    <div className="p-3 sm:p-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] leading-4 text-[#92949B] sm:text-xs">
                          {s.label}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.055] p-2 text-[#D4D4D8]">
                          <Icon size={16} />
                        </span>
                      </div>
                      <div className="mt-4 text-2xl font-semibold tracking-[-.045em] sm:mt-5 sm:text-3xl">
                        {loading ? "—" : s.value}
                      </div>
                      <p className="mt-2 text-[10px] leading-4 text-[#777A82] sm:text-[11px]">
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
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 sm:px-6">
                <div>
                  <h3 className="text-sm font-semibold">Learning paths</h3>
                  <p className="mt-1 text-[11px] text-[#777A82]">
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
                  <div className="py-8 text-center text-xs text-[#777A82]">
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
                            <p className="mt-1 text-[10px] text-[#777A82]">
                              {r.category} ·{" "}
                              {r.total
                                ? `${r.done}/${r.total} phases complete`
                                : "Phase progress not available"}
                            </p>
                          </div>
                          <span className="shrink-0 text-[#D4D4D8] text-sm font-semibold">
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
                      className="mx-auto mb-3 text-[#777A82]"
                      size={22}
                    />
                    <p className="text-sm text-white/70">
                      Your learning journey starts here
                    </p>
                    <p className="mt-1 text-xs text-[#777A82]">
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
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 sm:px-6">
                <div>
                  <h3 className="text-sm font-semibold">Recent activity</h3>
                  <p className="mt-1 text-[11px] text-[#777A82]">
                    Latest saved work across your workspace
                  </p>
                </div>
                <FiClock className="text-[#777A82]" />
              </div>
              <div className="p-5 sm:p-6">
                {loading ? (
                  <div className="py-8 text-center text-xs text-[#777A82]">
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
                          <span className="mt-0.5 rounded-xl border border-white/[0.08] bg-white/[0.035] p-2.5 text-[#D4D4D8]">
                            <Icon size={15} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-medium text-white/80 group-hover:text-white">
                              {item.title}
                            </span>
                            <span className="mt-1 block truncate text-[10px] capitalize text-[#777A82]">
                              {String(item.detail).replaceAll("_", " ")}
                            </span>
                            <span className="mt-1.5 block text-[10px] text-[#777A82]">
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
                      className="mx-auto mb-3 text-[#777A82]"
                      size={22}
                    />
                    <p className="text-xs text-white/60">
                      No recent activity found
                    </p>
                    <p className="mt-1 text-[10px] text-[#777A82]">
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
              className="group flex items-center gap-4 rounded-[22px] border border-white/[0.10] bg-[#111315] p-5 text-left transition hover:border-white/25"
            >
              <span className="rounded-xl border border-white/10 bg-white/[0.055] p-3 text-[#D4D4D8]">
                <FiFileText size={18} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">
                  Resume workspace
                </span>
                <span className="mt-1 block text-xs text-[#777A82]">
                  {resumes.length} saved resume{resumes.length === 1 ? "" : "s"}{" "}
                  found
                </span>
              </span>
              <FiArrowRight className="text-[#777A82] transition group-hover:text-white" />
            </button>
            <button
              onClick={() => navigate("/mock-interview/history")}
              className="group flex items-center gap-4 rounded-[22px] border border-white/[0.10] bg-[#111315] p-5 text-left transition hover:border-white/25"
            >
              <span className="rounded-xl border border-white/10 bg-white/[0.055] p-3 text-[#D4D4D8]">
                <FiCheckCircle size={18} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">
                  Interview reports
                </span>
                <span className="mt-1 block text-xs text-[#777A82]">
                  Review completed practice sessions
                </span>
              </span>
              <FiArrowRight className="text-[#777A82] transition group-hover:text-white" />
            </button>
          </div>
          <p className="mt-7 text-center text-[10px] tracking-wide text-white/20">
            RIO · CAREER INTELLIGENCE · YOUR DATA, YOUR PROGRESS
          </p>
          <nav
            aria-label="Progress quick actions"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#111315]/95 px-3 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-12px_35px_rgba(0,0,0,0.28)] backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto flex max-w-md items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextRoadmap = roadmapStats.find(
                    (roadmap) => roadmap.progress < 100,
                  );

                  navigate(
                    nextRoadmap?.id ? `/roadmap/${nextRoadmap.id}` : "/roadmap",
                  );
                }}
                className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 py-3 text-xs font-semibold text-[#17191C] active:scale-[0.98]"
              >
                {roadmapStats.some((roadmap) => roadmap.progress < 100)
                  ? "Continue Learning"
                  : "Start Learning"}
                <FiArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    interviews.length
                      ? "/mock-interview/history"
                      : "/mock-interview/new",
                  )
                }
                className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.045] px-3 py-3 text-xs font-semibold text-white active:scale-[0.98]"
              >
                {interviews.length ? "View Interviews" : "Start Interview"}
              </button>
            </div>
          </nav>
        </div>
      </main>
    </div>
  );
}
