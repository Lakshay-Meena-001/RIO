import { ArrowLeft, FileText, Trash2, X } from "lucide-react";
import ResumeHistoryDetailContent from "../details/ResumeHistoryDetailContent";

export default function ResumeHistoryWorkspace({
  navigate, displayName, setDeleteOpen, deleting, error, notice, setError, setNotice, selectedId, loadingDetail, selectedResume, editing, cancelEdit, startEdit, data, setDraft, normalize, dirty, detailSections, profile
}) {
  return (
        <main className="min-w-0 flex-1 overflow-hidden pb-[env(safe-area-inset-bottom)] lg:pl-[302px] lg:pr-[302px]">
          <div className="flex h-full min-h-0 flex-col">
            <div className="mx-6 mt-6 hidden border-b border-white/[0.08] pb-5 lg:block">
              <button
                type="button"
                onClick={() => navigate("/builder/dashboard")}
                className="group inline-flex items-center gap-2 text-xs font-medium text-[#71717A] transition-colors duration-200 hover:text-white"
              >
                <ArrowLeft
                  size={14}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
                Back to Resume Dashboard
              </button>
            </div>
            <div className="rio-history-mobile-header flex h-16 shrink-0 items-center border-b border-white/[0.07] bg-[#111214]/75 px-4 backdrop-blur-xl lg:hidden">
              <button
                type="button"
                onClick={() => navigate("/builder/dashboard")}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] text-[#D4D4D8] transition hover:bg-white/[0.08]"
                aria-label="Back to resume dashboard"
              >
                <ArrowLeft size={15} />
              </button>
              <div className="ml-3 min-w-0 border-l border-white/[0.09] pl-3">
                <p className="truncate text-[14px] font-semibold text-white">
                  {displayName}
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-[#858994]">
                  Resume detail workspace
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={deleting}
                className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] text-white transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
            <div className="rio-history-scroll rio-mobile-content min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-6 sm:px-7 sm:py-8 lg:px-9 lg:py-9">
              {(error || notice) && (
                <div
                  role={error ? "alert" : "status"}
                  className={`mx-1 mb-5 flex items-start justify-between gap-3 rounded-2xl border p-4 text-xs leading-5 ${error ? "border-rose-300/15 bg-rose-300/[0.055] text-rose-100/90" : "border-emerald-300/15 bg-emerald-300/[0.055] text-emerald-100/90"}`}
                >
                  <span>{error || notice}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setNotice("");
                    }}
                    aria-label="Dismiss message"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
              {!selectedId ? (
                <section className="flex min-h-[calc(100dvh-13rem)] items-center justify-center px-5 py-10 text-center lg:min-h-[60vh]">
                  <div className="mx-auto flex w-full max-w-xl flex-col items-center">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.035] text-[#D4D4D8] shadow-[0_10px_32px_rgba(0,0,0,.16)]">
                      <FileText size={19} />
                    </div>
                    <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#858994]">
                      Your career workspace
                    </p>
                    <h2 className="max-w-sm text-[25px] font-semibold leading-[1.15] tracking-[-0.045em] text-[#F4F4F5] sm:text-3xl">
                      Your experience, beautifully presented.
                    </h2>
                    <p className="mt-4 max-w-[19rem] text-[13px] leading-6 text-[#A1A1AA] sm:max-w-md sm:text-[15px]">
                      Choose a resume from your history to review every section,
                      edit details and preview the final document.
                    </p>
                  </div>
                </section>
              ) : loadingDetail && !selectedResume ? (
                <div className="mx-auto max-w-3xl px-6 py-16">
                  <div className="h-7 w-48 animate-pulse rounded bg-white/[0.06]" />
                  <div className="mt-5 h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
                  <div className="mt-3 h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
                </div>
              ) : (
                <>
                  <ResumeHistoryDetailContent
                    editing={editing}
                    displayName={displayName}
                    profile={profile}
                    cancelEdit={cancelEdit}
                    startEdit={startEdit}
                    data={data}
                    setDraft={setDraft}
                    normalize={normalize}
                    dirty={dirty}
                    navigate={navigate}
                    detailSections={detailSections}
                  />
                </>
              )}
            </div>
          </div>
        </main>
  );
}
