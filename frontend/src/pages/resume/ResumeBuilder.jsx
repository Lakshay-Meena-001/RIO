import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  FolderKanban,
  GraduationCap,
  Languages,
  LoaderCircle,
  Save,
  FilePlus2,
  ListChecks,
  Sun,
  Moon,
  RefreshCw,
  Sparkles,
  Target,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import ResumeForm from "./ResumeForm";
import PreviewResume from "../../components/resume/PreviewResume";
import BasicTemplate from "../../components/resume/templates/BasicTemplate";
import ModernTemplate from "../../components/resume/templates/ModernTemplate";
import ProfessionalTemplate from "../../components/resume/templates/ProfessionalTemplate";
import initialResumeData from "../../components/resume/initialData";
import {
  createResume,
  getResumeById,
  getScoredResumeById,
  getScoredResumes,
  updateResume,
} from "../../api/resume/resume.api";
import { setResume } from "../../redux/resumeSlice";
import { FiPlus } from "react-icons/fi";

const TEMPLATES = [
  { id: "basic", name: "Basic", subtitle: "ATS clean" },
  { id: "modern", name: "Modern", subtitle: "Contemporary" },
  { id: "professional", name: "Professional", subtitle: "Classic" },
];

const SECTIONS = [
  {
    label: "Personal details",
    hint: "Contact & profile",
    Icon: UserRound,
    terms: ["profile", "personal details"],
  },
  {
    label: "Professional summary",
    hint: "Your introduction",
    Icon: Target,
    terms: ["professional summary", "summary", "objective"],
  },
  {
    label: "Work experience",
    hint: "Roles & impact",
    Icon: BriefcaseBusiness,
    terms: ["work experience", "experience"],
  },
  {
    label: "Education",
    hint: "Academic background",
    Icon: GraduationCap,
    terms: ["education", "academic"],
  },
  {
    label: "Projects",
    hint: "Things you built",
    Icon: FolderKanban,
    terms: ["projects", "project"],
  },
  {
    label: "Skills",
    hint: "Technical strengths",
    Icon: Wrench,
    terms: ["skills", "skill"],
  },
  {
    label: "Certifications",
    hint: "Credentials",
    Icon: Award,
    terms: ["certifications", "certification"],
  },
  {
    label: "Achievements",
    hint: "Highlights & awards",
    Icon: Sparkles,
    terms: ["achievements", "achievement"],
  },
  {
    label: "Languages",
    hint: "Languages you know",
    Icon: Languages,
    terms: ["languages", "language"],
  },
];

function clone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function createBlankResume() {
  const blank = clone(initialResumeData);
  const blankProfile = Object.fromEntries(
    Object.keys(blank.profile || {}).map((key) => [key, ""]),
  );
  return {
    ...blank,
    profile: blankProfile,
    summary: "",
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    achievements: [],
    languages: [],
  };
}

function normalizeResume(resume) {
  if (!resume) return clone(initialResumeData);
  return {
    ...clone(initialResumeData),
    ...resume,
    profile: {
      ...(initialResumeData.profile || {}),
      ...(resume.profile || {}),
    },
    summary: resume.summary || "",
    education: Array.isArray(resume.education) ? clone(resume.education) : [],
    experience: Array.isArray(resume.experience)
      ? clone(resume.experience)
      : [],
    projects: Array.isArray(resume.projects) ? clone(resume.projects) : [],
    skills: Array.isArray(resume.skills) ? clone(resume.skills) : [],
    certifications: Array.isArray(resume.certifications)
      ? clone(resume.certifications)
      : [],
    achievements: Array.isArray(resume.achievements)
      ? clone(resume.achievements)
      : [],
    languages: Array.isArray(resume.languages) ? clone(resume.languages) : [],
  };
}

function unwrapResume(response) {
  if (response?.data?.data?.profile) return response.data.data;
  if (response?.data?.profile) return response.data;
  if (response?.profile) return response;
  return null;
}

function hasResumeContent(data) {
  const profile = data?.profile || {};
  return Boolean(
    Object.values(profile).some((value) => String(value || "").trim()) ||
    String(data?.summary || "").trim() ||
    [
      "education",
      "experience",
      "projects",
      "skills",
      "certifications",
      "achievements",
      "languages",
    ].some((key) =>
      (data?.[key] || []).some((item) =>
        typeof item === "string"
          ? item.trim()
          : Object.values(item || {}).some((value) =>
              Array.isArray(value)
                ? value.some((entry) => String(entry).trim())
                : String(value || "").trim(),
            ),
      ),
    ),
  );
}

function getValidationFieldErrors(data) {
  const errors = {};
  const profile = data?.profile || {};
  if (!profile.name?.trim()) errors.name = "Full name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email?.trim() || ""))
    errors.email = "Enter a valid email address.";
  if ((profile.phone || "").replace(/\D/g, "").length < 7)
    errors.phone = "Enter a valid phone number.";
  if ((data?.summary || "").trim().length < 30)
    errors.summary = "Add a professional summary of at least 30 characters.";
  const education = data?.education || [];
  if (
    !education.some((item) => item.institution?.trim() && item.degree?.trim())
  )
    errors.education =
      "Add at least one education entry with institution and degree.";
  if (
    education.some(
      (item) =>
        Object.values(item || {}).some((value) => String(value || "").trim()) &&
        !(item.institution?.trim() && item.degree?.trim()),
    )
  )
    errors.educationEntries =
      "Complete the institution and degree for each education entry you started, or remove the incomplete entry.";
  if ((data?.skills || []).filter((item) => String(item).trim()).length < 3)
    errors.skills = "Add at least 3 skills.";
  const projects = data?.projects || [];
  const experience = data?.experience || [];
  const hasProject = projects.some(
    (item) => item.title?.trim() && item.description?.trim(),
  );
  const hasExperience = experience.some(
    (item) =>
      item.company?.trim() && item.role?.trim() && item.description?.trim(),
  );
  if (
    projects.some(
      (item) =>
        Object.values(item || {}).some((value) =>
          Array.isArray(value)
            ? value.some((entry) => String(entry).trim())
            : String(value || "").trim(),
        ) && !(item.title?.trim() && item.description?.trim()),
    )
  )
    errors.projectEntries =
      "Complete the title and description for each project you started, or remove the incomplete project.";
  if (
    experience.some(
      (item) =>
        Object.values(item || {}).some((value) =>
          Array.isArray(value)
            ? value.some((entry) => String(entry).trim())
            : String(value || "").trim(),
        ) &&
        !(
          item.company?.trim() &&
          item.role?.trim() &&
          item.description?.trim()
        ),
    )
  )
    errors.experienceEntries =
      "Complete company, role and description for each work entry you started, or remove the incomplete entry.";
  if (!hasProject && !hasExperience)
    errors.projectExperience =
      "Add at least one complete project or work experience.";
  return errors;
}

function getCompletion(data) {
  const profile = data?.profile || {};
  const checks = [
    Boolean(profile.name?.trim()),
    Boolean(profile.email?.trim()),
    Boolean(profile.phone?.trim()),
    Boolean(profile.location?.trim()),
    Boolean(data?.summary?.trim()),
    Boolean(data?.education?.length),
    Boolean(data?.experience?.length),
    Boolean(data?.projects?.length),
    Boolean(data?.skills?.length),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const resumeId = searchParams.get("resumeId");

  const [data, setData] = useState(() => createBlankResume());
  const [savedData, setSavedData] = useState(() => createBlankResume());
  const [showScorerModal, setShowScorerModal] = useState(false);
  const [scorerReports, setScorerReports] = useState([]);
  const [scorerLoading, setScorerLoading] = useState(false);
  const [scorerError, setScorerError] = useState("");
  const [showCreatedModal, setShowCreatedModal] = useState(false);
  const [createdResumeId, setCreatedResumeId] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(Boolean(resumeId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("basic");
  const [resumeTheme, setResumeTheme] = useState("light");
  const [showPreview, setShowPreview] = useState(false);
  const [activeSection, setActiveSection] = useState("Personal details");
  const [previewScale, setPreviewScale] = useState(0.3);

  const editorRef = useRef(null);
  const sectionTabsRef = useRef(null);
  const previewViewportRef = useRef(null);
  const previewRef = useRef(null);

  const completion = useMemo(() => getCompletion(data), [data]);
  const hasChanges = useMemo(
    () => JSON.stringify(data) !== JSON.stringify(savedData),
    [data, savedData],
  );
  const previewName = data?.profile?.name?.trim() || "Your resume";

  useEffect(() => {
    if (!resumeId) return undefined;
    let cancelled = false;
    const loadResume = async () => {
      try {
        const response = await getResumeById(resumeId);
        const result = unwrapResume(response);
        if (!result) throw new Error("The saved resume response was invalid.");
        if (cancelled) return;
        const normalized = normalizeResume(result);
        setData(normalized);
        setSavedData(clone(normalized));
        dispatch(setResume(result));
      } catch (err) {
        if (!cancelled)
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Could not load this saved resume.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadResume();
    return () => {
      cancelled = true;
    };
  }, [dispatch, resumeId]);

  useEffect(() => {
    const viewport = previewViewportRef.current;
    if (!viewport) return;

    const updateScale = () => {
      const width = viewport.clientWidth - 28;
      const height = viewport.clientHeight - 28;
      if (width <= 0 || height <= 0) return;
      setPreviewScale(Math.max(0.12, Math.min(width / 794, height / 1123, 1)));
    };

    const frameId = window.requestAnimationFrame(updateScale);
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [loading]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleChange = useCallback((nextData) => {
    setData(normalizeResume(nextData));
    setError("");
    setNotice("");
    setFieldErrors({});
  }, []);

  const handleSave = useCallback(async () => {
    if (saving) return;
    const validation = getValidationFieldErrors(data);
    if (Object.keys(validation).length) {
      setFieldErrors(validation);
      setError(
        "Please complete the required details before creating your resume.",
      );
      setNotice("");
      const first = Object.keys(validation)[0];
      const section =
        first === "summary"
          ? SECTIONS[1]
          : first === "education"
            ? SECTIONS[3]
            : first === "skills"
              ? SECTIONS[5]
              : first === "projectExperience" || first === "projectEntries"
                ? SECTIONS[4]
                : first === "experienceEntries"
                  ? SECTIONS[2]
                  : SECTIONS[0];
      window.requestAnimationFrame(() => {
        const root = editorRef.current;
        if (!root) return;
        const terms = section.terms;
        const target = [
          ...root.querySelectorAll("h1, h2, h3, h4, [role='heading']"),
        ].find((heading) =>
          terms.some((term) =>
            (heading.textContent || "").toLowerCase().includes(term),
          ),
        );
        if (target)
          target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    if (resumeId && !hasChanges) {
      setNotice("Everything is up to date.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setNotice("");
      setFieldErrors({});
      const response = resumeId
        ? await updateResume({ ...data, resumeId })
        : await createResume(data);
      const result = unwrapResume(response) || data;
      const normalized = normalizeResume(result);
      const savedId = String(
        result?._id || result?.id || response?.data?.data?._id || "",
      );
      setData(normalized);
      setSavedData(clone(normalized));
      dispatch(setResume(result));
      if (resumeId) {
        setNotice("Resume updated successfully.");
      } else {
        setCreatedResumeId(savedId);
        setShowCreatedModal(true);
      }
    } catch (err) {
      const serverErrors = err?.response?.data?.errors;
      setError(
        Array.isArray(serverErrors) && serverErrors.length
          ? serverErrors.join(" ")
          : err?.response?.data?.message ||
              err?.message ||
              "Resume could not be created. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }, [data, dispatch, hasChanges, resumeId, saving]);

  const openScorerModal = useCallback(async () => {
    setShowScorerModal(true);
    setScorerLoading(true);
    setScorerError("");
    try {
      const response = await getScoredResumes();
      const payload = response?.data ?? response;
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.resumes)
            ? payload.resumes
            : [];
      setScorerReports(
        rows.filter((item) => item?.processing?.status === "completed"),
      );
    } catch (err) {
      setScorerReports([]);
      setScorerError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load Scorer reports.",
      );
    } finally {
      setScorerLoading(false);
    }
  }, []);

  const importScorerReport = useCallback(
    async (reportId) => {
      if (!reportId) return;
      setScorerLoading(true);
      setScorerError("");
      try {
        const response = await getScoredResumeById(reportId);
        const report = unwrapResume(response);
        if (!report)
          throw new Error("This Scorer report has no importable resume data.");
        const imported = normalizeResume(report);
        setData(imported);
        setSavedData(createBlankResume());
        setSearchParams({}, { replace: true });
        setFieldErrors({});
        setError("");
        setNotice(
          "Scorer report imported. Review the details, then create your resume.",
        );
        setShowScorerModal(false);
        editorRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        setScorerError(
          err?.response?.data?.message ||
            err?.message ||
            "Could not import this Scorer report.",
        );
      } finally {
        setScorerLoading(false);
      }
    },
    [setSearchParams],
  );

  const viewCreatedResume = useCallback(() => {
    const id = createdResumeId;
    const blank = createBlankResume();
    setData(blank);
    setSavedData(clone(blank));
    setShowCreatedModal(false);
    setSearchParams({}, { replace: true });
    navigate(
      id
        ? `/builder/history?resumeId=${encodeURIComponent(id)}`
        : "/builder/history",
      { state: { resumeId: id } },
    );
  }, [createdResumeId, navigate, setSearchParams]);

  const jumpToSection = useCallback((section) => {
    setActiveSection(section.label);

    const root = editorRef.current;
    if (!root) return;

    const headings = [
      ...root.querySelectorAll("h1, h2, h3, h4, [role='heading']"),
    ];

    const target = headings.find((heading) => {
      const text = (heading.textContent || "").toLowerCase();
      return section.terms.some((term) => text.includes(term));
    });

    if (target) {
      const rootRect = root.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const scrollTop = root.scrollTop + targetRect.top - rootRect.top - 16;

      root.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: "smooth",
      });
    } else {
      root.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    const root = editorRef.current;
    if (!root || loading) return;

    const updateActiveSection = () => {
      const marker =
        root.getBoundingClientRect().top +
        (window.innerWidth < 1024 ? 140 : 90);
      const headings = [
        ...root.querySelectorAll("h1,h2,h3,h4,[role='heading']"),
      ];
      let current = headings[0];
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= marker) current = heading;
        else break;
      }
      const text = (current?.textContent || "").toLowerCase();
      const match = SECTIONS.find((section) =>
        section.terms.some((term) => text.includes(term)),
      );
      if (match) setActiveSection(match.label);
    };

    root.addEventListener("scroll", updateActiveSection, { passive: true });
    const frameId = window.requestAnimationFrame(updateActiveSection);
    return () => {
      window.cancelAnimationFrame(frameId);
      root.removeEventListener("scroll", updateActiveSection);
    };
  }, [loading]);

  useEffect(() => {
    const tabs = sectionTabsRef.current;
    if (!tabs) return;

    const activeTab = [...tabs.querySelectorAll("[data-section-tab]")].find(
      (tab) => tab.dataset.sectionTab === activeSection,
    );

    if (!activeTab) return;

    const targetLeft =
      activeTab.offsetLeft - (tabs.clientWidth - activeTab.offsetWidth) / 2;

    tabs.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: "smooth",
    });
  }, [activeSection]);

  const openPreview = () => setShowPreview(true);
  const closePreview = useCallback(() => setShowPreview(false), []);

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#17191C] text-white">
        <LoaderCircle className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  const renderTemplate = (theme = resumeTheme) => {
    if (selectedTemplate === "modern")
      return <ModernTemplate data={data} theme={theme} />;
    if (selectedTemplate === "professional")
      return <ProfessionalTemplate data={data} theme={theme} />;
    return <BasicTemplate data={data} theme={theme} />;
  };

  return (
    <div className="rio-resume-workspace relative h-[100dvh] w-full overflow-hidden bg-[#101113] text-white lg:flex lg:items-center lg:justify-center lg:p-5">
      <style>{`
        .rio-resume-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .rio-resume-scroll::-webkit-scrollbar { display: none; }
        .rio-resume-fieldset h1,
        .rio-resume-fieldset h2,
        .rio-resume-fieldset h3,
        .rio-resume-fieldset h4 { scroll-margin-top: 92px; }
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_48%_0%,rgba(255,255,255,0.055),transparent_38%),#101113]" />
      </div>

      <div className="relative z-10 grid h-full min-h-0 w-full grid-cols-1 overflow-hidden border-white/[.12] lg:h-[calc(100dvh-40px)] lg:max-h-[1000px] lg:max-w-[1820px] lg:grid-cols-[minmax(230px,24%)_minmax(0,1fr)_minmax(270px,25%)] lg:gap-3 lg:rounded-[30px] lg:border lg:border-white/[.09] lg:bg-[#111315]/85 lg:p-3 lg:shadow-[0_24px_80px_rgba(0,0,0,.30)]">
        {/* One left container: section navigation only. */}
        <aside className="hidden min-h-0 flex-col overflow-hidden border border-white/[.09] bg-[#111315]/90 px-3.5 py-4 shadow-[0_22px_60px_rgba(0,0,0,.18)] xl:px-4 lg:flex lg:rounded-[23px]">
          <div className="flex shrink-0 items-center gap-2.5 px-1 pb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/[.10] bg-white/[.045]">
              <FileText className="h-4 w-4 text-white/75" />
            </span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[.18em] text-white/35">
                RIO Resume
              </p>
              <h2 className="mt-1 text-xs font-semibold text-white/90">
                Resume sections
              </h2>
            </div>
          </div>
          <div className="mb-3 h-px shrink-0 bg-gradient-to-r from-white/20 via-white/[.10] to-transparent" />
          <nav className="flex min-h-0 flex-1 flex-col justify-between gap-1 py-1">
            {SECTIONS.map(({ label, hint, Icon, terms }) => (
              <button
                key={label}
                type="button"
                onClick={() => jumpToSection({ label, terms })}
                aria-current={activeSection === label ? "step" : undefined}
                className={`group flex min-h-[44px] w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition ${activeSection === label ? "border-white/[.13] bg-white/[.075] text-white" : "border-transparent text-white/60 hover:border-white/[.075] hover:bg-white/[.04]"}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activeSection === label ? "bg-white/[.10] text-white" : "text-white/40 group-hover:text-white"}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">
                    {label}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-white/30">
                    {hint}
                  </span>
                </span>
                <span className="text-[8px] tabular-nums text-white/25">
                  {String(
                    SECTIONS.findIndex((item) => item.label === label) + 1,
                  ).padStart(2, "0")}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Center: one continuous scroll area; the form itself owns its fields. */}
        <main className="relative flex min-h-0 min-w-0 flex-col overflow-hidden bg-[#111315]/25 lg:rounded-[23px] lg:border lg:border-white/[.08] lg:bg-transparent lg:shadow-none">
          <div className="sticky top-0 z-30 shrink-0 border-b border-white/[.08] bg-[#111319]/95 pt-1 backdrop-blur-2xl sm:px-6 lg:static lg:border-0 lg:bg-transparent lg:px-6 lg:rounded-[23px] lg:!bg-transparent">
            {/* Desktop header: keep the back link transparent so it doesn't cover the workspace border. */}
            <div className="hidden h-[68px] items-center justify-between border-b border-white/[.09] bg-transparent lg:flex lg:!bg-transparent">
              <button
                type="button"
                onClick={() => navigate("/builder/dashboard")}
                className="group inline-flex items-center gap-2.5 border-0 bg-transparent px-0 text-[13px] font-medium text-white/55 transition hover:text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[.09] bg-white/[.025] transition group-hover:border-white/[.10] group-hover:bg-white/[.06]">
                  <ArrowLeft className="h-4 w-4" />
                </span>
                <span>Back to Resume Dashboard</span>
              </button>

              <button
                type="button"
                onClick={openScorerModal}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/[.12] bg-white/[.045] px-4 text-xs font-semibold text-white/85 transition hover:bg-white/[.08]"
              >
                <FiPlus className="h-4 w-4" /> Add from Scorer
              </button>
            </div>

            {/* Mobile app bar: separate from the desktop header, following the RIO workspace pattern. */}
            <div className="flex h-16 shrink-0 items-center border-b border-white/[.07] bg-[#111214]/75 p-4 backdrop-blur-xl lg:hidden">
              <button
                type="button"
                onClick={() => navigate("/builder/dashboard")}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[.10] bg-white/[.045] p-0 text-[#D4D4D8] transition hover:bg-white/[.08]"
                aria-label="Back to Resume Dashboard"
                title="Back to Resume Dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="ml-3 min-w-0 border-l border-white/[.09] pl-3">
                <p className="truncate text-xs font-semibold text-white">
                  Resume Builder
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[.14em] text-[#858994]">
                  Build your professional resume
                </p>
              </div>
            </div>

            <nav
              ref={sectionTabsRef}
              className="rio-resume-scroll -mx-4 flex gap-1.5 overflow-x-auto px-4 py-2.5 lg:hidden sm:-mx-6 sm:px-6"
            >
              {SECTIONS.map(({ label, Icon, terms }) => (
                <button
                  key={label}
                  data-section-tab={label}
                  type="button"
                  onClick={() => jumpToSection({ label, terms })}
                  aria-current={activeSection === label ? "step" : undefined}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] transition ${activeSection === label ? "border-white bg-white text-[#17191c]" : "border-white/[.09] bg-white/[.025] text-white/60 hover:bg-white/[.07] hover:text-white"}`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div
            id="resume-form-scroll"
            ref={editorRef}
            className="rio-resume-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-24 pt-5 sm:px-6 lg:px-6 lg:pb-8 lg:pt-6"
          >
            {error && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2 rounded-lg border border-red-300/15 bg-red-300/[.06] p-3 text-xs text-red-100/90"
              >
                <X className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="flex-1">{error}</p>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {notice && (
              <div
                role="status"
                className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-300/15 bg-emerald-300/[.05] p-3 text-xs text-emerald-100/85"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {notice}
              </div>
            )}
            <div className="rio-resume-fieldset min-w-0">
              <ResumeForm
                data={data}
                onChange={handleChange}
                fieldErrors={fieldErrors}
              />
            </div>
          </div>
        </main>

        {/* Right: one panel, three internal regions. */}
        <aside className="hidden min-h-0 min-w-0 flex-col gap-3 lg:flex ">
          <div className=" rounded-[22px] border border-white/[.10] bg-white/[.025] px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.025)]">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="mt-1 text-[13px] font-semibold">
                  Template preview
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((template) => {
                const selected = selectedTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                    aria-pressed={selected}
                    className={`min-w-0 rounded-xl border px-1.5 py-3 text-center transition duration-200 ${selected ? "border-white/[.15] bg-white/[.065] shadow-[inset_0_1px_0_rgba(255,255,255,.06)]" : "border-white/[.075] bg-black/10 hover:border-white/[.16] hover:bg-white/[.035]"}`}
                  >
                    <span
                      className={`mx-auto mb-2.5 block h-[3px] w-8 rounded-full ${selected ? "bg-white/80" : "bg-white/20"}`}
                    />
                    <span
                      className={`block truncate text-[12px] font-semibold ${selected ? "text-white" : "text-white/50"}`}
                    >
                      {template.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[9px] text-white/30">
                      {template.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between px-1 pt-1">
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-white/35">
                Live document
              </p>
              <p className="mt-0.5 truncate text-[10px] font-medium text-white/65"></p>
            </div>
            <span className="truncate text-[10px] font-medium text-white/65">
              {" "}
              {previewName}
            </span>
          </div>

          <div
            ref={previewViewportRef}
            className="rio-resume-scroll relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[22px] border border-white/[.075] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.025),transparent_68%),#111315] px-2 py-4"
          >
            <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setResumeTheme((theme) =>
                    theme === "light" ? "dark" : "light",
                  )
                }
                aria-label={`Switch resume preview to ${
                  resumeTheme === "light" ? "dark" : "light"
                } theme`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#222529] text-white/80 hover:bg-[#30343a]"
              >
                {resumeTheme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
            </div>
            <div
              className={`shrink-0 overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,.58)] ring-1 ring-white/15 ${resumeTheme === "dark" ? "bg-[#17191c] text-[#e5e7eb]" : "bg-white text-black"}`}
              style={{
                width: 794,
                height: 1123,
                transform: `scale(${previewScale})`,
                transformOrigin: "center center",
              }}
            >
              {renderTemplate(resumeTheme)}
            </div>
          </div>

          <div className="shrink-0 rounded-[22px] border border-white/[.10] bg-white/[.025] px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.025)]">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] text-white/35">Resume readiness</span>
              <span className="text-[10px] font-semibold tabular-nums text-white/70">
                {completion}%
              </span>
            </div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/[.08]">
              <motion.div
                className="h-full rounded-full bg-white/75"
                animate={{ width: `${completion}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {/* Builder-owned actions: History + Preview row, then full-width Create/Update. */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigate("/builder/history")}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-white/[.11] bg-white/[.035] px-2 text-[10px] font-semibold text-white/70 transition hover:bg-white/[.075] hover:text-white"
              >
                <Clock3 className="h-3.5 w-3.5" /> History
              </button>
              <button
                type="button"
                onClick={openPreview}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-white/[.11] bg-white/[.035] px-2 text-[10px] font-semibold text-white/70 transition hover:bg-white/[.075] hover:text-white"
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
            </div>
            {!resumeId ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !hasResumeContent(data)}
                className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-white px-3 text-[11px] font-semibold text-[#17191C] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FilePlus2 className="h-3.5 w-3.5" />
                )}
                {saving ? "Creating…" : "Create Resume"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-white px-3 text-[11px] font-semibold text-[#17191C] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {saving ? "Updating…" : "Update Resume"}
              </button>
            )}
            {!resumeId && hasResumeContent(data) && (
              <button
                type="button"
                onClick={() => {
                  const blank = createBlankResume();
                  setData(blank);
                  setSavedData(clone(blank));
                  setFieldErrors({});
                  setError("");
                  setNotice("");
                  setCreatedResumeId("");
                  editorRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-full border border-white/[.11] bg-white/[.035] px-2 text-[10px] font-semibold text-white/70 transition hover:bg-white/[.075] hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Create New (clear form)
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile actions are kept outside the scrollable editor. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[.09] bg-[#111315]/90 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 shadow-none backdrop-blur-2xl lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => navigate("/builder/history")}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[.035] px-3 text-xs font-semibold text-white/75"
          >
            <Clock3 className="h-3.5 w-3.5" /> History
          </button>
          <button
            type="button"
            onClick={openPreview}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[.035] px-3 text-xs font-semibold text-white/75"
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
        </div>
        {!resumeId ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasResumeContent(data)}
            className="mx-auto mt-2 flex min-h-10 w-full max-w-xl items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#17191C] disabled:opacity-40"
          >
            {saving ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FilePlus2 className="h-3.5 w-3.5" />
            )}
            {saving ? "Creating…" : "Create Resume"}
          </button>
        ) : (
          hasChanges && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mx-auto mt-2 flex min-h-10 w-full max-w-xl items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#17191C] disabled:opacity-40"
            >
              {saving ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? "Updating…" : "Update Resume"}
            </button>
          )
        )}
        {!resumeId && hasResumeContent(data) && (
          <button
            type="button"
            onClick={() => {
              const blank = createBlankResume();
              setData(blank);
              setSavedData(clone(blank));
              setFieldErrors({});
              setError("");
              setNotice("");
              setCreatedResumeId("");
              editorRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="mx-auto mt-2 flex min-h-8 w-full max-w-xl items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[.035] px-3 text-[10px] font-semibold text-white/65"
          >
            <RefreshCw className="h-3 w-3" /> Create New (clear form)
          </button>
        )}
      </div>

      {showScorerModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !scorerLoading)
              setShowScorerModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="scorer-import-heading"
            className="flex max-h-[min(80vh,680px)] w-full max-w-md flex-col rounded-[18px] border border-white/[0.11] bg-[#17191c] p-6 shadow-[0_24px_80px_rgba(0,0,0,.4)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-[#17191C]">
                  <ListChecks size={16} />
                </div>
                <h2
                  id="scorer-import-heading"
                  className="mt-4 text-lg font-semibold tracking-[-.025em]"
                >
                  Add from Scorer
                </h2>
                <p className="mt-2 text-[12px] leading-6 text-[#858994]">
                  Choose a completed report to prefill the form. Review and edit
                  everything before creating a separate resume.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowScorerModal(false)}
                aria-label="Close Scorer reports"
                className="rounded-lg p-2 text-white/50 hover:bg-white/[.06] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="rio-resume-scroll mt-4 min-h-0 flex-1 overflow-y-auto rounded-xl border border-white/[.08]">
              {scorerLoading && (
                <p className="p-4 text-xs text-white/55">
                  Loading Scorer reports…
                </p>
              )}
              {!scorerLoading && scorerError && (
                <div className="p-4">
                  <p role="alert" className="text-xs text-red-200">
                    {scorerError}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowScorerModal(false);
                      navigate("/scorer");
                    }}
                    className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#17191C]"
                  >
                    Go to Scorer
                  </button>
                </div>
              )}
              {!scorerLoading && !scorerError && scorerReports.length === 0 && (
                <div className="p-4">
                  <p className="text-sm font-medium text-white/85">
                    No completed Scorer reports yet.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Run a resume analysis in Scorer first. Paid analysis remains
                    in the Scorer flow.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowScorerModal(false);
                      navigate("/scorer");
                    }}
                    className="mt-4 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#17191C]"
                  >
                    Go to Scorer
                  </button>
                </div>
              )}
              {!scorerLoading &&
                scorerReports.map((report) => {
                  const id = String(report?._id || report?.id || "");
                  const date = report?.updatedAt || report?.createdAt;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => importScorerReport(id)}
                      disabled={scorerLoading}
                      className="flex w-full items-center gap-3 border-b border-white/[.06] px-4 py-3.5 text-left transition last:border-b-0 hover:bg-white/[.045] disabled:opacity-50"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[.09] bg-white/[.04]">
                        <FileText size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-white/90">
                          {report?.profile?.name || "Untitled resume report"}
                        </span>
                        <span className="mt-1 block text-[11px] text-white/40">
                          {date
                            ? new Date(date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Date unavailable"}{" "}
                          · Completed analysis
                        </span>
                      </span>
                      <ArrowLeft className="h-4 w-4 rotate-180 text-white/35" />
                    </button>
                  );
                })}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowScorerModal(false)}
                className="rounded-xl border border-white/[.10] bg-white/[.035] px-4 py-2.5 text-xs font-semibold text-white/70"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreatedModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setShowCreatedModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="created-resume-heading"
            className="w-full max-w-md rounded-[18px] border border-white/[0.11] bg-[#17191c] p-6 shadow-[0_24px_80px_rgba(0,0,0,.4)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-[#17191C]">
                <CheckCircle2 size={17} />
              </div>
              <button
                type="button"
                onClick={() => setShowCreatedModal(false)}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-white/50 hover:bg-white/[.06] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <h2
              id="created-resume-heading"
              className="mt-4 text-lg font-semibold tracking-[-.025em]"
            >
              Your resume has been created!
            </h2>
            <p className="mt-2 text-[12px] leading-6 text-[#858994]">
              Your resume is saved. You can continue working on this form or
              view the saved report in Resume History.
            </p>
            <div className="mt-6 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowCreatedModal(false)}
                className="rounded-xl border border-white/[.10] bg-white/[.035] px-4 py-2.5 text-xs font-semibold text-white/75"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={viewCreatedResume}
                className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-xs font-semibold text-[#17191C]"
              >
                <Eye size={13} /> View Report
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showPreview && (
          <PreviewResume
            data={data}
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            onClose={closePreview}
            resumeTheme={resumeTheme}
            onThemeChange={setResumeTheme}
            resumeRef={previewRef}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
