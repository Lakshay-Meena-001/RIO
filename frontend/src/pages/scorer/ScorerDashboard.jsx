import ServiceNavigation from "../../components/ServiceNavigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiRefreshCw,
  FiTrendingUp,
  FiUploadCloud,
  FiUser,
  FiBriefcase,
  FiBarChart2,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";

import api from "../../utils/axios";
import Surface from "../../components/ui/Surface";

import { getCurrentUser } from "../../api/user/user.api";
import PageEyebrow from "../../components/ui/PageEyebrow";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SCORER_COST = 100;

const unwrap = (response) => response?.data ?? response ?? {};
const getResumeId = (resume) =>
  resume?._id || resume?.id || resume?.resumeId || "";
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

const CHECKS = [
  {
    title: "Profile",
    description: "Contact information and professional identity.",
    Icon: FiUser,
  },
  {
    title: "Experience",
    description: "Roles, companies, projects and technologies.",
    Icon: FiBriefcase,
  },
  {
    title: "Resume quality",
    description: "Strengths, weaknesses and overall score.",
    Icon: FiBarChart2,
  },
  {
    title: "Career direction",
    description: "Suggested roles and useful missing skills.",
    Icon: FiTrendingUp,
  },
];

export default function ScorerDashboard({ user, setUser }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const requestLock = useRef(false);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [recentResumes, setRecentResumes] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => localStorage.getItem("rio-sidebar-open") !== "false",
  );
  const [balanceDeductionDetails, setBalanceDeductionDetails] = useState(null);
  const [pendingReport, setPendingReport] = useState(null);
  const [leavingForHistory, setLeavingForHistory] = useState(false);

  const firstName = user?.name?.trim()?.split(/\s+/)?.[0] || "there";
  const balance = Number(
    user?.balance ??
      user?.coins ??
      user?.wallet?.balance ??
      user?.walletBalance,
  );
  const balanceLabel = Number.isFinite(balance)
    ? balance.toLocaleString("en-IN")
    : "—";

  const loadRecent = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const response = await api.get("/api/resumes/scored");
      const payload = unwrap(response);
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.resumes)
          ? payload.resumes
          : Array.isArray(payload?.data?.resumes)
            ? payload.data.resumes
            : [];
      setRecentResumes(list.slice(0, 3));
    } catch {
      // Recent reports are supplementary; keep the upload flow available.
      setRecentResumes([]);
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    // Defer the initial fetch so the effect does not synchronously trigger
    // the state updates used by the loading UI.
    const timer = window.setTimeout(() => {
      void loadRecent();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRecent]);

  const acceptFile = (candidate) => {
    setError("");
    setSuccess("");
    if (!candidate) return;
    if (
      candidate.type !== "application/pdf" &&
      !candidate.name?.toLowerCase().endsWith(".pdf")
    ) {
      setFile(null);
      setError("Please choose a PDF resume.");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("The PDF must be 10 MB or smaller.");
      return;
    }
    setFile(candidate);
  };

  const clearFile = () => {
    setFile(null);
    setError("");
    setSuccess("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const analyzeResume = async () => {
    if (!file || requestLock.current || analyzing) return;
    requestLock.current = true;
    setAnalyzing(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      // Billing and content-fingerprint idempotency are backend responsibilities.
      // Never deduct balance from the client here.
      const response = await api.post("/api/resumes/upload", formData);
      const payload = unwrap(response);
      const resume = payload?.data?.data || payload?.data;
      const resumeId = getResumeId(resume);

      if (payload?.success === false || !resumeId) {
        throw new Error(
          payload?.message ||
            "The analysis response was incomplete. Please try again.",
        );
      }

      const reused = Boolean(payload?.reused);
      const deduction = payload?.balanceDeduction ?? null;

      // Update the shared user state with the latest server balance.
      try {
        const currentUserResponse = await getCurrentUser();

        if (currentUserResponse?.user) {
          setUser(currentUserResponse.user);
        }
      } catch (balanceError) {
        console.error(
          "Failed to refresh balance after resume upload:",
          balanceError,
        );
      }

      await loadRecent();

      if (!reused && deduction) {
        setPendingReport({
          resume,
          resumeId,
          reused: false,
        });

        setBalanceDeductionDetails(deduction);
        setSuccess("");
        return;
      }

      setSuccess(
        reused
          ? "Existing analysis found. No new charge was made."
          : "Analysis completed.",
      );

      navigate(`/scorer/history?resume=${encodeURIComponent(resumeId)}`, {
        state: { resume, reused },
      });
    } catch (uploadError) {
      const status = uploadError?.response?.status;
      const message =
        uploadError?.response?.data?.message ||
        uploadError?.response?.data?.error?.message ||
        uploadError?.message ||
        "We couldn't analyze this resume. Please try again.";
      setError(
        status === 402 ||
          /insufficient balance|not enough balance/i.test(message)
          ? "Your balance may be insufficient. Refresh your balance and try again."
          : message,
      );
    } finally {
      requestLock.current = false;
      setAnalyzing(false);
    }
  };

  const openReport = (item) => {
    const id = getResumeId(item);
    if (id) navigate(`/scorer/history?resume=${id}`);
  };

  const openHistorySmooth = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      navigate("/scorer/history");
      return;
    }

    setLeavingForHistory(true);

    window.setTimeout(() => {
      navigate("/scorer/history");
    }, 160);
  };

  return (
    <div
      className={`relative min-h-screen w-full min-w-0 overflow-x-clip bg-[#17191C] text-white transition-opacity duration-150 ease-out motion-reduce:transition-none ${
        leavingForHistory ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 88% 4%, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.02) 42%, transparent 72%), radial-gradient(ellipse 65% 55% at 0% 92%, rgba(255,255,255,0.03) 0%, transparent 70%), linear-gradient(135deg, #191b1e 0%, #17191c 48%, #141619 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen w-full min-w-0">
        <ServiceNavigation
          user={user}
          setUser={setUser}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main
          className={`min-w-0 flex-1 transition-[margin-left] duration-300 ease-out ${sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"}`}
        >
          <div className="mx-auto w-full min-w-0 max-w-[1480px] px-5 pb-16 pt-[clamp(5.5rem,10vh,6.5rem)] sm:px-7 sm:pb-10 lg:px-10 lg:pb-12 lg:pt-10">
            <section className="mb-8 flex min-w-0 flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 max-w-3xl">
                <PageEyebrow className="mb-4">Resume intelligence</PageEyebrow>
                <h1 className="max-w-full break-words text-[32px] font-semibold leading-[1.02] tracking-[-0.055em] sm:max-w-3xl sm:text-[50px] lg:text-[58px]">
                  Know exactly where
                  <span className="mt-2 block font-serif font-normal italic tracking-[-0.055em] text-[#A1A1AA]">
                    your resume stands.
                  </span>
                </h1>
                <p className="mt-5 max-w-2xl text-[14px] leading-7 text-[#92949B] sm:text-[15px]">
                  Hi {firstName}. Upload your resume to understand your
                  strengths, identify gaps, and discover the roles it supports.
                </p>
              </div>

              <div className="pdf-actions-responsive flex w-full min-w-0 flex-wrap items-center justify-center gap-2 sm:gap-3 lg:w-auto lg:flex-nowrap lg:justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/scorer/history")}
                  className="inline-flex min-w-0 shrink items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-semibold text-[#D4D4D8] transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white sm:px-4"
                >
                  <FiClock size={14} />
                  View History
                </button>

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex min-w-0 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-3 py-3 text-xs font-medium text-[#17191C] transition hover:bg-[#E8E8EB] sm:px-4"
                >
                  Choose PDF <FiArrowRight size={14} />
                </button>
              </div>
            </section>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-300/20 bg-rose-300/[0.055] p-4 text-sm text-rose-100/85"
              >
                <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
                <span className="min-w-0 flex-1 leading-6">{error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                  className="text-rose-100/60 hover:text-white"
                >
                  <FiX />
                </button>
              </div>
            )}

            <Surface
              variant="scorer"
              className="w-full min-w-0 max-w-full shadow-[0_22px_60px_rgba(0,0,0,0.16)]"
            >
              <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_370px]">
                <div className="min-w-0 p-3 sm:p-6 lg:p-7">
                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget))
                        setDragging(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      acceptFile(event.dataTransfer.files?.[0]);
                    }}
                    className={`flex min-h-[330px] w-full min-w-0 flex-col items-center justify-center rounded-[20px] border border-dashed px-3 py-8 text-center transition-colors sm:px-8 ${dragging ? "border-white/35 bg-white/[0.045]" : "border-white/[0.10] bg-black/10"}`}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(event) => acceptFile(event.target.files?.[0])}
                    />
                    <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[20px] border border-white/[0.10] bg-white/[0.045] text-[#D4D4D8]">
                      {file ? (
                        <FiCheckCircle size={27} />
                      ) : (
                        <FiUploadCloud size={29} />
                      )}
                    </div>
                    <h2 className="mt-6 max-w-full break-words text-[23px] font-semibold tracking-[-0.04em] sm:text-[29px]">
                      {file ? "Your resume is ready" : "Upload your resume"}
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-[#858994]">
                      {file
                        ? "Review the selected PDF before starting the analysis."
                        : "Drag and drop your PDF here, or choose a file from your device."}
                    </p>

                    {file ? (
                      <div className="mt-7 flex w-full max-w-[620px] items-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.025] p-3.5 text-left sm:p-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#B8BBC2]">
                          <FiFileText size={19} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#E4E4E7]">
                            {file.name}
                          </p>
                          <p className="mt-1 text-[11px] text-[#777B85]">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB · PDF
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={clearFile}
                          disabled={analyzing}
                          aria-label="Remove selected PDF"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-[#858994] transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-semibold text-[#17191C] transition hover:bg-[#E8E8EB]"
                      >
                        Choose PDF <FiArrowRight size={14} />
                      </button>
                    )}

                    {file && (
                      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={analyzeResume}
                          disabled={analyzing}
                          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-semibold text-[#17191C] transition hover:-translate-y-0.5 hover:bg-[#E8E8EB] disabled:cursor-wait disabled:opacity-60"
                        >
                          {analyzing ? (
                            <>
                              <FiRefreshCw className="animate-spin" size={14} />{" "}
                              Analyzing resume…
                            </>
                          ) : (
                            <>
                              Analyze resume <FiArrowRight size={14} />
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => inputRef.current?.click()}
                          disabled={analyzing}
                          className="min-h-12 rounded-full border border-white/10 px-5 py-3 text-xs font-semibold text-[#D4D4D8] transition hover:bg-white/[0.05] disabled:opacity-40"
                        >
                          Replace PDF
                        </button>
                      </div>
                    )}
                    <p className="mt-4 text-[10px] text-[#666870]">
                      PDF only · Maximum 10 MB
                    </p>
                    <p className="mt-1 text-[10px] text-[#666870]">
                      Analysis cost: {SCORER_COST} · Balance: {balanceLabel}
                    </p>
                    {success && (
                      <p role="status" className="mt-3 text-xs text-[#BFC2C9]">
                        {success}
                      </p>
                    )}
                  </div>
                </div>

                <aside className="min-w-0 border-t border-white/[0.07] p-4 sm:p-6 lg:border-l lg:border-t-0 lg:p-6">
                  <p className="text-center text-[10px] font-semibold uppercase tracking-[0.20em] text-[#777B85] sm:text-left">
                    What RIO checks
                  </p>
                  <div className="mt-5 space-y-3">
                    {CHECKS.map(({ title, description, Icon }) => (
                      <div
                        key={title}
                        className="flex gap-3 rounded-[17px] border border-white/[0.075] bg-white/[0.018] p-3.5 transition-colors hover:border-white/[0.12]"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-[#92949B]">
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-semibold text-[#D4D4D8]">
                            {title}
                          </h3>
                          <p className="mt-1 text-[11px] leading-5 text-[#858994]">
                            {description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </Surface>

            <section className="mt-10 mb-8 min-w-0">
              <div className="mb-5 flex items-center justify-center gap-4 sm:items-end sm:justify-between">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-[#666870]">
                    Your activity
                  </p>
                  <h2 className="mt-2 text-[25px] font-semibold tracking-[-0.04em] sm:text-[29px]">
                    Recent resume reports.
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/scorer/history")}
                  className="group hidden shrink-0 items-center gap-2 text-xs font-semibold text-[#A1A1AA] transition hover:text-white sm:inline-flex"
                >
                  See all{" "}
                  <FiArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </div>
              <Surface
                variant="scorer"
                className="shadow-[0_22px_60px_rgba(0,0,0,0.16)]"
              >
                {loadingRecent ? (
                  <div className="divide-y divide-white/[0.07] px-5 sm:px-7">
                    {[1, 2].map((item) => (
                      <div key={item} className="flex items-center gap-4 py-5">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.06]" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-40 animate-pulse rounded bg-white/[0.07]" />
                          <div className="h-2.5 w-28 animate-pulse rounded bg-white/[0.04]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentResumes.length ? (
                  <div className="px-5 sm:px-7">
                    {recentResumes.map((item, index) => (
                      <button
                        key={
                          getResumeId(item) ||
                          `${item?.createdAt || item?.updatedAt || "resume"}-${index}`
                        }
                        type="button"
                        onClick={() => openReport(item)}
                        className={`group flex w-full items-center gap-4 py-4 text-left sm:py-[18px] ${index ? "border-t border-white/[0.07]" : ""}`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-[#92949B]">
                          <FiFileText size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-[#D4D4D8] transition-colors group-hover:text-white sm:text-sm">
                            {item?.profile?.name || "Resume analysis"}
                          </span>
                          <span className="mt-1 block text-[10px] text-[#777B85]">
                            Analyzed{" "}
                            {formatDate(item?.createdAt || item?.updatedAt)}
                          </span>
                        </span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-[#777B85] transition duration-200 group-hover:border-white/[0.18] group-hover:bg-white/[0.045] group-hover:text-white">
                          <FiArrowRight
                            size={14}
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                          />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-10 sm:px-7 sm:py-12">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.025] text-[#858994]">
                        <FiFileText size={16} />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-[#D4D4D8]">
                          Your reports will appear here.
                        </h3>
                        <p className="mt-1 max-w-xl text-xs leading-5 text-[#777B85]">
                          Once you complete an analysis, you can reopen the
                          report here or find all your past reports in Scorer
                          History.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Surface>
            </section>

            <section className="flex flex-col gap-5 border-t border-white/[0.08] pt-7 pb-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-[#666870]">
                  Keep moving forward
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-white sm:text-[23px]">
                  Ready to strengthen your resume?
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-[#777B85] sm:mx-0">
                  Run a fresh analysis when your experience, projects, or skills
                  change. Your previous reports remain available in history.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={openHistorySmooth}
                  className="group hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-[#D4D4D8] transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white"
                >
                  View scorer history{" "}
                  <FiArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearFile();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group hidden sm:inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition duration-200 hover:-translate-y-0.5 hover:bg-[#E8E8EB]"
                >
                  Analyze another resume{" "}
                  <FiArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </section>
          </div>
        </main>

        <nav
          aria-label="Resume scorer quick actions"
          className="rio-mobile-action-bar fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.10] bg-[#111315]/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_35px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:hidden"
        >
          <div className="mx-auto flex max-w-md items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/scorer/history")}
              className="inline-flex px-3 py-3 flex-1 items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.045] px-4 text-xs font-semibold text-[#E4E4E7] transition active:scale-[0.98]"
            >
              <FiClock size={15} />
              History
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={analyzing}
              className="inline-flex px-3 py-3 flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-[#17191C] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiUploadCloud size={15} />
              {file ? "Replace PDF" : "Upload PDF"}
            </button>
          </div>
        </nav>

        {balanceDeductionDetails && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="scorer-balance-title"
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#191B1E] p-6 text-white shadow-2xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                <FiCheckCircle size={26} />
              </div>

              <h2
                id="scorer-balance-title"
                className="mt-4 text-center text-xl font-semibold"
              >
                Resume Scorer Completed
              </h2>

              <p className="mt-2 text-center text-sm text-[#A1A1AA]">
                Your balance deduction is confirmed.
              </p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#A1A1AA]">Service</span>
                  <span className="text-sm font-medium">
                    {balanceDeductionDetails.service || "Resume Scorer"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-sm text-[#A1A1AA]">
                    Amount deducted
                  </span>
                  <span className="font-semibold">
                    -
                    {Number(
                      balanceDeductionDetails.deductedAmount,
                    ).toLocaleString("en-IN")}{" "}
                    INR
                  </span>
                </div>

                <div className="my-4 border-t border-white/10" />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#A1A1AA]">
                    Previous balance
                  </span>
                  <span>
                    {Number(
                      balanceDeductionDetails.previousBalance,
                    ).toLocaleString("en-IN")}{" "}
                    INR
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-[#A1A1AA]">
                    Remaining balance
                  </span>
                  <span className="font-semibold text-emerald-400">
                    {Number(balanceDeductionDetails.balance).toLocaleString(
                      "en-IN",
                    )}{" "}
                    INR
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const report = pendingReport;

                  setBalanceDeductionDetails(null);
                  setPendingReport(null);

                  if (report?.resumeId) {
                    navigate(`/scorer/history?resume=${report.resumeId}`, {
                      state: {
                        resume: report.resume,
                        reused: report.reused,
                      },
                    });
                  }
                }}
                className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#17191C] transition hover:bg-white/90"
              >
                Continue to Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
