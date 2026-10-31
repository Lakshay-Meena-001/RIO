import { Clock3, Eye, LoaderCircle, Pencil, Save, X } from "lucide-react";

export default function ResumeHistoryMobileActions({
  selectedId,
  editing,
  selectedResume,
  setPreviewOpen,
  setDeleteOpen,
  setMobileHistoryOpen,
  saveChanges,
  dirty,
  saving,
  startEdit,
  cancelEdit,
  loadingDetail,
}) {
  return (
    <>
      <div className="rio-history-mobile-bottom-bar rio-mobile-action-bar fixed inset-x-0 bottom-0 z-[60] border-t border-white/[0.08] bg-[#111315]/88 px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid w-full max-w-none grid-cols-2 gap-2 md:grid-cols-4">
          {selectedId ? (
            editing ? (
              <>
                <button
                  type="button"
                  onClick={() => setMobileHistoryOpen((open) => !open)}
                  className="order-1 inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-[#D4D4D8] transition-colors duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                >
                  <Clock3 size={14} />
                  <span>My Resumes</span>
                </button>
                <button
                  type="button"
                  onClick={saveChanges}
                  disabled={!selectedResume || !dirty || saving}
                  className="order-4 inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#17191C] transition-colors duration-200 hover:bg-[#E8E8EB] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-40"
                >
                  {saving ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>{saving ? "Saving…" : "Edit"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  disabled={!selectedResume}
                  className="order-2 hidden h-11 min-w-0 w-full items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.035] px-2 text-[10px] font-semibold text-[#D4D4D8] disabled:opacity-40 md:inline-flex rio-resume-tablet-only"
                >
                  <Eye size={13} /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  disabled={!selectedResume}
                  className="order-3 hidden h-11 min-w-0 w-full items-center justify-center gap-1 rounded-full border border-rose-300/20 bg-rose-300/[.07] px-2 text-[10px] font-semibold text-rose-200 disabled:opacity-40 md:inline-flex rio-resume-tablet-only"
                >
                  <X size={13} /> Delete
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setMobileHistoryOpen((open) => !open)}
                  className="order-1 inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-[#D4D4D8] transition-colors duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rio-mobile-action-button"
                >
                  <Clock3 size={14} />
                  <span>My Resumes</span>
                </button>

                <button
                  type="button"
                  onClick={() => (editing ? cancelEdit() : startEdit())}
                  disabled={!selectedResume || loadingDetail}
                  className="order-4 inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#17191C] transition-colors duration-200 hover:bg-[#E8E8EB] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  {editing ? (
                    <>
                      <X size={14} /> Cancel
                    </>
                  ) : (
                    <>
                      <Pencil size={14} /> Edit
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  disabled={!selectedResume}
                  className="order-2 hidden h-11 min-w-0 w-full items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.035] px-2 text-[10px] font-semibold text-[#D4D4D8] disabled:opacity-40 md:inline-flex rio-resume-tablet-only"
                >
                  <Eye size={13} /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  disabled={!selectedResume}
                  className="order-3 hidden h-11 min-w-0 w-full items-center justify-center gap-1 rounded-full border border-rose-300/20 bg-rose-300/[.07] px-2 text-[10px] font-semibold text-rose-200 disabled:opacity-40 md:inline-flex rio-resume-tablet-only"
                >
                  <X size={13} /> Delete
                </button>
              </>
            )
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMobileHistoryOpen((open) => !open)}
                className="order-1 inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-[#D4D4D8]"
              >
                <Clock3 size={14} />
                <span>My Resumes</span>
              </button>
              <button
                type="button"
                disabled
                className="order-4 inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#17191C] opacity-50 md:order-4"
              >
                <Pencil size={14} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                disabled
                className="order-2 hidden h-11 min-w-0 w-full items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.035] px-2 text-[10px] font-semibold text-[#D4D4D8] opacity-40 md:inline-flex rio-resume-tablet-only"
              >
                <Eye size={13} /> Preview
              </button>
              <button
                type="button"
                disabled
                className="order-3 hidden h-11 min-w-0 w-full items-center justify-center gap-1 rounded-full border border-rose-300/20 bg-rose-300/[.07] px-2 text-[10px] font-semibold text-rose-200 opacity-40 md:inline-flex rio-resume-tablet-only"
              >
                <X size={13} /> Delete
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
