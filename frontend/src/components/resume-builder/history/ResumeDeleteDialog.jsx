import { LoaderCircle, Trash2 } from "lucide-react";

export default function ResumeDeleteDialog({ open, displayName, deleting, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="delete-resume-heading" className="w-full max-w-md rounded-[18px] border border-white/[0.11] bg-[#17191c] p-6 shadow-[0_24px_80px_rgba(0,0,0,.4)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-[#17191C]"><Trash2 size={16} /></div>
        <h2 id="delete-resume-heading" className="mt-4 text-lg font-semibold tracking-[-.025em]">Delete this resume?</h2>
        <p className="mt-2 text-[12px] leading-6 text-[#858994]">“{displayName}” will be permanently deleted from your account. This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={deleting} className="rounded-xl border border-white/[.10] bg-white/[.035] px-4 py-2.5 text-xs font-semibold text-white/70">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={deleting} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-xs font-semibold text-[#17191C]">
            {deleting ? <LoaderCircle size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete resume
          </button>
        </div>
      </div>
    </div>
  );
}
