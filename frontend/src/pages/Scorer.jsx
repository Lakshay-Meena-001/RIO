import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  FileText,
  GraduationCap,
  Lightbulb,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../utils/axios";
import { setResume } from "../redux/resumeSlice";
import { getResume } from "../api/resume.api";
import Sidebar from "../components/SideBar";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

/* =========================================================
   SCORE RING
========================================================= */

const ScoreRing = ({ score }) => {
  const scoreData = [
    {
      name: "Score",
      value: score,
      fill: "#ffffff",
    },
  ];

  return (
    <div className="relative h-[230px] w-[230px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="76%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          data={scoreData}
          barSize={13}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />

          <RadialBar
            dataKey="value"
            background={{
              fill: "rgba(255,255,255,0.07)",
            }}
            cornerRadius={12}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[58px] font-semibold leading-none tracking-[-0.06em]">
          {score}
        </span>

        <span className="mt-2 text-xs text-white/50">
          out of{" "}
          <span className="mt-2 text-xl font-bold text-white/80">100</span>
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Scorer = ({ user, setUser }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const { resume } = useSelector((state) => state.resume);

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const hasResult = Boolean(resume?.analysis);

  /* =======================================================
     FILE LOGIC
  ======================================================= */

  const selectFile = (selectedFile) => {
    setError("");

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF resume.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Resume must be smaller than 20 MB.");
      return;
    }

    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];

    selectFile(droppedFile);
  };

  /* =======================================================
     EXISTING UPLOAD LOGIC — DO NOT CHANGE
  ======================================================= */

  const handleUpload = async () => {
    if (!file || loading) return;

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("resume", file);

      const response = await api.post("/api/resume/upload", formData);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Resume analysis failed.");
      }

      const resumeResponse = await getResume();

      const resumeData = resumeResponse?.data;

      if (!resumeData) {
        throw new Error("Resume was analyzed but could not be loaded.");
      }

      dispatch(setResume(resumeData));

      clearFile();
    } catch (uploadError) {
      console.error("Resume upload failed:", uploadError);

      setError(
        uploadError?.response?.data?.message ||
          uploadError?.message ||
          "We couldn't analyze your resume. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    dispatch(setResume(null));
    clearFile();
  };

  const score = Math.round(resume?.analysis?.score ?? 0);

  const profile = resume?.profile || {};
  const analysis = resume?.analysis || {};

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden overflow-y-visible bg-[#17191C] text-white">
      {/* ===================================================
          RIO BACKGROUND
      =================================================== */}

      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 90% 70% at 100% 0%,
                rgba(255,255,255,0.055) 0%,
                rgba(255,255,255,0.022) 35%,
                transparent 72%
              ),
              radial-gradient(
                ellipse 80% 65% at 0% 100%,
                rgba(255,255,255,0.028) 0%,
                rgba(255,255,255,0.012) 38%,
                transparent 72%
              ),
              linear-gradient(
                115deg,
                #191b1e 0%,
                #17191c 45%,
                #181a1d 72%,
                #1b1e21 100%
              )
            `,
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.025] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-white/[0.025] blur-[120px]" />

        <div className="absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-white/[0.018] blur-[120px]" />
      </div>

      {/* ===================================================
          MOBILE HEADER
      =================================================== */}

      <header className="fixed left-3 right-3 top-3 z-50 flex h-14 items-center justify-between rounded-full border border-white/[0.12] bg-[#17191C]/65 px-3 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-2xl md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition-colors hover:bg-white/[0.1]"
          aria-label="Open navigation"
        >
          <span className="text-lg">☰</span>
        </button>

        <span
          className="text-[17px] tracking-tight"
          style={{
            fontFamily: '"Zen Dots", sans-serif',
          }}
        >
          RIO
        </span>

        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold">
          {(user?.name?.[0] || "U").toUpperCase()}
        </div>
      </header>

      <div className="relative z-10 flex min-h-screen">
        {/* =================================================
            SIDEBAR
        ================================================= */}

        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          user={user}
          sidebarOpen={sidebarOpen}
          setUser={setUser}
          setSidebarOpen={setSidebarOpen}
        />

        {/* =================================================
            MAIN
        ================================================= */}

        <main
          className={`min-w-0 w-full max-w-full flex-1 overflow-x-hidden transition-[margin-left] duration-300 ${
            sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"
          }`}
        >
          <div className="mx-auto w-full max-w-[1500px] min-w-0 px-3 pb-16 pt-[92px] sm:px-6 lg:px-8 lg:pt-9">
            <AnimatePresence mode="wait">
              {!hasResult ? (
                <UploadView
                  file={file}
                  loading={loading}
                  error={error}
                  dragActive={dragActive}
                  inputRef={inputRef}
                  setDragActive={setDragActive}
                  selectFile={selectFile}
                  clearFile={clearFile}
                  handleDrop={handleDrop}
                  handleUpload={handleUpload}
                />
              ) : (
                <ResultView
                  resume={resume}
                  profile={profile}
                  analysis={analysis}
                  score={score}
                  handleAnalyzeAnother={handleAnalyzeAnother}
                  navigate={navigate}
                />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

/* =========================================================
   UPLOAD VIEW
========================================================= */

const UploadView = ({
  file,
  loading,
  error,
  dragActive,
  inputRef,
  setDragActive,
  selectFile,
  clearFile,
  handleDrop,
  handleUpload,
}) => {
  return (
    <motion.section
      key="upload"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-[1180px] min-w-0"
    >
      {/* HEADER */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0 w-full">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            Resume Intelligence
          </div>

          <h1 className="max-w-3xl break-words text-[36px] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-[48px] lg:text-[56px]">
            Know exactly where
            <span className="block text-white/35">your resume stands.</span>
          </h1>

          <p className="mt-4 w-full max-w-2xl break-words text-sm leading-6 text-white/40 sm:text-base">
            Upload your resume and let RIO extract your profile, evaluate your
            resume, identify career directions, and surface the improvements
            that matter.
          </p>
        </div>

        <div className="hidden shrink-0 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 sm:block">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-white/80" />

            <span className="text-xs text-white/80">
              Private resume analysis
            </span>
          </div>
        </div>
      </motion.div>

      {/* MAIN UPLOAD CARD */}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.08,
          duration: 0.45,
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => {
          setDragActive(false);
        }}
        onDrop={handleDrop}
        className={`relative w-full min-w-0 overflow-hidden rounded-[30px] border transition-all duration-300 ${
          dragActive
            ? "border-white/25 bg-white/[0.07]"
            : "border-white/[0.09] bg-white/[0.035]"
        }`}
      >
        {/* ambient glow */}

        <div className="pointer-events-none absolute -right-32 -top-32 h-[350px] w-[350px] rounded-full bg-white/[0.035] blur-[100px]" />

        <div className="relative grid w-full min-w-0 grid-cols-1 lg:grid-cols-[1.35fr_0.65fr]">
          {/* =================================================
              LEFT UPLOAD CONTAINER
          ================================================= */}

          <div className="w-full min-w-0 p-3 sm:p-5">
            <div className="flex min-h-[440px] w-full min-w-0 flex-col items-center justify-center rounded-[24px] border border-dashed border-white/[0.10] bg-[#111315]/55 px-4 py-10 text-center sm:px-10 sm:py-12">
              {/* =================================================
                  BEFORE FILE
              ================================================= */}

              {!file ? (
                <>
                  <motion.div
                    animate={{
                      y: dragActive ? -7 : 0,
                      scale: dragActive ? 1.05 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 20,
                    }}
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-white/[0.1] bg-white/[0.055] shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
                  >
                    <Upload className="h-8 w-8 text-white/65" />
                  </motion.div>

                  <h2 className="mt-7 max-w-full break-words text-xl font-medium tracking-[-0.03em] sm:text-3xl">
                    {dragActive
                      ? "Drop your resume here"
                      : "Upload your resume"}
                  </h2>

                  <p className="mt-3 w-full max-w-md break-words text-sm leading-6 text-white/35">
                    Drag and drop your PDF here, or choose a file from your
                    device.
                  </p>

                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="mt-7 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#17191C] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Choose PDF
                  </button>

                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(event) => {
                      selectFile(event.target.files?.[0]);
                    }}
                  />

                  <p className="mt-4 text-[11px] text-white/20">
                    PDF only · Maximum 20 MB
                  </p>
                </>
              ) : (
                /* =================================================
                   AFTER FILE SELECTED
                ================================================= */

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="flex w-full min-w-0 max-w-2xl flex-col items-center"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-white/[0.1] bg-white/[0.055]">
                    <CheckCircle2 className="h-7 w-7 text-white/65" />
                  </div>

                  <h2 className="mt-6 max-w-full break-words text-xl font-medium tracking-[-0.03em] sm:text-3xl">
                    Your resume is ready
                  </h2>

                  <p className="mt-3 w-full max-w-md break-words text-sm leading-6 text-white/35">
                    Review the selected file before starting the analysis.
                  </p>

                  {/* FILE — SAME CONTAINER */}

                  <div className="mt-7 flex w-full min-w-0 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3 sm:gap-4 sm:p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.045] sm:h-12 sm:w-12">
                      <FileText className="h-5 w-5 text-white/55" />
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-medium text-white/80">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-white/25">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB · PDF
                      </p>
                    </div>

                    {/* CANCEL */}

                    <button
                      type="button"
                      onClick={clearFile}
                      disabled={loading}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-white/35 transition-all hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Remove selected resume"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* ANALYZE */}

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleUpload}
                    className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#17191C] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing
                      </>
                    ) : (
                      <>
                        Analyze resume
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* =================================================
              RIGHT INFORMATION
          ================================================= */}

          <div className="w-full min-w-0 border-t border-white/[0.07] p-4 sm:p-6 lg:border-l lg:border-t-0 lg:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
              What RIO checks
            </p>

            <div className="mt-6 w-full min-w-0 space-y-3">
              <FeatureRow
                icon={<UserRound />}
                title="Profile"
                text="Contact information and professional identity."
              />

              <FeatureRow
                icon={<BriefcaseBusiness />}
                title="Experience"
                text="Roles, companies, projects and technologies."
              />

              <FeatureRow
                icon={<BarChart3 />}
                title="Resume quality"
                text="Strengths, weaknesses and overall score."
              />

              <FeatureRow
                icon={<TrendingUp />}
                title="Career direction"
                text="Suggested roles and useful missing skills."
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ERROR */}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 8,
            }}
            className="mt-4 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/[0.04] p-4 text-sm text-red-200/75"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <span className="min-w-0 break-words">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOADING */}

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                <Loader2 className="h-4 w-4 animate-spin text-white/65" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-white/75">
                  RIO is analyzing your resume
                </p>

                <p className="mt-1 break-words text-xs text-white/30">
                  Extracting your profile and generating career insights.
                </p>
              </div>
            </div>

            <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full w-1/3 rounded-full bg-white/60"
                animate={{
                  x: ["-100%", "300%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

/* =========================================================
   FEATURE ROW
========================================================= */

const FeatureRow = ({ icon, title, text }) => {
  return (
    <div className="flex w-full min-w-0 gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3 sm:p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-white/45">
        <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium text-white/80">{title}</p>

        <p className="mt-1 break-words text-xs leading-5 text-white/80">
          {text}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   RESULT VIEW
========================================================= */

const ResultView = ({
  resume,
  profile,
  analysis,
  score,
  handleAnalyzeAnother,
  navigate,
}) => {
  const resumeBreakdown = [
    {
      name: "Experience",
      value: resume?.experience?.length || 0,
    },
    {
      name: "Projects",
      value: resume?.projects?.length || 0,
    },
    {
      name: "Skills",
      value: resume?.skills?.length || 0,
    },
    {
      name: "Education",
      value: resume?.education?.length || 0,
    },
    {
      name: "Certifications",
      value: resume?.certifications?.length || 0,
    },
  ];

  return (
    <motion.section
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-5"
    >
      {/* RESULT HEADER */}

      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-5 flex items-center gap-2 text-xs text-white/30 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </button>

          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Analysis complete
          </div>

          <h1 className="break-words text-[38px] font-semibold tracking-[-0.05em] sm:text-[52px]">
            Resume intelligence
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/35 sm:text-base">
            A visual overview of your resume, career direction, strengths and
            the areas worth improving next.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAnalyzeAnother}
          className="flex w-fit font-bold shrink-0 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black/80 transition-all hover:bg-white/[0.8] hover:text-black/[0.8]"
        >
          <RotateCcw className="h-4 w-4" />
          Analyze another
        </button>
      </motion.div>

      {/* HERO INTELLIGENCE GRID */}

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        {/* PROFILE */}

        <motion.div
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.04,
          }}
          className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#111315] p-6 sm:p-8"
        >
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/20 blur-[90px]" />

          <div className="relative">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  Candidate profile
                </p>

                <h2 className="mt-3 wrap-break-words text-3xl font-medium tracking-[-0.04em]">
                  {profile.name || "Your resume"}
                </h2>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/50">
                  {profile.email && (
                    <span className="break-all">{profile.email}</span>
                  )}

                  {profile.location && <span>{profile.location}</span>}

                  {profile.phone && <span>{profile.phone}</span>}
                </div>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4">
                <UserRound className="h-4 w-4 text-white/45" />
              </div>
            </div>

            {/* COUNTERS */}

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat
                icon={<BriefcaseBusiness />}
                label="Experience"
                value={resume?.experience?.length || 0}
              />

              <MiniStat
                icon={<FileText />}
                label="Projects"
                value={resume?.projects?.length || 0}
              />

              <MiniStat
                icon={<Zap />}
                label="Skills"
                value={resume?.skills?.length || 0}
              />

              <MiniStat
                icon={<GraduationCap />}
                label="Education"
                value={resume?.education?.length || 0}
              />
            </div>
          </div>
        </motion.div>

        {/* SCORE */}

        <motion.div
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.08,
          }}
          className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#17191C]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.055),transparent_55%)]" />

          <div className="relative flex h-full min-h-[330px] flex-col items-center justify-center p-6">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
              <BarChart3 className="h-3.5 w-3.5" />
              Resume score
            </div>

            <ScoreRing score={score} />

            <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" />

              <span className="text-[10px] text-white/35">
                AI heuristic assessment
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ANALYTICS */}

      <motion.div
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.12,
        }}
        className="rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-5 sm:p-7"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Resume composition
            </p>

            <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em]">
              What's inside your resume
            </h2>
          </div>

          <p className="max-w-sm text-xs leading-5 text-white/60">
            A visual breakdown of the information RIO extracted from your
            uploaded resume.
          </p>
        </div>

        <div className="mt-7 h-[260px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={resumeBreakdown}
              margin={{
                top: 8,
                right: 8,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />

              <XAxis
                dataKey="name"
                tick={{
                  fill: "rgba(255,255,255,0.35)",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fill: "rgba(255,255,255,0.25)",
                  fontSize: 10,
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{
                  fill: "rgba(255,255,255,0.025)",
                }}
                contentStyle={{
                  background: "#111315",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />

              <Bar
                dataKey="value"
                radius={[7, 7, 0, 0]}
                fill="#ffffff"
                maxBarSize={42}
              >
                {resumeBreakdown.map((_, index) => (
                  <Cell key={index} fill="rgba(255,255,255,0.9)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* CAREER + STRENGTHS */}

      <div className="grid gap-5 xl:grid-cols-2">
        
        <InsightSection
          icon={<BriefcaseBusiness />}
          eyebrow="Career direction"
          title="Roles that match your profile"
          items={analysis.suggestedRoles}
          numbered
        />

        <InsightSection
          icon={<Check />}
          eyebrow="What is working"
          title="Your strengths"
          items={analysis.strengths}
          compact
        />
      </div>

      {/* WEAKNESSES + MISSING SKILLS */}

      <div className="grid gap-5 xl:grid-cols-2">
        <InsightSection
          icon={<AlertCircle />}
          eyebrow="Attention"
          title="Areas to improve"
          items={analysis.weaknesses}
          numbered
        />

        <InsightSection
          icon={<TrendingUp />}
          eyebrow="Opportunity"
          title="Missing skills"
          items={analysis.missingSkills}
          numbered
        />
      </div>

      {/* RECOMMENDATIONS */}

      <motion.div
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.18,
        }}
        className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-black/10 p-6 sm:p-8"
      >
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/[0.025] blur-[70px]" />

        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
              <Lightbulb className="h-4 w-4 text-white/80" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                RIO guidance
              </p>

              <h2 className="mt-2 break-words text-2xl font-medium tracking-[-0.03em]">
                What to work on next
              </h2>

              <p className="mt-2 text-sm text-white/50">
                Turn the analysis into concrete improvements.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-3 lg:grid-cols-2">
            {analysis.recommendations?.length ? (
              analysis.recommendations.map((item, index) => (
                <motion.div
                  key={`${item}-${index}`}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.04,
                  }}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.2] p-5 transition-colors hover:bg-white/[0.045]"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-[10px] font-semibold text-white/80">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="min-w-0 break-words text-sm leading-6 text-white/80">
                      {item}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <EmptyState text="No recommendations were generated for this resume." />
            )}
          </div>
        </div>
      </motion.div>

      {/* FOOTNOTE */}

      <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-white/25">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />

        <span>
          RIO's score is an AI-generated heuristic and is not a score from a
          real ATS system.
        </span>
      </div>
    </motion.section>
  );
};

/* =========================================================
   MINI STAT
========================================================= */

const MiniStat = ({ icon, label, value }) => {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.1] p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] text-white/35">
        <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
      </div>

      <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.12em] text-white/50">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white/80">
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   INSIGHT SECTION
========================================================= */

const InsightSection = ({
  icon,
  eyebrow,
  title,
  items = [],
  numbered = false,
  compact = false,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      className="rounded-[28px] border border-white/[0.08] bg-black/10 p-5 sm:p-7"
    >
      
      
      <div className="flex items-center gap-2 text-white/60">
      
        <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
          {eyebrow}
        </span>
      </div>

      <h2 className="mt-3 break-words text-2xl font-medium tracking-[-0.03em]">
        {title}
      </h2>

      <div className={`mt-6 ${compact ? "space-y-2" : "grid gap-2"}`}>
        
        {items?.length ? (
          items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="group flex min-w-0 gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.2] p-4 transition-colors hover:bg-white/[0.04]"
            >
              
              {numbered ? (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.045] text-[10px] font-semibold text-white/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
              ) : (
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
              )}

              <p className="min-w-0 break-words text-sm leading-6 text-white/80">
                {item}
              </p>
            </div>
            
          ))
        ) : (
          <EmptyState text="Nothing was identified here from the uploaded resume." />
        )}
      </div>
      
    </motion.div>
    
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({ text }) => {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.015] p-5 text-sm leading-6 text-white/25">
      {text}
    </div>
  );
};

export default Scorer;
