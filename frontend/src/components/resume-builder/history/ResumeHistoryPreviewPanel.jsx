import { Eye, LoaderCircle, Save, Trash2 } from "lucide-react";

export default function ResumeHistoryPreviewPanel({
  TEMPLATES, template, setTemplate, selectedResume, draft, resumeTheme, resumePrintRef, TemplateComponent, setPreviewOpen, saveChanges, selectedId, dirty, saving, deleting, setDeleteOpen
}) {
  return (
        <aside className="absolute inset-y-4 right-4 z-30 hidden w-[min(282px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[18px] border border-white/[0.11] bg-[#111315]/90 shadow-[0_22px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl lg:inset-y-5 lg:right-5 lg:flex">
          <div className="shrink-0 border-b border-white/[0.065] bg-white/[0.012] px-4 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#6B6D73]">
                  Your document
                </p>
                <h2 className="mt-2 text-[17px] font-semibold tracking-[-0.035em] text-white">
                  Template preview
                </h2>
                <p className="mt-1.5 text-[10px] leading-5 text-[#70727A]">
                  Choose a style and review the A4 resume.
                </p>
              </div>
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white/80" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-1.5">
              {Object.entries(TEMPLATES).map(([id, item]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTemplate(id)}
                  className={`rounded-xl border px-1 py-2 text-[9px] font-semibold transition ${template === id ? "border-white/20 bg-white/[0.09] text-white" : "border-white/[0.07] bg-white/[0.02] text-[#6B6D73] hover:bg-white/[0.05] hover:text-white"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="rio-history-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <p className="mb-3 flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.16em] text-[#52545B]">
              <span>Live document</span>
              <span className="normal-case tracking-normal text-[#858994]">
                {selectedResume ? "A4 · Portrait" : "No selection"}
              </span>
            </p>
            {selectedResume && draft ? (
              <div className="mx-auto w-full max-w-[210px]">
                <div
                  className="relative mx-auto overflow-hidden bg-white shadow-[0_16px_40px_rgba(0,0,0,.32)]"
                  style={{
                    aspectRatio: "210 / 297",
                    background: resumeTheme === "dark" ? "#17191c" : "#ffffff",
                  }}
                >
                  <div
                    className="absolute left-0 top-0 origin-top-left"
                    style={{
                      width: "794px",
                      minHeight: "1123px",
                      transform: "scale(0.2645)",
                      transformOrigin: "top left",
                    }}
                  >
                    <div
                      ref={resumePrintRef}
                      className={`resume-page ${resumeTheme === "dark" ? "resume-theme-dark" : ""}`}
                      style={{
                        width: "210mm",
                        minHeight: "297mm",
                        background:
                          resumeTheme === "dark" ? "#17191c" : "#ffffff",
                        color: resumeTheme === "dark" ? "#e5e7eb" : "#111111",
                        overflow: "hidden",
                      }}
                    >
                      <TemplateComponent data={data} theme={resumeTheme} />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-center text-[9px] leading-4 text-[#55575E]">
                  {TEMPLATES[template]?.label || "Basic"} template · Live
                  preview
                </p>
              </div>
            ) : (
              <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[#66686F]">
                  <Eye size={15} />
                </div>
                <p className="mt-3 text-[11px] font-medium text-[#B8BAC1]">
                  No resume selected
                </p>
                <p className="mt-1 max-w-[175px] text-[10px] leading-5 text-[#66686F]">
                  Choose one from history to preview its document.
                </p>
              </div>
            )}
          </div>
          <div className="shrink-0 border-t border-white/[0.065] bg-white/[0.012] p-3.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                disabled={!selectedResume}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.035] px-2 py-2.5 text-[10px] font-semibold text-[#D4D4D8] transition hover:bg-white/[0.075] disabled:opacity-40"
              >
                <Eye size={12} /> Preview
              </button>
              <button
                type="button"
                onClick={saveChanges}
                disabled={!selectedResume || !dirty || saving}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-white px-2 py-2.5 text-[10px] font-semibold text-[#17191C] shadow-[0_10px_30px_rgba(255,255,255,0.06)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? (
                  <LoaderCircle size={12} className="animate-spin" />
                ) : (
                  <Save size={12} />
                )}{" "}
                Update
              </button>
            </div>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={!selectedResume || deleting}
              className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-white  px-3 py-2.5 text-[10px] font-semibold text-[#17191C] transition   disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={12} /> Delete resume
            </button>
            <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
              <span className="text-[9px] text-[#52545B]">
                {dirty ? "Unsaved changes" : "All changes saved"}
              </span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${dirty ? "bg-amber-200/80" : "bg-white/30"}`}
              />
            </div>
          </div>
        </aside>
  );
}
