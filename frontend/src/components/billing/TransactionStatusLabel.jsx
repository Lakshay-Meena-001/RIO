import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";

const SUCCESS_STATUSES = ["paid", "completed", "captured", "success", "succeeded"];

export default function TransactionStatusLabel({ status }) {
  const normalized = String(status || "unknown").toLowerCase();
  const isSuccess = SUCCESS_STATUSES.includes(normalized);
  const isPending = ["pending", "created", "processing"].includes(normalized);
  const Icon = isSuccess ? FiCheckCircle : isPending ? FiClock : FiXCircle;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium capitalize text-[#B9BBC2]">
      <Icon size={12} aria-hidden="true" />
      {normalized.replaceAll("-", " ")}
    </span>
  );
}
