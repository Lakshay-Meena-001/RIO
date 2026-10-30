import { Clock3, Eye, LoaderCircle, Pencil, Plus, Save, X } from "lucide-react";

export default function ResumeHistoryMobileActions({
  selectedId, editing, selectedResume, mobileHistoryOpen, setPreviewOpen, setMobileHistoryOpen, saveChanges, dirty, saving, startEdit, cancelEdit, loadingDetail, navigate
}) {
  return (
    <>
      {!editing && selectedResume && !mobileHistoryOpen && (
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          aria-label="Preview resume"
          className="fixed bottom-[calc(104px+env(safe-area-inset-bottom))] right-5 z-[55] grid h-12 w-12 place-items-center rounded-full border border-white/[.16] bg-white text-[#17191C] shadow-[0_10px_32px_rgba(0,0,0,.38)] transition active:scale-95 lg:hidden"
        >
          <Eye size={19} />
        </button>
      )}
      <div className="rio-history-mobile-bottom-bar rio-mobile-action-bar fixed inset-x-0 bottom-0 z-[60] border-t border-white/[0.08] bg-[#111315]/88 px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          {selectedId ? (
            editing ? (
              <>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  disabled={!selectedResume}
                  className="inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-[#D4D4D8] transition-colors duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-40"
                >
                  <Eye size={14} />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={saveChanges}
                  disabled={!selectedResume || !dirty || saving}
                  className="inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#17191C] transition-colors duration-200 hover:bg-[#E8E8EB] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-40"
                >
                  {saving ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Update</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setMobileHistoryOpen((open) => !open)}
                  className="inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-[#D4D4D8] transition-colors duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rio-mobile-action-button"
                >
                  <Clock3 size={14} />
                  <span>My Resumes</span>
                </button>

                <button
                  type="button"
                  onClick={() => (editing ? cancelEdit() : startEdit())}
                  disabled={!selectedResume || loadingDetail}
                  className="inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#17191C] transition-colors duration-200 hover:bg-[#E8E8EB] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
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
              </>
            )
          ) : (
            <button
              type="button"
              onClick={() => navigate("/builder")}
              className="inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#17191C] transition-colors duration-200 hover:bg-[#E8E8EB] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <Plus size={14} />
              <span>Create resume</span>
            </button>
          )}
        </div>
      </div>

    </>
  );
}
