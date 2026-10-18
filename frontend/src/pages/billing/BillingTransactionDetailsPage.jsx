import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiRefreshCw,
  FiAlertCircle,
  FiTrendingDown,
  FiZap,
} from "react-icons/fi";
import {
  getBillingSummary,
  getBillingTransactionById,
} from "../../api/billing.api";

const cx = (...values) => values.filter(Boolean).join(" ");
const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? response ?? {};
const SUCCESS = new Set([
  "paid",
  "completed",
  "captured",
  "success",
  "succeeded",
]);
const PENDING = new Set(["pending", "created", "processing", "authorized"]);

const titleCase = (value = "") =>
  String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const formatInr = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return (amount / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

const formatCount = (value) => {
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : "Not available";
};

const firstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

function Surface({ children, className = "" }) {
  return (
    <section
      className={cx(
        "relative overflow-hidden rounded-[22px] border border-white/[0.10] bg-[#111315]",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 85% at 100% 0%, rgba(255,255,255,0.055), transparent 68%), linear-gradient(135deg, rgba(255,255,255,0.02), transparent 48%)",
        }}
      />
      <div className="relative">{children}</div>
    </section>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "unknown").toLowerCase();
  const success = SUCCESS.has(normalized);
  const pending = PENDING.has(normalized);
  return (
    <span
      className={cx(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
        success
          ? "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-200"
          : pending
            ? "border-amber-200/15 bg-amber-200/[0.05] text-amber-100"
            : "border-white/[0.09] bg-white/[0.035] text-[#A1A1AA]",
      )}
    >
      {success ? <FiCheckCircle size={12} /> : <FiClock size={12} />}
      {titleCase(normalized)}
    </span>
  );
}

function DetailRow({ label, value, mono = false, valueClassName = "" }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-3 last:border-0">
      <span className="shrink-0 text-[11px] text-[#777B85]">{label}</span>
      <span
        className={cx(
          "min-w-0 break-all text-right text-[11px] text-[#D4D4D8]",
          mono && "font-mono",
          valueClassName,
        )}
      >
        {value ?? "Not available"}
      </span>
    </div>
  );
}

export default function BillingTransactionDetailsPage() {
  const { transactionId = "" } = useParams();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [transaction, setTransaction] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDetails = useCallback(async () => {
    if (!transactionId) {
      setError("Transaction ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    const [transactionResult, summaryResult] = await Promise.allSettled([
      getBillingTransactionById(transactionId),
      getBillingSummary(),
    ]);

    if (transactionResult.status === "fulfilled") {
      const payload = unwrap(transactionResult.value);
      setTransaction(payload?.transaction ?? payload);
    } else {
      setError(
        transactionResult.reason?.response?.data?.message ||
          "We couldn't load this transaction. Please refresh and try again.",
      );
      setTransaction(null);
    }

    if (summaryResult.status === "fulfilled") {
      setSummary(unwrap(summaryResult.value));
    }
    setLoading(false);
  }, [transactionId]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!transactionId) {
        setError("Transaction ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      const [transactionResult, summaryResult] = await Promise.allSettled([
        getBillingTransactionById(transactionId),
        getBillingSummary(),
      ]);
      if (cancelled) return;
      if (transactionResult.status === "fulfilled") {
        const payload = unwrap(transactionResult.value);
        setTransaction(payload?.transaction ?? payload);
      } else {
        setError(
          transactionResult.reason?.response?.data?.message ||
            "We couldn't load this transaction. Please refresh and try again.",
        );
        setTransaction(null);
      }
      if (summaryResult.status === "fulfilled")
        setSummary(unwrap(summaryResult.value));
      setLoading(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  const status = String(
    transaction?.status ??
      transaction?.paymentStatus ??
      transaction?.state ??
      "unknown",
  ).toLowerCase();
  const amount = firstDefined(
    transaction?.amount,
    transaction?.amountInPaise,
    transaction?.paymentAmount,
  );
  const balanceBefore = firstDefined(
    transaction?.balanceBefore,
    transaction?.balanceBeforeTransaction,
    transaction?.previousBalance,
    transaction?.metadata?.balanceBefore,
  );
  const balanceAfter = firstDefined(
    transaction?.balanceAfter,
    transaction?.balanceAfterTransaction,
    transaction?.newBalance,
    transaction?.metadata?.balanceAfter,
  );
  const serviceName = firstDefined(
    transaction?.serviceName,
    transaction?.service,
    transaction?.featureName,
    transaction?.usage?.service,
    transaction?.metadata?.serviceName,
  );
  const serviceUsage = firstDefined(
    transaction?.creditsUsed,
    transaction?.creditsDeducted,
    transaction?.balanceDeducted,
    transaction?.usage?.credits,
    transaction?.metadata?.creditsUsed,
  );
  const transactionType = String(
    firstDefined(
      transaction?.type,
      transaction?.transactionType,
      transaction?.kind,
      transaction?.category,
      "",
    ),
  ).toLowerCase();
  const inferredDeduction =
    balanceBefore != null &&
    balanceAfter != null &&
    Number(balanceBefore) > Number(balanceAfter)
      ? Number(balanceBefore) - Number(balanceAfter)
      : null;
  const usageAmount = serviceUsage != null ? serviceUsage : inferredDeduction;
  const isDebit =
    /debit|deduct|usage|consume|service/.test(transactionType) ||
    Number(serviceUsage) > 0 ||
    inferredDeduction != null;
  const currentBalance = firstDefined(
    summary?.currentBalance,
    summary?.accountBalance,
    summary?.balance,
  );
  const lowBalance =
    currentBalance != null &&
    Number.isFinite(Number(currentBalance)) &&
    Number(currentBalance) <= 50;
  const transactionReference = firstDefined(
    transaction?.transactionId,
    transaction?._id,
    transaction?.id,
    transactionId,
  );
  const orderId = firstDefined(
    transaction?.razorpayOrderId,
    transaction?.orderId,
  );
  const paymentId = firstDefined(
    transaction?.razorpayPaymentId,
    transaction?.paymentId,
  );
  const description = firstDefined(
    transaction?.description,
    transaction?.planName,
    serviceName,
    isDebit ? "Service usage" : "Balance purchase",
  );
  const extraMetadata = useMemo(() => {
    const metadata = transaction?.metadata;
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata))
      return [];
    const ignored = new Set([
      "balanceBefore",
      "balanceAfter",
      "serviceName",
      "creditsUsed",
    ]);
    return Object.entries(metadata).filter(
      ([key, value]) =>
        !ignored.has(key) && value != null && typeof value !== "object",
    );
  }, [transaction]);

  return (
    <div className="relative min-h-[100dvh] bg-[#17191C] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 88% 4%, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.02) 42%, transparent 72%), linear-gradient(135deg, #191b1e 0%, #17191c 48%, #141619 100%)",
        }}
      />

      <main className="relative z-10 mx-auto min-h-[100dvh] w-full max-w-[1440px] px-4 pb-10 pt-5 sm:px-7 lg:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/billing/history")}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#858994] transition hover:text-white"
          >
            <FiArrowLeft size={14} /> Back to history
          </button>
          <button
            type="button"
            onClick={() => navigate("/billing?addBalance=1")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#17191C] transition hover:bg-[#E8E8EB]"
          >
            <FiCreditCard size={14} /> Add Balance
          </button>
        </header>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div className="mb-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#777B85]">
              Billing & account
            </p>
            <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.05em] sm:text-[40px]">
              Transaction details<span className="text-[#858994]">.</span>
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-6 text-[#858994] sm:text-sm">
              Inspect the payment, balance change, and service usage recorded
              for this transaction.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-2xl border border-red-300/15 bg-red-300/[0.04] p-4 text-xs leading-5 text-[#D4D4D8]"
            >
              <FiAlertCircle
                className="mt-0.5 shrink-0 text-red-300"
                size={15}
              />
              <span className="min-w-0 flex-1">{error}</span>
              <button
                type="button"
                onClick={() => void loadDetails()}
                className="underline underline-offset-4"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <Surface className="flex min-h-[300px] items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-white/80" />
                <p className="text-xs text-[#858994]">
                  Loading transaction details…
                </p>
              </div>
            </Surface>
          ) : transaction ? (
            <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-5">
                <Surface className="p-5 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-[#D4D4D8]">
                        {isDebit ? (
                          <FiTrendingDown size={18} />
                        ) : (
                          <FiCreditCard size={18} />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#777B85]">
                          {isDebit ? "Balance deducted" : "Transaction amount"}
                        </p>
                        <h2 className="mt-2 break-words text-[32px] font-semibold tracking-[-0.055em] sm:text-[42px]">
                          {isDebit
                            ? usageAmount == null
                              ? "—"
                              : `−${formatCount(usageAmount)}`
                            : amount == null
                              ? "—"
                              : formatInr(amount)}
                        </h2>
                        {isDebit && (
                          <p className="mt-1 text-[10px] text-[#777B85]">
                            Account balance units
                          </p>
                        )}
                        <p className="mt-2 text-[11px] text-[#777B85]">
                          {formatDate(
                            transaction?.createdAt ?? transaction?.updatedAt,
                          )}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <div className="mt-6 border-t border-white/[0.07] pt-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#777B85]">
                      Description
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#E4E4E7]">
                      {description}
                    </p>
                    {serviceName && (
                      <p className="mt-1 text-xs text-[#858994]">
                        Service: {titleCase(String(serviceName))}
                      </p>
                    )}
                  </div>
                </Surface>

                <Surface className="p-5 sm:p-7">
                  <div className="flex items-center gap-2">
                    <FiZap size={15} className="text-[#92949B]" />
                    <h2 className="text-sm font-semibold">Balance impact</h2>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                      <p className="text-[9px] uppercase tracking-[0.13em] text-[#777B85]">
                        Before transaction
                      </p>
                      <p className="mt-2 text-xl font-semibold">
                        {balanceBefore == null
                          ? "—"
                          : formatCount(balanceBefore)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                      <p className="text-[9px] uppercase tracking-[0.13em] text-[#777B85]">
                        {isDebit ? "Deducted" : "Added"}
                      </p>
                      <p
                        className={cx(
                          "mt-2 text-xl font-semibold",
                          isDebit ? "text-red-300" : "text-emerald-200",
                        )}
                      >
                        {usageAmount != null
                          ? `${isDebit ? "−" : "+"}${formatCount(usageAmount)}`
                          : "—"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                      <p className="text-[9px] uppercase tracking-[0.13em] text-[#777B85]">
                        After transaction
                      </p>
                      <p className="mt-2 text-xl font-semibold">
                        {balanceAfter == null ? "—" : formatCount(balanceAfter)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] leading-5 text-[#777B85]">
                    Balance and usage values are shown only when returned by the
                    billing record. Missing values are not estimated.
                  </p>
                </Surface>

                <Surface className="p-5 sm:p-7">
                  <div className="flex items-center gap-2">
                    <FiFileText size={15} className="text-[#92949B]" />
                    <h2 className="text-sm font-semibold">
                      Transaction record
                    </h2>
                  </div>
                  <div className="mt-3">
                    <DetailRow
                      label="Transaction reference"
                      value={transactionReference}
                      mono
                    />
                    <DetailRow
                      label="Transaction type"
                      value={titleCase(
                        firstDefined(
                          transaction?.type,
                          transaction?.transactionType,
                          transaction?.kind,
                          transaction?.category,
                          "Not specified",
                        ),
                      )}
                    />
                    <DetailRow
                      label="Payment status"
                      value={titleCase(status)}
                    />
                    <DetailRow label="Razorpay order ID" value={orderId} mono />
                    <DetailRow
                      label="Razorpay payment ID"
                      value={paymentId}
                      mono
                    />
                    <DetailRow
                      label="Created at"
                      value={formatDate(transaction?.createdAt)}
                    />
                    <DetailRow
                      label="Last updated"
                      value={formatDate(transaction?.updatedAt)}
                    />
                    <DetailRow
                      label="Currency"
                      value={
                        transaction?.currency || summary?.currency || "INR"
                      }
                    />
                  </div>
                </Surface>

                {extraMetadata.length > 0 && (
                  <Surface className="p-5 sm:p-7">
                    <h2 className="text-sm font-semibold">
                      Additional record information
                    </h2>
                    <div className="mt-3">
                      {extraMetadata.map(([key, value]) => (
                        <DetailRow
                          key={key}
                          label={titleCase(key)}
                          value={String(value)}
                        />
                      ))}
                    </div>
                  </Surface>
                )}
              </div>

              <aside className="space-y-4 xl:sticky xl:top-5">
                <Surface className="p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#6B6D73]">
                    Your account
                  </p>
                  <h2 className="mt-2 text-[17px] font-semibold tracking-[-0.035em]">
                    Billing overview
                  </h2>
                  <div className="mt-5 border-t border-white/[0.06] pt-4">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#62656D]">
                      Current account balance
                    </p>
                    <p
                      className={cx(
                        "mt-2 text-2xl font-semibold",
                        lowBalance ? "text-red-400" : "text-[#E4E4E7]",
                      )}
                    >
                      {currentBalance == null
                        ? "Unavailable"
                        : formatCount(currentBalance)}
                    </p>
                    <p className="mt-1 text-[10px] leading-5 text-[#777B85]">
                      {lowBalance
                        ? "Low balance — add balance to continue using services."
                        : "Available account balance"}
                    </p>
                  </div>
                  <div className="mt-4 border-t border-white/[0.06] pt-4">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#62656D]">
                      Total transactions
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {formatCount(summary?.totalTransactions ?? 0)}
                    </p>
                  </div>
                  <div className="mt-4 border-t border-white/[0.06] pt-4">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#62656D]">
                      Total successful payments
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {formatCount(summary?.successfulPayments ?? 0)}
                    </p>
                  </div>
                  <div className="mt-4 border-t border-white/[0.06] pt-4">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#62656D]">
                      Total payment amount
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {summary?.totalPaidAmount == null
                        ? "—"
                        : formatInr(summary.totalPaidAmount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/billing?addBalance=1")}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-[#E8E8EB]"
                  >
                    <FiCreditCard size={14} /> Add Balance
                  </button>
                </Surface>
                <button
                  type="button"
                  onClick={() => navigate("/billing/history")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.035] px-3 py-3 text-xs font-semibold text-[#D4D4D8] transition hover:bg-white/[0.08]"
                >
                  <FiArrowLeft size={13} /> Back to transaction history
                </button>
              </aside>
            </div>
          ) : (
            <Surface className="p-8 text-center">
              <FiFileText className="mx-auto text-[#858994]" size={24} />
              <h2 className="mt-4 text-base font-semibold">
                Transaction unavailable
              </h2>
              <p className="mt-2 text-xs leading-6 text-[#777B85]">
                This transaction could not be found or you may not have
                permission to view it.
              </p>
              <button
                type="button"
                onClick={() => navigate("/billing/history")}
                className="mt-5 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#17191C]"
              >
                Back to history
              </button>
            </Surface>
          )}
        </motion.div>
      </main>
    </div>
  );
}
