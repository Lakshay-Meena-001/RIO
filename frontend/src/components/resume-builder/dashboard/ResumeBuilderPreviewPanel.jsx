import { motion } from "motion/react";
import { Clock3, Eye, FilePlus2, LoaderCircle, Moon, RefreshCw, Save, Sun } from "lucide-react";

export default function ResumeBuilderPreviewPanel(props) {
  const {
    TEMPLATES, selectedTemplate, setSelectedTemplate, previewName, previewViewportRef,
    setResumeTheme, resumeTheme, previewScale, renderTemplate, completion, navigate, openPreview,
    resumeId, handleSave, saving, hasResumeContent, data, hasChanges, setData, createBlankResume,
    setSavedData, clone, setFieldErrors, setError, setNotice, setCreatedResumeId, editorRef,
  } = props;
  return (
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
  );
}
