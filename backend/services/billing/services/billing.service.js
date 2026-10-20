import mongoose from "mongoose";

import BillingTransaction from "../models/billing-transaction.model.js";
import { getActiveBillingPlan } from "../config/billing-plans.js";
import { getRazorpayKeyId } from "../config/razorpay.js";
import {
  createProviderOrder,
  fetchProviderOrderPayments,
} from "./razorpay.service.js";
import {
  BILLING_TRANSACTION_STATUS,
  BILLING_TRANSACTION_TYPE,
  PAYMENT_PROVIDER,
  BILLING_CURRENCY,
} from "../constants/billing.constants.js";
import AppError from "../utils/AppError.js";

const isFinalFailedPayment = (payments) =>
  payments.length === 0 ||
  payments.every((payment) => payment.status === "failed");

export const createBillingOrder = async ({ userId, amount }) => {
  if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
    throw new AppError(
      "A valid authenticated user is required",
      401,
      "INVALID_USER_IDENTITY",
    );
  }

  if (!Number.isSafeInteger(amount) || amount < 100 || amount > 50000) {
    throw new AppError(
      "Top-up amount must be between ₹100 and ₹50,000",
      400,
      "INVALID_TOP_UP_AMOUNT",
    );
  }

  const now = new Date();

  const expiredPendingTransaction = await BillingTransaction.findOne({
    userId,
    type: BILLING_TRANSACTION_TYPE.BALANCE_PURCHASE,
    provider: PAYMENT_PROVIDER.RAZORPAY,
    status: BILLING_TRANSACTION_STATUS.PENDING,
    expiresAt: { $lte: now },
  });

  if (expiredPendingTransaction) {
    const payments = await fetchProviderOrderPayments(
      expiredPendingTransaction.providerOrderId,
    );

    const capturedPayment = payments.find(
      (payment) => payment.status === "captured",
    );

    const unresolvedPayment = payments.find(
      (payment) =>
        payment.status === "authorized" || payment.status === "created",
    );

    if (capturedPayment || unresolvedPayment) {
      throw new AppError(
        "An earlier payment needs reconciliation. Continue that payment instead of creating a new order.",
        409,
        "PAYMENT_RECONCILIATION_REQUIRED",
      );
    }

    const allAttemptsFailed = payments.every(
      (payment) => payment.status === "failed",
    );

    if (payments.length === 0 || allAttemptsFailed) {
      throw new AppError(
        "The previous payment needs reconciliation before retrying.",
        409,
        "PAYMENT_RECONCILIATION_REQUIRED",
      );
    }

    throw new AppError(
      "The earlier payment status is not final. Please retry reconciliation.",
      409,
      "PAYMENT_RECONCILIATION_REQUIRED",
    );
  }

  const activePendingTransaction = await BillingTransaction.findOne({
    userId,
    type: BILLING_TRANSACTION_TYPE.BALANCE_PURCHASE,
    provider: PAYMENT_PROVIDER.RAZORPAY,
    status: BILLING_TRANSACTION_STATUS.PENDING,
    expiresAt: { $gt: new Date() },
  });

  if (activePendingTransaction) {
    throw new AppError(
      "You already have a pending payment. Continue or cancel it before starting another.",
      409,
      "PENDING_PAYMENT_EXISTS",
    );
  }

  const keyId = getRazorpayKeyId();

  // Store the selected INR amount as the wallet credit.

  let transaction;

  try {
    transaction = await BillingTransaction.create({
      userId,
      type: BILLING_TRANSACTION_TYPE.BALANCE_PURCHASE,
      provider: PAYMENT_PROVIDER.RAZORPAY,
      planId: "custom_top_up",
      amount: amount * 100,
      currency: BILLING_CURRENCY,
      balanceCredit: amount,
      status: BILLING_TRANSACTION_STATUS.CREATED,
      balanceCreditStatus: "pending",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError(
        "You already have an active payment. Continue it before creating another.",
        409,
        "PENDING_PAYMENT_EXISTS",
      );
    }

    throw error;
  }

  let providerOrder;

  try {
    providerOrder = await createProviderOrder({
      amount: transaction.amount,
      currency: transaction.currency,
      receipt: transaction.transactionId,
      notes: {
        transactionId: transaction.transactionId,
        userId: transaction.userId.toString(),
      },
    });
  } catch {
    transaction.failureCode = "PAYMENT_ORDER_CREATION_UNCONFIRMED";
    await transaction.save();

    throw new AppError(
      "Payment order status is uncertain. Please retry reconciliation before creating another payment.",
      502,
      "PAYMENT_ORDER_CREATION_UNCONFIRMED",
    );
  }

  transaction.providerOrderId = providerOrder.id;
  transaction.status = BILLING_TRANSACTION_STATUS.PENDING;

  await transaction.save();

  return {
    transactionId: transaction.transactionId,
    orderId: providerOrder.id,
    amount: transaction.amount,
    currency: transaction.currency,
    keyId,
  };
};

export const cancelBillingPayment = async ({ userId, transactionId }) => {
  const transaction = await BillingTransaction.findOne({
    userId,
    transactionId,
    type: BILLING_TRANSACTION_TYPE.BALANCE_PURCHASE,
    provider: PAYMENT_PROVIDER.RAZORPAY,
  });

  if (!transaction) {
    throw new AppError(
      "Billing transaction not found",
      404,
      "BILLING_TRANSACTION_NOT_FOUND",
    );
  }

  if (transaction.status === BILLING_TRANSACTION_STATUS.PAID) {
    throw new AppError(
      "Payment is already completed",
      409,
      "PAYMENT_ALREADY_COMPLETED",
    );
  }

  if (
    transaction.status !== BILLING_TRANSACTION_STATUS.CREATED &&
    transaction.status !== BILLING_TRANSACTION_STATUS.PENDING
  ) {
    return {
      transactionId: transaction.transactionId,
      status: transaction.status,
    };
  }

  if (!transaction.providerOrderId) {
    throw new AppError(
      "Payment order status is uncertain; reconciliation is required",
      409,
      "PAYMENT_RECONCILIATION_REQUIRED",
    );
  }

  const payments = await fetchProviderOrderPayments(
    transaction.providerOrderId,
  );

  if (payments.some((payment) => payment.status === "captured")) {
    throw new AppError(
      "Payment was captured. Refresh billing status before retrying.",
      409,
      "PAYMENT_RECONCILIATION_REQUIRED",
    );
  }

  if (
    payments.some(
      (payment) =>
        payment.status === "authorized" || payment.status === "created",
    )
  ) {
    throw new AppError(
      "Payment is still processing. Please retry shortly.",
      409,
      "PAYMENT_RECONCILIATION_REQUIRED",
    );
  }

  if (!isFinalFailedPayment(payments)) {
    throw new AppError(
      "Payment status is uncertain; reconciliation is required",
      409,
      "PAYMENT_RECONCILIATION_REQUIRED",
    );
  }

  const updated = await BillingTransaction.findOneAndUpdate(
    {
      _id: transaction._id,
      status: {
        $in: [
          BILLING_TRANSACTION_STATUS.CREATED,
          BILLING_TRANSACTION_STATUS.PENDING,
        ],
      },
    },
    {
      $set: {
        cancelRequestedAt: new Date(),
      },
    },
    { new: true },
  );

  if (!updated) {
    throw new AppError(
      "Payment status changed. Refresh billing status.",
      409,
      "PAYMENT_STATUS_CHANGED",
    );
  }

  return {
    transactionId: updated.transactionId,
    status: updated.status,
    cancelRequestedAt: updated.cancelRequestedAt,
    cancellationConfirmed: false,
  };
};