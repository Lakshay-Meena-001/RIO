export const BILLING_TRANSACTION_STATUS = Object.freeze({
  CREATED: "created",
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  EXPIRED: "expired",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
});

export const BILLING_TRANSACTION_TYPE = Object.freeze({
  BALANCE_PURCHASE: "balance_purchase",
});

export const PAYMENT_PROVIDER = Object.freeze({
  RAZORPAY: "razorpay",
});

export const BILLING_CURRENCY = "INR";

export const BILLING_LIMITS = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
});

export const BILLING_ROUTES = Object.freeze({
  SUMMARY: "/summary",
  TRANSACTIONS: "/transactions",
  ORDERS: "/orders",
  VERIFY: "/verify",
  WEBHOOK: "/webhook",
});
