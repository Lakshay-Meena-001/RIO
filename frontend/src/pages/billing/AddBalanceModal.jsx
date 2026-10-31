import { useEffect, useState } from "react";
import { FiArrowRight, FiCreditCard, FiShield, FiX } from "react-icons/fi";
import { motion, useReducedMotion } from "framer-motion";

const PRESET_AMOUNTS = [100, 200, 300, 400, 500, 1000];

export default function AddBalanceModal({
  onClose,
  onContinue,
  currentBalance = null,
  loading = false,
  error = "",
}) {
  const [amount, setAmount] = useState("500");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, loading]);

  const numericAmount = Number(amount);
  const validAmount =
    /^\d+$/.test(amount) &&
    Number.isSafeInteger(numericAmount) &&
    numericAmount >= 100 &&
    numericAmount <= 50000;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden overscroll-none bg-[#090b0d]/85 p-3 backdrop-blur-md sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <div className="flex max-h-full min-h-0 w-full items-center justify-center">
        <motion.section
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-balance-title"
          initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.99 }}
          transition={{ duration: 0.18 }}
          className="relative max-h-full w-full max-w-[860px] overflow-y-auto overscroll-contain rounded-[24px] border border-white/15 bg-[#17191C] text-white shadow-[0_30px_100px_rgba(0,0,0,0.58)] sm:rounded-[28px]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_0%_0%,rgba(255,255,255,0.07),transparent_70%)]" />

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close add balance dialog"
            className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/60 transition hover:bg-white/[0.12] hover:text-white disabled:opacity-40 sm:right-5 sm:top-5"
          >
            <FiX size={17} />
          </button>

          <div className="relative grid md:min-h-[430px] md:grid-cols-[0.85fr_1.15fr]">
            <aside className="relative hidden flex-col justify-between border-r border-white/10 bg-white/[0.025] p-8 md:flex lg:p-10">
              <div>
                <p
                  className="text-base font-bold  tracking-[0.22em] text-white"
                  style={{
                    fontFamily: '"Zen Dots", sans-serif',
                  }}
                >
                  RIO
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-white/35">
                  Career Intelligence
                </p>
              </div>

              <div className="my-10 max-w-[290px]">
                <div className="mb-5 h-1 w-12 rounded-full bg-white" />
                <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.045em]">
                  Add balance,
                  <span className="mt-2 block font-serif font-normal italic text-white/65">
                    keep moving.
                  </span>
                </h2>
                <p className="mt-5 text-sm leading-6 text-white/45">
                  Top up your RIO balance securely and continue using your
                  services without interruption.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-white/40">
                <FiShield size={14} />
                Secure payment powered by Razorpay
              </div>
            </aside>

            <div className="min-w-0 p-4 pt-16 sm:p-6 sm:pt-16 md:p-8 md:pt-10 lg:p-10 lg:pt-10">
              <div className="mb-6 md:mb-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  Account balance
                </p>
                <h3
                  id="add-balance-title"
                  className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
                >
                  Add Balance
                </h3>
                <p className="mt-2 max-w-md text-sm leading-5 text-white/45">
                  Select amount or enter a custom value.
                </p>
              </div>

              <div className="mb-6 flex items-center justify-between gap-4 border-y border-white/10 py-4">
                <div>
                  <p className="text-xs text-white/45">Current balance</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">
                    {currentBalance == null
                      ? "—"
                      : Number(currentBalance).toLocaleString("en-IN")}
                    <span className="ml-2 text-xs font-normal text-white/40">
                      INR
                    </span>
                  </p>
                </div>
                <span className="rounded-full border border-emerald-300/20 px-3 py-1.5 text-[10px] font-medium text-emerald-200/90">
                  Secured
                </span>
              </div>

              <p className="text-xs font-medium text-white/65">
                Select amount <span className="text-white/35">(INR)</span>
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
                {PRESET_AMOUNTS.map((value) => {
                  const selected = amount === String(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={loading}
                      onClick={() => setAmount(String(value))}
                      aria-pressed={selected}
                      className={`min-h-10 rounded-full border px-2 py-2.5 text-sm font-semibold transition ${
                        selected
                          ? "border-white bg-white text-[#17191C]"
                          : "border-white/10 bg-white/[0.025] text-white/75 hover:border-white/25 hover:bg-white/[0.06]"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      ₹{value.toLocaleString("en-IN")}
                    </button>
                  );
                })}
              </div>

              <label
                htmlFor="custom-topup-amount"
                className="mt-5 block text-xs font-medium text-white/65"
              >
                Custom amount
              </label>
              <div className="mt-2 flex items-center rounded-full border border-white/15 bg-black/20 px-4 transition focus-within:border-white/35">
                <span className="mr-3 text-lg text-white/40">₹</span>
                <input
                  id="custom-topup-amount"
                  type="number"
                  min="100"
                  max="50000"
                  step="1"
                  inputMode="numeric"
                  value={amount}
                  disabled={loading}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="100–50,000"
                  className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/25 disabled:opacity-50"
                />
              </div>
              <p className="mt-2 text-[10px] leading-4 text-white/35">
                Minimum ₹100 · Maximum ₹50,000 · Whole rupees only
              </p>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-3 py-2.5 text-xs leading-5 text-red-200"
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={() => onContinue(numericAmount)}
                disabled={loading || !validAmount}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#17191C] transition hover:bg-[#E8E8EB] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#17191C]/25 border-t-[#17191C]" />
                    Processing…
                  </>
                ) : (
                  <>
                    <FiCreditCard size={16} />
                    Pay ₹
                    {Number.isFinite(numericAmount)
                      ? numericAmount.toLocaleString("en-IN")
                      : "0"}
                    <FiArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="mt-3 flex items-center justify-center gap-2 text-[10px] text-white/35 md:hidden">
                <FiShield size={13} /> Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
