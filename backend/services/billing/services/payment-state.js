// A missing payment attempt is not proof of a failed payment.
export const hasOnlyFailedAttempts = (payments) =>
  Array.isArray(payments) &&
  payments.length > 0 &&
  payments.every((payment) => payment?.status === "failed");

export const hasUnresolvedAttempts = (payments) =>
  Array.isArray(payments) &&
  payments.some((payment) => ["created", "authorized"].includes(payment?.status));

export const canExpireCheckout = (payments) =>
  Array.isArray(payments) &&
  !hasUnresolvedAttempts(payments) &&
  (payments.length === 0 || hasOnlyFailedAttempts(payments));
