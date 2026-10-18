import mongoose from "mongoose";

import BillingTransaction from "../models/billing-transaction.model.js";
import AppError from "../utils/AppError.js";

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

export const getBillingSummary = async (userId) => {
  const authenticatedUserId = getAuthenticatedUserId(userId);

  const summary = await BillingTransaction.aggregate([
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
      },
    },
  ]);

  const result = summary[0] ?? {
    totalTransactions: 0,
    successfulPayments: 0,
    totalPaidAmount: 0,
  };

  return {
    totalTransactions: result.totalTransactions,
    successfulPayments: result.successfulPayments,
    totalPaidAmount: toSafeAmount(result.totalPaidAmount),
    currency: "INR",
  };
};

export const getBillingTransactions = async (userId, query) => {
  const authenticatedUserId = getAuthenticatedUserId(userId);

  // Pagination has already been validated by the route middleware.
  const { page, pageSize, skip } = query;

  const filter = { userId: authenticatedUserId };

  const [transactions, total] = await Promise.all([
    BillingTransaction.find(filter)
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
      .skip(skip)
      .limit(pageSize)
      .lean(),

    BillingTransaction.countDocuments(filter),
  ]);

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
