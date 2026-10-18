import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiCreditCard,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiMenu,
  FiPlus,
} from "react-icons/fi";

import Sidebar from "../../components/SideBar";
import {
  getBillingSummary,
  getBillingTransactions,
} from "../../api/billing.api";

const ease = [0.22, 1, 0.36, 1];

const unwrap = (value) => value?.data?.data ?? value?.data ?? value ?? {};

const getTransactionList = (response) => {
  const payload = unwrap(response);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.transactions)) return payload.transactions;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;

  return [];
};

const formatNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })
    : "—";
};

// Billing API stores transaction amounts in paise.
const formatInrFromPaise = (value) => {
  const amount = Number(value);

  return Number.isFinite(amount)
    ? (amount / 100).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      })
    : "—";
};

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const getStatus = (transaction) =>
  String(
    transaction?.status ?? transaction?.paymentStatus ?? "unknown",
  ).toLowerCase();

const SUCCESS_STATUSES = [
  "paid",
  "completed",
  "captured",
  "success",
  "succeeded",
];

function StatusLabel({ status }) {
  const normalized = String(status || "unknown").toLowerCase();

  const isSuccess = SUCCESS_STATUSES.includes(normalized);
  const isPending = ["pending", "created", "processing"].includes(normalized);

  const Icon = isSuccess ? FiCheckCircle : isPending ? FiClock : FiXCircle;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium capitalize text-[#B9BBC2]">
      <Icon size={12} />
      {normalized.replaceAll("-", " ")}
    </span>
  );
}

function Surface({ children, className = "" }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[22px] border border-white/[0.10] bg-[#111315] ${className}`}
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

export default function BillingDashboardPage({ user, setUser }) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const firstName = user?.name?.trim()?.split(/\s+/)?.[0] || "there";

  const loadBilling = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryResult, transactionsResult] = await Promise.allSettled([
        getBillingSummary(),
        getBillingTransactions({
          page: 1,
          pageSize: 5,
        }),
      ]);

      if (summaryResult.status === "fulfilled") {
        setSummary(unwrap(summaryResult.value));
      }

      if (transactionsResult.status === "fulfilled") {
        setTransactions(getTransactionList(transactionsResult.value));
      }

      if (
        summaryResult.status === "rejected" &&
        transactionsResult.status === "rejected"
      ) {
        setError(
          summaryResult.reason?.response?.data?.message ||
            transactionsResult.reason?.response?.data?.message ||
            "We couldn't load your billing information.",
        );
      } else if (summaryResult.status === "rejected") {
        setError(
          summaryResult.reason?.response?.data?.message ||
            "Your billing summary couldn't be loaded.",
        );
      } else if (transactionsResult.status === "rejected") {
        setError(
          transactionsResult.reason?.response?.data?.message ||
            "Recent transactions couldn't be loaded.",
        );
      }
    } catch {
      setError("Something went wrong while loading billing data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchBilling = async () => {
      try {
        const [summaryResult, transactionsResult] = await Promise.allSettled([
          getBillingSummary(),
          getBillingTransactions({ page: 1, pageSize: 5 }),
        ]);

        if (cancelled) return;

        if (summaryResult.status === "fulfilled") {
          setSummary(unwrap(summaryResult.value));
        }

        if (transactionsResult.status === "fulfilled") {
          setTransactions(getTransactionList(transactionsResult.value));
        }

        if (
          summaryResult.status === "rejected" &&
          transactionsResult.status === "rejected"
        ) {
          setError(
            summaryResult.reason?.response?.data?.message ||
              transactionsResult.reason?.response?.data?.message ||
              "We couldn't load your billing information.",
          );
        } else if (summaryResult.status === "rejected") {
          setError(
            summaryResult.reason?.response?.data?.message ||
              "Your billing summary couldn't be loaded.",
          );
        } else if (transactionsResult.status === "rejected") {
          setError(
            transactionsResult.reason?.response?.data?.message ||
              "Recent transactions couldn't be loaded.",
          );
        }
      } catch {
        if (!cancelled) {
          setError("Something went wrong while loading billing data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchBilling();

    return () => {
      cancelled = true;
    };
  }, []);

  const balance = useMemo(() => {
    const candidate =
      summary?.balance ??
      summary?.currentBalance ??
      summary?.availableBalance ??
      user?.balance;

    return candidate != null && Number.isFinite(Number(candidate))
      ? Number(candidate)
      : null;
  }, [summary, user?.balance]);

  const paidTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        SUCCESS_STATUSES.includes(getStatus(transaction)),
      ),
    [transactions],
  );

  const totalPaidAmount = useMemo(
    () =>
      paidTransactions.reduce(
        (total, transaction) =>
          total +
          Number(transaction?.amount ?? transaction?.amountInPaise ?? 0),
        0,
      ),
    [paidTransactions],
  );

  // Prefer the backend's complete count over the current page's count.
  const successfulPayments =
    summary?.successfulPayments ??
    summary?.successfulTransactions ??
    summary?.paidCount ??
    paidTransactions.length;

  const totalAmount =
    summary?.totalPaidAmount ?? summary?.totalAmount ?? totalPaidAmount;

  const stats = [
    {
      label: "Available balance",
      value: balance === null ? "—" : formatNumber(balance),
      detail: "Your current account balance",
      Icon: FiCreditCard,
    },
    {
      label: "Successful payments",
      value: formatNumber(successfulPayments),
      detail: "Completed billing transactions",
      Icon: FiCheckCircle,
    },
    {
      label: "Total payment amount",
      value: formatInrFromPaise(totalAmount),
      detail: "Total recorded successful payments",
      Icon: FiArrowUpRight,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#17191C] text-white">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 88% 4%, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.02) 42%, transparent 72%), radial-gradient(ellipse 65% 55% at 0% 92%, rgba(255,255,255,0.03) 0%, transparent 70%), linear-gradient(135deg, #191b1e 0%, #17191c 48%, #141619 100%)",
          }}
        />
      </div>

      {/* Mobile header */}
      <header className="fixed left-3 right-3 top-3 z-40 flex h-14 items-center justify-between rounded-full border border-white/[0.10] bg-[#17191C]/85 px-3 shadow-[0_16px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-white transition hover:bg-white/[0.1]"
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

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          user={user}
          setUser={setUser}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main
          className={`min-w-0 flex-1 transition-[margin-left] duration-300 ease-out ${
            sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"
          }`}
        >
          <div className="mx-auto w-full max-w-[1480px] px-5 pb-22 pt-[88px] sm:px-7 sm:pb-10 lg:px-10 lg:pb-12 lg:pt-10">
            {/* Page heading */}
            <motion.section
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
              className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
            >
              <div className="max-w-3xl">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />

                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8F9198]">
                    Billing & account
                  </p>
                </div>

                <h1 className="text-[38px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[50px] lg:text-[58px]">
                  Your balance,
                  <span className="mt-2 block font-serif font-normal italic tracking-[-0.055em] text-[#A1A1AA]">
                    clearly accounted for.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-[14px] leading-7 text-[#92949B] sm:text-[15px]">
                  Welcome back, {firstName}. Review your available balance and
                  keep track of your billing activity in one place.
                </p>
              </div>

              
              <div className="hidden items-center gap-3 sm:flex">
                <button
                  type="button"
                  onClick={() => navigate("/billing/history")}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-[#D4D4D8] transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 sm:px-5"
                >
                  <FiClock size={14} />
                  Transaction history
                </button>

                <button
                  type="button"
                  onClick={""}
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-semibold text-[#17191C] shadow-[0_10px_30px_rgba(255,255,255,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(255,255,255,0.12)] focus:outline-none focus:ring-2 focus:ring-white/30 sm:px-5"
                >
                  <FiPlus
                    size={14}
                    className={""}
                  />
                  Add Balance
                </button>
              </div>
            </motion.section>

            {/* Error state */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-[#D4D4D8]"
              >
                <FiAlertCircle
                  className="mt-0.5 shrink-0 text-[#A1A1AA]"
                  size={16}
                />

                <span className="min-w-0 flex-1 leading-6">{error}</span>

                <button
                  type="button"
                  onClick={() => void loadBilling()}
                  className="shrink-0 text-xs font-semibold text-white underline underline-offset-4"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Billing overview */}
            <section aria-label="Billing overview" className="mb-9">
              <div className="grid gap-3 md:grid-cols-3">
                {stats.map(({ label, value, detail, Icon }, index) => (
                  <motion.div
                    key={label}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.055,
                      ease,
                    }}
                  >
                    <Surface className="h-full p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#777A82]">
                          {label}
                        </p>

                        <Icon size={17} className="shrink-0 text-[#92949B]" />
                      </div>

                      <p className="mt-5 break-words text-[30px] font-semibold tracking-[-0.05em] sm:text-[36px]">
                        {loading ? (
                          <span className="inline-block h-9 w-24 animate-pulse rounded-lg bg-white/[0.08]" />
                        ) : (
                          value
                        )}
                      </p>

                      <p className="mt-2 text-[11px] leading-5 text-[#71747C]">
                        {detail}
                      </p>
                    </Surface>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Recent transactions */}

            <section className="mb-10">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div className="w-full text-center sm:w-auto sm:text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                    Account activity
                  </p>

                  <h2 className="mt-2 text-[25px] font-semibold tracking-[-0.04em] sm:text-[29px]">
                    Recent transactions.
                  </h2>
                </div>
              </div>

              <Surface>
                {loading ? (
                  <div className="divide-y divide-white/[0.07] px-5 sm:px-7">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center gap-4 py-5">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.06]" />

                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-3 w-40 animate-pulse rounded bg-white/[0.07]" />
                          <div className="h-2.5 w-28 animate-pulse rounded bg-white/[0.04]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="px-5 sm:px-7">
                    {transactions.map((transaction, index) => (
                      <div
                        key={
                          transaction?._id ||
                          transaction?.transactionId ||
                          `${transaction?.createdAt || "transaction"}-${index}`
                        }
                        className={`flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between ${
                          index ? "border-t border-white/[0.07]" : ""
                        }`}
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-[#92949B]">
                            <FiCreditCard size={16} />
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#D4D4D8]">
                              {transaction?.description ||
                                transaction?.planName ||
                                transaction?.transactionId ||
                                "Balance purchase"}
                            </p>

                            <p className="mt-1.5 text-[10px] text-[#777B85]">
                              {formatDate(
                                transaction?.createdAt ||
                                  transaction?.updatedAt,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 pl-[52px] sm:pl-0">
                          <StatusLabel status={getStatus(transaction)} />

                          <span className="text-sm font-semibold text-white">
                            {formatInrFromPaise(
                              transaction?.amount ?? transaction?.amountInPaise,
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-12 sm:px-7">
                    <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.025] text-[#858994]">
                        <FiCreditCard size={16} />
                      </span>

                      <div>
                        <h3 className="text-sm font-semibold text-[#D4D4D8]">
                          Your transactions will appear here.
                        </h3>

                        <p className="mx-auto mt-1 max-w-xl text-xs leading-5 text-[#777B85] sm:mx-0">
                          Once you have billing activity, you can review its
                          amount, date, and payment status here.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Surface>
            </section>

            {/* Billing footer */}

            <footer className="flex flex-col items-center gap-4 border-t border-white/[0.08] pt-7 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
              <div className="w-full sm:w-auto">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                  Billing overview
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] sm:text-[23px]">
                  Your account, at a glance.
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-[#777B85] sm:mx-0">
                  Your available balance and recent payment activity are
                  displayed here.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadBilling()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 self-center rounded-full bg-white px-5 py-3 text-xs font-semibold text-[#17191C] transition hover:-translate-y-0.5 hover:bg-[#E8E8EB] disabled:cursor-not-allowed disabled:opacity-50 sm:self-start"
              >
                <FiRefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh billing
                <FiArrowRight size={14} />
              </button>
            </footer>
          </div>
        </main>
      </div>

      {/* Mobile bottom actions */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-[#111315]/90 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/billing/history")}
            className="group flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-semibold text-[#D4D4D8] transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <FiClock size={14} />
            <span>History</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/billing/add-balance")}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 py-3 text-xs font-semibold text-[#17191C] shadow-[0_-10px_35px_rgba(0,0,0,0.22)] transition duration-200 hover:bg-[#E8E8EB] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <FiPlus size={15} />
            <span>Add balance</span>
            <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
