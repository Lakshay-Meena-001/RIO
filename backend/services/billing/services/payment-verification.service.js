import mongoose from "mongoose";

import BillingTransaction from "../models/billing-transaction.model.js";
import { getRazorpayClient } from "../config/razorpay.js";
import { verifyPaymentSignature } from "./razorpay.service.js";
import { creditUserBalance } from "./wallet.service.js";
import {
  BILLING_TRANSACTION_STATUS,
  PAYMENT_PROVIDER,
} from "../constants/billing.constants.js";
import AppError from "../utils/AppError.js";

const creditPaidTransactionBalance = async (transaction) => {
  // Already completed: do not issue another credit request.
  if (transaction.balanceCreditStatus === "completed") {
    return;
  }

  try {
    await creditUserBalance({
      userId: transaction.userId.toString(),
      transactionId: transaction.transactionId,
      amount: transaction.balanceCredit,
    });
  } catch {
    await BillingTransaction.updateOne(
      {
        _id: transaction._id,
        status: BILLING_TRANSACTION_STATUS.PAID,
        balanceCreditStatus: { $ne: "completed" },
      },
      {
        $set: {
          balanceCreditStatus: "failed",
          failureCode: "BALANCE_CREDIT_FAILED",
        },
      },
    );

    throw new AppError(
      "Payment succeeded, but balance credit needs recovery",
      503,
      "BALANCE_CREDIT_RECOVERY_REQUIRED",
    );
  }

  await BillingTransaction.updateOne(
    {
      _id: transaction._id,
      status: BILLING_TRANSACTION_STATUS.PAID,
      providerPaymentId: transaction.providerPaymentId,
      balanceCreditStatus: { $ne: "completed" },
    },
    {
      $set: {
        balanceCreditStatus: "completed",
        balanceCreditedAt: new Date(),
        failureCode: null,
      },
    },
    {
      runValidators: true,
    },
  );

  const latestTransaction = await BillingTransaction.findById(
    transaction._id,
  ).select("balanceCreditStatus");

  if (latestTransaction?.balanceCreditStatus !== "completed") {
    throw new AppError(
      "Balance credit result needs recovery",
      503,
      "BALANCE_CREDIT_RECOVERY_REQUIRED",
    );
  }
};

export const verifyBillingPayment = async ({
  userId,
  orderId,
  paymentId,
  signature,
}) => {
  if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
    throw new AppError(
      "A valid authenticated user is required",
      401,
      "INVALID_USER_IDENTITY",
    );
  }

  if (
    typeof orderId !== "string" ||
    orderId.trim().length === 0 ||
    typeof paymentId !== "string" ||
    paymentId.trim().length === 0 ||
    typeof signature !== "string"
  ) {
    throw new AppError(
      "Payment verification details are invalid",
      400,
      "INVALID_PAYMENT_VERIFICATION",
    );
  }

  const transaction = await BillingTransaction.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    provider: PAYMENT_PROVIDER.RAZORPAY,
    providerOrderId: orderId,
  });

  if (!transaction) {
    throw new AppError(
      "Billing transaction not found",
      404,
      "BILLING_TRANSACTION_NOT_FOUND",
    );
  }

  const signatureIsValid = verifyPaymentSignature({
    orderId,
    paymentId,
    signature,
  });

  if (!signatureIsValid) {
    throw new AppError(
      "Payment signature verification failed",
      400,
      "INVALID_PAYMENT_SIGNATURE",
    );
  }

  let payment;

  try {
    const razorpay = getRazorpayClient();
    payment = await razorpay.payments.fetch(paymentId);
  } catch {
    throw new AppError(
      "Unable to confirm payment details with the provider",
      502,
      "PAYMENT_LOOKUP_FAILED",
    );
  }

  if (
    payment.order_id !== transaction.providerOrderId ||
    payment.id !== paymentId
  ) {
    throw new AppError(
      "Payment does not match the billing transaction",
      400,
      "PAYMENT_TRANSACTION_MISMATCH",
    );
  }

  if (
    payment.amount !== transaction.amount ||
    payment.currency !== transaction.currency
  ) {
    throw new AppError(
      "Payment amount or currency does not match the order",
      400,
      "PAYMENT_AMOUNT_MISMATCH",
    );
  }

  if (payment.status !== "captured") {
    throw new AppError(
      "Payment has not been captured",
      409,
      "PAYMENT_NOT_CAPTURED",
    );
  }

  // Retry recovery for a previously paid transaction.
  if (transaction.status === BILLING_TRANSACTION_STATUS.PAID) {
    if (transaction.providerPaymentId !== paymentId) {
      throw new AppError(
        "A different payment is already associated with this transaction",
        409,
        "PAYMENT_ALREADY_ASSOCIATED",
      );
    }

    await creditPaidTransactionBalance(transaction);

    const recoveredTransaction = await BillingTransaction.findById(
      transaction._id,
    ).select("transactionId status balanceCreditStatus");

    return {
      transactionId: recoveredTransaction.transactionId,
      status: recoveredTransaction.status,
      balanceCreditStatus: recoveredTransaction.balanceCreditStatus,
    };
  }

  if (
    transaction.status !== BILLING_TRANSACTION_STATUS.PENDING &&
    transaction.status !== BILLING_TRANSACTION_STATUS.EXPIRED
  ) {
    throw new AppError(
      "Billing transaction is not eligible for payment verification",
      409,
      "BILLING_TRANSACTION_NOT_ELIGIBLE",
    );
  }

  // Atomically claim the pending transaction.
  const claimedTransaction = await BillingTransaction.findOneAndUpdate(
    {
      _id: transaction._id,
      status: {
        $in: [
          BILLING_TRANSACTION_STATUS.PENDING,
          BILLING_TRANSACTION_STATUS.EXPIRED,
        ],
      },
    },
    {
      $set: {
        status: BILLING_TRANSACTION_STATUS.PAID,
        providerPaymentId: paymentId,
        paidAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!claimedTransaction) {
    throw new AppError(
      "Payment verification is already being processed",
      409,
      "PAYMENT_VERIFICATION_CONFLICT",
    );
  }

  await creditPaidTransactionBalance(claimedTransaction);

  const completedTransaction = await BillingTransaction.findById(
    claimedTransaction._id,
  ).select("transactionId status balanceCreditStatus");

  return {
    transactionId: completedTransaction.transactionId,
    status: completedTransaction.status,
    balanceCreditStatus: completedTransaction.balanceCreditStatus,
  };
};
