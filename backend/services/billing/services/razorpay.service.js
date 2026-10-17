import crypto from "node:crypto";

import { getRazorpayClient } from "../config/razorpay.js";
import AppError from "../utils/AppError.js";

const isPositiveSafeInteger = (value) =>
  Number.isSafeInteger(value) && value > 0;

export const createProviderOrder = async ({
  amount,
  currency,
  receipt,
  notes = {},
}) => {
  if (!isPositiveSafeInteger(amount)) {
    throw new AppError(
      "Order amount must be a positive safe integer in paise",
      400,
      "INVALID_ORDER_AMOUNT",
    );
  }

  if (currency !== "INR") {
    throw new AppError(
      "Unsupported payment currency",
      400,
      "UNSUPPORTED_CURRENCY",
    );
  }

  if (
    typeof receipt !== "string" ||
    receipt.trim().length === 0 ||
    receipt.length > 40
  ) {
    throw new AppError(
      "A valid order receipt is required",
      400,
      "INVALID_ORDER_RECEIPT",
    );
  }

  const razorpay = getRazorpayClient();

  // The amount and currency must come from trusted server-side
  // billing plan data, never directly from the client request.
  return razorpay.orders.create({
    amount,
    currency,
    receipt,
    notes,
  });
};

export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keySecret) {
    throw new AppError(
      "Razorpay payment verification is not configured",
      500,
      "PAYMENT_VERIFICATION_NOT_CONFIGURED",
    );
  }

  if (
    typeof orderId !== "string" ||
    orderId.length === 0 ||
    typeof paymentId !== "string" ||
    paymentId.length === 0 ||
    typeof signature !== "string" ||
    !/^[a-f\d]{64}$/i.test(signature)
  ) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  const receivedSignature = Buffer.from(signature, "hex");

  if (receivedSignature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedSignature, receivedSignature);
};
