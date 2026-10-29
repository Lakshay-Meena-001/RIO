import mongoose from "mongoose";

import BillingTransaction from "../models/billing-transaction.model.js";
import { getRazorpayKeyId, getRazorpayClient } from "../config/razorpay.js";
import { settleCapturedPayment } from "./payment-settlement.service.js";
import {
  hasOnlyFailedAttempts,
  hasUnresolvedAttempts,
} from "./payment-state.js";
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
    if (capturedPayment) {
      const confirmedPayment = await getRazorpayClient().payments.fetch(
        capturedPayment.id,
      );
      await settleCapturedPayment({
        transaction: expiredPendingTransaction,
        payment: confirmedPayment,
      });
      throw new AppError(
        "The previous payment completed successfully. Refresh your balance.",
        409,
        "PAYMENT_ALREADY_COMPLETED",
      );
    }

    const unresolvedPayment = hasUnresolvedAttempts(payments);
    if (
      unresolvedPayment ||
      (payments.length > 0 && !hasOnlyFailedAttempts(payments))
    ) {
      throw new AppError(
        "The earlier payment is still being reconciled. Please try again shortly.",
        409,
        "PAYMENT_RECONCILIATION_REQUIRED",
      );
    }

    // No attempts or all attempts failed: the old order is no longer
    // offered for checkout. A later provider capture can still be settled safely.
    await BillingTransaction.findOneAndUpdate(
      {
        _id: expiredPendingTransaction._id,
        status: BILLING_TRANSACTION_STATUS.PENDING,
      },
      {
        $set: {
          status: BILLING_TRANSACTION_STATUS.EXPIRED,
          failureCode: "PAYMENT_WINDOW_EXPIRED",
        },
      },
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
    await BillingTransaction.updateOne(
      {
        _id: transaction._id,
        status: BILLING_TRANSACTION_STATUS.CREATED,
        $or: [
          { providerOrderId: { $exists: false } },
          { providerOrderId: null },
        ],
      },
      {
        $set: {
          status: BILLING_TRANSACTION_STATUS.FAILED,
          failureCode: "PAYMENT_ORDER_CREATION_FAILED",
        },
      },
    );

    throw new AppError(
      "Could not create the payment order. No checkout was started; you can safely try again.",
      502,
      "PAYMENT_ORDER_CREATION_FAILED",
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

export const getPendingBillingPayment = async ({ userId }) => {
  const transaction = await BillingTransaction.findOne({
    userId,
    type: BILLING_TRANSACTION_TYPE.BALANCE_PURCHASE,
    provider: PAYMENT_PROVIDER.RAZORPAY,
    status: {
      $in: [
        BILLING_TRANSACTION_STATUS.CREATED,
        BILLING_TRANSACTION_STATUS.PENDING,
      ],
    },
  }).sort({ createdAt: -1 });

  if (!transaction) return null;

  const now = new Date();
  if (transaction.expiresAt && transaction.expiresAt <= now) {
    if (!transaction.providerOrderId) {
      // The order ID was never persisted or returned to the client, so checkout
      // could not have started. Release the user's active-payment lock.
      await BillingTransaction.updateOne(
        {
          _id: transaction._id,
          status: BILLING_TRANSACTION_STATUS.CREATED,
          $or: [
            { providerOrderId: { $exists: false } },
            { providerOrderId: null },
          ],
        },
        {
          $set: {
            status: BILLING_TRANSACTION_STATUS.FAILED,
            failureCode: "PAYMENT_ORDER_CREATION_FAILED",
          },
        },
      );
      return null;
    }

    const payments = await fetchProviderOrderPayments(
      transaction.providerOrderId,
    );
    const capturedPayment = payments.find(
      (payment) => payment.status === "captured",
    );
    if (capturedPayment) {
      const confirmedPayment = await getRazorpayClient().payments.fetch(
        capturedPayment.id,
      );
      await settleCapturedPayment({ transaction, payment: confirmedPayment });
      return null;
    }
    if (hasUnresolvedAttempts(payments)) {
      // Never mark a captured or unresolved gateway attempt as failed.
      return null;
    }

    if (payments.length === 0 || hasOnlyFailedAttempts(payments)) {
      const failed = await BillingTransaction.findOneAndUpdate(
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
            status: BILLING_TRANSACTION_STATUS.EXPIRED,
            failureCode: "PAYMENT_WINDOW_EXPIRED",
            expiredAt: now,
          },
        },
        { new: true },
      );
      if (failed) return null;
    }
    return null;
  }

  return {
    transactionId: transaction.transactionId,
    orderId: transaction.providerOrderId,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    expiresAt: transaction.expiresAt,
  };
};

export const continueBillingPayment = async ({ userId, transactionId }) => {
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
    transaction.status !== BILLING_TRANSACTION_STATUS.PENDING ||
    !transaction.providerOrderId
  ) {
    throw new AppError(
      "This payment can no longer be continued",
      409,
      "PAYMENT_NOT_CONTINUABLE",
    );
  }

  if (transaction.expiresAt && transaction.expiresAt <= new Date()) {
    throw new AppError(
      "The 10-minute payment window has expired. Refresh billing status before retrying.",
      409,
      "PAYMENT_WINDOW_EXPIRED",
    );
  }

  const payments = await fetchProviderOrderPayments(
    transaction.providerOrderId,
  );
  if (payments.some((payment) => payment.status === "captured")) {
    throw new AppError(
      "Payment was captured. Refresh billing status.",
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

  return {
    transactionId: transaction.transactionId,
    orderId: transaction.providerOrderId,
    amount: transaction.amount,
    currency: transaction.currency,
    keyId: getRazorpayKeyId(),
    expiresAt: transaction.expiresAt,
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

  // An empty attempt list is possible when checkout is closed
  // before the user starts a payment. Failed attempts are also safe
  // to expire. Do not expire any other unresolved gateway state.
  if (payments.length > 0 && !hasOnlyFailedAttempts(payments)) {
    throw new AppError(
      "Payment status is still being reconciled. Please refresh and try again.",
      409,
      "PAYMENT_RECONCILIATION_REQUIRED",
    );
  }

  const now = new Date();

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
        status: BILLING_TRANSACTION_STATUS.EXPIRED,
        cancelRequestedAt: now,
        expiredAt: now,
        failureCode: "PAYMENT_WINDOW_EXPIRED",
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
    expiredAt: updated.expiredAt,
    cancellationConfirmed: true,
  };
};
