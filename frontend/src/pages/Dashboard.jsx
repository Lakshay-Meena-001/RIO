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
  FiMenu,
  FiPlay,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import Sidebar from "../components/SideBar";
import { getInterviewHistory, getActiveInterview } from "../api/interview.api";
import { getResume, getResumes } from "../api/resume.api";
import { getUserRoadmaps } from "../api/roadmap.api";
import { getBillingSummary, getBillingTransactions } from "../api/billing.api";

const ease = [0.22, 1, 0.36, 1];

const Surface = ({ children, className = "" }) => (
  <section
    className={`relative overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#111315]/95 shadow-[0_22px_70px_rgba(0,0,0,0.18)] ${className}`}
  >
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 78% 85% at 100% 0%, rgba(255,255,255,0.055), transparent 66%), linear-gradient(135deg, rgba(255,255,255,0.025), transparent 48%)",
      }}
    />
    <div className="relative">{children}</div>
  </section>
);

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

const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      getResume(),
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
        results[3].status === "fulfilled"
          ? (normalizePayload(results[3].value)?.resume ??
            normalizePayload(results[3].value) ??
            null)
          : null,
      roadmaps:
        results[4].status === "fulfilled"
          ? getRoadmapList(results[4].value)
          : [],
      billing:
        results[5].status === "fulfilled"
          ? normalizePayload(results[5].value)
          : null,
      transactions:
        results[6].status === "fulfilled"
          ? getTransactionList(results[6].value)
          : [],
    };

    const failures = results.filter(
      (result) => result.status === "rejected",
    ).length;
    setData(next);
    if (failures === results.length)
      setError(
        "Dashboard data could not be loaded. Check your connection and try again.",
      );
    else if (failures > 0)
      setError(
        "Some sections could not load. Available information is shown; try refreshing to retry.",
      );
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadDashboard(refreshKey > 0);
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
    <div className="relative min-h-screen overflow-hidden bg-[#0b0c0e] text-white selection:bg-white/30 selection:text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 62% 48% at 95% 0%, rgba(255,255,255,0.055), transparent 68%), radial-gradient(ellipse 55% 52% at 0% 100%, rgba(255,255,255,0.025), transparent 70%), linear-gradient(135deg,#111214 0%,#0b0c0e 52%,#101113 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          user={user}
          sidebarOpen={sidebarOpen}
          setUser={setUser}
          setSidebarOpen={setSidebarOpen}
        />
        <main
          className={`min-w-0 flex-1 transition-[margin-left] duration-300 ${sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"}`}
        >
          <header className="fixed left-3 right-3 top-3 z-20 flex h-14 items-center justify-between rounded-full border border-white/[0.09] bg-[#111315]/85 px-3 shadow-[0_12px_45px_rgba(0,0,0,0.24)] backdrop-blur-2xl md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white"
            >
              <FiMenu size={18} />
            </button>
            <span className="text-sm font-semibold tracking-[0.22em]">
              RIO <span className="text-white">/</span> WORKSPACE
            </span>
            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              aria-label="Refresh dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white"
            >
              <FiRefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </header>

          <div className="mx-auto w-full max-w-[1540px] px-4 pb-10 pt-[88px] sm:px-6 lg:px-9 lg:py-9">
            <motion.div
              {...enter}
              className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-white">
                  <span className="h-px w-6 bg-white/70" /> Personal workspace
                </p>
                <h1 className="text-[32px] font-medium leading-tight tracking-[-0.045em] text-white sm:text-[42px]">
                  Welcome back,{" "}
                  <span className="font-light text-white">{firstName}</span>
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8c8d91]">
                  Your work, learning progress and account activity — together
                  in one place.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRefreshKey((value) => value + 1)}
                  disabled={refreshing}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/[0.11] bg-white/[0.035] px-4 text-xs font-medium text-[#dedede] transition hover:bg-white/[0.07] disabled:opacity-60"
                >
                  <FiRefreshCw
                    size={13}
                    className={refreshing ? "animate-spin" : ""}
                  />{" "}
                  {refreshing ? "Refreshing" : "Refresh"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/mock-interview/new")}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#e4e4e7] px-5 text-xs font-semibold text-[#171511] transition hover:bg-[#ffffff]"
                >
                  <FiPlay size={13} /> Start interview
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
              {...enter}
              className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
            >
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <button
                    type="button"
                    key={stat.label}
                    onClick={() => navigate(stat.action)}
                    className="group relative overflow-hidden rounded-[21px] border border-white/[0.085] bg-[#111315]/90 p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-[#151618]"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.035] blur-2xl transition group-hover:bg-white/[0.09]"
                    />
                    <div className="relative flex items-start justify-between gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#77797d]">
                        {stat.label}
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/[0.055] text-white">
                        <Icon size={16} />
                      </span>
                    </div>
                    <p className="relative mt-5 text-[27px] font-medium tracking-[-0.04em] text-white">
                      {loading ? (
                        <span className="inline-block h-7 w-20 animate-pulse rounded bg-white/[0.08]" />
                      ) : (
                        stat.value
                      )}
                    </p>
                    <div className="relative mt-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#77797d]">
                        {loading ? "Loading live data…" : stat.note}
                      </span>
                      <FiArrowRight
                        size={14}
                        className="text-[#68696d] transition group-hover:translate-x-1 group-hover:text-white"
                      />
                    </div>
                  </button>
                );
              })}
            </motion.div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.8fr)]">
              <Surface className="p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                      Continue where you left off
                    </p>
                    <h2 className="mt-2 text-xl font-medium tracking-[-0.03em] sm:text-2xl">
                      Your next move
                    </h2>
                    <p className="mt-2 max-w-xl text-xs leading-5 text-[#85868a]">
                      Jump back into an active session or keep building momentum
                      across your workspace.
                    </p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.055] text-white">
                    <FiTarget size={18} />
                  </span>
                </div>
                {activeInterview ? (
                  <div className="mt-6 rounded-2xl border border-white/20 bg-white/[0.045] p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                        <FiPlay size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">
                          Active mock interview
                        </p>
                        <p className="mt-1 text-xs text-[#929398]">
                          {activeInterview?.role ||
                            activeInterview?.title ||
                            "Resume your interview session"}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/20 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white">
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
                      className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#e4e4e7] px-4 text-xs font-semibold text-[#171511] hover:bg-[#ffffff]"
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
                      className="group rounded-2xl border border-white/[0.09] bg-white/[0.025] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.045]"
                    >
                      <div className="flex items-center justify-between">
                        <FiBookOpen size={17} className="text-white" />
                        <FiArrowRight
                          size={14}
                          className="text-[#68696d] transition group-hover:translate-x-1 group-hover:text-white"
                        />
                      </div>
                      <p className="mt-4 text-sm font-medium text-white">
                        {latestRoadmap?.roadmap?.title ||
                          latestRoadmap?.catalogRoadmap?.title ||
                          latestRoadmap?.title ||
                          "Explore your roadmap"}
                      </p>
                      <p className="mt-1 text-[11px] text-[#828388]">
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
                      className="group rounded-2xl border border-white/[0.09] bg-white/[0.025] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.045]"
                    >
                      <div className="flex items-center justify-between">
                        <FiFileText size={17} className="text-white" />
                        <FiArrowRight
                          size={14}
                          className="text-[#68696d] transition group-hover:translate-x-1 group-hover:text-white"
                        />
                      </div>
                      <p className="mt-4 text-sm font-medium text-white">
                        {latestResume
                          ? getResumeTitle(latestResume)
                          : "Build your resume"}
                      </p>
                      <p className="mt-1 text-[11px] text-[#828388]">
                        {latestResume
                          ? "Open your resume workspace"
                          : "Create and refine your professional profile"}
                      </p>
                    </button>
                  </div>
                )}
                <div className="mt-6 border-t border-white/[0.075] pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77797d]">
                      Workspace completion
                    </span>
                    <span className="text-xs font-medium text-white">
                      {profileCompletion}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <motion.div
                      initial={false}
                      animate={{ width: `${profileCompletion}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#a1a1aa] to-[#f4f4f5]"
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-[#77797d]">
                    Based on available account profile fields, not an assessment
                    score.
                  </p>
                </div>
              </Surface>

              <Surface className="p-5 sm:p-6">
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
                        <span className="text-xs font-medium text-[#dedede]">
                          {item.label}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {loading ? "—" : `${item.value}%`}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                        <motion.div
                          initial={false}
                          animate={{ width: `${loading ? 0 : item.value}%` }}
                          transition={{ duration: 0.6, ease }}
                          className="h-full rounded-full bg-[#e4e4e7]"
                        />
                      </div>
                      <p className="mt-2 text-[10px] text-[#77797d]">
                        {loading ? "Loading" : item.detail}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] text-white">
                      <FiZap size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white">
                        Keep your progress real
                      </p>
                      <p className="mt-1 text-[10px] leading-4 text-[#77797d]">
                        Stats update from your saved activity; unavailable
                        services are not replaced with sample numbers.
                      </p>
                    </div>
                  </div>
                </div>
              </Surface>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
              <Surface className="p-5 sm:p-6">
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
                    className="inline-flex items-center gap-1 text-[11px] text-[#999a9e] transition hover:text-white"
                  >
                    View history <FiChevronRight size={14} />
                  </button>
                </div>
                {loading ? (
                  <div className="mt-5 space-y-4">
                    {[0, 1, 2].map((key) => (
                      <div key={key} className="flex gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.06]" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
                          <div className="h-2.5 w-1/3 animate-pulse rounded bg-white/[0.04]" />
                        </div>
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
                          className="flex w-full items-center gap-3 py-4 text-left first:pt-1 last:pb-1"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white">
                            <Icon size={16} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-medium text-[#e8e8e8]">
                              {item.title}
                            </span>
                            <span className="mt-1 block truncate text-[10px] capitalize text-[#77797d]">
                              {item.detail}
                            </span>
                          </span>
                          <span className="shrink-0 text-[10px] text-[#77797d]">
                            {formatRelativeDate(item.date)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-white/[0.1] px-4 py-8 text-center">
                    <FiActivity className="mx-auto text-[#66686c]" size={20} />
                    <p className="mt-3 text-xs font-medium text-[#dedede]">
                      No recent activity yet
                    </p>
                    <p className="mt-1 text-[10px] text-[#77797d]">
                      Your saved interviews, roadmaps, resumes and billing
                      events will appear here.
                    </p>
                  </div>
                )}
              </Surface>

              <Surface className="p-5 sm:p-6">
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
                        className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-white/[0.07] hover:bg-white/[0.035]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white">
                          <Icon size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium text-[#e4e4e4]">
                            {item.title}
                          </span>
                          <span className="mt-1 block text-[10px] text-[#77797d]">
                            {item.desc}
                          </span>
                        </span>
                        <FiArrowRight
                          size={14}
                          className="text-[#65666a] transition group-hover:translate-x-0.5 group-hover:text-white"
                        />
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/builder/dashboard")}
                  className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 text-xs font-semibold text-[#d8c79e] transition hover:bg-white/[0.1]"
                >
                  Open your workspace <FiArrowDownRight size={14} />
                </button>
              </Surface>
            </div>

            <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/[0.07] py-5 text-[10px] text-[#66686c] sm:flex-row">
              <span>
                RIO Workspace <span className="mx-1 text-white">/</span> Your
                progress, in one place
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FiCheckCircle size={12} /> Live account data where available
              </span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
