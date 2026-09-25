import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  History,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
  RotateCcw,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import Sidebar from "../components/SideBar";
import ResumeForm from "../components/resume/ResumeForm";
import PreviewResume from "../components/resume/PreviewResume";

import initialResumeData from "../components/resume/initialData";
import { getResume, updateResume } from "../api/resume.api";
import { setResume } from "../redux/resumeSlice";

/* =========================================================
   CONSTANTS
========================================================= */

const HISTORY_KEY = "rio_resume_builder_history_v1";

const TEMPLATE_OPTIONS = [
  {
    id: "basic",
    name: "Basic",
    description: "Clean ATS-friendly layout",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Balanced modern professional layout",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Traditional technical resume",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const cloneData = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const normalizeResume = (resume) => {
  if (!resume) {
    return cloneData(initialResumeData);
  }

  return {
    profile: {
      ...initialResumeData.profile,
      ...(resume.profile || {}),
    },

    summary: resume.summary || "",

    education: Array.isArray(resume.education)
      ? cloneData(resume.education)
      : [],

    experience: Array.isArray(resume.experience)
      ? cloneData(resume.experience)
      : [],

    projects: Array.isArray(resume.projects) ? cloneData(resume.projects) : [],

    skills: Array.isArray(resume.skills) ? cloneData(resume.skills) : [],

    certifications: Array.isArray(resume.certifications)
      ? cloneData(resume.certifications)
      : [],

    achievements: Array.isArray(resume.achievements)
      ? cloneData(resume.achievements)
      : [],

    languages: Array.isArray(resume.languages)
      ? cloneData(resume.languages)
      : [],
  };
};

const extractResumeFromResponse = (response) => {
  if (!response) return null;

  /*
    Supports both possible API shapes:

    {
      success: true,
      data: {...}
    }

    OR

    {...resume}
  */

  if (response?.data?.profile) {
    return response.data;
  }

  if (response?.profile) {
    return response;
  }

  return null;
};

const getHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveHistory = (history) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save resume history:", error);
  }
};

const createHistorySnapshot = ({ data, template, type = "saved" }) => {
  return {
    id: `resume-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

    createdAt: new Date().toISOString(),

    template,

    type,

    name: data?.profile?.name?.trim() || "Untitled Resume",

    data: cloneData(data),
  };
};

/* =========================================================
   COMPLETION CALCULATION
========================================================= */

const calculateCompletion = (data) => {
  if (!data) return 0;

  let completed = 0;
  let total = 0;

  const check = (condition) => {
    total += 1;

    if (condition) {
      completed += 1;
    }
  };

  const profile = data.profile || {};

  check(Boolean(profile.name?.trim()));
  check(Boolean(profile.email?.trim()));
  check(Boolean(profile.phone?.trim()));
  check(Boolean(profile.location?.trim()));

  check(Boolean(data.summary?.trim()));

  check(Array.isArray(data.education) && data.education.length > 0);

  check(Array.isArray(data.experience) && data.experience.length > 0);

  check(Array.isArray(data.projects) && data.projects.length > 0);

  check(Array.isArray(data.skills) && data.skills.length > 0);

  if (total === 0) return 0;

  return Math.round((completed / total) * 100);
};

/* =========================================================
   CIRCULAR COMPLETION
========================================================= */

const CompletionRing = ({ value }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-[116px] w-[116px] shrink-0">
      <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="4"
        />

        <motion.circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{
            strokeDashoffset: offset,
          }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[24px] font-semibold tracking-[-0.04em]">
          {value}
        <span className=" ml-1 text-[18px] font-semibold tracking-[-0.04em]" >%</span>
        </span>

        <span className="mt-0.5 text-[8px] uppercase tracking-[0.12em] text-white/90">
          complete
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ResumeBuilder = ({ user, setUser }) => {
  const dispatch = useDispatch();
  const shouldReduceMotion = useReducedMotion();

  const { resume: reduxResume } = useSelector((state) => state.resume);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [data, setData] = useState(normalizeResume(reduxResume));

  const [originalData, setOriginalData] = useState(
    normalizeResume(reduxResume),
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isExistingResume, setIsExistingResume] = useState(
    Boolean(reduxResume),
  );

  const [isHistoryResume, setIsHistoryResume] = useState(false);

  const [showPreview, setShowPreview] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState("basic");

  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  const [history, setHistory] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showNewConfirm, setShowNewConfirm] = useState(false);

  const [saveMode, setSaveMode] = useState("new");

  const previewRef = useRef(null);

  /* =======================================================
     LOAD RESUME
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadResume = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getResume();

        if (!mounted) return;

        const resumeData = extractResumeFromResponse(response);

        if (resumeData) {
          const normalized = normalizeResume(resumeData);

          setData(normalized);
          setOriginalData(normalized);

          setIsExistingResume(true);
          setIsHistoryResume(false);

          dispatch(setResume(resumeData));

          /*
            If backend currently stores a selected template,
            we can later hydrate it here.
          */
        } else {
          setData(normalizeResume(initialResumeData));

          setOriginalData(normalizeResume(initialResumeData));

          setIsExistingResume(false);
        }
      } catch (loadError) {
        console.error("Resume loading failed:", loadError);

        /*
          Existing backend/API may return 404 when
          no resume exists. That should not make the
          entire Builder unusable.
        */

        const status = loadError?.response?.status;

        if (status !== 404) {
          setError(
            loadError?.response?.data?.message ||
              loadError?.message ||
              "We couldn't load your resume. Please try again.",
          );
        }

        setData(normalizeResume(initialResumeData));

        setOriginalData(normalizeResume(initialResumeData));

        setIsExistingResume(false);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadResume();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  /* =======================================================
     LOAD LOCAL HISTORY
  ======================================================= */

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  /* =======================================================
     AUTO CLEAR SUCCESS MESSAGE
  ======================================================= */

  useEffect(() => {
    if (!successMessage) return;

    const timer = window.setTimeout(() => {
      setSuccessMessage("");
    }, 2800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [successMessage]);

  /* =======================================================
     DERIVED STATE
  ======================================================= */

  const completion = useMemo(() => calculateCompletion(data), [data]);

  const hasChanges = useMemo(() => {
    try {
      return JSON.stringify(data) !== JSON.stringify(originalData);
    } catch {
      return false;
    }
  }, [data, originalData]);

  const selectedTemplateInfo =
    TEMPLATE_OPTIONS.find((template) => template.id === selectedTemplate) ||
    TEMPLATE_OPTIONS[0];

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (nextData) => {
    setData(normalizeResume(nextData));

    setError("");
    setSuccessMessage("");
  };

  /* =======================================================
     SAVE TO BACKEND
  ======================================================= */

  const saveBackend = async (payload) => {
    const response = await updateResume(payload);

    const updatedResume = extractResumeFromResponse(response);

    if (!updatedResume) {
      throw new Error(
        "Resume was saved but the updated resume could not be loaded.",
      );
    }

    dispatch(setResume(updatedResume));

    return updatedResume;
  };

  /* =======================================================
     UPDATE CURRENT RESUME
  ======================================================= */

  const handleUpdate = async () => {
    if (saving) return;

    if (!hasChanges) {
      setSuccessMessage("There are no changes to update.");

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const updatedResume = await saveBackend(data);

      const normalized = normalizeResume(updatedResume);

      setData(normalized);
      setOriginalData(normalized);

      setIsExistingResume(true);
      setIsHistoryResume(false);

      /*
        Temporary local version snapshot.
        This will move to MongoDB History API
        in the next backend step.
      */

      const snapshot = createHistorySnapshot({
        data: normalized,
        template: selectedTemplate,
        type: "updated",
      });

      const nextHistory = [snapshot, ...history].slice(0, 20);

      setHistory(nextHistory);
      saveHistory(nextHistory);

      setSuccessMessage("Resume changes updated successfully.");
    } catch (saveError) {
      console.error("Resume update failed:", saveError);

      setError(
        saveError?.response?.data?.message ||
          saveError?.message ||
          "We couldn't update your resume. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     SAVE AS NEW
  ======================================================= */

  const handleSaveAsNew = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      /*
        Current backend has one resume per user.
        So for now Save as New creates a version snapshot
        locally.

        Later this will call:
        POST /api/resume/versions
      */

      const snapshot = createHistorySnapshot({
        data,
        template: selectedTemplate,
        type: "new",
      });

      const nextHistory = [snapshot, ...history].slice(0, 20);

      setHistory(nextHistory);
      saveHistory(nextHistory);

      /*
        Also update current active resume so the user
        doesn't lose their work.
      */

      const updatedResume = await saveBackend(data);

      const normalized = normalizeResume(updatedResume);

      setData(normalized);
      setOriginalData(normalized);

      setIsExistingResume(true);
      setIsHistoryResume(false);

      setSuccessMessage("New resume version saved.");
    } catch (saveError) {
      console.error("Save as new failed:", saveError);

      setError(
        saveError?.response?.data?.message ||
          saveError?.message ||
          "We couldn't save this resume version.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     START NEW RESUME
  ======================================================= */

  const startNewResume = () => {
    setData(normalizeResume(initialResumeData));

    setOriginalData(normalizeResume(initialResumeData));

    setIsExistingResume(false);
    setIsHistoryResume(false);

    setError("");
    setSuccessMessage("");

    setShowNewConfirm(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     OPEN HISTORY
  ======================================================= */

  const openHistory = (item) => {
    if (!item?.data) return;

    const restored = normalizeResume(item.data);

    setData(restored);
    setOriginalData(restored);

    setSelectedTemplate(item.template || "basic");

    setIsExistingResume(true);
    setIsHistoryResume(true);

    setError("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     DELETE HISTORY
  ======================================================= */

  const confirmDeleteHistory = () => {
    if (!deleteTarget) return;

    const nextHistory = history.filter((item) => item.id !== deleteTarget.id);

    setHistory(nextHistory);
    saveHistory(nextHistory);

    setDeleteTarget(null);

    setSuccessMessage("Resume version deleted.");
  };

  /* =======================================================
     PREVIEW
  ======================================================= */

  const openPreview = () => {
    setError("");
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  /* =======================================================
     KEYBOARD SHORTCUT
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();

        if (isExistingResume) {
          handleUpdate();
        } else {
          handleSaveAsNew();
        }
      }

      if (event.key === "Escape" && showPreview) {
        closePreview();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExistingResume, showPreview, hasChanges, data, saving, history]);

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#17191C] text-white">
        <div className="flex min-h-screen">
          <Sidebar
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            user={user}
            sidebarOpen={sidebarOpen}
            setUser={setUser}
            setSidebarOpen={setSidebarOpen}
          />

          <main
            className={`flex min-w-0 flex-1 items-center justify-center transition-[margin-left] duration-300 ${
              sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045]">
                <Loader2 className="h-5 w-5 animate-spin text-white/60" />
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-white/75">
                  Loading your resume
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Preparing your workspace...
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#17191C] text-white">
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

      {/* ===================================================
          SHELL
      =================================================== */}

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
          className={`min-w-0 w-full flex-1 overflow-x-hidden transition-[margin-left] duration-300 ${
            sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"
          }`}
        >
          <div className="mx-auto w-full max-w-[1500px] min-w-0 px-4 pb-28 pt-[86px] sm:px-6 lg:px-8 lg:py-8">
            <motion.div
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.4,
              }}
            >
              {/* =================================================
                  HEADER
              ================================================= */}

              <section className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      window.history.back();
                    }}
                    className="mb-5 text-xs text-white/25 transition-colors hover:text-white/60"
                  >
                    ← Dashboard
                  </button>

                  <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Resume Builder
                  </p>

                  <h1 className="max-w-3xl break-words text-[38px] font-semibold tracking-[-0.05em] sm:text-[52px]">
                    Build your next
                    <span
                      className="block font-serif text-[#A1A1AA]"
                      style={{
                        fontStyle: "italic",
                        fontWeight: 400,
                        letterSpacing: "-0.055em",
                      }}
                    >
                      career move.
                    </span>
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A1A1AA] sm:text-base">
                    Create, refine and preview a professional resume that
                    represents your work clearly.
                  </p>
                </div>

                {/* DESKTOP ACTIONS */}

                <div className="hidden shrink-0 items-center gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={openPreview}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>

                  {isExistingResume ? (
                    <>
                      <button
                        type="button"
                        onClick={handleUpdate}
                        disabled={saving || !hasChanges}
                        className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#17191C] transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Update Changes
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveAsNew}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.08] disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                        Save as New
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveAsNew}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#17191C] transition-all hover:scale-[1.01] disabled:opacity-40"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Resume
                    </button>
                  )}
                </div>
              </section>

              {/* =================================================
                  STATUS
              ================================================= */}

              <section className="mb-4 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
                <div className="flex w-full flex-col items-center">
                  <p className="mb-4 w-full text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717A] sm:mb-5">
                    Resume status
                  </p>

                  <div className="flex w-full flex-col items-center text-center">
                    <CompletionRing value={completion} />

                    <div className="mt-5 flex w-full min-w-0 flex-col items-center">
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-[28px]">
                      {completion >= 90
                        ? "Your resume is nearly ready."
                        : completion >= 60
                          ? "Your resume is taking shape."
                          : completion >= 30
                            ? "Keep building your resume."
                            : "Let's build your resume."}
                    </h2>

                    <div className="mt-2 flex items-center justify-center gap-2 text-xs text-white/35">
                      {saving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Saving changes...
                        </>
                      ) : hasChanges ? (
                        <>
                          <Clock3 className="h-3.5 w-3.5" />
                          Unsaved changes
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5 text-white/70" />
                          All changes saved
                        </>
                      )}
                    </div>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/35">
                      Add the important sections, keep your strongest work
                      visible, and make every part of the resume useful.
                    </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  ERROR
              ================================================= */}

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
                    className="mb-4 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/[0.04] p-4 text-sm text-red-200/75"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <span className="min-w-0 flex-1 break-words">{error}</span>

                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="shrink-0 text-white/30 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* =================================================
                  SUCCESS
              ================================================= */}

              <AnimatePresence>
                {successMessage && (
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
                    className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm text-white/70"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-white/80" />

                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* =================================================
                  MAIN GRID
              ================================================= */}

              <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                {/* ===============================================
                    FORM
                =============================================== */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.45,
                    delay: shouldReduceMotion ? 0 : 0.05,
                  }}
                  className="min-w-0 rounded-2xl border-0 bg-transparent p-0 sm:border sm:border-white/10 sm:bg-transparent sm:p-6"
                >
                  <ResumeForm data={data} onChange={handleChange} />
                </motion.div>

                {/* ===============================================
                    RIGHT PANEL
                =============================================== */}

                <aside className="min-w-0 space-y-4">
                  {/* TEMPLATE */}

                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                          Preview template
                        </p>

                        <h3 className="mt-2 text-base font-semibold">
                          {selectedTemplateInfo.name}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-[#71717A]">
                          {selectedTemplateInfo.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowTemplateMenu((value) => !value)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition-colors hover:bg-white/[0.08]"
                        aria-label="Choose template"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    <AnimatePresence>
                      {showTemplateMenu && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            height: 0,
                          }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                          }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-2 border-t border-white/[0.07] pt-4">
                            {TEMPLATE_OPTIONS.map((template) => (
                              <button
                                key={template.id}
                                type="button"
                                onClick={() => {
                                  setSelectedTemplate(template.id);
                                  setShowTemplateMenu(false);
                                }}
                                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                                  selectedTemplate === template.id
                                    ? "border-white/20 bg-white/[0.09]"
                                    : "border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.06]"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-sm font-medium">
                                    {template.name}
                                  </span>

                                  {selectedTemplate === template.id && (
                                    <Check className="h-4 w-4 text-white/70" />
                                  )}
                                </div>

                                <p className="mt-1 text-[11px] leading-5 text-white/30">
                                  {template.description}
                                </p>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={openPreview}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-medium text-white transition-colors hover:bg-white/[0.08]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Open Preview
                    </button>
                  </div>

                  {/* CURRENT RESUME */}

                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-white/45" />

                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                        Current resume
                      </p>
                    </div>

                    <h3 className="mt-3 text-base font-semibold">
                      {data?.profile?.name || "RIO Resume"}
                    </h3>

                    <div className="mt-5 space-y-3">
                      <ResumeCount
                        label="Experience"
                        value={data?.experience?.length || 0}
                      />

                      <ResumeCount
                        label="Projects"
                        value={data?.projects?.length || 0}
                      />

                      <ResumeCount
                        label="Education"
                        value={data?.education?.length || 0}
                      />

                      <ResumeCount
                        label="Skills"
                        value={data?.skills?.length || 0}
                      />

                      <ResumeCount
                        label="Certifications"
                        value={data?.certifications?.length || 0}
                      />
                    </div>
                  </div>

                  {/* HISTORY */}

                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                          History
                        </p>

                        <h3 className="mt-2 text-base font-semibold">
                          Previous resumes
                        </h3>
                      </div>

                      <History className="h-4 w-4 text-white/30" />
                    </div>

                    {history.length === 0 ? (
                      <div className="mt-4 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015] p-4">
                        <p className="text-xs leading-5 text-white/25">
                          Saved versions will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-2">
                        {history.map((item) => (
                          <HistoryItem
                            key={item.id}
                            item={item}
                            onOpen={openHistory}
                            onDelete={setDeleteTarget}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* NEW RESUME */}

                  <button
                    type="button"
                    onClick={() => {
                      if (hasChanges) {
                        setShowNewConfirm(true);
                      } else {
                        startNewResume();
                      }
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Start New Resume
                  </button>
                </aside>
              </section>
            </motion.div>
          </div>
        </main>
      </div>

      {/* =====================================================
          MOBILE ACTION BAR
      ===================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#111315]/90 p-3 backdrop-blur-2xl sm:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <button
            type="button"
            onClick={openPreview}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>

          {isExistingResume ? (
            <button
              type="button"
              onClick={handleUpdate}
              disabled={saving || !hasChanges}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#17191C] disabled:opacity-40"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Update
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveAsNew}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#17191C] disabled:opacity-40"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          PREVIEW MODAL
      ===================================================== */}

      <AnimatePresence>
        {showPreview && (
          <PreviewResume
            data={data}
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            onClose={closePreview}
            resumeRef={previewRef}
          />
        )}
      </AnimatePresence>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmModal
            title="Delete resume version?"
            description={`"${deleteTarget.name}" will be removed from your saved history.`}
            confirmText="Delete"
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDeleteHistory}
            danger
          />
        )}
      </AnimatePresence>

      {/* =====================================================
          NEW RESUME MODAL
      ===================================================== */}

      <AnimatePresence>
        {showNewConfirm && (
          <ConfirmModal
            title="Start a new resume?"
            description="You have unsaved changes. Starting a new resume will clear the current editor."
            confirmText="Start New"
            onCancel={() => setShowNewConfirm(false)}
            onConfirm={startNewResume}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* =========================================================
   RESUME COUNT
========================================================= */

const ResumeCount = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 last:border-0 last:pb-0">
      <span className="text-xs text-white/35">{label}</span>

      <span className="text-xs font-medium text-white/70">{value}</span>
    </div>
  );
};

/* =========================================================
   HISTORY ITEM
========================================================= */

const HistoryItem = ({ item, onOpen, onDelete }) => {
  const date = new Date(item.createdAt);

  const formattedDate = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="group rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 transition-colors hover:bg-white/[0.05]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04]">
          <FileText className="h-3.5 w-3.5 text-white/40" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-white/75">
            {item.name}
          </p>

          <p className="mt-1 text-[10px] text-white/25">
            {item.template || "Basic"} · {formattedDate} · {formattedTime}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDelete(item)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/20 opacity-100 transition-colors hover:bg-red-400/[0.08] hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label={`Delete ${item.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onOpen(item)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[11px] font-medium text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white"
      >
        <Eye className="h-3 w-3" />
        Open Resume
      </button>
    </div>
  );
};

/* =========================================================
   CONFIRM MODAL
========================================================= */

const ConfirmModal = ({
  title,
  description,
  confirmText,
  onCancel,
  onConfirm,
  danger = false,
}) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onCancel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 10,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
          y: 10,
        }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#17191C] p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold tracking-[-0.025em]">
              {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/40">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-white/40 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/[0.07]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              danger
                ? "bg-red-400 text-black hover:bg-red-300"
                : "bg-white text-[#17191C] hover:bg-white/90"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResumeBuilder;
