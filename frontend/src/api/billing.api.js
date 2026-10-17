import api from "../utils/axios";

// BILLING SUMMARY

/**
 * Get the authenticated user's billing summary.
 * GET /api/billing/summary
 */
export const getBillingSummary = async () => {
  const response = await api.get("/api/billing/summary");

  return response.data;
};

// TRANSACTION HISTORY

/**
 * Get billing transactions with pagination.
 *
 * GET /api/billing/transactions?page=1&pageSize=10
 */
export const getBillingTransactions = async ({
  page = 1,
  pageSize = 10,
} = {}) => {
  const response = await api.get("/api/billing/transactions", {
    params: {
      page,
      pageSize,
    },
  });

  return response.data;
};

/**
 * Get one transaction by its ID.
 *
 * GET /api/billing/transactions/:transactionId
 */
export const getBillingTransactionById = async (transactionId) => {
  if (typeof transactionId !== "string" || !transactionId.trim()) {
    throw new Error("Transaction ID is required.");
  }

  const response = await api.get(
    `/api/billing/transactions/${encodeURIComponent(transactionId.trim())}`,
  );

  return response.data;
};

// PAYMENT ORDER

/**
 * Create a payment order.
 *
 * POST /api/billing/orders
 */
export const createBillingOrder = async (orderData) => {
  const response = await api.post("/api/billing/orders", orderData);

  return response.data;
};

// PAYMENT VERIFICATION

/**
 * Verify the payment with the backend.
 *
 * POST /api/billing/verify
 */
export const verifyBillingPayment = async (verificationData) => {
  const response = await api.post("/api/billing/verify", verificationData);

  return response.data;
};
