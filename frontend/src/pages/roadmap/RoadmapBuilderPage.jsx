import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiCompass,
  FiFileText,
  FiLayers,
  FiMenu,
  FiPlay,
  FiRefreshCw,
  FiSearch,
  FiMonitor,
  FiServer,
  FiCloud,
  FiGitBranch,
  FiDatabase,
  FiCpu,
  FiShield,
  FiTarget,
  FiUser,
  FiX,
  FiZap,
} from "react-icons/fi";

import Sidebar from "../../components/SideBar";

import {
  createRoadmapDraft,
  generateRoadmap,
  getLatestRoadmapDraft,
  getRoadmapTemplates,
  markRoadmapDraftGenerated,
  updateRoadmapDraft,
} from "../../api/roadmap.api";

import { getResumes, getResumeById } from "../../api/resume.api";

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

const inputClass =
  "w-full rounded-xl border border-white/[0.10] bg-[#191B1F] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#686B74] hover:border-white/[0.17] focus:border-white/30 focus:bg-[#1D1F23]";

const unwrap = (response) => response?.data ?? null;

const recordId = (record) =>
  record?._id || record?.id || record?.draftId || null;

const getResumeId = (resume) =>
  resume?._id || resume?.id || resume?.resumeId || null;

const splitLines = (value = "") =>
  String(value)
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getResumeLabel = (resume) =>
  resume?.profile?.name?.trim() ||
  resume?.profile?.email?.trim() ||
  `Resume ${String(getResumeId(resume) || "").slice(-6)}`;

const getTemplateIcon = (template) => {
  const value = `${template?.id || ""} ${template?.title || ""}`.toLowerCase();

  if (value.includes("frontend") || value.includes("front-end"))
    return FiMonitor;
  if (value.includes("backend") || value.includes("back-end")) return FiServer;
  if (value.includes("cloud")) return FiCloud;
  if (value.includes("devops") || value.includes("platform"))
    return FiGitBranch;
  if (value.includes("data engineer")) return FiDatabase;
  if (value.includes("ai") || value.includes("ml") || value.includes("llm"))
    return FiCpu;
  if (value.includes("security") || value.includes("cyber")) return FiShield;
  if (value.includes("full-stack") || value.includes("full stack"))
    return FiLayers;
  if (value.includes("system design")) return FiCompass;

  return FiBookOpen;
};

function SectionHeading({ number, icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex flex-col items-center gap-3 text-center sm:mb-4 sm:flex-row sm:items-start sm:gap-3 sm:text-left">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#D4D4D8]">
        <Icon size={17} />
      </div>

      <div className="min-w-0 sm:text-left">
        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#777B85]">
          {number}
        </p>

        <h2 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">
          {title}
        </h2>

        <p className="mx-auto mb-2 mt-1 max-w-md text-xs leading-5 text-[#858994] sm:mx-0 sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

function FieldLabel({ children, optional = false }) {
  return (
    <label className="mb-2 block text-xs font-medium text-[#C4C6CC]">
      {children}

      {optional && (
        <span className="ml-1.5 font-normal text-[#686B74]">Optional</span>
      )}
    </label>
  );
}

// ------------------------------------------------------------
// PAGE
// ------------------------------------------------------------

export default function RoadmapBuilderPage({ user, setUser }) {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [templates, setTemplates] = useState([]);
  const [resumes, setResumes] = useState([]);

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);

  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadingResumeDetails, setLoadingResumeDetails] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [generatedRoadmapId, setGeneratedRoadmapId] = useState(null);
  const [autoSaveState, setAutoSaveState] = useState("idle");

  const [draftId, setDraftId] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [showModes, setShowModes] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    templateId: "",
    generationMode: "standard",
    role: "",
    level: "beginner",
    availableHoursPerDay: 2,
    targetLpa: 12,
    manualSkills: "",
    prompt: "",
    goals: "",
    technologies: "",
    exclusions: "",
    projectPreferences: "",
    notes: "",
  });

  const setField = useCallback((key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setError("");
    setNotice("");
  }, []);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === form.templateId),
    [templates, form.templateId],
  );

  const activeResume = useMemo(
    () =>
      resumes.find(
        (resume) => String(getResumeId(resume)) === String(selectedResumeId),
      ) || null,
    [resumes, selectedResumeId],
  );

  const filteredTemplates = useMemo(() => {
    const query = templateSearch.trim().toLowerCase();
    if (!query) return templates;

    return templates.filter((template) =>
      [template?.title, template?.id, template?.description, template?.goal]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [templates, templateSearch]);

  // ----------------------------------------------------------
  // PAYLOAD
  // ----------------------------------------------------------

  const buildPayload = useCallback(
    () => ({
      templateId: form.templateId,
      generationMode: form.generationMode,
      role: form.role.trim(),
      level: form.level,
      availableHoursPerDay: Number(form.availableHoursPerDay),
      targetLpa: Number(form.targetLpa),

      resumeId:
        form.generationMode === "resume" ? selectedResumeId || null : null,

      resumeVersion:
        form.generationMode === "resume"
          ? selectedResume?.version || null
          : null,

      manualSkills: splitLines(form.manualSkills),

      customRequirements: {
        prompt: form.prompt.trim(),
        goals: splitLines(form.goals),
        technologies: splitLines(form.technologies),
        exclusions: splitLines(form.exclusions),
        projectPreferences: splitLines(form.projectPreferences),
        notes: form.notes.trim(),
      },

      inputSource:
        form.generationMode === "resume"
          ? "resume"
          : splitLines(form.manualSkills).length
            ? "skills"
            : "standard",
    }),
    [form, selectedResumeId, selectedResume],
  );

  // ----------------------------------------------------------
  // INITIAL LOAD: TEMPLATES, RESUMES AND DRAFT
  // ----------------------------------------------------------

  const loadResumes = useCallback(async () => {
    setLoadingResumes(true);

    try {
      const response = await getResumes();
      const result = unwrap(response);

      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.resumes)
          ? result.resumes
          : [];

      setResumes(list);

      return list;
    } catch (loadError) {
      console.error("Could not load resumes:", loadError);
      setResumes([]);
      return [];
    } finally {
      setLoadingResumes(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      setLoadingTemplates(true);
      setError("");

      try {
        const [templateResponse, draftResponse, resumeResponse] =
          await Promise.all([
            getRoadmapTemplates(),
            getLatestRoadmapDraft().catch(() => null),
            getResumes().catch(() => null),
          ]);

        if (cancelled) return;

        const templateResult = unwrap(templateResponse);

        const templateList = Array.isArray(templateResult)
          ? templateResult
          : Array.isArray(templateResult?.templates)
            ? templateResult.templates
            : Array.isArray(templateResponse)
              ? templateResponse
              : [];

        const resumeResult = unwrap(resumeResponse);

        const resumeList = Array.isArray(resumeResult)
          ? resumeResult
          : Array.isArray(resumeResult?.resumes)
            ? resumeResult.resumes
            : [];

        setTemplates(templateList);
        setResumes(resumeList);
        setLoadingResumes(false);

        const draft = unwrap(draftResponse);

        if (draft && !draft.generated) {
          setDraftId(recordId(draft));

          const draftResumeId =
            draft.resumeId?._id || draft.resumeId || draft.resume?._id || "";

          setSelectedResumeId(String(draftResumeId || ""));

          setForm((current) => ({
            ...current,
            templateId: draft.templateId || "",
            generationMode: draft.generationMode || "standard",
            role: draft.role || "",
            level: draft.level || "beginner",
            availableHoursPerDay: draft.availableHoursPerDay ?? 2,
            targetLpa: Number(draft.targetLpa ?? draft.targetPackageLpa ?? 12),
            manualSkills: (draft.manualSkills || []).join(", "),
            prompt: draft.customRequirements?.prompt || "",
            goals: (draft.customRequirements?.goals || []).join("\n"),
            technologies: (draft.customRequirements?.technologies || []).join(
              "\n",
            ),
            exclusions: (draft.customRequirements?.exclusions || []).join("\n"),
            projectPreferences: (
              draft.customRequirements?.projectPreferences || []
            ).join("\n"),
            notes: draft.customRequirements?.notes || "",
          }));

          setNotice("Your unfinished roadmap draft has been restored.");
        } else if (templateList.length > 0) {
          const firstTemplate = templateList[0];

          setForm((current) => ({
            ...current,
            templateId: current.templateId || firstTemplate.id,
            role: current.role || firstTemplate.title || firstTemplate.id || "",
          }));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError?.response?.data?.message ||
              loadError?.message ||
              "Could not load the roadmap builder.",
          );
        }
      } finally {
        if (!cancelled) setLoadingTemplates(false);
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  // ----------------------------------------------------------
  // FETCH FULL DETAILS WHEN A RESUME IS SELECTED
  // ----------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const fetchSelectedResume = async () => {
      if (!selectedResumeId) {
        setSelectedResume(null);
        return;
      }

      // The list item can be used for the dropdown immediately.
      setSelectedResume(activeResume);

      setLoadingResumeDetails(true);

      try {
        const response = await getResumeById(selectedResumeId);

        if (cancelled) return;

        const result = unwrap(response);
        const fullResume = result?.resume || result;

        setSelectedResume(fullResume || activeResume);
      } catch (fetchError) {
        if (!cancelled) {
          setSelectedResume(activeResume);

          setError(
            fetchError?.response?.data?.message ||
              "Could not load the selected resume. Please try selecting it again.",
          );
        }
      } finally {
        if (!cancelled) setLoadingResumeDetails(false);
      }
    };

    fetchSelectedResume();

    return () => {
      cancelled = true;
    };
  }, [selectedResumeId, activeResume]);

  // Quiet auto-save: preserve unfinished work after the user pauses typing.
  useEffect(() => {
    if (loadingTemplates || generating || !form.templateId) return;
    if (form.generationMode === "resume" && !selectedResumeId) return;

    const hasStartedEditing = Boolean(
      form.manualSkills.trim() ||
      form.prompt.trim() ||
      form.goals.trim() ||
      form.technologies.trim() ||
      form.exclusions.trim() ||
      form.projectPreferences.trim() ||
      form.notes.trim() ||
      form.level !== "beginner" ||
      Number(form.availableHoursPerDay) !== 2 ||
      Number(form.targetLpa) !== 12,
    );
    if (!hasStartedEditing) return;

    const timer = setTimeout(async () => {
      setAutoSaveState("saving");
      try {
        const body = {
          ...buildPayload(),
          currentStep: 0,
          useResume: form.generationMode === "resume",
        };
        const response = draftId
          ? await updateRoadmapDraft(draftId, body)
          : await createRoadmapDraft(body);
        const draft = unwrap(response);
        if (recordId(draft)) setDraftId(recordId(draft));
        setAutoSaveState("saved");
      } catch (saveError) {
        console.warn("Roadmap draft auto-save failed:", saveError);
        setAutoSaveState("error");
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [
    form,
    selectedResumeId,
    selectedResume,
    draftId,
    loadingTemplates,
    generating,
    buildPayload,
  ]);

  // ----------------------------------------------------------
  // TEMPLATE SELECTION
  // Selecting a template also fills the editable role field.
  // ----------------------------------------------------------

  const selectTemplate = (template) => {
    setForm((current) => ({
      ...current,
      templateId: template.id,
      role: template.title || template.id || current.role,
    }));

    setError("");
    setNotice("");
  };

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  const validate = () => {
    if (!form.templateId) {
      return "Choose a roadmap template to continue.";
    }

    if (form.role.trim().length < 2) {
      return "Enter the role or career goal you are preparing for.";
    }

    if (
      !Number.isFinite(Number(form.availableHoursPerDay)) ||
      Number(form.availableHoursPerDay) < 1
    ) {
      return "Choose at least one learning hour per day.";
    }

    if (form.generationMode === "resume" && !selectedResumeId) {
      return "Select a saved resume before using Resume-based mode.";
    }

    if (
      form.generationMode === "custom" &&
      ![
        form.prompt,
        form.goals,
        form.technologies,
        form.exclusions,
        form.projectPreferences,
        form.notes,
      ].some((value) => value.trim())
    ) {
      return "Add at least one custom requirement.";
    }

    return "";
  };

  // ----------------------------------------------------------
  // GENERATE ROADMAP
  // ----------------------------------------------------------

  const submit = async (event) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setGenerating(true);
    setGenerationComplete(false);
    setError("");
    setNotice("");

    try {
      const response = await generateRoadmap(buildPayload());
      const roadmap = unwrap(response);
      const roadmapId = recordId(roadmap);

      if (!roadmapId) {
        throw new Error(
          response?.message || "The server did not return a roadmap ID.",
        );
      }

      if (draftId) {
        try {
          await markRoadmapDraftGenerated(draftId, roadmapId);
        } catch (draftError) {
          console.warn(
            "Roadmap created, but draft status could not be updated.",
            draftError,
          );
        }
      }

      setGeneratedRoadmapId(roadmapId);
      setGenerationComplete(true);
      setNotice(
        `Your ${selectedTemplate?.title || "learning"} roadmap is ready.`,
      );
    } catch (generateError) {
      setError(
        generateError?.response?.data?.message ||
          generateError?.message ||
          "Roadmap generation failed. Please try again.",
      );
    } finally {
      setGenerating(false);
    }
  };

  // ----------------------------------------------------------
  // OPTIONS
  // ----------------------------------------------------------

  const modes = [
    {
      value: "standard",
      title: "Standard",
      description: "Follow the selected structured roadmap.",
      icon: FiBookOpen,
    },
    {
      value: "resume",
      title: "Resume-based",
      description: "Use a specific saved resume as context.",
      icon: FiFileText,
    },
    {
      value: "custom",
      title: "Custom",
      description: "Add your own goals and requirements.",
      icon: FiZap,
    },
  ];

  const busy = generating || loadingTemplates;

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#17191C] text-white">
      <style>{`
        .rio-range {
          height: 5px;
          appearance: none;
          -webkit-appearance: none;
          border-radius: 9999px;
          outline: none;
        }
        .rio-range::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 17px;
          height: 17px;
          border-radius: 9999px;
          border: 3px solid #17191C;
          background: #F4F4F5;
          box-shadow: 0 0 0 1px rgba(255,255,255,.42);
        }
        .rio-range::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          border: 3px solid #17191C;
          background: #F4F4F5;
          box-shadow: 0 0 0 1px rgba(255,255,255,.42);
        }
      `}</style>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 100% 0%, rgba(255,255,255,.055), transparent 70%), radial-gradient(ellipse 60% 55% at 0% 100%, rgba(255,255,255,.025), transparent 72%)",
        }}
      />
      {/* Mobile header */}
      <header className="fixed left-3 right-3 top-3 z-40 flex h-14 items-center justify-between rounded-2xl border border-white/10 bg-[#17191C]/90 px-3 backdrop-blur-xl md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]"
        >
          <FiMenu size={18} />
        </button>

        <span
          className="text-base tracking-wide"
          style={{ fontFamily: '"Zen Dots", sans-serif' }}
        >
          RIO
        </span>

        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xs font-semibold">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </span>
      </header>
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
          className={`min-w-0 flex-1 transition-[margin-left] duration-300 ${
            sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"
          }`}
        >
          <div className="mx-auto w-full max-w-none px-3 pb-16 pt-[82px] sm:px-6 sm:pb-28 lg:px-8 lg:py-8 lg:pb-4">
            {/* Back navigation */}
            <button
              type="button"
              onClick={() => navigate("/roadmap")}
              className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-[#92959E] transition hover:text-white"
            >
              <FiArrowLeft size={14} />
              Back to roadmaps
            </button>

            {/* Page title */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-6 flex flex-col items-center gap-4  sm:mb-7 sm:items-start sm:text-left lg:flex-row lg:items-end lg:justify-between"
            >
              <div className="max-w-2xl">
                <p className="mb-3 items-center flex gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#858994] sm:justify-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  Roadmap Studio
                </p>

                <h1 className="text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">
                  Build your{" "}
                  <span className="font-serif font-normal italic text-[#B8BAC1]">
                    learning path.
                  </span>
                </h1>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#92959E] sm:mx-0 ">
                  Pick a direction, set your pace, and let RIO organize the next
                  steps.
                </p>
              </div>

              <div className="hidden items-center gap-3 rounded-[17px] border border-white/[0.11] bg-[#ffffff] px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.16)] lg:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/20 bg-black/[0.05]">
                  <span className="text-xl font-semibold text-[#17191C]">
                    ₹
                  </span>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6F727A]">
                    ROADMAP COST
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#17191C]">
                    100 INR
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Alerts */}
            <AnimatePresence initial={false}>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 overflow-hidden"
                >
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-[#DCA47A]/20 bg-[#DCA47A]/[0.06] px-4 py-3 text-sm text-[#E6C2A4]"
                  >
                    <FiX className="mt-0.5 shrink-0" size={15} />
                    <p className="flex-1">{error}</p>
                    <button
                      type="button"
                      onClick={() => setError("")}
                      aria-label="Dismiss error"
                    >
                      <FiX size={15} />
                    </button>
                  </div>
                </motion.div>
              )}

              {notice && (
                <motion.div
                  key="notice"
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 overflow-hidden"
                >
                  <div
                    role="status"
                    className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs text-[#D4D4D8]"
                  >
                    {notice}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form id="roadmap-builder-form" onSubmit={submit}>
              <div className="grid w-full min-w-0 items-start gap-4">
                {/* Main form */}
                <div className="min-w-0 space-y-4">
                  {/* STEP 1: TEMPLATE */}
                  <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.04 }}
                    className="rounded-2xl border border-white/[0.09] bg-[#111316] p-4 sm:p-5"
                  >
                    <SectionHeading
                      number="01 / Direction"
                      icon={FiTarget}
                      title="Where do you want to go?"
                      description="Choose a starting roadmap. Its title will fill your role field, which you can edit."
                    />

                    <div className="rounded-xl border border-white/[0.09] bg-white/[0.025] p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#D4D4D8]">
                          <FiLayers size={17} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777B85]">
                            Selected roadmap
                          </p>
                          <p className="mt-1 truncate text-sm font-semibold text-white">
                            {selectedTemplate?.title ||
                              (loadingTemplates
                                ? "Loading roadmaps…"
                                : "Choose a roadmap")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowTemplates((value) => !value);
                            if (showTemplates) setTemplateSearch("");
                          }}
                          aria-label={
                            showTemplates
                              ? "Close roadmap list"
                              : "Open roadmap list"
                          }
                          aria-expanded={showTemplates}
                          className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-[#A1A1AA] transition hover:bg-white/[0.08] hover:text-white sm:ml-0 sm:h-auto sm:w-auto sm:gap-1.5 sm:rounded-lg sm:px-3 sm:py-2 sm:text-xs sm:font-medium sm:text-[#D4D4D8]"
                        >
                          <motion.span
                            animate={{ rotate: showTemplates ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FiChevronDown size={15} />
                          </motion.span>
                          <span className="hidden sm:inline">
                            {showTemplates ? "Done" : "Change"}
                          </span>
                        </button>
                      </div>

                      <label className="relative mt-3 block w-full">
                        <FiSearch
                          size={15}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777B85]"
                        />
                        <input
                          type="search"
                          value={templateSearch}
                          onFocus={() => setShowTemplates(true)}
                          onChange={(event) => {
                            setTemplateSearch(event.target.value);
                            setShowTemplates(true);
                          }}
                          placeholder="Search roadmaps..."
                          aria-label="Search roadmaps"
                          className={`${inputClass} py-3 pl-10 pr-10`}
                        />
                        {templateSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setTemplateSearch("");
                              setShowTemplates(true);
                            }}
                            aria-label="Clear roadmap search"
                            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.06] text-white/60 transition hover:bg-white/[0.12] hover:text-white"
                          >
                            <FiX size={13} />
                          </button>
                        )}
                      </label>

                      <AnimatePresence initial={false}>
                        {showTemplates && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, y: -5 }}
                            animate={{ height: "auto", opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -5 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3">
                              {loadingTemplates ? (
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {[1, 2, 3, 4].map((item) => (
                                    <div
                                      key={item}
                                      className="h-20 animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.025]"
                                    />
                                  ))}
                                </div>
                              ) : templates.length === 0 ? (
                                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 text-sm text-[#A1A1AA]">
                                  No roadmap templates were returned. Check that
                                  the Roadmap Service and templates API are
                                  available.
                                </div>
                              ) : filteredTemplates.length === 0 ? (
                                <p className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 text-sm text-[#858994]">
                                  No roadmaps match “{templateSearch}”.
                                </p>
                              ) : (
                                <div className="grid items-stretch gap-2 sm:grid-cols-2">
                                  {filteredTemplates.map((template) => {
                                    const active =
                                      form.templateId === template.id;
                                    const TemplateIcon =
                                      getTemplateIcon(template);
                                    return (
                                      <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => {
                                          selectTemplate(template);
                                          setShowTemplates(false);
                                          setTemplateSearch("");
                                        }}
                                        aria-pressed={active}
                                        className={`group flex h-full min-h-[132px] w-full items-start gap-3 rounded-xl border p-3 text-left transition duration-200 ${active ? "border-white/25 bg-white/[0.075]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.04]"}`}
                                      >
                                        <span
                                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${active ? "border-white/20 bg-white/[0.09] text-white" : "border-white/10 bg-white/[0.04] text-[#A1A1AA]"}`}
                                        >
                                          <TemplateIcon size={15} />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                          <span className="block text-sm font-semibold text-white">
                                            {template.title || template.id}
                                          </span>
                                          <span
                                            className="mt-1 block min-h-[3.75rem] text-xs leading-5 text-[#858994]"
                                            style={{
                                              display: "-webkit-box",
                                              WebkitBoxOrient: "vertical",
                                              WebkitLineClamp: 3,
                                              overflow: "hidden",
                                            }}
                                          >
                                            {template.description ||
                                              template.goal ||
                                              "A structured learning roadmap."}
                                          </span>
                                        </span>
                                        {active && (
                                          <FiCheck
                                            className="mt-1 shrink-0"
                                            size={15}
                                          />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel>Role / career goal</FieldLabel>

                        <input
                          value={form.role}
                          onChange={(event) =>
                            setField("role", event.target.value)
                          }
                          maxLength={200}
                          placeholder="e.g. Backend Engineer"
                          className={inputClass}
                        />

                        <p className="mt-1.5 text-[10px] leading-4 text-[#686B74]">
                          Auto-filled from the selected template; still
                          editable.
                        </p>
                      </div>

                      <div>
                        <FieldLabel>Current experience level</FieldLabel>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            ["beginner", "Beginner"],
                            ["intermediate", "Intermediate"],
                            ["advanced", "Advanced"],
                          ].map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setField("level", value)}
                              aria-pressed={form.level === value}
                              className={`rounded-xl border px-2 py-3 text-xs font-medium transition ${
                                form.level === value
                                  ? "border-white/25 bg-white/[0.09] text-white"
                                  : "border-white/[0.08] bg-white/[0.025] text-[#92959E] hover:bg-white/[0.05]"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.section>

                  {/* STEP 2: GENERATION MODE */}
                  <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 }}
                    className="rounded-2xl border border-white/[0.09] bg-[#111316] p-4 sm:p-5"
                  >
                    <SectionHeading
                      number="02 / Approach"
                      icon={FiBookOpen}
                      title="How should RIO build it?"
                      description="Choose a standard roadmap, use a saved resume, or add custom instructions."
                    />

                    <div className="rounded-xl border border-white/[0.09] bg-white/[0.025] p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#D4D4D8]">
                          {(() => {
                            const ActiveIcon =
                              modes.find(
                                (mode) => mode.value === form.generationMode,
                              )?.icon || FiBookOpen;
                            return <ActiveIcon size={17} />;
                          })()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777B85]">
                            Generation mode
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {modes.find(
                              (mode) => mode.value === form.generationMode,
                            )?.title || "Standard"}
                          </p>
                          <p className="mt-0.5 text-xs text-[#858994]">
                            {form.generationMode === "standard"
                              ? "Canonical roadmap · Free"
                              : "AI-personalized roadmap · ₹100"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowModes((value) => !value)}
                          aria-expanded={showModes}
                          aria-label={
                            showModes
                              ? "Close generation options"
                              : "Change generation mode"
                          }
                          className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-[#A1A1AA] transition hover:bg-white/[0.08] hover:text-white sm:ml-0 sm:h-auto sm:w-auto sm:gap-1.5 sm:rounded-lg sm:px-3 sm:py-2 sm:text-xs sm:font-medium sm:text-[#D4D4D8]"
                        >
                          <motion.span
                            animate={{ rotate: showModes ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FiChevronDown size={15} />
                          </motion.span>
                          <span className="hidden sm:inline">
                            {showModes ? "Done" : "Change"}
                          </span>
                        </button>
                      </div>
                      <AnimatePresence initial={false}>
                        {showModes && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, y: -5 }}
                            animate={{ height: "auto", opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -5 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="grid gap-2 pt-3 sm:grid-cols-3">
                              {modes.map((mode) => {
                                const Icon = mode.icon;
                                const active =
                                  form.generationMode === mode.value;
                                return (
                                  <button
                                    key={mode.value}
                                    type="button"
                                    onClick={() => {
                                      setField("generationMode", mode.value);
                                      setShowModes(false);
                                    }}
                                    aria-pressed={active}
                                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${active ? "border-white/25 bg-white/[0.075]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.04]"}`}
                                  >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#D4D4D8]">
                                      <Icon size={15} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block text-sm font-semibold text-white">
                                        {mode.title}
                                      </span>
                                      <span className="mt-1 block text-xs leading-5 text-[#858994]">
                                        {mode.description}
                                      </span>
                                      <span className="mt-2 block text-[10px] font-medium text-[#C4C6CC]">
                                        {mode.value === "standard"
                                          ? "Free"
                                          : "₹100 on successful generation"}
                                      </span>
                                    </span>
                                    {active && (
                                      <FiCheck
                                        className="mt-1 shrink-0"
                                        size={14}
                                      />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Resume selection */}
                    <AnimatePresence initial={false}>
                      {form.generationMode === "resume" && (
                        <motion.div
                          key="resume-picker"
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 rounded-xl border border-white/[0.09] bg-white/[0.025] p-4 sm:p-5">
                            <div className="mb-4 flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  Choose a saved resume
                                </p>

                                <p className="mt-1 text-xs leading-5 text-[#858994]">
                                  RIO will use the selected resume, not simply
                                  whichever resume was loaded most recently.
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={loadResumes}
                                disabled={loadingResumes}
                                aria-label="Refresh resumes"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-[#B8BAC1] transition hover:bg-white/[0.08] disabled:opacity-50"
                              >
                                <FiRefreshCw
                                  size={14}
                                  className={
                                    loadingResumes ? "animate-spin" : ""
                                  }
                                />
                              </button>
                            </div>

                            {loadingResumes ? (
                              <div className="h-12 animate-pulse rounded-xl border border-white/10 bg-white/[0.035]" />
                            ) : resumes.length === 0 ? (
                              <div className="rounded-xl border border-white/[0.08] bg-[#191B1F] p-4">
                                <div className="flex items-start gap-3">
                                  <FiFileText
                                    className="mt-0.5 text-[#A1A1AA]"
                                    size={17}
                                  />

                                  <div>
                                    <p className="text-sm font-medium text-white">
                                      No saved resumes found
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[#858994]">
                                      Upload and analyze a resume first. Then
                                      return here and refresh the list.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <label
                                  htmlFor="roadmap-resume-select"
                                  className="mb-2 block text-xs font-medium text-[#C4C6CC]"
                                >
                                  Saved resumes
                                </label>

                                <div className="relative">
                                  <select
                                    id="roadmap-resume-select"
                                    value={selectedResumeId}
                                    onChange={(event) =>
                                      setSelectedResumeId(event.target.value)
                                    }
                                    className={`${inputClass} appearance-none pr-10`}
                                  >
                                    <option value="" className="bg-[#191B1F]">
                                      Select a resume...
                                    </option>

                                    {resumes.map((resume) => {
                                      const id = getResumeId(resume);

                                      if (!id) return null;

                                      return (
                                        <option
                                          key={id}
                                          value={id}
                                          className="bg-[#191B1F]"
                                        >
                                          {getResumeLabel(resume)} · Updated{" "}
                                          {formatDate(resume.updatedAt)}
                                        </option>
                                      );
                                    })}
                                  </select>

                                  <FiChevronDown
                                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#858994]"
                                    size={15}
                                  />
                                </div>

                                {activeResume && (
                                  <div className="mt-3 flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#191B1F] p-3.5">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045]">
                                      <FiUser size={15} />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-medium text-white">
                                        {getResumeLabel(activeResume)}
                                      </p>

                                      {activeResume.profile?.email && (
                                        <p className="mt-0.5 truncate text-xs text-[#858994]">
                                          {activeResume.profile.email}
                                        </p>
                                      )}

                                      <p className="mt-1 text-[10px] text-[#777B85]">
                                        Updated{" "}
                                        {formatDate(activeResume.updatedAt)}
                                        {activeResume.createdAt && (
                                          <>
                                            {" "}
                                            · Created{" "}
                                            {formatDate(activeResume.createdAt)}
                                          </>
                                        )}
                                      </p>
                                    </div>

                                    {loadingResumeDetails ? (
                                      <span className="mt-1 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                    ) : (
                                      <FiCheck
                                        className="mt-1 shrink-0 text-white"
                                        size={16}
                                      />
                                    )}
                                  </div>
                                )}

                                {!selectedResumeId && (
                                  <p className="mt-2 text-[11px] text-[#C4C6CC]">
                                    Select the resume you want RIO to use.
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {form.generationMode === "custom" && (
                        <motion.div
                          key="custom-fields"
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-4 rounded-xl border border-white/[0.09] bg-white/[0.025] p-4 sm:p-5">
                            <div>
                              <FieldLabel>What should RIO focus on?</FieldLabel>

                              <textarea
                                rows={3}
                                value={form.prompt}
                                onChange={(event) =>
                                  setField("prompt", event.target.value)
                                }
                                maxLength={10000}
                                placeholder="Describe the outcome you want, your constraints, and what success looks like..."
                                className={`${inputClass} resize-y`}
                              />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              {[
                                [
                                  "goals",
                                  "Goals",
                                  "Build production-ready projects",
                                ],
                                [
                                  "technologies",
                                  "Technologies",
                                  "Node.js, React, MongoDB",
                                ],
                                [
                                  "projectPreferences",
                                  "Project preferences",
                                  "SaaS, e-commerce, microservices",
                                ],
                                [
                                  "exclusions",
                                  "Skip / already know",
                                  "Topics you do not need to repeat",
                                ],
                              ].map(([key, label, placeholder]) => (
                                <div key={key}>
                                  <FieldLabel optional>{label}</FieldLabel>

                                  <textarea
                                    rows={2}
                                    value={form[key]}
                                    onChange={(event) =>
                                      setField(key, event.target.value)
                                    }
                                    placeholder={placeholder}
                                    className={`${inputClass} resize-y`}
                                  />
                                </div>
                              ))}
                            </div>

                            <div>
                              <FieldLabel optional>Additional notes</FieldLabel>

                              <textarea
                                rows={2}
                                value={form.notes}
                                onChange={(event) =>
                                  setField("notes", event.target.value)
                                }
                                maxLength={5000}
                                placeholder="Anything else RIO should know..."
                                className={`${inputClass} resize-y`}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.section>

                  {/* STEP 3: PACE AND SKILLS */}
                  <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.12 }}
                    className="rounded-2xl border border-white/[0.09] bg-[#111316] p-4 sm:p-5"
                  >
                    <SectionHeading
                      number="03 / Your pace"
                      icon={FiClock}
                      title="Make it realistic."
                      description="Set your daily study time and tell RIO what you already know."
                    />

                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <div className="mb-4 flex items-end justify-between gap-3">
                        <FieldLabel>Available learning time per day</FieldLabel>
                        <p className="text-lg font-semibold tabular-nums text-white">
                          {form.availableHoursPerDay}{" "}
                          <span className="text-xs font-medium text-[#858994]">
                            {Number(form.availableHoursPerDay) === 1
                              ? "hour/day"
                              : "hours/day"}
                          </span>
                        </p>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="12"
                        step="1"
                        value={Number(form.availableHoursPerDay)}
                        onChange={(event) =>
                          setField(
                            "availableHoursPerDay",
                            Number(event.target.value),
                          )
                        }
                        aria-label="Available learning hours per day"
                        className="rio-range w-full cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #F4F4F5 ${((Number(form.availableHoursPerDay) - 1) / 11) * 100}%, #34363B ${((Number(form.availableHoursPerDay) - 1) / 11) * 100}%)`,
                        }}
                      />
                      <div className="mt-2 flex justify-between text-[10px] text-[#777B85]">
                        <span>1 hour</span>
                        <span>6 hours</span>
                        <span>12 hours</span>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <div className="mb-4 flex items-end justify-between gap-3">
                        <FieldLabel>Target package (LPA)</FieldLabel>
                        <p className="text-lg font-semibold tabular-nums text-white">
                          {Number(form.targetLpa) >= 100
                            ? "1 Cr+"
                            : `${form.targetLpa} LPA`}
                        </p>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="9"
                        step="1"
                        value={
                          [1, 3, 5, 8, 12, 20, 30, 50, 75, 100].indexOf(
                            Number(form.targetLpa),
                          ) < 0
                            ? 4
                            : [1, 3, 5, 8, 12, 20, 30, 50, 75, 100].indexOf(
                                Number(form.targetLpa),
                              )
                        }
                        onChange={(event) =>
                          setField(
                            "targetLpa",
                            [1, 3, 5, 8, 12, 20, 30, 50, 75, 100][
                              Number(event.target.value)
                            ],
                          )
                        }
                        aria-label="Target package in LPA"
                        className="rio-range w-full cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #F4F4F5 ${(Number([1, 3, 5, 8, 12, 20, 30, 50, 75, 100].indexOf(Number(form.targetLpa)) < 0 ? 4 : [1, 3, 5, 8, 12, 20, 30, 50, 75, 100].indexOf(Number(form.targetLpa))) / 9) * 100}%, #34363B ${(Number([1, 3, 5, 8, 12, 20, 30, 50, 75, 100].indexOf(Number(form.targetLpa)) < 0 ? 4 : [1, 3, 5, 8, 12, 20, 30, 50, 75, 100].indexOf(Number(form.targetLpa))) / 9) * 100}%)`,
                        }}
                      />
                      <div className="mt-2 flex justify-between text-[10px] text-[#777B85]">
                        <span>1 LPA</span>
                        <span>12 LPA</span>
                        <span>1 Cr+</span>
                      </div>
                      <p className="mt-3 text-[10px] leading-4 text-[#686B74]">
                        RIO uses this as a career target. The canonical roadmap
                        remains intact; personalization can add relevant depth.
                      </p>
                    </div>

                    <div className="mt-5">
                      <FieldLabel optional>Skills you already know</FieldLabel>

                      <textarea
                        rows={3}
                        value={form.manualSkills}
                        onChange={(event) =>
                          setField("manualSkills", event.target.value)
                        }
                        placeholder="C++, DSA, JavaScript, SQL..."
                        className={`${inputClass} resize-y`}
                      />

                      <p className="mt-1.5 text-[10px] leading-4 text-[#686B74]">
                        Separate skills with commas or new lines. This helps RIO
                        avoid repeating fundamentals unnecessarily.
                      </p>
                    </div>
                  </motion.section>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.09] pt-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    Build a path that fits your day.
                  </p>
                  <p className="mt-1 text-xs text-[#858994]">
                    {form.availableHoursPerDay}{" "}
                    {Number(form.availableHoursPerDay) === 1 ? "hour" : "hours"}{" "}
                    per day · {form.level} level
                    <span className="mx-2 text-white/20">·</span>
                    {autoSaveState === "saving"
                      ? "Saving draft…"
                      : autoSaveState === "saved"
                        ? "Draft saved automatically"
                        : autoSaveState === "error"
                          ? "Auto-save will retry after your next change"
                          : "Unfinished changes save automatically"}
                  </p>
                </div>
                <div className="hidden shrink-0 items-center justify-end gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/roadmap/history?roadmap=${encodeURIComponent(generatedRoadmapId)}`,
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.13] bg-white/[0.035] px-4 py-3 text-sm font-medium text-[#E4E4E7] transition hover:bg-white/[0.08]"
                  >
                    <FiClock size={15} /> History
                  </button>
                  <button
                    type="submit"
                    disabled={
                      busy ||
                      templates.length === 0 ||
                      (form.generationMode === "resume" && !selectedResumeId)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#17191C] transition hover:-translate-y-0.5 hover:bg-[#E7E7E7] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {generating ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                    ) : (
                      <FiZap size={15} />
                    )}
                    {generating ? "Building roadmap…" : "Build roadmap"}
                    {!generating && <FiArrowRight size={15} />}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
      ```jsx
      {/* Fixed mobile actions — matches the Dashboard bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#111315]/[0.92] p-3 backdrop-blur-xl sm:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/roadmap/history?roadmap=${encodeURIComponent(generatedRoadmapId)}`,
              )
            }
            className="group flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-semibold text-[#D4D4D8] transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white"
          >
            <FiClock size={14} />
            <span>View history</span>
          </button>

          <button
            type="submit"
            form="roadmap-builder-form"
            disabled={
              busy ||
              templates.length === 0 ||
              (form.generationMode === "resume" && !selectedResumeId)
            }
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-[#17191C] shadow-[0_-10px_35px_rgba(0,0,0,0.22)] transition duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
            ) : (
              <FiPlay size={14} />
            )}

            <span>{generating ? "Building…" : "Build roadmap"}</span>

            {!generating && <FiArrowRight size={14} className="sm:hidden" />}
          </button>
        </div>
      </div>
      ```
      <AnimatePresence>
        {(generating || generationComplete) && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="roadmap-generation-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#17191C] p-6 shadow-[0_30px_100px_rgba(0,0,0,.5)]"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                {generationComplete ? (
                  <FiCheck size={24} className="text-white" />
                ) : (
                  <FiLayers size={23} className="animate-pulse text-white" />
                )}
              </div>
              <h2
                id="roadmap-generation-title"
                className="mt-5 text-center text-xl font-semibold tracking-tight"
              >
                {generationComplete
                  ? "Your roadmap is ready"
                  : "Building your roadmap"}
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-[#A1A1AA]">
                {generationComplete
                  ? "Your learning path has been created and saved. Open it whenever you're ready."
                  : form.generationMode === "standard"
                    ? "RIO is organizing the selected roadmap and preparing your learning steps."
                    : "RIO is tailoring your learning path to the details you provided. This may take a little while."}
              </p>
              {!generationComplete ? (
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <motion.div
                    className="h-full w-1/3 rounded-full bg-white"
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{
                      duration: 1.35,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    generatedRoadmapId &&
                    navigate(
                      `/roadmap/history?roadmap=${encodeURIComponent(generatedRoadmapId)}`,
                    )
                  }
                  disabled={!generatedRoadmapId}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#17191C] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  View roadmap <FiArrowRight size={15} />
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
