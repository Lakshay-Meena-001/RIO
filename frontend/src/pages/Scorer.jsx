import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

import api from "../utils/axios";
import { setResume } from "../redux/resumeSlice";
import { getResume } from "../api/resume.api";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const Scorer = ({ user, setUser }) => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const { resume } = useSelector((state) => state.resume);

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasResult = Boolean(resume?.analysis);

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

  const handleUpload = async () => {
    if (!file || loading) return;

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("resume", file);

      // Step 1: Upload + analyze resume
      const response = await api.post("/api/resume/upload", formData);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Resume analysis failed.");
      }

      // Step 2: Fetch the complete resume document
      const resumeResponse = await getResume();

      const resumeData = resumeResponse?.data;

      console.log("UPLOAD RESPONSE:", response.data);
      console.log("GET RESUME RESPONSE:", resumeResponse);
      console.log("RESUME DATA:", resumeData);

      if (!resumeData) {
        throw new Error("Resume was analyzed but could not be loaded.");
      }

      // Step 3: Store complete resume in Redux
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
    <div className="min-h-screen bg-[#111315] text-white">
      <main className="min-w-0 md:ml-[76px]">
        <div className="mx-auto w-full max-w-[1500px] px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-10">
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
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-[1100px]"
    >
      {/* Heading */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="mb-10 max-w-3xl"
      >
        <div className="mb-4 flex items-center gap-2 text-sm text-white/40">
          <Sparkles className="h-4 w-4" />

          <span>RIO Resume Intelligence</span>
        </div>

        <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
          Understand what your
          <span className="block text-white/40">resume is really saying.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-white/40 sm:text-lg">
          Upload your resume and RIO will extract your profile, evaluate your
          resume, identify career directions, and give you practical
          improvements.
        </p>
      </motion.div>

      {/* Upload area */}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => {
          setDragActive(false);
        }}
        onDrop={handleDrop}
        className={`rounded-[28px] border p-2 transition-all duration-300 ${
          dragActive
            ? "border-white/25 bg-white/[0.06]"
            : "border-white/[0.08] bg-white/[0.02]"
        }`}
      >
        <div className="rounded-[22px] border border-white/[0.06] bg-[#17191C] p-6 sm:p-10 lg:p-14">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <motion.div
              animate={{
                y: dragActive ? -5 : 0,
                scale: dragActive ? 1.04 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 20,
              }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.045]"
            >
              <Upload className="h-7 w-7 text-white/70" />
            </motion.div>

            <h2 className="mt-6 text-2xl font-medium tracking-[-0.025em]">
              Drop your resume here
            </h2>

            <p className="mt-2 text-sm text-white/35">
              PDF only · maximum 20 MB
            </p>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-7 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
          </div>

          {/* Selected file */}

          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mx-auto mt-8 flex max-w-2xl items-center gap-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  <FileText className="h-5 w-5 text-white/65" />
                </div>

                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-white/85">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · PDF
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearFile}
                  className="rounded-lg p-2 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white"
                  aria-label="Remove selected file"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mx-auto mt-5 flex max-w-2xl items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/[0.04] p-4 text-left text-sm text-red-200/75"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}

          <div className="mx-auto mt-8 flex max-w-2xl justify-center">
            <button
              type="button"
              disabled={!file || loading}
              onClick={handleUpload}
              className="group flex items-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-medium text-black transition-all duration-200 hover:scale-[1.015] disabled:cursor-not-allowed disabled:opacity-30"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  Analyzing resume
                </>
              ) : (
                <>
                  Analyze resume
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bottom information */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        className="mt-6 grid gap-3 sm:grid-cols-3"
      >
        <InfoItem
          number="01"
          title="Structured extraction"
          description="Profile, education, experience and projects."
        />

        <InfoItem
          number="02"
          title="Career analysis"
          description="Roles and skills based on your resume."
        />

        <InfoItem
          number="03"
          title="Actionable feedback"
          description="Clear improvements you can work on next."
        />
      </motion.div>
    </motion.section>
  );
};

const InfoItem = ({ number, title, description }) => {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <p className="text-sm font-medium text-white/75">
        {number} · {title}
      </p>

      <p className="mt-2 text-xs leading-5 text-white/30">{description}</p>
    </div>
  );
};

const ResultView = ({
  resume,
  profile,
  analysis,
  score,
  handleAnalyzeAnother,
}) => {
  return (
    <motion.section
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Header */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-white/40">
            <CheckCircle2 className="h-4 w-4" />

            <span>Analysis complete</span>
          </div>

          <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
            Resume intelligence
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40 sm:text-base">
            A structured view of your resume, career direction, and the areas
            worth improving next.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAnalyzeAnother}
          className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Analyze another
        </button>
      </motion.div>

      {/* Hero */}

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.45 }}
        className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]"
      >
        {/* Profile */}

        <div className="rounded-[28px] border border-white/[0.08] bg-[#17191C] p-6 sm:p-8">
          <div className="flex h-full flex-col justify-between gap-8">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/25">
                Candidate profile
              </p>

              <h2 className="mt-3 text-3xl font-medium tracking-[-0.035em]">
                {profile.name || "Your resume"}
              </h2>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/40">
                {profile.email && <span>{profile.email}</span>}

                {profile.location && <span>{profile.location}</span>}

                {profile.phone && <span>{profile.phone}</span>}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatItem
                label="Experience"
                value={resume?.experience?.length || 0}
              />

              <StatItem
                label="Projects"
                value={resume?.projects?.length || 0}
              />

              <StatItem label="Skills" value={resume?.skills?.length || 0} />

              <StatItem
                label="Education"
                value={resume?.education?.length || 0}
              />
            </div>
          </div>
        </div>

        {/* Score */}

        <ScoreCard score={score} />
      </motion.div>

      {/* Analysis grid */}

      <div className="grid gap-5 lg:grid-cols-2">
        <InsightSection
          icon={<BriefcaseBusiness className="h-4 w-4" />}
          eyebrow="Career direction"
          title="Suggested roles"
          items={analysis.suggestedRoles}
        />

        <InsightSection
          icon={<CheckCircle2 className="h-4 w-4" />}
          eyebrow="What already works"
          title="Strengths"
          items={analysis.strengths}
        />

        <InsightSection
          icon={<AlertCircle className="h-4 w-4" />}
          eyebrow="Areas to improve"
          title="Weaknesses"
          items={analysis.weaknesses}
        />

        <InsightSection
          icon={<Lightbulb className="h-4 w-4" />}
          eyebrow="Next opportunities"
          title="Missing skills"
          items={analysis.missingSkills}
        />
      </div>

      {/* Recommendations */}

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="rounded-[28px] border border-white/[0.08] bg-[#17191C] p-6 sm:p-8"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
            <Sparkles className="h-4 w-4 text-white/65" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/25">
              RIO recommendations
            </p>

            <h2 className="mt-2 text-2xl font-medium tracking-[-0.025em]">
              What to work on next
            </h2>
          </div>
        </div>

        <div className="mt-7 grid gap-3">
          {analysis.recommendations?.length ? (
            analysis.recommendations.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <span className="pt-0.5 text-xs text-white/20">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <p className="text-sm leading-6 text-white/55">{item}</p>
              </div>
            ))
          ) : (
            <EmptyState text="No recommendations were generated for this resume." />
          )}
        </div>
      </motion.div>

      {/* Disclaimer */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-white/25"
      >
        <ShieldCheck className="h-4 w-4 shrink-0" />

        <span>
          RIO's score is an AI-generated heuristic and is not a score from a
          real ATS system.
        </span>
      </motion.div>
    </motion.section>
  );
};

const StatItem = ({ label, value }) => {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
      <p className="text-xs text-white/25">{label}</p>

      <p className="mt-2 text-xl font-medium text-white/85">{value}</p>
    </div>
  );
};

const ScoreCard = ({ score }) => {
  const scoreData = [
    {
      name: "Score",
      value: score,
      fill: "#FFFFFF",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#17191C] p-6">
      <div className="flex min-h-[320px] flex-col items-center justify-center">
        <p className="text-xs uppercase tracking-[0.18em] text-white/25">
          Resume score
        </p>

        <div className="relative mt-2 h-[220px] w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="78%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              data={scoreData}
              barSize={14}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />

              <RadialBar
                background={{
                  fill: "rgba(255,255,255,0.06)",
                }}
                cornerRadius={12}
                dataKey="value"
              />
            </RadialBarChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-semibold tracking-[-0.055em]">
              {score}
            </span>

            <span className="mt-1 text-xs text-white/25">out of 100</span>
          </div>
        </div>

        <p className="max-w-xs text-center text-xs leading-5 text-white/25">
          AI-generated heuristic score based on the uploaded resume.
        </p>
      </div>
    </div>
  );
};

const InsightSection = ({ icon, eyebrow, title, items = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[28px] border border-white/[0.08] bg-[#17191C] p-6 sm:p-7"
    >
      <div className="flex items-center gap-2 text-white/40">
        {icon}

        <span className="text-xs uppercase tracking-[0.16em]">{eyebrow}</span>
      </div>

      <h2 className="mt-3 text-2xl font-medium tracking-[-0.025em]">{title}</h2>

      <div className="mt-6 space-y-2">
        {items?.length ? (
          items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4"
            >
              <span className="mt-0.5 text-xs text-white/20">
                {String(index + 1).padStart(2, "0")}
              </span>

              <p className="text-sm leading-6 text-white/55">{item}</p>
            </div>
          ))
        ) : (
          <EmptyState text="Nothing was identified here from the uploaded resume." />
        )}
      </div>
    </motion.div>
  );
};

const EmptyState = ({ text }) => {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.07] p-5 text-sm leading-6 text-white/25">
      {text}
    </div>
  );
};

export default Scorer;
