import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiArrowDownRight,
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiChevronRight,
  FiCreditCard,
  FiFileText,
  FiLayers,
  FiPlay,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import Sidebar from "../../components/sidebar/SideBar";
import Surface from "../../components/ui/Surface";
import {
  getInterviewHistory,
  getActiveInterview,
} from "../../api/interview/interview.api";
import { getResumes } from "../../api/resume/resume.api";
import { getUserRoadmaps } from "../../api/roadmap/roadmap.api";
import {
  getBillingSummary,
  getBillingTransactions,
} from "../../api/billing/billing.api";
import PageHeader from "../../components/ui/PageHeader";
import MobileHeader from "../../components/MobileHeader";
import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import DashboardReveal from "../../components/dashboard/DashboardReveal";
import DashboardMobileActionBar from "../../components/dashboard/DashboardMobileActionBar";

const ease = [0.22, 1, 0.36, 1];

const normalizePayload = (response) => {
  let value = response?.data ?? response;
  if (value?.success && value?.data !== undefined) value = value.data;
  return value;
};

const asList = (value, keys = []) => {
  if (Array.isArray(value)) return value;
  for (const key of keys) if (Array.isArray(value?.[key])) return value[key];
  return [];
};

const dateValue = (value) => {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatRelativeDate = (value) => {
  const time = dateValue(value);
  if (!time) return "Date unavailable";
  const days = Math.floor((Date.now() - time) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(time).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const getRoadmapList = (response) =>
  asList(normalizePayload(response), ["roadmaps", "items"]);
const getResumeList = (response) =>
  asList(normalizePayload(response), ["resumes", "items"]);
const getInterviewList = (response) =>
  asList(normalizePayload(response), ["interviews", "history", "items"]);
const getTransactionList = (response) =>
  asList(normalizePayload(response), ["transactions", "items"]);

const getRoadmapProgress = (roadmap) => {
  const raw = Number(roadmap?.progressPercentage ?? roadmap?.progress ?? 0);
  return Number.isFinite(raw) ? Math.max(0, Math.min(100, Math.round(raw))) : 0;
};

const getResumeTitle = (resume) =>
  resume?.profile?.name ||
  resume?.personalInfo?.fullName ||
  resume?.name ||
  "Resume";

const Shimmer = ({ className = "" }) => (
  <span
    aria-hidden="true"
    className={`rio-shimmer block rounded-md ${className}`}
  />
);

const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => localStorage.getItem("rio-sidebar-open") !== "false",
  );
  const [compactDesktop, setCompactDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 768px) and (max-width: 1023px)",
    );
    const syncViewport = () => setCompactDesktop(media.matches);
    syncViewport();
    media.addEventListener?.("change", syncViewport);
    return () => media.removeEventListener?.("change", syncViewport);
  }, []);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    interviews: [],
    activeInterview: null,
    resumes: [],
    currentResume: null,
    roadmaps: [],
    billing: null,
    transactions: [],
  });

  const firstName = user?.name?.trim()?.split(/\s+/)?.[0] || "there";

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError("");

    const results = await Promise.allSettled([
      getInterviewHistory(),
      getActiveInterview(),
      getResumes(),
      getUserRoadmaps({ page: 1, limit: 20 }),
      getBillingSummary(),
      getBillingTransactions({ page: 1, pageSize: 5 }),
    ]);

    const next = {
      interviews:
        results[0].status === "fulfilled"
          ? getInterviewList(results[0].value)
          : [],
      activeInterview:
        results[1].status === "fulfilled"
          ? (normalizePayload(results[1].value)?.interview ??
            normalizePayload(results[1].value) ??
            null)
          : null,
      resumes:
        results[2].status === "fulfilled"
          ? getResumeList(results[2].value)
          : [],
      currentResume:
        results[2].status === "fulfilled"
          ? (getResumeList(results[2].value)[0] ?? null)
          : null,
      roadmaps:
        results[3].status === "fulfilled"
          ? getRoadmapList(results[3].value)
          : [],
      billing:
        results[4].status === "fulfilled"
          ? normalizePayload(results[4].value)
          : null,
      transactions:
        results[5].status === "fulfilled"
          ? getTransactionList(results[5].value)
          : [],
    };

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error("Dashboard request failed:", index, result.reason);
      }
    });
    const failures = results.filter(
      (result) => result.status === "rejected",
    ).length;

    setData(next);

    if (failures === results.length) {
      setError(
        "Dashboard data could not be loaded. Check your connection and try again.",
      );
    } else if (failures > 0) {
      setError(
        "Some sections could not load. Available information is shown; try refreshing to retry.",
      );
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const runDashboardLoad = async () => {
      if (cancelled) return;
      await loadDashboard(refreshKey > 0);
    };

    runDashboardLoad();

    return () => {
      cancelled = true;
    };
  }, [loadDashboard, refreshKey]);

  const balance = Number(
    data.billing?.currentBalance ??
      data.billing?.balance ??
      data.billing?.walletBalance ??
      user?.coins ??
      user?.balance,
  );
  const completedInterviews = data.interviews.filter((item) =>
    ["completed", "submitted", "evaluated"].includes(
      String(item?.status || "").toLowerCase(),
    ),
  ).length;
  const roadmapProgress = data.roadmaps.length
    ? Math.round(
        data.roadmaps.reduce((sum, item) => sum + getRoadmapProgress(item), 0) /
          data.roadmaps.length,
      )
    : 0;
  const profileCompletion = useMemo(() => {
    const fields = [
      user?.name,
      user?.email,
      user?.phone,
      user?.targetRole,
      user?.profileCompleted,
    ];
    const done = fields.filter(Boolean).length;
    return Math.round((done / fields.length) * 100);
  }, [user]);

  const activity = useMemo(() => {
    const items = [];
    data.interviews.forEach((item) =>
      items.push({
        id: `interview-${item?._id || item?.id || item?.updatedAt || item?.createdAt}`,
        title:
          item?.title || item?.role || item?.interviewType || "Mock interview",
        detail: item?.status
          ? `Interview · ${String(item.status).replace(/[-_]/g, " ")}`
          : "Interview activity",
        date: item?.updatedAt || item?.completedAt || item?.createdAt,
        icon: FiPlay,
        action: "/mock-interview/history",
      }),
    );
    data.roadmaps.forEach((item) =>
      items.push({
        id: `roadmap-${item?._id || item?.id}`,
        title:
          item?.roadmap?.title ||
          item?.catalogRoadmap?.title ||
          item?.title ||
          "Learning roadmap",
        detail: `Roadmap · ${getRoadmapProgress(item)}% progress`,
        date: item?.lastAccessedAt || item?.updatedAt || item?.createdAt,
        icon: FiBookOpen,
        action: "/roadmap",
      }),
    );
    data.resumes.forEach((item) =>
      items.push({
        id: `resume-${item?._id || item?.id}`,
        title: getResumeTitle(item),
        detail: "Resume · available in your workspace",
        date: item?.updatedAt || item?.createdAt,
        icon: FiFileText,
        action: "/builder/dashboard",
      }),
    );
    data.transactions.forEach((item) =>
      items.push({
        id: `billing-${item?._id || item?.transactionId || item?.id}`,
        title: item?.title || item?.description || "Billing activity",
        detail: `Billing · ${String(item?.status || "recorded").replace(/[-_]/g, " ")}`,
        date: item?.updatedAt || item?.createdAt || item?.created,
        icon: FiCreditCard,
        action: "/billing/history",
      }),
    );
    return items
      .filter(
        (item) =>
          item.id &&
          item.id !== "interview-undefined" &&
          item.id !== "roadmap-undefined" &&
          item.id !== "resume-undefined" &&
          item.id !== "billing-undefined",
      )
      .sort((a, b) => dateValue(b.date) - dateValue(a.date))
      .slice(0, 5);
  }, [data]);

  const activeInterview =
    data.activeInterview &&
    !["completed", "submitted", "cancelled", "expired"].includes(
      String(data.activeInterview.status || "").toLowerCase(),
    )
      ? data.activeInterview
      : null;
  const latestRoadmap = [...data.roadmaps].sort(
    (a, b) =>
      dateValue(b?.lastAccessedAt || b?.updatedAt || b?.createdAt) -
      dateValue(a?.lastAccessedAt || a?.updatedAt || a?.createdAt),
  )[0];
  const latestResume = data.currentResume || data.resumes[0] || null;

  const stats = [
    {
      label: "Account balance",
      value: Number.isFinite(balance) ? formatMoney(balance) : "—",
      note: "Available credits",
      icon: FiCreditCard,
      action: "/billing",
    },
    {
      label: "Interview sessions",
      value: String(data.interviews.length),
      note: `${completedInterviews} completed`,
      icon: FiActivity,
      action: "/mock-interview/history",
    },
    {
      label: "Active roadmaps",
      value: String(data.roadmaps.length),
      note: data.roadmaps.length
        ? `${roadmapProgress}% average progress`
        : "Start your first path",
      icon: FiLayers,
      action: "/roadmap",
    },
    {
      label: "Resumes",
      value: String(data.resumes.length || (data.currentResume ? 1 : 0)),
      note: latestResume ? "Workspace available" : "Build your resume",
      icon: FiFileText,
      action: "/builder/dashboard",
    },
  ];

  const enter = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.42, ease },
      };

  return (
    <div className="rio-dashboard relative min-h-screen overflow-x-clip bg-[#17191C] text-white selection:bg-white/30 selection:text-white">
      <style>{`
        @keyframes rio-dashboard-shimmer {
          0% { background-position: 180% 0; }
          100% { background-position: -80% 0; }
        }
        .rio-dashboard .rio-shimmer {
          background: linear-gradient(100deg, rgba(255,255,255,.045) 20%, rgba(255,255,255,.105) 38%, rgba(255,255,255,.045) 56%);
          background-size: 220% 100%;
          animation: rio-dashboard-shimmer 1.45s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .rio-dashboard .rio-shimmer { animation: none; }
          .rio-dashboard * { scroll-behavior: auto !important; }
        }
      `}</style>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 50% at 85% 0%, rgba(255,255,255,0.045), transparent 70%), radial-gradient(ellipse 55% 40% at 0% 100%, rgba(255,255,255,0.02), transparent 72%)",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          user={user}
          sidebarOpen={compactDesktop ? false : sidebarOpen}
          setUser={setUser}
          setSidebarOpen={setSidebarOpen}
        />
        <main
          className={`min-w-0 flex-1 transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${compactDesktop ? "md:ml-[76px]" : sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"}`}
        >
          <MobileHeader
            onOpenNavigation={() => setMobileOpen(true)}
            user={user}
          />

          <div className="mx-auto w-full max-w-[1600px] px-4 pt-[clamp(5.5rem,10vh,6.5rem)] pb-[calc(5rem+env(safe-area-inset-bottom))] min-[480px]:px-5 sm:pt-8 sm:pb-10 md:px-6 md:pt-8 lg:px-8 xl:px-10">
            <motion.div
              {...enter}
              className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-7 sm:gap-5 lg:flex-row lg:items-end lg:justify-between"
            >
              <PageHeader
                size="hero"
                eyebrow="Dashboard"
                title={
                  <>
                    Welcome, {firstName}
                    <span className="mt-1 block font-serif font-normal italic tracking-[-0.055em] text-[#A1A1AA]">
                      your next chapter starts here.
                    </span>
                  </>
                }
                description="Your work, learning progress and account activity — together in one place."
              />

              <div className="hidden max-w-full shrink-0 flex-wrap gap-2 lg:flex">
                <button
                  type="button"
                  onClick={() => navigate("/builder/dashboard")}
                  className="inline-flex min-h-10 max-w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Resume Builder <FiArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/roadmap")}
                  className="inline-flex min-h-10 max-w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  My Roadmaps <FiArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/mock-interview/new")}
                  className="inline-flex min-h-10 max-w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  Start Interview <FiArrowRight size={14} />
                </button>
              </div>
            </motion.div>

            <AnimatePresence initial={false}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-amber-200/15 bg-amber-100/[0.04] px-4 py-3 text-xs text-white"
                >
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => setRefreshKey((value) => value + 1)}
                    className="shrink-0 underline underline-offset-4"
                  >
                    Retry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              variants={
                reduceMotion
                  ? undefined
                  : {
                      hidden: { opacity: 1 },
                      show: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.075,
                          delayChildren: 0.04,
                        },
                      },
                    }
              }
              initial={reduceMotion ? false : "hidden"}
              animate="show"
              className="mb-4 grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2 2xl:grid-cols-4 sm:gap-4"
            >
              {stats.map((stat, index) => (
                <DashboardStatCard
                  key={stat.label}
                  stat={stat}
                  loading={loading}
                  onClick={() => navigate(stat.action)}
                  index={index}
                />
              ))}
            </motion.div>

            <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(290px,0.8fr)]">
              <DashboardReveal delay={0.06} reduceMotion={reduceMotion}>
                <Surface className="min-w-0 p-4 min-[480px]:p-5 sm:p-6 xl:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                        Continue where you left off
                      </p>
                      <h2 className="mt-2 text-xl font-medium tracking-[-0.03em] sm:text-2xl">
                        Your next move
                      </h2>
                      <p className="mt-2 max-w-xl text-xs leading-5 text-[#92949B]">
                        Jump back into an active session or keep building
                        momentum across your workspace.
                      </p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.055] text-white">
                      <FiTarget size={18} />
                    </span>
                  </div>
                  {activeInterview ? (
                    <div className="mt-6 rounded-2xl border border-white/[0.14] bg-white/[0.055] p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                          <FiPlay size={17} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white">
                            Active mock interview
                          </p>
                          <p className="mt-1 text-xs text-[#92949B]">
                            {activeInterview?.role ||
                              activeInterview?.title ||
                              "Resume your interview session"}
                          </p>
                        </div>
                        <span className="rounded-full border border-white/[0.14] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white">
                          In progress
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            activeInterview?._id || activeInterview?.id
                              ? `/mock-interview/${activeInterview._id || activeInterview.id}`
                              : "/mock-interview",
                          )
                        }
                        className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-[#17191C] hover:bg-white"
                      >
                        Resume interview <FiArrowRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            latestRoadmap?._id
                              ? `/roadmap/${latestRoadmap._id}`
                              : "/roadmap",
                          )
                        }
                        className="group rounded-2xl border border-white/[0.10] bg-white/[0.045] p-4 text-left transition hover:border-white/[0.14] hover:bg-white/[0.055]"
                      >
                        <div className="flex items-center justify-between">
                          <FiBookOpen size={17} className="text-white" />
                          <FiArrowRight
                            size={14}
                            className="text-[#92949B] transition group-hover:translate-x-1 group-hover:text-white"
                          />
                        </div>
                        <p className="mt-4 text-sm font-medium text-white">
                          {latestRoadmap?.roadmap?.title ||
                            latestRoadmap?.catalogRoadmap?.title ||
                            latestRoadmap?.title ||
                            "Explore your roadmap"}
                        </p>
                        <p className="mt-1 text-[11px] text-[#92949B]">
                          {latestRoadmap
                            ? `${getRoadmapProgress(latestRoadmap)}% progress · continue learning`
                            : "Choose a learning path to get started"}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            latestResume ? "/builder/dashboard" : "/builder",
                          )
                        }
                        className="group rounded-2xl border border-white/[0.10] bg-white/[0.045] p-4 text-left transition hover:border-white/[0.14] hover:bg-white/[0.055]"
                      >
                        <div className="flex items-center justify-between">
                          <FiFileText size={17} className="text-white" />
                          <FiArrowRight
                            size={14}
                            className="text-[#92949B] transition group-hover:translate-x-1 group-hover:text-white"
                          />
                        </div>
                        <p className="mt-4 text-sm font-medium text-white">
                          {latestResume
                            ? getResumeTitle(latestResume)
                            : "Build your resume"}
                        </p>
                        <p className="mt-1 text-[11px] text-[#92949B]">
                          {latestResume
                            ? "Open your resume workspace"
                            : "Create and refine your professional profile"}
                        </p>
                      </button>
                    </div>
                  )}
                  <div className="mt-6 border-t border-white/[0.10] pt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#92949B]">
                        Workspace completion
                      </span>
                      <span className="text-xs font-medium text-white">
                        {profileCompletion}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.055]">
                      <motion.div
                        initial={false}
                        animate={{ width: `${profileCompletion}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-[#a1a1aa] to-[#f4f4f5]"
                      />
                    </div>
                    <p className="mt-2 text-[10px] text-[#92949B]">
                      Based on available account profile fields, not an
                      assessment score.
                    </p>
                  </div>
                </Surface>
              </DashboardReveal>

              <DashboardReveal delay={0.12} reduceMotion={reduceMotion}>
                <Surface className="min-w-0 p-4 min-[480px]:p-5 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                        Learning overview
                      </p>
                      <h2 className="mt-2 text-xl font-medium tracking-[-0.03em]">
                        Your momentum
                      </h2>
                    </div>
                    <FiTrendingUp size={18} className="text-white" />
                  </div>
                  <div className="mt-6 space-y-5">
                    {[
                      {
                        label: "Roadmap progress",
                        value: roadmapProgress,
                        detail: data.roadmaps.length
                          ? `${data.roadmaps.length} saved learning path${data.roadmaps.length === 1 ? "" : "s"}`
                          : "No roadmaps yet",
                      },
                      {
                        label: "Interview completion",
                        value: data.interviews.length
                          ? Math.round(
                              (completedInterviews / data.interviews.length) *
                                100,
                            )
                          : 0,
                        detail: `${completedInterviews} of ${data.interviews.length} sessions completed`,
                      },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-medium text-white">
                            {item.label}
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {loading ? (
                              <Shimmer className="h-3 w-8" />
                            ) : (
                              `${item.value}%`
                            )}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.055]">
                          <motion.div
                            initial={false}
                            animate={{ width: `${loading ? 0 : item.value}%` }}
                            transition={{ duration: 0.6, ease }}
                            className="h-full rounded-full bg-white"
                          />
                        </div>
                        <p className="mt-2 text-[10px] text-[#92949B]">
                          {loading ? (
                            <Shimmer className="mt-2 h-2.5 w-32 max-w-full" />
                          ) : (
                            item.detail
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl border border-white/[0.10] bg-white/[0.045] p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.055] text-white">
                        <FiZap size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-white">
                          Keep your progress real
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-[#92949B]">
                          Stats update from your saved activity; unavailable
                          services are not replaced with sample numbers.
                        </p>
                      </div>
                    </div>
                  </div>
                </Surface>
              </DashboardReveal>
            </div>

            <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
              <DashboardReveal delay={0.08} reduceMotion={reduceMotion}>
                <Surface className="min-w-0 p-4 min-[480px]:p-5 sm:p-6">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                        Latest updates
                      </p>
                      <h2 className="mt-2 text-xl font-medium tracking-[-0.03em]">
                        Recent activity
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/mock-interview/history")}
                      className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-[11px] text-[#92949B] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    >
                      View history <FiChevronRight size={14} />
                    </button>
                  </div>
                  {loading ? (
                    <div
                      className="mt-5 divide-y divide-white/[0.06]"
                      aria-label="Loading recent activity"
                    >
                      {[0, 1, 2].map((key) => (
                        <div
                          key={key}
                          className="flex items-center gap-3 py-4 first:pt-1"
                        >
                          <Shimmer className="h-10 w-10 shrink-0 rounded-xl" />
                          <div className="min-w-0 flex-1 space-y-2">
                            <Shimmer className="h-3 w-2/3 max-w-full" />
                            <Shimmer className="h-2.5 w-1/2 max-w-full" />
                          </div>
                          <Shimmer className="h-2.5 w-12 shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : activity.length ? (
                    <div className="mt-4 divide-y divide-white/[0.07]">
                      {activity.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => navigate(item.action)}
                            className="flex min-h-[60px] w-full items-center gap-3 py-4 text-left first:pt-1 last:pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/30"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] text-white">
                              <Icon size={16} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-medium text-white">
                                {item.title}
                              </span>
                              <span className="mt-1 block truncate text-[10px] capitalize text-[#92949B]">
                                {item.detail}
                              </span>
                            </span>
                            <span className="shrink-0 text-[10px] text-[#92949B]">
                              {formatRelativeDate(item.date)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-white/[0.10] px-4 py-8 text-center">
                      <FiActivity
                        className="mx-auto text-[#92949B]"
                        size={20}
                      />
                      <p className="mt-3 text-xs font-medium text-white">
                        No recent activity yet
                      </p>
                      <p className="mt-1 text-[10px] text-[#92949B]">
                        Your saved interviews, roadmaps, resumes and billing
                        events will appear here.
                      </p>
                    </div>
                  )}
                </Surface>
              </DashboardReveal>

              <DashboardReveal delay={0.14} reduceMotion={reduceMotion}>
                <Surface className="min-w-0 p-4 min-[480px]:p-5 sm:p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                    Quick access
                  </p>
                  <h2 className="mt-2 text-xl font-medium tracking-[-0.03em]">
                    Your tools
                  </h2>
                  <div className="mt-4 space-y-2">
                    {[
                      {
                        title: "Resume builder",
                        desc: "Create and manage resumes",
                        icon: FiFileText,
                        to: "/builder/dashboard",
                      },
                      {
                        title: "Mock interviews",
                        desc: "Practice and review sessions",
                        icon: FiPlay,
                        to: "/mock-interview",
                      },
                      {
                        title: "Learning roadmaps",
                        desc: "Continue your learning paths",
                        icon: FiBookOpen,
                        to: "/roadmap",
                      },
                      {
                        title: "Resume scorer",
                        desc: "Review your resume score",
                        icon: FiTarget,
                        to: "/scorer",
                      },
                      {
                        title: "Billing & balance",
                        desc: "Manage credits and payments",
                        icon: FiCreditCard,
                        to: "/billing",
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          type="button"
                          key={item.title}
                          onClick={() => navigate(item.to)}
                          className="group flex min-h-[58px] w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-colors hover:border-white/[0.10] hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] text-white">
                            <Icon size={15} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-medium text-white">
                              {item.title}
                            </span>
                            <span className="mt-1 block text-[10px] text-[#92949B]">
                              {item.desc}
                            </span>
                          </span>
                          <FiArrowRight
                            size={14}
                            className="text-[#92949B] transition group-hover:translate-x-0.5 group-hover:text-white"
                          />
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/builder/dashboard")}
                    className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.055] px-4 text-xs font-semibold text-[var(--accent)] transition hover:bg-white/[0.1]"
                  >
                    Open your workspace <FiArrowDownRight size={14} />
                  </button>
                </Surface>
              </DashboardReveal>
            </div>

            <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/[0.10] py-5 text-center text-[10px] text-[#92949B] sm:flex-row sm:text-left">
              <span>
                RIO Workspace <span className="mx-1 text-white">.</span> Your
                progress, in one place
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FiCheckCircle size={12} /> Live account data where available
              </span>
            </footer>
          </div>
          <DashboardMobileActionBar
            onStartInterview={() => navigate("/mock-interview/new")}
            onOpenResume={() => navigate("/builder/dashboard")}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
