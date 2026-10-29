import mongoose from "mongoose";

import BillingTransaction from "../models/billing-transaction.model.js";
import { getRazorpayClient } from "../config/razorpay.js";
import { verifyPaymentSignature } from "./razorpay.service.js";
import { settleCapturedPayment } from "./payment-settlement.service.js";
import { PAYMENT_PROVIDER } from "../constants/billing.constants.js";
import AppError from "../utils/AppError.js";

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
    !orderId.trim() ||
    typeof paymentId !== "string" ||
    !paymentId.trim() ||
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

  if (!verifyPaymentSignature({ orderId, paymentId, signature })) {
    throw new AppError(
      "Payment signature verification failed",
      400,
      "INVALID_PAYMENT_SIGNATURE",
    );
  }

  let payment;
  try {
    payment = await getRazorpayClient().payments.fetch(paymentId);
  } catch {
    throw new AppError(
      "Unable to confirm payment details with the provider",
      502,
      "PAYMENT_LOOKUP_FAILED",
    );
  }

  if (payment.order_id !== orderId || payment.id !== paymentId) {
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

  return settleCapturedPayment({ transaction, payment });
};
