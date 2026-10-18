import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiExternalLink,
  FiFileText,
  FiMenu,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";

import {
  getBillingSummary,
  getBillingTransactions,
} from "../../api/billing.api";

const cx = (...values) => values.filter(Boolean).join(" ");
const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? response ?? {};

const getId = (item) =>
  String(
    item?._id ??
      item?.transactionId ??
      item?.id ??
      item?.razorpayPaymentId ??
      "",
  );

const getStatus = (item) =>
  String(
    item?.status ?? item?.paymentStatus ?? item?.state ?? "unknown",
  ).toLowerCase();

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

const formatDate = (value, includeTime = false) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

// Billing API amounts are stored in paise.
const formatInr = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return (amount / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

function getTransactionResult(response) {
  const payload = unwrap(response);
  const items = payload?.transactions ?? payload?.items ?? payload?.data;

  return {
    items: Array.isArray(payload) ? payload : Array.isArray(items) ? items : [],
    pagination: payload?.pagination ?? payload?.meta ?? null,
  };
}

function Surface({ children, className = "", contentClassName = "" }) {
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
      <div className={cx("relative", contentClassName)}>{children}</div>
    </section>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "unknown").toLowerCase();
  const success = SUCCESS.has(normalized);
  const pending = PENDING.has(normalized);

  const Icon = success ? FiCheckCircle : pending ? FiClock : FiXCircle;

  const tone = success
    ? "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-200"
    : pending
      ? "border-amber-200/15 bg-amber-200/[0.05] text-amber-100"
      : "border-white/[0.09] bg-white/[0.035] text-[#A1A1AA]";

  return (
    <span
      className={cx(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
        tone,
      )}
    >
      <Icon size={12} />
      {titleCase(normalized)}
    </span>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-3 last:border-0">
      <span className="shrink-0 text-[11px] text-[#777B85]">{label}</span>
      <span
        className={cx(
          "min-w-0 break-all text-right text-[11px] text-[#D4D4D8]",
          mono && "font-mono",
        )}
      >
        {value || "Not available"}
      </span>
    </div>
  );
}

export default function BillingHistoryPage({ user, setUser }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const reduceMotion = useReducedMotion();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedId, setSelectedId] = useState(
    searchParams.get("transaction") || "",
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const firstName = user?.name?.trim()?.split(/\s+/)?.[0] || "there";

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryResult, transactionsResult] = await Promise.allSettled([
        getBillingSummary(),
        getBillingTransactions({ page, pageSize }),
      ]);

      if (summaryResult.status === "fulfilled") {
        setSummary(unwrap(summaryResult.value));
      }

      if (transactionsResult.status === "fulfilled") {
        const result = getTransactionResult(transactionsResult.value);

        setTransactions(result.items);

        setSelectedId((current) => {
          const requested = searchParams.get("transaction");

          if (
            requested &&
            result.items.some((item) => getId(item) === requested)
          ) {
            return requested;
          }

          if (current && result.items.some((item) => getId(item) === current)) {
            return current;
          }

          return getId(result.items[0]) || "";
        });
      }

      if (
        summaryResult.status === "rejected" &&
        transactionsResult.status === "rejected"
      ) {
        setError(
          summaryResult.reason?.response?.data?.message ||
            transactionsResult.reason?.response?.data?.message ||
            "We couldn't load your billing history.",
        );
      } else if (transactionsResult.status === "rejected") {
        setError(
          transactionsResult.reason?.response?.data?.message ||
            "Transaction history couldn't be loaded.",
        );
      } else if (summaryResult.status === "rejected") {
        setError(
          summaryResult.reason?.response?.data?.message ||
            "Billing summary couldn't be loaded.",
        );
      }
    } catch {
      setError("Something went wrong while loading billing history.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchParams]);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const [summaryResult, transactionsResult] = await Promise.allSettled([
          getBillingSummary(),
          getBillingTransactions({ page, pageSize }),
        ]);

        if (cancelled) return;

        if (summaryResult.status === "fulfilled") {
          setSummary(unwrap(summaryResult.value));
        }

        if (transactionsResult.status === "fulfilled") {
          const result = getTransactionResult(transactionsResult.value);

          setTransactions(result.items);

          setSelectedId((current) => {
            const requested = searchParams.get("transaction");

            if (
              requested &&
              result.items.some((item) => getId(item) === requested)
            ) {
              return requested;
            }

            if (
              current &&
              result.items.some((item) => getId(item) === current)
            ) {
              return current;
            }

            return getId(result.items[0]) || "";
          });
        }

        if (
          summaryResult.status === "rejected" &&
          transactionsResult.status === "rejected"
        ) {
          setError(
            summaryResult.reason?.response?.data?.message ||
              transactionsResult.reason?.response?.data?.message ||
              "We couldn't load your billing history.",
          );
        } else if (transactionsResult.status === "rejected") {
          setError(
            transactionsResult.reason?.response?.data?.message ||
              "Transaction history couldn't be loaded.",
          );
        } else if (summaryResult.status === "rejected") {
          setError(
            summaryResult.reason?.response?.data?.message ||
              "Billing summary couldn't be loaded.",
          );
        }
      } catch {
        if (!cancelled) {
          setError("Something went wrong while loading billing history.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, searchParams]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return transactions;

    return transactions.filter((item) =>
      [
        item?.description,
        item?.planName,
        item?.transactionId,
        item?.razorpayOrderId,
        item?.razorpayPaymentId,
        item?.status,
        item?.paymentStatus,
        item?.amount,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [transactions, search]);

  const selected = useMemo(
    () => transactions.find((item) => getId(item) === selectedId) || null,
    [transactions, selectedId],
  );

  const totalCount = Number(summary?.totalTransactions ?? transactions.length);

  const successfulCount =
    summary?.successfulPayments ??
    summary?.successfulTransactions ??
    transactions.filter((item) => SUCCESS.has(getStatus(item))).length;

  const totalPaid = summary?.totalPaidAmount ?? summary?.totalAmount;
  const currentBalance =
    summary?.currentBalance ??
    summary?.accountBalance ??
    summary?.balance ??
    user?.currentBalance ??
    user?.accountBalance ??
    user?.balance ??
    null;
  const numericBalance = Number(currentBalance);
  const hasBalance =
    currentBalance !== null &&
    currentBalance !== undefined &&
    currentBalance !== "";
  const lowBalance =
    hasBalance && Number.isFinite(numericBalance) && numericBalance <= 50;

  const amount = selected?.amount ?? selected?.amountInPaise;

  const transactionReference =
    selected?.transactionId ?? selected?._id ?? selected?.id;

  const orderId = selected?.razorpayOrderId ?? selected?.orderId;

  const paymentId = selected?.razorpayPaymentId ?? selected?.paymentId;

  const selectTransaction = (item) => {
    const id = getId(item);

    setSelectedId(id);

    if (id) {
      setSearchParams({ transaction: id }, { replace: true });
    }

    setMobileOpen(false);
  };

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#17191C] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 88% 4%, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.02) 42%, transparent 72%), linear-gradient(135deg, #191b1e 0%, #17191c 48%, #141619 100%)",
        }}
      />

      {/* Mobile header */}
      <header className="fixed left-3 right-3 top-3 z-40 flex h-14 items-center justify-between rounded-full border border-white/[0.10] bg-[#17191C]/90 px-3 shadow-[0_16px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open transaction history"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-white"
        >
          <FiMenu size={18} />
        </button>

        <div className="flex flex-col items-center leading-none">
          <span
            className="text-[16px] tracking-tight"
            style={{ fontFamily: '"Zen Dots", sans-serif' }}
          >
            RIO
          </span>
          <span className="mt-1 text-[7px] font-medium tracking-[0.12em] text-white/55">
            CAREER INTELLIGENCE
          </span>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-xs font-semibold">
          {firstName.charAt(0).toUpperCase()}
        </div>
      </header>

      <div className="relative z-10 flex h-full min-h-0">
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close transaction history overlay"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}

        {/* LEFT: transaction list */}
        <aside
          className={cx(
            "absolute inset-y-3 left-3 z-50 flex w-[min(310px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[20px] border border-white/[0.10] bg-[#111315]/95 shadow-[0_24px_80px_rgba(0,0,0,.32)] backdrop-blur-xl transition-transform duration-300 md:inset-y-4 md:left-4 md:w-[300px] lg:inset-y-5 lg:left-5 lg:w-[292px]",
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-[calc(100%+1rem)] md:translate-x-0",
          )}
        >
          <div className="shrink-0 border-b border-white/[0.07] px-5 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#6B6D73]">
                  Billing & account
                </p>
                <h1 className="mt-2 text-[19px] font-semibold tracking-[-0.035em]">
                  Transaction history
                </h1>
                <p className="mt-1.5 text-[11px] leading-5 text-[#777B85]">
                  Payments and account activity.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadHistory()}
                disabled={loading}
                aria-label="Refresh billing history"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#9B9DA4] transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
              >
                <FiRefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>

            <div className="mt-4 border-t border-white/[0.07] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#62656D]">
                  Transactions
                </span>
                <span className="text-xs font-semibold tabular-nums text-[#D4D4D8]">
                  {Number.isFinite(totalCount)
                    ? totalCount
                    : transactions.length}
                </span>
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5">
              <FiSearch size={13} className="shrink-0 text-[#686B74]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transactions…"
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#62656D]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="text-[#777B85] hover:text-white"
                >
                  <FiX size={13} />
                </button>
              )}
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {loading && transactions.length === 0 && (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-white/80" />
                <p className="text-[11px] text-[#696B72]">
                  Loading transactions…
                </p>
              </div>
            )}

            {!loading && !error && filteredTransactions.length === 0 && (
              <div className="px-5 py-10">
                <FiCreditCard size={18} className="text-[#858994]" />
                <h2 className="mt-4 text-sm font-semibold">
                  {search ? "No matches found." : "No transactions yet."}
                </h2>
                <p className="mt-2 text-[11px] leading-5 text-[#777B85]">
                  {search
                    ? "Try a different transaction ID or status."
                    : "Your payment activity will appear here."}
                </p>
              </div>
            )}

            {filteredTransactions.map((item, index) => {
              const id = getId(item);
              const active = id === selectedId;

              return (
                <button
                  key={id || index}
                  type="button"
                  onClick={() => selectTransaction(item)}
                  className={cx(
                    "group relative flex w-full items-start gap-3 border-b border-white/[0.045] px-5 py-[17px] text-left transition-colors",
                    active ? "bg-white/[0.065]" : "hover:bg-white/[0.035]",
                  )}
                >
                  {active && (
                    <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-white" />
                  )}

                  <span
                    className={cx(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                      active
                        ? "border-white/15 bg-white/[0.08] text-white"
                        : "border-white/[0.08] bg-white/[0.025] text-[#777B85]",
                    )}
                  >
                    <FiCreditCard size={14} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-white">
                      {item?.description ||
                        item?.planName ||
                        "Balance purchase"}
                    </span>

                    <span className="mt-1 block truncate text-[9px] text-[#777B85]">
                      {formatDate(item?.createdAt || item?.updatedAt)}
                    </span>

                    <span className="mt-2 flex items-center justify-between gap-2">
                      <StatusBadge status={getStatus(item)} />
                      <span className="text-[11px] font-semibold tabular-nums text-[#E4E4E7]">
                        {formatInr(item?.amount ?? item?.amountInPaise)}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Pagination stays pinned to the bottom of the left aside. */}
          <div className="shrink-0 border-t border-white/[0.07] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-[#777B85]">
                Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || loading}
                  aria-label="Previous page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-[#D4D4D8] hover:bg-white/[0.06] disabled:opacity-30"
                >
                  <FiArrowLeft size={13} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        Math.max(1, Math.ceil(totalCount / pageSize)),
                        current + 1,
                      ),
                    )
                  }
                  disabled={
                    page >= Math.max(1, Math.ceil(totalCount / pageSize)) ||
                    loading
                  }
                  aria-label="Next page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-[#D4D4D8] hover:bg-white/[0.06] disabled:opacity-30"
                >
                  <FiArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER: selected transaction */}
        <main className="min-w-0 flex-1 overflow-y-auto pb-24 pt-[82px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:pb-8 md:pt-5 md:pl-[324px] lg:pl-[330px] lg:pr-[310px]">
          <div className="mx-auto w-full max-w-[880px] px-4 sm:px-7 lg:px-5">
            <div className="mb-7 hidden items-center justify-between gap-4 md:flex">
              <button
                type="button"
                onClick={() => navigate("/billing")}
                className="inline-flex items-center gap-2 text-xs font-medium text-[#858994] transition hover:text-white"
              >
                <FiArrowLeft size={14} /> Back to billing
              </button>

              <button
                type="button"
                onClick={() => void loadHistory()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-[11px] font-semibold text-[#D4D4D8] hover:bg-white/[0.07] disabled:opacity-50"
              >
                <FiRefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#777B85]">
                  Payment workspace
                </p>
                <h2 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.05em] sm:text-[38px]">
                  Transaction details<span className="text-[#858994]">.</span>
                </h2>
                <p className="mt-2 max-w-xl text-[12px] leading-6 text-[#858994] sm:text-[13px]">
                  Select a transaction from your history to inspect its payment
                  information.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-xs leading-5 text-[#D4D4D8]"
                >
                  <FiAlertCircle
                    size={15}
                    className="mt-0.5 shrink-0 text-[#A1A1AA]"
                  />
                  <span className="min-w-0 flex-1">{error}</span>
                  <button
                    type="button"
                    onClick={() => void loadHistory()}
                    className="shrink-0 underline underline-offset-4"
                  >
                    Retry
                  </button>
                </div>
              )}

              {selected ? (
                <div className="space-y-4">
                  <Surface className="p-5 sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3.5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-[#D4D4D8]">
                          <FiCreditCard size={18} />
                        </span>

                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#777B85]">
                            Transaction amount
                          </p>
                          <h3 className="mt-2 break-words text-[32px] font-semibold tracking-[-0.055em] sm:text-[42px]">
                            {formatInr(amount)}
                          </h3>
                          <p className="mt-2 text-[11px] text-[#777B85]">
                            {formatDate(
                              selected?.createdAt || selected?.updatedAt,
                              true,
                            )}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={getStatus(selected)} />
                    </div>

                    <div className="mt-6 border-t border-white/[0.07] pt-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#777B85]">
                        Payment description
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#E4E4E7]">
                        {selected?.description ||
                          selected?.planName ||
                          "Balance purchase"}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-[#858994]">
                        Payment details shown from the billing record.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/billing/transactions/${encodeURIComponent(getId(selected))}`,
                        )
                      }
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-[#E8E8EB]"
                    >
                      Open full transaction page
                      <FiExternalLink size={13} />
                    </button>
                  </Surface>

                  <Surface className="p-5 sm:p-7">
                    <div className="flex items-center gap-2">
                      <FiFileText size={15} className="text-[#92949B]" />
                      <h3 className="text-sm font-semibold">Payment record</h3>
                    </div>

                    <div className="mt-3">
                      <DetailRow
                        label="Transaction reference"
                        value={transactionReference}
                        mono
                      />
                      <DetailRow
                        label="Razorpay order ID"
                        value={orderId}
                        mono
                      />
                      <DetailRow
                        label="Razorpay payment ID"
                        value={paymentId}
                        mono
                      />
                      <DetailRow
                        label="Created at"
                        value={formatDate(selected?.createdAt, true)}
                      />
                      <DetailRow
                        label="Last updated"
                        value={formatDate(selected?.updatedAt, true)}
                      />
                      <DetailRow
                        label="Payment status"
                        value={titleCase(getStatus(selected))}
                      />
                      <DetailRow
                        label="Currency"
                        value={selected?.currency || summary?.currency || "INR"}
                      />
                    </div>
                  </Surface>
                </div>
              ) : (
                <Surface
                  className="min-h-[350px]"
                  contentClassName="flex min-h-[350px] w-full flex-col items-center justify-center px-6 py-12 text-center"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-[#858994]">
                    <FiCreditCard size={20} />
                  </span>

                  <h3 className="mt-4 text-base font-semibold">
                    {loading
                      ? "Loading billing activity…"
                      : "Choose a transaction"}
                  </h3>

                  <p className="mt-2 max-w-sm text-xs leading-6 text-[#777B85]">
                    {loading
                      ? "Your billing history will appear here shortly."
                      : "Select an item from the left panel to view its amount, status, payment IDs and timestamps."}
                  </p>

                  {!loading && transactions.length === 0 && (
                    <button
                      type="button"
                      onClick={() => navigate("/billing")}
                      className="mt-5 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#17191C] transition hover:bg-[#E8E8EB]"
                    >
                      Back to billing
                    </button>
                  )}
                </Surface>
              )}
            </motion.div>
          </div>
        </main>

        {/* RIGHT: summary aside */}
        <aside className="fixed inset-y-5 right-5 z-20 hidden w-[270px] flex-col overflow-y-auto rounded-[20px] border border-white/[0.09] bg-[#111315]/55 p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#6B6D73]">
              Your account
            </p>
            <h2 className="mt-2 text-[17px] font-semibold tracking-[-0.035em]">
              Billing overview
            </h2>
            <p className="mt-1.5 text-[11px] leading-5 text-[#777B85]">
              A quick summary of your recorded payment activity.
            </p>
          </div>

          <div className="mt-5 border-t border-white/[0.06] pt-4">
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#62656D]">
              Total transactions
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              {loading
                ? "—"
                : Number(
                    summary?.totalTransactions ?? totalCount,
                  ).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#62656D]">
              Successful payments
            </p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-[-0.04em]">
              <FiCheckCircle size={17} className="text-[#A1A1AA]" />
              {loading ? "—" : Number(successfulCount).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#62656D]">
              Total payment amount
            </p>
            <p className="mt-2 break-words text-[22px] font-semibold tracking-[-0.04em]">
              {loading || totalPaid == null ? "—" : formatInr(totalPaid)}
            </p>
            <p className="mt-1 text-[10px] leading-5 text-[#777B85]">
              Recorded successful payments
            </p>
          </div>

          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#62656D]">
              Current account balance
            </p>
            <p
              className={cx(
                "mt-2 break-words text-[22px] font-semibold tracking-[-0.04em]",
                lowBalance ? "text-red-400" : "text-[#E4E4E7]",
              )}
            >
              {loading
                ? "—"
                : hasBalance
                  ? Number.isFinite(numericBalance)
                    ? numericBalance.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })
                    : String(currentBalance)
                  : "Unavailable"}
            </p>
            <p className="mt-1 text-[10px] leading-5 text-[#777B85]">
              {lowBalance
                ? "Low balance — add balance to continue using services."
                : "Available account balance"}
            </p>
          </div>

          <div className="mt-5 border-t border-white/[0.06] pt-4">
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#62656D]">
              Selected transaction
            </p>
            {selected ? (
              <>
                <p className="mt-2 line-clamp-2 text-xs font-semibold text-[#E4E4E7]">
                  {selected?.description ||
                    selected?.planName ||
                    "Balance purchase"}
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {formatInr(amount)}
                </p>
                <div className="mt-2">
                  <StatusBadge status={getStatus(selected)} />
                </div>
                <p className="mt-2 text-[10px] leading-5 text-[#777B85]">
                  {formatDate(selected?.createdAt || selected?.updatedAt, true)}
                </p>
              </>
            ) : (
              <p className="mt-2 text-[11px] leading-5 text-[#777B85]">
                Select a transaction to see its summary.
              </p>
            )}
          </div>

          <div className="mt-auto pt-7">
            <button
              type="button"
              onClick={() => navigate("/billing?addBalance=1")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-[#E8E8EB]"
            >
              <FiCreditCard size={14} /> Add Balance
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile bottom actions */}
      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/[0.08] bg-[#111315]/90 px-4 pt-3 backdrop-blur-xl pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => navigate("/billing")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-semibold text-[#D4D4D8]"
          >
            <FiArrowLeft size={14} /> Billing
          </button>
          <button
            type="button"
            onClick={() => void loadHistory()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-[#17191C] disabled:opacity-50"
          >
            <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh history
          </button>
        </div>
      </div>
    </div>
  );
}
