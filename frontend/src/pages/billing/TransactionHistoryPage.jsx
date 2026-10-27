import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiActivity,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiRefreshCw,
  FiSearch,
  FiTrendingDown,
  FiTrendingUp,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import {
  getBillingSummary,
  getBillingTransactions,
  getPendingBillingPayment,
  cancelBillingPayment,
} from "../../api/billing/billing.api";

import Surface from "../../components/ui/Surface";

const cx = (...v) => v.filter(Boolean).join(" ");
const unwrap = (r) => r?.data?.data ?? r?.data ?? r ?? {};
const getItems = (r) => {
  const p = unwrap(r);
  const items = p?.transactions ?? p?.items ?? p?.data;
  return {
    items: Array.isArray(p) ? p : Array.isArray(items) ? items : [],
    pagination: p?.pagination ?? p?.meta ?? null,
  };
};
const idOf = (t) =>
  String(t?.transactionId ?? t?._id ?? t?.id ?? t?.razorpayPaymentId ?? "");
const statusOf = (t) =>
  String(t?.status ?? t?.paymentStatus ?? t?.state ?? "unknown").toLowerCase();
const isTopUp = (t) =>
  t?.source === "billing" ||
  t?.type === "balance_purchase" ||
  t?.balanceCredit != null ||
  Boolean(t?.planId) ||
  /billing|top[-_ ]?up|balance[-_ ]?credit/i.test(
    `${t?.action || ""} ${t?.serviceName || ""} ${t?.description || ""}`,
  );
const isLivePendingTopUp = (t) =>
  PENDING.has(statusOf(t)) &&
  isTopUp(t) &&
  (!t?.expiresAt || new Date(t.expiresAt).getTime() > Date.now());
const SUCCESS = new Set([
  "paid",
  "completed",
  "captured",
  "success",
  "succeeded",
]);
const PENDING = new Set(["pending", "created", "processing", "authorized"]);
const titleCase = (s = "") =>
  String(s)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
const dateOf = (v, time = false) => {
  if (!v || Number.isNaN(new Date(v).getTime())) return "Date unavailable";
  return new Date(v).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};
const inr = (v) =>
  Number.isFinite(Number(v))
    ? (Number(v) / 100).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      })
    : "—";

const balanceValue = (v) =>
  Number.isFinite(Number(v))
    ? Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : "—";

const isDeduction = (t) =>
  t?.type === "deduction" ||
  /resume scorer|interview|deduct/.test(
    String(t?.action || "")
      .toLowerCase()
      .replace(/[-_]/g, " "),
  ) ||
  t?.source === "balance";

const isFailed = (t) =>
  [
    "failed",
    "failure",
    "cancelled",
    "canceled",
    "rejected",
    "refunded",
    "error",
  ].includes(statusOf(t));

const titleOf = (t) => {
  const metadata =
    t?.metadata && typeof t.metadata === "object" ? t.metadata : {};
  const service = [
    t?.serviceName,
    t?.service,
    t?.feature,
    t?.product,
    t?.action,
    t?.description,
    t?.transactionType,
    t?.kind,
    metadata.serviceName,
    metadata.service,
    metadata.feature,
    metadata.action,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const resumeName = [
    t?.resumeFileName,
    t?.fileName,
    t?.documentName,
    t?.resumeName,
    metadata.resumeFileName,
    metadata.fileName,
    metadata.documentName,
    metadata.resumeName,
  ].find((v) => typeof v === "string" && v.trim());
  const interviewName = [
    t?.interviewName,
    t?.interviewTitle,
    t?.sessionName,
    metadata.interviewName,
    metadata.interviewTitle,
    metadata.sessionName,
  ].find((v) => typeof v === "string" && v.trim());

  if (/resume[-_ ]?scor|resume analysis|resume score/.test(service))
    return resumeName ? `Resume Scorer · ${resumeName}` : "Resume Scorer";
  if (/interview|mock[-_ ]?interview/.test(service))
    return interviewName ? `Interview · ${interviewName}` : "Interview";
  if (
    /billing-balance-credit|balance[-_ ]?credit|top[-_ ]?up/.test(service) ||
    t?.balanceCredit != null ||
    t?.source === "billing" ||
    t?.planId
  )
    return t?.planName || titleCase(t?.planId || "Balance added");

  return (
    t?.description ||
    titleCase(
      t?.action ||
        t?.serviceName ||
        t?.service ||
        t?.feature ||
        t?.transactionType ||
        t?.kind ||
        "Account activity",
    )
  );
};

const amountOf = (t) => {
  if (!t) return "—";
  if (
    isDeduction(t) ||
    t?.source === "balance" ||
    t?.amountUnit === "balance-unit"
  ) {
    const n = Number(t?.amount);
    return Number.isFinite(n)
      ? `${isDeduction(t) ? "−" : "+"}${balanceValue(n)} INR`
      : "—";
  }
  if (t?.balanceCredit != null)
    return `+${balanceValue(t.balanceCredit)} INR`;
  return inr(t?.amount ?? t?.amountInPaise);
};

const stateLabel = (t) => {
  const s = statusOf(t);

  if (PENDING.has(s)) return "Pending";
  if (s === "expired") return "Expired";
  if (SUCCESS.has(s)) {
    return isDeduction(t) ? "Deducted" : "Added";
  }

  return s === "failed" ||
    s === "failure" ||
    s === "cancelled" ||
    s === "canceled" ||
    s === "rejected" ||
    s === "refunded"
    ? "Failed"
    : titleCase(s || "Unknown");
};

const stateTone = (t) => {
  const s = statusOf(t);
  if (PENDING.has(s))
    return "border-amber-300/20 bg-amber-300/[.08] text-amber-200";
  if (!SUCCESS.has(s))
    return "border-rose-300/20 bg-rose-300/[.08] text-rose-200";
  return isDeduction(t)
    ? "border-rose-300/20 bg-rose-300/[.08] text-rose-200"
    : "border-emerald-300/20 bg-emerald-300/[.08] text-emerald-200";
};

function Badge({ transaction }) {
  const s = statusOf(transaction);
  const Icon = PENDING.has(s)
    ? FiClock
    : SUCCESS.has(s)
      ? FiCheckCircle
      : FiXCircle;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
        stateTone(transaction),
      )}
    >
      <Icon size={11} />
      {stateLabel(transaction)}
    </span>
  );
}
function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[.065] py-3 last:border-0">
      <span className="shrink-0 text-[11px] text-[#858994]">{label}</span>
      <span
        className={cx(
          "min-w-0 break-all text-right text-[11px] text-[#E4E4E7]",
          mono && "font-mono",
        )}
      >
        {value || "Not available"}
      </span>
    </div>
  );
}
export default function BillingHistoryPage({ user }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedId, setSelectedId] = useState(params.get("transaction") || "");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [, setExpiryClockTick] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [sr, tr, pr] = await Promise.allSettled([
      getBillingSummary(),
      getBillingTransactions({ page, pageSize }),
      getPendingBillingPayment(),
    ]);
    if (sr.status === "fulfilled") setSummary(unwrap(sr.value));
    else
      setError(
        sr.reason?.response?.data?.message ||
          "Billing summary could not be loaded.",
      );
    if (tr.status === "fulfilled") {
      const result = getItems(tr.value);
      let nextItems = result.items;
      if (pr.status === "fulfilled") {
        const pendingPayload = unwrap(pr.value);
        const pending = pendingPayload?.transactionId ? pendingPayload : null;
        if (pending) {
          const alreadyIncluded = nextItems.some(
            (item) =>
              item?.transactionId === pending.transactionId ||
              item?._id === pending._id,
          );
          if (!alreadyIncluded) nextItems = [pending, ...nextItems];
        }
      }
      setTransactions(nextItems);
      if (result.pagination)
        setPagination({
          total: Number(
            result.pagination.total ??
              result.pagination.count ??
              result.items.length,
          ),
          totalPages: Math.max(
            1,
            Number(
              result.pagination.totalPages ||
                Math.ceil(
                  Number(result.pagination.total ?? result.items.length) /
                    pageSize,
                ),
            ),
          ),
        });
      setSelectedId((current) => {
        const requested = params.get("transaction");
        if (requested && nextItems.some((x) => idOf(x) === requested))
          return requested;
        return nextItems.some((x) => idOf(x) === current)
          ? current
          : idOf(nextItems[0]);
      });
    } else
      setError(
        tr.reason?.response?.data?.message ||
          "Transaction history could not be loaded.",
      );
    setLoading(false);
  }, [page, params]);

  useEffect(() => {
    // Start data loading after the effect commits; cancel if dependencies change
    // or the page unmounts before the request is kicked off.
    const frameId = window.requestAnimationFrame(() => {
      void load();
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [load]);

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const matchesFilter =
          filter === "All" ||
          (filter === "Pending" && PENDING.has(statusOf(t))) ||
          (filter === "Success" && SUCCESS.has(statusOf(t))) ||
          (filter === "Expired" && statusOf(t) === "expired") ||
          (filter === "Top-ups" && isTopUp(t)) ||
          (filter === "Failed" && isFailed(t));

        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          [
            titleOf(t),
            t?.description,
            t?.transactionId,
            t?.razorpayOrderId,
            t?.razorpayPaymentId,
            t?.status,
            t?.amount,
          ].some((v) =>
            String(v ?? "")
              .toLowerCase()
              .includes(q),
          );
        return matchesFilter && matchesSearch;
      }),
    [transactions, filter, search],
  );

  const selected =
    filtered.find((t) => idOf(t) === selectedId) ||
    transactions.find((t) => idOf(t) === selectedId) ||
    null;

  const selectedStatus = statusOf(selected || {});
  const selectedTransactionId = selected?.transactionId;
  const selectedExpiresAt = selected?.expiresAt;

  useEffect(() => {
    const expiresAt = selectedExpiresAt
      ? new Date(selectedExpiresAt).getTime()
      : NaN;

    if (
      !selectedTransactionId ||
      !PENDING.has(selectedStatus) ||
      !Number.isFinite(expiresAt)
    ) {
      return undefined;
    }

    let refreshedAfterExpiry = false;

    const intervalId = window.setInterval(() => {
      setExpiryClockTick((value) => value + 1);

      if (!refreshedAfterExpiry && Date.now() >= expiresAt) {
        refreshedAfterExpiry = true;

        // The pending-payment endpoint may persist expiry while the transaction
        // list from the same parallel request still contains the old status.
        // Run a second read after reconciliation so history immediately shows Expired.
        void (async () => {
          await load();
          await load();
        })();
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [selectedTransactionId, selectedExpiresAt, selectedStatus, load]);

  const total = Number(pagination.total ?? transactions.length);
  const pages = Math.max(
    1,
    Number(pagination.totalPages || Math.ceil(total / pageSize)),
  );
  const balance =
    summary?.currentBalance ??
    summary?.accountBalance ??
    summary?.balance ??
    user?.currentBalance ??
    user?.balance;
  const paidTotal = summary?.totalPaidAmount;
  const lowBalance =
    balance != null &&
    Number.isFinite(Number(balance)) &&
    Number(balance) <= 50;
  const choose = (t) => {
    const id = idOf(t);
    setSelectedId(id);
    if (id) setParams({ transaction: id }, { replace: true });
    setMobileOpen(false);
  };

  const selectedIsLivePending = Boolean(
    selected && isLivePendingTopUp(selected),
  );

  const handleCancelSelectedPayment = async () => {
    if (!selected?.transactionId || actionLoading) return;
    setActionLoading(true);
    setActionError("");
    try {
      await cancelBillingPayment(selected.transactionId);
      setCancelConfirmOpen(false);
      await load();
    } catch (error) {
      setActionError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to cancel this payment.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const continueSelectedPayment = () => {
    if (!selected?.transactionId) return;
    navigate(
      `/billing?continuePayment=${encodeURIComponent(selected.transactionId)}`,
    );
  };

  return (
    <div className="rio-transaction-history relative h-[100dvh] overflow-hidden bg-[#17191C] text-white">
      {cancelConfirmOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="history-cancel-title"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151719] p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-300/20 bg-amber-300/[.08] text-amber-200">
                <FiClock size={19} />
              </span>
              <div>
                <h2
                  id="history-cancel-title"
                  className="text-base font-semibold text-white"
                >
                  Cancel this payment?
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">
                  The pending checkout will be closed. If the gateway has
                  captured or is still processing the payment, its status will
                  be reconciled before any expiry is recorded.
                </p>
              </div>
            </div>
            {actionError && (
              <p role="alert" className="mt-3 text-xs text-rose-300">
                {actionError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setCancelConfirmOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-[#D4D4D8] hover:bg-white/[.05] disabled:opacity-50"
              >
                Keep payment
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => void handleCancelSelectedPayment()}
                className="rounded-xl bg-amber-300 px-4 py-2.5 text-xs font-semibold text-black hover:bg-amber-200 disabled:opacity-50"
              >
                {actionLoading ? "Cancelling…" : "Yes, cancel payment"}
              </button>
            </div>
          </section>
        </div>
      )}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 88% 4%, rgba(255,255,255,.065) 0%, rgba(255,255,255,.02) 42%, transparent 72%), linear-gradient(135deg, #191b1e 0%, #17191c 48%, #141619 100%)",
        }}
      />
      <header
        className={cx(
          "rio-history-mobile-header fixed inset-x-0 top-0 flex h-16 items-center border-b border-white/[0.07] bg-[#111214]/95 px-4 backdrop-blur-xl md:hidden",
          mobileOpen ? "z-40" : "z-[60]",
        )}
      >
        <button
          type="button"
          onClick={() => navigate("/billing")}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] p-0 text-[#D4D4D8] transition hover:bg-white/[0.08]"
          aria-label="Back to billing"
          title="Back to billing"
        >
          <FiArrowLeft size={16} />
        </button>

        <div className="ml-3 min-w-0 border-l border-white/[0.09] pl-3">
          <p className="truncate text-xs font-semibold text-white">
            Transaction history
          </p>

          <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-[#858994]">
            Account activity & billing
          </p>
        </div>
      </header>
      <div
        className={cx(
          "relative flex h-full min-h-0",
          mobileOpen ? "z-[80]" : "z-10",
        )}
      >
        {mobileOpen && (
          <button
            aria-label="Close transaction list"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md transition-opacity duration-300 md:hidden"
          />
        )}
        <aside
          className={cx(
            "absolute top-4 bottom-20 left-4 flex w-[min(282px,calc(100vw-1rem))] flex-col overflow-hidden rounded-[24px] border border-white/[.10] bg-[#111315]/95 shadow-[0_24px_80px_rgba(0,0,0,.32)] backdrop-blur-xl transition-transform duration-300 md:inset-y-4 md:left-4 md:right-auto md:w-[300px] lg:inset-y-5 lg:left-5",
            mobileOpen ? "z-[90]" : "z-50",
            mobileOpen
              ? "z-[90] translate-x-0"
              : "z-50 -translate-x-[calc(100%+1rem)] md:translate-x-0",
          )}
        >
          <div className="shrink-0 border-b border-white/[.07] px-5 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[.22em] text-[#777B85]">
                  RIO / ACCOUNT
                </p>
                <h1 className="mt-2 text-[20px] font-semibold tracking-[-.04em]">
                  Transaction history<span className="text-[#858994]">.</span>
                </h1>
                <p className="mt-1.5 text-[11px] leading-5 text-[#858994]">
                  Every balance movement, in one place.
                </p>
              </div>
              <button
                onClick={() => void load()}
                disabled={loading}
                aria-label="Refresh history"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.045] text-[#A1A1AA] hover:bg-white/[.08] disabled:opacity-50"
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} />
              </button>
            </div>
            <div className="relative mt-4">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                aria-expanded={filterOpen}
                className="flex w-full items-center justify-between rounded-xl border border-white/[.09] bg-white/[.035] px-3 py-2.5 text-left"
              >
                <span className="text-xs font-semibold">
                  {filter}{" "}
                  <span className="text-[#858994]">
                    {filter === "All" ? total : filtered.length}
                  </span>
                </span>
                <FiChevronDown
                  className={cx(
                    "text-[#858994] transition",
                    filterOpen && "rotate-180",
                  )}
                />
              </button>
              {filterOpen && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-white/[.12] bg-[#191b1e] p-1 shadow-2xl">
                  {[
                    "All",
                    "Pending",
                    "Success",
                    "Expired",
                    "Failed",
                    "Top-ups",
                  ].map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        setFilter(v);
                        setFilterOpen(false);
                      }}
                      className={cx(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs",
                        filter === v
                          ? "bg-white/[.09] text-white"
                          : "text-[#A1A1AA] hover:bg-white/[.05]",
                      )}
                    >
                      {v}
                      {filter === v && <FiCheckCircle />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <label className="mt-3 flex items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.025] px-3 py-2.5">
              <FiSearch className="text-[#777B85]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions…"
                className="w-full bg-transparent text-xs outline-none placeholder:text-[#62656D]"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search">
                  <FiX />
                </button>
              )}
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {loading && transactions.length === 0 && (
              <div className="grid min-h-[220px] place-items-center text-xs text-[#858994]">
                <FiRefreshCw className="animate-spin" /> Loading activity…
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="flex min-h-[230px] flex-col items-center justify-center px-6 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[.035] text-[#858994]">
                  <FiActivity size={20} />
                </span>
                <p className="mt-4 text-sm font-semibold">
                  {search ? "No matches found" : "No transactions yet"}
                </p>
                <p className="mt-2 text-[11px] leading-5 text-[#777B85]">
                  {search
                    ? "Try another name, status or reference."
                    : "Your balance activity will appear here."}
                </p>
              </div>
            )}
            {filtered.map((t, i) => {
              const id = idOf(t),
                active = id === selectedId;
              const debit = isDeduction(t);
              const Icon = debit ? FiTrendingDown : FiTrendingUp;
              return (
                <button
                  key={id || i}
                  onClick={() => choose(t)}
                  className={cx(
                    "group relative flex w-full items-start gap-3 border-b border-white/[.045] px-5 py-4 text-left transition",
                    active ? "bg-white/[.065]" : "hover:bg-white/[.035]",
                  )}
                >
                  {active && (
                    <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-white" />
                  )}
                  <span
                    className={cx(
                      "mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border",
                      active
                        ? "border-white/15 bg-white/[.08] text-white"
                        : "border-white/[.08] bg-white/[.025] text-[#858994]",
                    )}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">
                      {titleOf(t)}
                    </span>
                    <span className="mt-1 block text-[10px] text-[#777B85]">
                      {dateOf(t?.createdAt || t?.updatedAt, true)}
                    </span>
                    <span className="mt-2 flex items-center justify-between gap-2">
                      <Badge transaction={t} />

                      <span
                        className={cx(
                          "shrink-0 text-right text-[11px] font-semibold tabular-nums",
                          PENDING.has(statusOf(t))
                            ? "text-amber-200"
                            : !SUCCESS.has(statusOf(t))
                              ? "text-rose-300"
                              : debit
                                ? "text-rose-300"
                                : "text-emerald-200",
                        )}
                      >
                        {amountOf(t)}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="shrink-0 border-t border-white/[.07] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-[#858994]">
                Page {page} of {pages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 disabled:opacity-30"
                >
                  <FiArrowLeft />
                </button>
                <button
                  disabled={page >= pages || loading}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  aria-label="Next page"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 disabled:opacity-30"
                >
                  <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto pb-28 pt-[82px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:pb-8 md:pt-5 md:pl-[328px] lg:pl-[328px] lg:pr-[328px]">
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-7 lg:px-5">
            <div className=" pb-4 border-b  border-white/[0.08] hidden items-center justify-between md:flex">
              <button
                onClick={() => navigate("/billing")}
                className="inline-flex items-center gap-2 text-xs text-[#858994] hover:text-white"
              >
                <FiArrowLeft /> Back to billing
              </button>
              <button
                onClick={() => void load()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.035] px-3.5 py-2.5 text-[11px] font-semibold text-[#D4D4D8] hover:bg-white/[.07] disabled:opacity-50"
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} />{" "}
                Refresh
              </button>
            </div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 9 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className=" mb-6 sm:mt-6">
                <p className="text-[9px] font-semibold uppercase tracking-[.22em] text-[#777B85]">
                  ACCOUNT ACTIVITY / OVERVIEW
                </p>
                <h2 className="mt-2 text-[27px] font-semibold tracking-[-.05em] sm:text-[34px]">
                  Your transactions<span className="text-[#858994]">.</span>
                </h2>
                <p className="mt-2 max-w-xl text-xs leading-6 text-[#858994]">
                  Review balance changes and payment records with a clear,
                  item-by-item history.
                </p>
              </div>
              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-2xl border border-rose-300/15 bg-rose-300/[.04] p-4 text-xs text-rose-100"
                >
                  {error}
                </div>
              )}
              {selected ? (
                <div className="space-y-4">
                  <Surface variant="roadmap" className="p-4 sm:p-7">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3.5">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.045] text-[#D4D4D8] sm:h-12 sm:w-12 sm:rounded-2xl">
                          {isDeduction(selected) ? (
                            <FiTrendingDown size={19} />
                          ) : (
                            <FiCreditCard size={19} />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase tracking-[.18em] text-[#777B85]">
                            {isDeduction(selected)
                              ? "Balance deducted"
                              : "Balance activity"}
                          </p>
                          <h3 className="mt-1.5 break-words text-[24px] font-semibold leading-tight tracking-[-.05em] sm:mt-2 sm:text-[36px]">
                            {amountOf(selected)}
                          </h3>
                          <p className="mt-1.5 text-[10px] text-[#858994] sm:mt-2 sm:text-[11px]">
                            {dateOf(
                              selected.createdAt || selected.updatedAt,
                              true,
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge transaction={selected} />
                    </div>
                    <div className="mt-6 border-t border-white/[.07] pt-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[.17em] text-[#777B85]">
                        Activity
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#E4E4E7]">
                        {titleOf(selected)}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-[#858994]">
                        {isDeduction(selected)
                          ? "This service activity is reflected in your account balance."
                          : "Your account activity and payment record are shown below."}
                      </p>
                    </div>
                  </Surface>
                  <Surface variant="roadmap" className="p-5 sm:p-7">
                    <div className="flex items-center gap-2">
                      <FiFileText className="text-[#92949B]" />
                      <h3 className="text-sm font-semibold">
                        Transaction record
                      </h3>
                    </div>
                    <div className="mt-3">
                      <Row
                        label="Transaction reference"
                        value={
                          selected.transactionId || selected._id || selected.id
                        }
                        mono
                      />
                      <Row label="Activity type" value={titleOf(selected)} />
                      {(() => {
                        const reportUrl =
                          selected.reportUrl || selected.metadata?.reportUrl;

                        const isSafeReportUrl =
                          typeof reportUrl === "string" &&
                          reportUrl.startsWith("/") &&
                          !reportUrl.startsWith("//") &&
                          !reportUrl.includes("\\");

                        return (
                          isSafeReportUrl && (
                            <Row
                              label="Report"
                              value={
                                <a
                                  href={reportUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline underline-offset-2"
                                >
                                  View report
                                </a>
                              }
                            />
                          )
                        );
                      })()}
                      {(selected.serviceName ||
                        selected.metadata?.serviceName) && (
                        <Row
                          label="Service"
                          value={
                            selected.serviceName ||
                            selected.metadata?.serviceName
                          }
                        />
                      )}

                      {(selected.resourceName ||
                        selected.metadata?.resourceName) && (
                        <Row
                          label="Resource"
                          value={
                            selected.resourceName ||
                            selected.metadata?.resourceName
                          }
                        />
                      )}

                      {(selected.resourceId ||
                        selected.metadata?.resourceId) && (
                        <Row
                          label="Resource ID"
                          value={
                            selected.resourceId || selected.metadata?.resourceId
                          }
                          mono
                        />
                      )}
                      <Row
                        label="Transaction type"
                        value={
                          isDeduction(selected)
                            ? "Balance deduction"
                            : "Balance top-up"
                        }
                      />
                      {selected.balanceBefore != null && (
                        <Row
                          label="Balance before transaction"
                          value={`${balanceValue(selected.balanceBefore)} Balance`}
                        />
                      )}
                      <Row
                        label="Status"
                        value={titleCase(statusOf(selected))}
                      />
                      {selected.balanceAfter != null && (
                        <Row
                          label="Balance after transaction"
                          value={`${balanceValue(selected.balanceAfter)} Balance`}
                        />
                      )}
                      {selected.razorpayOrderId && (
                        <Row
                          label="Razorpay order ID"
                          value={selected.razorpayOrderId}
                          mono
                        />
                      )}
                      {selected.razorpayPaymentId && (
                        <Row
                          label="Razorpay payment ID"
                          value={selected.razorpayPaymentId}
                          mono
                        />
                      )}
                      {!isDeduction(selected) && (
                        <Row
                          label="Payment amount"
                          value={inr(selected.amount ?? selected.amountInPaise)}
                        />
                      )}
                      <Row
                        label="Recorded at"
                        value={dateOf(
                          selected.createdAt || selected.updatedAt,
                          true,
                        )}
                      />
                    </div>
                  </Surface>
                </div>
              ) : (
                <Surface
                  variant="roadmap"
                  className="flex min-h-[330px] flex-col items-center justify-center p-8 text-center"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[.035] text-[#858994]">
                    <FiActivity size={22} />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">
                    {loading
                      ? "Loading account activity…"
                      : "Choose a transaction"}
                  </h3>
                  <p className="mt-2 max-w-sm text-xs leading-6 text-[#777B85]">
                    {loading
                      ? "Your latest activity will appear here."
                      : "Select a transaction from the left panel to inspect its amount, status and balance impact."}
                  </p>
                </Surface>
              )}
            </motion.div>
          </div>
        </main>

        <aside className="fixed inset-y-5 right-5 z-20 hidden w-[292px] flex-col overflow-y-auto rounded-[24px] border border-white/[.09] bg-[#111315]/90 p-5 lg:flex">
          <p className="text-[9px] font-semibold uppercase tracking-[.22em] text-[#777B85]">
            YOUR ACCOUNT
          </p>
          <h2 className="mt-2 text-[18px] font-semibold tracking-[-.04em]">
            Billing overview<span className="text-[#858994]">.</span>
          </h2>
          <div className="mt-5 rounded-2xl border border-white/[.08] bg-white/[.025] p-4">
            <p className="text-[9px] uppercase tracking-[.15em] text-[#858994]">
              Current account balance
            </p>
            <p
              className={cx(
                "mt-2 text-[27px] font-semibold tracking-[-.04em]",
                lowBalance ? "text-rose-300" : "text-[#F4F4F5]",
              )}
            >
              {balance == null
                ? "Unavailable"
                : `${balanceValue(balance)} INR`}
            </p>
            <p
              className={cx(
                "mt-2 text-[10px] leading-5",
                lowBalance ? "text-rose-200" : "text-[#777B85]",
              )}
            >
              {lowBalance
                ? "Low balance. Some services may not work until you add balance."
                : "Available for supported RIO services."}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              {
                label: "Total transactions",
                value: summary?.totalTransactions ?? total,
                icon: FiActivity,
              },
              {
                label: "Successful",
                value:
                  summary?.successfulTransactions ??
                  summary?.successfulPayments ??
                  "—",
                icon: FiCheckCircle,
              },
              {
                label: "Top-ups",
                value: summary?.totalTopUpTransactions ?? "—",
                icon: FiCreditCard,
              },
              {
                label: "Failed",
                value:
                  summary?.failedTransactions ?? summary?.failedPayments ?? "—",
                icon: FiXCircle,
              },
            ].map((x) => (
              <div
                key={x.label}
                className="min-w-0 rounded-2xl border border-white/[.07] bg-white/[.025] p-3"
              >
                <x.icon className="text-[#858994]" size={14} />
                <p className="mt-3 text-[9px] leading-4 text-[#858994]">
                  {x.label}
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {typeof x.value === "number"
                    ? x.value.toLocaleString("en-IN")
                    : x.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-2xl border border-white/[.07] bg-white/[.025] p-4">
            <p className="text-[9px] uppercase tracking-[.15em] text-[#858994]">
              Total payment amount
            </p>
            <p className="mt-2 text-[23px] font-semibold tracking-[-.04em]">
              {paidTotal == null ? "—" : paidTotal.toLocaleString("en-IN")} {`INR`}
            </p>
            <p className="mt-1 text-[10px] text-[#777B85]">
              Successful payments only
            </p>
          </div>
          <div className="mt-auto pt-5">
            <button
              onClick={() => navigate("/billing?addBalance=1")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-xs font-semibold text-[#17191C] transition hover:bg-[#E8E8EB]"
            >
              <FiCreditCard size={15} /> Add Balance
            </button>
            {selectedIsLivePending && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActionError("");
                    setCancelConfirmOpen(true);
                  }}
                  disabled={actionLoading}
                  className="flex min-h-[44px] min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-amber-300/25 bg-amber-300/[.07] px-2 text-[10px] font-semibold text-amber-200 transition hover:bg-amber-300/15 disabled:opacity-50"
                >
                  <FiXCircle size={13} className="shrink-0" />
                  <span>Cancel Payment</span>
                </button>
                <button
                  type="button"
                  onClick={continueSelectedPayment}
                  disabled={actionLoading}
                  className="flex min-h-[44px] min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-amber-300 px-2 text-[10px] font-semibold text-black transition hover:bg-amber-200 disabled:opacity-50"
                >
                  <FiCreditCard size={13} className="shrink-0" />
                  <span>Continue Payment</span>
                </button>
              </div>
            )}
            <p className="mt-3 text-center text-[9px] leading-4 text-[#686B74]">
              Secure payments powered by Razorpay
            </p>
          </div>
        </aside>

        {/* Mobile actions stay anchored at the bottom, outside the scrollable content. */}
        <div
          className={cx(
            "rio-history-mobile-bottom-bar fixed inset-x-0 bottom-0 border-t border-white/[0.08] bg-[#111315]/90 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden",
            mobileOpen ? "z-40" : "z-[60]",
          )}
        >
          <div className="grid grid-cols-2 gap-2">
            {selectedIsLivePending ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActionError("");
                    setCancelConfirmOpen(true);
                  }}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/25 bg-amber-300/[.07] px-3 py-3 text-xs font-semibold text-amber-200 disabled:opacity-50"
                >
                  <FiXCircle size={14} /> Cancel Payment
                </button>
                <button
                  type="button"
                  onClick={continueSelectedPayment}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-3 py-3 text-xs font-semibold text-black disabled:opacity-50"
                >
                  <FiCreditCard size={14} /> Continue Payment
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-semibold text-[#D4D4D8] transition hover:bg-white/[0.065]"
                  aria-label="Open transaction history list"
                >
                  <FiFileText size={14} /> History
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/billing?addBalance=1")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-[#E8E8EB]"
                  aria-label="Add balance"
                >
                  <FiCreditCard size={14} /> Add Balance
                </button>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => void load()}
          disabled={loading}
          aria-label="Refresh transaction history"
          className={cx(
            "fixed bottom-[5.6rem] right-4 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-[#22252A] text-[#E4E4E7] shadow-[0_8px_28px_rgba(0,0,0,.35)] transition hover:bg-[#30333A] disabled:opacity-50 md:hidden",
            mobileOpen ? "z-hidden" : "z-[70]",
          )}
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
        </button>
      </div>
    </div>
  );
}
