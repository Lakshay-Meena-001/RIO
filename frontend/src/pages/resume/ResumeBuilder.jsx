import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  LoaderCircle,
  Save,
  FilePlus2,
  ListChecks,
  X,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import ResumeForm from "./ResumeForm";
import "./resume-builder.css";
import PreviewResume from "../../components/resume/PreviewResume";
import BasicTemplate from "../../components/resume/templates/BasicTemplate";
import ModernTemplate from "../../components/resume/templates/ModernTemplate";
import ProfessionalTemplate from "../../components/resume/templates/ProfessionalTemplate";
import {
  createResume,
  getResumeById,
  getScoredResumeById,
  getScoredResumes,
  updateResume,
} from "../../api/resume/resume.api";
import { setResume } from "../../redux/resumeSlice";
import { FiPlus } from "react-icons/fi";
import ResumeBuilderPreviewPanel from "../../components/resume-builder/dashboard/ResumeBuilderPreviewPanel";
import {
  TEMPLATES,
  SECTIONS,
  clone,
  createBlankResume,
  normalizeResume,
  unwrapResume,
  hasResumeContent,
  getValidationFieldErrors,
  getCompletion,
} from "../../components/resume-builder/shared/resumeBuilderUtils";

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

  const previewPanelProps = {
    TEMPLATES,
    selectedTemplate,
    setSelectedTemplate,
    previewName,
    previewViewportRef,
    setResumeTheme,
    resumeTheme,
    previewScale,
    renderTemplate,
    completion,
    navigate,
    openPreview,
    resumeId,
    handleSave,
    saving,
    hasResumeContent,
    data,
    hasChanges,
    setData,
    createBlankResume,
    setSavedData,
    clone,
    setFieldErrors,
    setError,
    setNotice,
    setCreatedResumeId,
    editorRef,
  };

  return (
    <div className="rio-resume-workspace relative h-[100dvh] w-full overflow-hidden bg-[#101113] text-white lg:flex lg:p-0">
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

      <div className="relative z-10 grid h-full min-h-0 w-full grid-cols-1 overflow-hidden border-white/[.12] lg:h-full lg:max-h-none lg:max-w-none lg:grid-cols-[minmax(220px,22%)_minmax(0,1fr)_minmax(260px,25%)] lg:gap-3 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-3 lg:shadow-none">
        {/* One left container: section navigation only. */}
        <aside className="hidden h-full min-h-0 flex-col overflow-hidden border border-white/[.09] bg-[#111315]/90 px-2.5 py-3 shadow-[0_22px_60px_rgba(0,0,0,.18)] lg:flex lg:rounded-[23px] xl:px-3.5 xl:py-4">
          <div className="flex shrink-0 items-center gap-2 px-1 pb-3">
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
          <div className="mb-2 h-px shrink-0 bg-gradient-to-r from-white/20 via-white/[.10] to-transparent" />
          <nav className="flex min-h-0 flex-1 flex-col justify-evenly gap-1 overflow-hidden py-1">
            {SECTIONS.map(({ label, hint, Icon, terms }) => (
              <button
                key={label}
                type="button"
                onClick={() => jumpToSection({ label, terms })}
                aria-current={activeSection === label ? "step" : undefined}
                className={`group flex min-h-0 flex-1 w-full items-center gap-2 rounded-xl border px-2 py-1 text-left transition ${activeSection === label ? "border-white/[.13] bg-white/[.075] text-white" : "border-transparent text-white/60 hover:border-white/[.075] hover:bg-white/[.04]"}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activeSection === label ? "bg-white/[.10] text-white" : "text-white/40 group-hover:text-white"}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[clamp(10px,0.9vw,14px)] font-semibold">
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
        <ResumeBuilderPreviewPanel {...previewPanelProps} />
      </div>

      {/* Mobile actions are kept outside the scrollable editor. */}
      <div className="rio-mobile-action-bar fixed inset-x-0 bottom-0 z-40 border-t border-white/[.09] bg-[#111315]/90 px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid w-full max-w-xl grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => navigate("/builder/history")}
            className="inline-flex min-w-0 w-full items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[.035] px-2 text-[10px] font-semibold text-white/75"
          >
            <Clock3 className="h-3.5 w-3.5 shrink-0" /> History
          </button>
          <button
            type="button"
            onClick={openPreview}
            className="inline-flex min-w-0 w-full items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[.035] px-2 text-[10px] font-semibold text-white/75"
          >
            <Eye className="h-3.5 w-3.5 shrink-0" /> Preview
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || (resumeId ? !hasChanges : !hasResumeContent(data))}
            className="inline-flex min-w-0 w-full items-center justify-center gap-1.5 rounded-full bg-white px-2 text-[10px] font-semibold text-[#17191C] disabled:opacity-40"
          >
            {saving ? (
              <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin" />
            ) : resumeId ? (
              <Save className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <FilePlus2 className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="truncate">{saving ? "Saving…" : resumeId ? "Update" : "Create"}</span>
          </button>
        </div>
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
