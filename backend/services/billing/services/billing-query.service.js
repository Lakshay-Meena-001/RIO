import mongoose from "mongoose";

import BillingTransaction from "../models/billing-transaction.model.js";
import AppError from "../utils/AppError.js";

const AUTH_REQUEST_TIMEOUT_MS = 10_000;
const AUTH_PAGE_SIZE = 100;

const toSafeAmount = (value) =>
  Number.isSafeInteger(value) && value >= 0 ? value : 0;

const getAuthenticatedUserId = (userId) => {
  if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
    throw new AppError(
      "A valid authenticated user is required",
      401,
      "INVALID_USER_IDENTITY",
    );
  }

  return new mongoose.Types.ObjectId(userId);
};

const getAuthServiceConfig = () => {
  const authServiceUrl = process.env.AUTH_SERVICE_URL?.trim();
  const internalSecret = process.env.AUTH_INTERNAL_SECRET?.trim();

  if (!authServiceUrl || !internalSecret) {
    throw new AppError(
      "Auth Service integration is not configured",
      500,
      "AUTH_SERVICE_CONFIGURATION_ERROR",
    );
  }

  return { authServiceUrl, internalSecret };
};

/**
 * Read the Auth Service's persisted balance transactions.
 *
 * The endpoint is internal and must be protected by
 * internalAuthMiddleware. Never accept the user ID from the
 * request body; use the trusted service-to-service header.
 */
const fetchAuthBalanceTransactions = async (userId, requiredCount) => {
  const { authServiceUrl, internalSecret } = getAuthServiceConfig();
  const endpoint = new URL("/internal/balance-transactions", authServiceUrl);

  const transactions = [];
  let total = 0;
  let page = 1;

  do {
    let response;

    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-service-secret": internalSecret,
          "x-user-id": userId,
        },
        body: JSON.stringify({
          page,
          pageSize: AUTH_PAGE_SIZE,
        }),
        signal: AbortSignal.timeout(AUTH_REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new AppError(
        "Could not retrieve balance transaction history",
        503,
        "BALANCE_HISTORY_UNAVAILABLE",
      );
    }

    let result;

    try {
      result = await response.json();
    } catch {
      throw new AppError(
        "Auth Service returned an invalid transaction history response",
        502,
        "INVALID_BALANCE_HISTORY_RESPONSE",
      );
    }

    if (!response.ok || result?.success !== true) {
      throw new AppError(
        "Auth Service could not retrieve balance transaction history",
        502,
        "BALANCE_HISTORY_LOOKUP_FAILED",
      );
    }

    const data = result.data;
    const batch = data?.transactions;
    const pagination = data?.pagination;

    if (
      !Array.isArray(batch) ||
      !pagination ||
      !Number.isSafeInteger(pagination.total) ||
      pagination.total < 0
    ) {
      throw new AppError(
        "Auth Service returned an invalid transaction history payload",
        502,
        "INVALID_BALANCE_HISTORY_RESPONSE",
      );
    }

    if (page === 1) {
      total = pagination.total;
    }

    transactions.push(...batch);
    page += 1;

    // Fetch enough newest-first records to calculate this global page.
    // Stop early when the source has no more records.
  } while (
    transactions.length < Math.min(requiredCount, total) &&
    transactions.length < total
  );

  return {
    transactions,
    total,
  };
};

const toBalanceHistoryItem = (transaction) => ({
  transactionId: transaction.transactionId,
  source: "balance",
  action: transaction.action,
  type: "deduction",
  status: "completed",

  // This amount is in RIO balance units, not paise.
  amount: transaction.amount,
  amountUnit: "balance-unit",

  balanceAfter: transaction.balanceAfter,
  createdAt: transaction.createdAt,
});

const toBillingHistoryItem = (transaction) => ({
  transactionId: transaction.transactionId,
  source: "billing",
  action: "billing-balance-credit",
  type: transaction.type,
  planId: transaction.planId,
  status: transaction.status,
  balanceCreditStatus: transaction.balanceCreditStatus,

  // Razorpay payment amount is stored in paise.
  amount: transaction.amount,
  amountUnit: "paise",

  // Balance credit uses RIO balance units.
  balanceCredit: transaction.balanceCredit,
  balanceCreditUnit: "balance-unit",

  currency: transaction.currency,
  providerOrderId: transaction.providerOrderId,
  providerPaymentId: transaction.providerPaymentId,
  paidAt: transaction.paidAt,
  balanceCreditedAt: transaction.balanceCreditedAt,
  createdAt: transaction.createdAt,
});

const getHistoryTimestamp = (transaction) => {
  const timestamp = new Date(transaction.createdAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const compareNewestFirst = (a, b) => {
  const timeDifference = getHistoryTimestamp(b) - getHistoryTimestamp(a);

  if (timeDifference !== 0) {
    return timeDifference;
  }

  return String(b.transactionId).localeCompare(String(a.transactionId));
};

export const getBillingSummary = async (userId) => {
  const authenticatedUserId = getAuthenticatedUserId(userId);

  const [summary, userBalance, balanceHistory] = await Promise.all([
    BillingTransaction.aggregate([
      {
        $match: {
          userId: authenticatedUserId,
        },
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          successfulPayments: {
            $sum: {
              $cond: [{ $eq: ["$status", "paid"] }, 1, 0],
            },
          },
          totalPaidAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0],
            },
          },
          pendingPayments: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          failedPayments: {
            $sum: {
              $cond: [{ $eq: ["$status", "failed"] }, 1, 0],
            },
          },
        },
      },
    ]),
    fetchCurrentBalance(userId),
    fetchAuthBalanceTransactions(userId, 0),
  ]);

  const result = summary[0] ?? {
    totalTransactions: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    totalPaidAmount: 0,
  };

  // Auth history excludes billing-balance-credit entries.
  // Count these separately so top-ups aren't double-counted.
  const deductionCount = balanceHistory.total;

  return {
    // All top-up records plus persisted balance transactions.
    totalTransactions: result.totalTransactions + deductionCount,

    // Actual successful Razorpay top-up payments only.
    successfulPayments: result.successfulPayments,
    successfulTransactions: result.successfulPayments + deductionCount,

    pendingPayments: result.pendingPayments,
    failedPayments: result.failedPayments,

    // BillingTransaction.amount is stored in paise.
    totalPaidAmount: toSafeAmount(result.totalPaidAmount),

    currency: "INR",
    currentBalance: userBalance,
  };
};

const fetchCurrentBalance = async (userId) => {
  const { authServiceUrl, internalSecret } = getAuthServiceConfig();
  const endpoint = new URL("/internal/user-balance", authServiceUrl);

  let response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-service-secret": internalSecret,
        "x-user-id": userId,
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(AUTH_REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new AppError(
      "Could not retrieve the current balance",
      503,
      "CURRENT_BALANCE_UNAVAILABLE",
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new AppError(
      "Auth Service returned an invalid balance response",
      502,
      "INVALID_BALANCE_RESPONSE",
    );
  }

  if (
    !response.ok ||
    result?.success !== true ||
    !Number.isSafeInteger(result.balance) ||
    result.balance < 0
  ) {
    throw new AppError(
      "Auth Service could not retrieve the current balance",
      502,
      "CURRENT_BALANCE_LOOKUP_FAILED",
    );
  }

  return result.balance;
};

export const getBillingTransactions = async (userId, query) => {
  const authenticatedUserId = getAuthenticatedUserId(userId);
  const { page, pageSize, skip } = query;

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    !Number.isSafeInteger(skip) ||
    skip < 0
  ) {
    throw new AppError(
      "Invalid pagination parameters",
      400,
      "INVALID_PAGINATION",
    );
  }

  const requiredCount = skip + pageSize;

  if (!Number.isSafeInteger(requiredCount)) {
    throw new AppError(
      "Pagination parameters are too large",
      400,
      "INVALID_PAGINATION",
    );
  }

  const billingFilter = {
    userId: authenticatedUserId,
  };

  const [billingRows, billingTotal, balanceHistory] = await Promise.all([
    BillingTransaction.find(billingFilter)
      .select(
        [
          "transactionId",
          "type",
          "planId",
          "amount",
          "currency",
          "balanceCredit",
          "status",
          "balanceCreditStatus",
          "providerOrderId",
          "providerPaymentId",
          "paidAt",
          "balanceCreditedAt",
          "createdAt",
        ].join(" "),
      )
      .sort({ createdAt: -1, _id: -1 })
      .limit(requiredCount)
      .lean(),

    BillingTransaction.countDocuments(billingFilter),

    fetchAuthBalanceTransactions(userId, requiredCount),
  ]);

  // Top-ups are represented by BillingTransaction. Auth's endpoint
  // excludes billing-balance-credit, preventing duplicate history items.
  const merged = [
    ...billingRows.map(toBillingHistoryItem),
    ...balanceHistory.transactions.map(toBalanceHistoryItem),
  ].sort(compareNewestFirst);

  const transactions = merged.slice(skip, requiredCount);
  const total = billingTotal + balanceHistory.total;

  return {
    transactions,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export const getBillingTransactionById = async (userId, transactionId) => {
  const authenticatedUserId = getAuthenticatedUserId(userId);

  if (typeof transactionId !== "string" || transactionId.trim().length === 0) {
    throw new AppError(
      "A valid transaction ID is required",
      400,
      "INVALID_TRANSACTION_ID",
    );
  }

  const transaction = await BillingTransaction.findOne({
    userId: authenticatedUserId,
    transactionId: transactionId.trim(),
  })
    .select(
      [
        "transactionId",
        "type",
        "provider",
        "planId",
        "amount",
        "currency",
        "balanceCredit",
        "status",
        "balanceCreditStatus",
        "providerOrderId",
        "providerPaymentId",
        "paidAt",
        "balanceCreditedAt",
        "failureCode",
        "createdAt",
        "updatedAt",
      ].join(" "),
    )
    .lean();

  if (!transaction) {
    throw new AppError(
      "Billing transaction not found",
      404,
      "BILLING_TRANSACTION_NOT_FOUND",
    );
  }

  return transaction;
};
