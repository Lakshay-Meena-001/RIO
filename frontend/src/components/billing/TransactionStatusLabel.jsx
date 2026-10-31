import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
const PENDING_STATUSES = ["pending", "created", "processing", "authorized"];
const FAILED_STATUSES = [
  "failed",
  "failure",
  "cancelled",
  "canceled",
  "rejected",
  "refunded",
  "error",
  "expired",
];

export default function TransactionStatusLabel({ status }) {
  const normalized = String(status || "unknown").toLowerCase();
  const isPending = PENDING_STATUSES.includes(normalized);
  const isFailed = FAILED_STATUSES.includes(normalized);
  const isPaid = ["paid", "captured", "success", "succeeded"].includes(
    normalized,
  );
  const isCompleted = normalized === "completed";
  const Icon = isPending ? FiClock : isFailed ? FiXCircle : FiCheckCircle;
  const label = isPending
    ? "Pending"
    : isFailed
      ? "Failed"
      : isCompleted
        ? "Completed"
        : isPaid
          ? "Paid"
          : normalized.replaceAll("-", " ");
  const tone = isPending
    ? "border-amber-300/25 bg-amber-300/[.10] text-amber-200"
    : isFailed
      ? "border-rose-300/25 bg-rose-300/[.10] text-rose-200"
      : isCompleted
        ? "border-white/20 bg-white/[.09] text-white"
        : isPaid
          ? "border-emerald-300/25 bg-emerald-300/[.10] text-emerald-200"
          : "border-white/[.10] bg-white/[.04] text-[#B9BBC2]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${tone}`}
    >
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  );
}
