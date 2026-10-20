import { useEffect } from "react";
import { FiX, FiCreditCard, FiShield, FiArrowRight } from "react-icons/fi";
import { motion, useReducedMotion } from "framer-motion";

export default function AddBalanceModal({
  onClose,
  onContinue,
  loading = false,
  error = "",
}) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, loading]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-balance-title"
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.22 }}
        className="relative my-auto w-full max-w-md overflow-hidden rounded-[26px] border border-white/[0.12] bg-[#111315] text-white shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 85% 55% at 100% 0%, rgba(255,255,255,0.075), transparent 70%)",
          }}
        />

        <div className="relative p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-white">
                <FiCreditCard size={20} />
              </span>

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#858994]">
                Account balance
              </p>

              <h2
                id="add-balance-title"
                className="mt-2 text-2xl font-semibold tracking-[-0.045em]"
              >
                Add balance.
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#92949B]">
                Top up your account securely to continue using your services.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Close add balance dialog"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#A1A1AA] transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <FiX size={17} />
            </button>
          </div>

          <div className="mt-7 rounded-2xl border border-white/[0.10] bg-white/[0.035] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  Starter top-up
                </p>
                <p className="mt-1 text-xs text-[#858994]">One-time payment</p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] text-[#B9BBC2]">
                Starter
              </span>
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#777B85]">
                  Pay
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">
                  ₹199
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#777B85]">
                  Balance credit
                </p>
                <p className="mt-1 text-lg font-semibold text-[#D4D4D8]">
                  300 units
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-4 py-3 text-xs leading-5 text-red-200"
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => onContinue("starter")}
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-[#17191C] transition hover:bg-[#E8E8EB] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#17191C]/25 border-t-[#17191C]" />
                Processing…
              </>
            ) : (
              <>
                <FiCreditCard size={16} />
                Continue to payment
                <FiArrowRight size={15} />
              </>
            )}
          </button>

          <p className="mt-4 flex items-center justify-center gap-2 text-[10px] leading-5 text-[#777B85]">
            <FiShield size={13} />
            Secure payment powered by Razorpay
          </p>
        </div>
      </motion.section>
    </div>
  );
}
