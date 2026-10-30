import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiClock,
  FiFileText,
  FiEdit3,
  FiCheckCircle,
  FiTrendingUp,
  FiLayout,
  FiRefreshCw,
} from "react-icons/fi";

import { getResumes } from "../../api/resume/resume.api";
import Sidebar from "../../components/sidebar/SideBar";
import MobileHeader from "../../components/MobileHeader";
import PageEyebrow from "../../components/ui/PageEyebrow";
import Surface from "../../components/ui/Surface";
import {
  PrimaryButton,
  SecondaryButton,
} from "../../components/resume-builder/dashboard/ResumeActionButtons";
import ResumeDashboardMobileActionBar from "../../components/resume-builder/dashboard/ResumeDashboardMobileActionBar";
import ResumeDashboardStats from "../../components/resume-builder/dashboard/ResumeDashboardStats";
import "./resume-builder.css";

const ease = [0.22, 1, 0.36, 1];

const getPayload = (response) =>
  response?.data?.data ?? response?.data ?? response;

const getResumeList = (response) => {
  const payload = getPayload(response);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.resumes)) return payload.resumes;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
};

const getResumeName = (resume) =>
  resume?.profile?.name ||
  resume?.personalInfo?.fullName ||
  resume?.name ||
  "Untitled resume";

const getUpdatedDate = (value) => {
  if (!value) return "Recently updated";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently updated";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getCompletion = (resume) => {
  if (!resume) return 0;

  const profile = resume.profile || resume.personalInfo || {};

  const checks = [
    Boolean(profile.name || profile.fullName),
    Boolean(profile.email),
    Boolean(profile.phone),
    Boolean(resume.summary || resume.professionalSummary),
    Array.isArray(resume.education) && resume.education.length > 0,
    Array.isArray(resume.experience) && resume.experience.length > 0,
    Array.isArray(resume.projects) && resume.projects.length > 0,
    Array.isArray(resume.skills) && resume.skills.length > 0,
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const ResumeBuilderDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => localStorage.getItem("rio-sidebar-open") !== "false",
  );

  const firstName = user?.name?.trim()?.split(/\s+/)?.[0] || "there";

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const result = await getResumes();
        if (cancelled) return;
        const list = getResumeList(result);
        setResumes(list);
        setCurrentResume(list[0] || null);
        setError("");
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Could not load your resume history.",
          );
          setCurrentResume(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeResume = useMemo(() => {
    if (currentResume) return currentResume;
    return resumes[0] || null;
  }, [currentResume, resumes]);

  const completion = useMemo(() => getCompletion(activeResume), [activeResume]);

  const stats = useMemo(() => {
    const total = resumes.length;

    const completed = resumes.filter(
      (resume) => getCompletion(resume) === 100,
    ).length;

    const average = total
      ? Math.round(
          resumes.reduce((sum, resume) => sum + getCompletion(resume), 0) /
            total,
        )
      : 0;

    return [
      {
        label: "Total resumes",
        value: total,
        detail: "Your resume workspace",
        icon: FiFileText,
      },
      {
        label: "In progress",
        value: resumes.filter((resume) => getCompletion(resume) < 100).length,
        detail: "Ready for improvement",
        icon: FiTrendingUp,
      },
      {
        label: "Completed",
        value: completed,
        detail: "All key sections filled",
        icon: FiCheckCircle,
      },
      {
        label: "Average readiness",
        value: `${average}%`,
        detail: "Across saved resumes",
        icon: FiLayout,
      },
    ];
  }, [resumes]);

  const openBuilder = () => navigate("/builder");

  const openHistory = () => navigate("/builder/history");

  const openResume = (resume) => {
    const id = resume?._id || resume?.id;

    navigate(id ? `/builder?resumeId=${encodeURIComponent(id)}` : "/builder");
  };

  return (
    <div className="rio-resume-dashboard relative min-h-screen overflow-x-clip bg-[#17191C] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 50% at 85% 0%, rgba(255,255,255,0.045), transparent 70%), radial-gradient(ellipse 55% 40% at 0% 100%, rgba(255,255,255,0.02), transparent 72%)",
        }}
      />

      {/* Mobile header */}
      <MobileHeader onOpenNavigation={() => setMobileOpen(true)} user={user} />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          user={user}
          setUser={setUser}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main
          className={`min-w-0 flex-1 transition-[margin-left] duration-300 ease-out ${
            sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"
          }`}
        >
          <div className="rio-dashboard-content mx-auto w-full max-w-[1600px] px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[clamp(5.5rem,10vh,6.5rem)] sm:px-7 sm:pb-10 sm:pt-8 lg:px-9 lg:pt-9">
            {/* Page heading */}
            <motion.section
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
              className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end"
            >
              <div className="max-w-3xl">
                <PageEyebrow className="mb-3">
                  Your resume workspace
                </PageEyebrow>

                <h1 className="text-[35px] font-semibold leading-[1.03] tracking-[-0.055em] sm:text-[47px] lg:text-[56px]">
                  Your next chapter,
                  <span className="mt-1 block font-serif font-normal italic tracking-[-0.055em] text-[#A1A1AA]">
                    well presented.
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-[#92949B]">
                  Welcome back, {firstName}. Build a clear story around your
                  skills, experience, and the work you are proud of.
                </p>
              </div>

              {/* These two buttons are desktop-only */}
              <div className="hidden flex-wrap gap-2 md:flex">
                <SecondaryButton onClick={openHistory}>
                  <FiClock size={14} />
                  View history
                </SecondaryButton>

                <PrimaryButton onClick={openBuilder}>
                  Resume Builder
                  <FiArrowRight size={14} />
                </PrimaryButton>
              </div>
            </motion.section>

            <ResumeDashboardStats
              stats={stats}
              loading={loading}
              reduceMotion={reduceMotion}
            />
            {/* Continue editing */}
            <section className="mb-10">
              <div className="mb-5 flex items-end justify-center gap-3 sm:justify-between">
                <div className="text-center sm:text-left">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#777A82]">
                    Continue creating
                  </p>
                  <h2 className="mt-2 text-[23px] font-semibold tracking-[-0.045em] sm:text-[29px]">
                    Pick up where you left off.
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={openHistory}
                  className="hidden items-center gap-2 pb-1 text-[11px] text-[#A1A1AA] transition hover:text-white sm:inline-flex"
                >
                  All resumes <FiArrowRight size={13} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Surface className="p-6 sm:p-8">
                      <div className="h-4 w-28 animate-pulse rounded bg-white/[0.08]" />
                      <div className="mt-5 h-8 max-w-sm animate-pulse rounded bg-white/[0.08]" />
                      <div className="mt-4 h-3 max-w-xl animate-pulse rounded bg-white/[0.05]" />
                      <div className="mt-8 h-2 animate-pulse rounded-full bg-white/[0.06]" />
                    </Surface>
                  </motion.div>
                ) : activeResume ? (
                  <motion.div
                    key={
                      activeResume._id || activeResume.id || "current-resume"
                    }
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3, ease }}
                  >
                    <Surface>
                      <div className="grid md:grid-cols-[minmax(0,1fr)_205px]">
                        <div className="min-w-0 p-5 sm:p-7 lg:p-8">
                          <div className="mb-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] ${
                                completion === 100
                                  ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                                  : "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              {completion === 100
                                ? "Completed"
                                : "Resume in progress"}
                            </span>
                          </div>

                          <h3 className="break-words text-center text-[27px] font-semibold tracking-[-0.045em] sm:text-left sm:text-[34px]">
                            {getResumeName(activeResume)}
                          </h3>

                          <p className="mt-3 text-center text-xs leading-6 text-[#92949B] sm:text-left">
                            {activeResume.summary ||
                              activeResume.professionalSummary ||
                              "Add a concise professional summary to introduce your strengths and the value you bring."}
                          </p>

                          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[10px] text-[#777A82] sm:justify-start">
                            <span>{completion}% complete</span>
                            <span className="text-white/20">·</span>
                            <span>
                              Updated{" "}
                              {getUpdatedDate(
                                activeResume.updatedAt ||
                                  activeResume.createdAt,
                              )}
                            </span>
                          </div>

                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                            <motion.div
                              className="h-full rounded-full bg-white"
                              initial={reduceMotion ? false : { width: 0 }}
                              animate={{ width: `${completion}%` }}
                              transition={{ duration: 0.65, ease }}
                            />
                          </div>

                          {/* Mobile: saved resumes left, continue editing right */}
                          <div className="mt-6 flex flex-nowrap gap-2">
                            <SecondaryButton
                              onClick={openHistory}
                              className="order-1 min-w-0 flex-1 whitespace-nowrap px-3 sm:order-2 sm:flex-none sm:px-4"
                            >
                              View saved resumes
                            </SecondaryButton>

                            <PrimaryButton
                              onClick={() => openResume(activeResume)}
                              className="order-2 min-w-0 flex-1 whitespace-nowrap px-3 sm:order-1 sm:flex-none sm:px-5"
                            >
                              <FiEdit3 size={14} />
                              Continue editing
                              <FiArrowRight size={13} />
                            </PrimaryButton>
                          </div>
                        </div>

                        {/* Next-step panel */}
                        <div className="flex flex-col items-center justify-between border-t border-white/[0.08] bg-white/[0.015] p-5 text-center sm:p-6 md:items-start md:border-l md:border-t-0 md:text-left">
                          <div className="flex flex-col items-center md:items-start">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                              <FiFileText
                                size={19}
                                className="text-[#D4D4D8]"
                              />
                            </div>

                            <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#777A82]">
                              Your next step
                            </p>

                            <p className="mt-2 text-sm font-medium leading-6 text-[#E4E4E7]">
                              Small improvements make a stronger first
                              impression.
                            </p>

                            <p className="mt-2 text-[10px] leading-5 text-[#777A82]">
                              Complete the missing sections and review your
                              resume.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => openResume(activeResume)}
                            className="mt-6 inline-flex items-center justify-center gap-2 text-center text-xs font-semibold text-white transition hover:text-white/70"
                          >
                            Improve resume <FiArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    </Surface>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease }}
                  >
                    <Surface className="p-6 sm:p-9">
                      <div className="grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_220px]">
                        <div>
                          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                            <FiFileText size={20} />
                          </span>

                          <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#777A82]">
                            A fresh start
                          </p>

                          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">
                            Your next resume starts here.
                          </h3>

                          <p className="mt-3 max-w-lg text-xs leading-6 text-[#92949B]">
                            Bring your experience, projects, and skills together
                            in one focused document. You can refine it as your
                            career grows.
                          </p>

                          <PrimaryButton onClick={openBuilder} className="mt-6">
                            Open Resume Builder <FiArrowRight size={14} />
                          </PrimaryButton>
                        </div>

                        <div className="hidden md:block">
                          <div className="rotate-[3deg] rounded-xl bg-[#E5E5E5] p-3 shadow-2xl">
                            <div className="rounded-lg bg-white p-4 text-[#24262A]">
                              <div className="h-2 w-20 rounded bg-[#303238]" />
                              <div className="mt-2 h-1 w-28 rounded bg-[#D3D4D7]" />
                              <div className="mt-5 h-px bg-[#D7D8DB]" />
                              <div className="mt-4 h-1 w-12 rounded bg-[#555B68]" />
                              <div className="mt-2 h-1 w-full rounded bg-[#E4E5E7]" />
                              <div className="mt-2 h-1 w-4/5 rounded bg-[#E4E5E7]" />
                              <div className="mt-4 h-1 w-14 rounded bg-[#555B68]" />
                              <div className="mt-2 h-1 w-full rounded bg-[#E4E5E7]" />
                              <div className="mt-2 h-1 w-3/4 rounded bg-[#E4E5E7]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Surface>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
                  <p role="status" className="text-xs leading-5 text-[#B9BBC2]">
                    {error}
                  </p>

                  <SecondaryButton onClick={() => window.location.reload()}>
                    <FiRefreshCw size={13} /> Retry
                  </SecondaryButton>
                </div>
              )}
            </section>

            {/* Closing section: centered on mobile */}
            <footer className="mt-12 flex flex-col items-center gap-4 border-t border-white/[0.08] pt-7 pb-2 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
              <div className="flex flex-col items-center sm:items-start">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                  Your next chapter
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-white sm:text-[23px]">
                  Make every application count.
                </h2>

                <p className="mt-2 max-w-xl text-xs leading-5 text-[#777B85]">
                  Keep your experience current, your achievements clear, and
                  your resume ready for the next opportunity.
                </p>
              </div>

              {/* Bottom bar already handles these actions on mobile */}
              <div className="hidden shrink-0 flex-wrap gap-3 sm:flex">
                <SecondaryButton onClick={openHistory}>
                  <FiClock size={14} />
                  Resume history
                </SecondaryButton>

                <PrimaryButton onClick={openBuilder}>
                  Open builder
                  <FiArrowRight size={14} />
                </PrimaryButton>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <ResumeDashboardMobileActionBar
        onOpenHistory={openHistory}
        onOpenBuilder={openBuilder}
      />
    </div>
  );
};

export default ResumeBuilderDashboard;
