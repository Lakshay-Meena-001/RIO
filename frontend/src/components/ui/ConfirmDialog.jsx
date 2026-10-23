
import Modal from "./Modal.jsx";
import { FiLogOut, FiX } from "react-icons/fi";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}) {
  const isLogout =
    variant === "danger" ||
    /log out|logout/i.test(`${title} ${confirmLabel}`);

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={null}
      size="sm"
      closeOnBackdrop={!loading}
      className="!w-[calc(100%-32px)] !max-w-[360px] !rounded-[24px] !border !border-white/10 !bg-[#17191C] !p-0"
      footer={
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-11 flex-1 rounded-full border border-white/10 bg-white/[0.045] px-4 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08] disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`min-h-11 flex-1 rounded-full px-4 text-xs font-bold transition active:scale-[0.99] disabled:opacity-50 ${
              isLogout
                ? "bg-[#C94D55] text-white hover:bg-[#D95760]"
                : "bg-white text-[#17191C] hover:bg-[#F5F5F5]"
            }`}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-white/75">
            <FiLogOut size={17} />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-[17px] font-semibold tracking-tight text-white">
              {title}
            </h2>

            {description && (
              <p className="mt-1.5 text-xs leading-5 text-white/55">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/45 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-40"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
