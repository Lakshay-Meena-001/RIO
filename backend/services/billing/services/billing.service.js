import mongoose from "mongoose";

import BillingTransaction from "../models/billing-transaction.model.js";
import { getActiveBillingPlan } from "../config/billing-plans.js";
import { getRazorpayKeyId } from "../config/razorpay.js";
import { createProviderOrder } from "./razorpay.service.js";
import {
  BILLING_TRANSACTION_STATUS,
  BILLING_TRANSACTION_TYPE,
  PAYMENT_PROVIDER,
  BILLING_CURRENCY,
} from "../constants/billing.constants.js";
import AppError from "../utils/AppError.js";

export const createBillingOrder = async ({ userId, planId }) => {
  if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
    throw new AppError(
      "A valid authenticated user is required",
      401,
      "INVALID_USER_IDENTITY",
    );
  }

  const plan = getActiveBillingPlan(planId);

  if (!plan) {
    throw new AppError(
      "The selected billing plan is unavailable",
      400,
      "INVALID_BILLING_PLAN",
    );
  }

  // Validate public checkout configuration before creating a record.
  const keyId = getRazorpayKeyId();

  const transaction = await BillingTransaction.create({
    userId,
    type: BILLING_TRANSACTION_TYPE.BALANCE_PURCHASE,
    provider: PAYMENT_PROVIDER.RAZORPAY,
    planId: plan.id,
    amount: plan.amount,
    currency: BILLING_CURRENCY,
    balanceCredit: plan.balanceCredit,
    status: BILLING_TRANSACTION_STATUS.CREATED,
    balanceCreditStatus: "pending",
  });

  let providerOrder;

  try {
    providerOrder = await createProviderOrder({
      amount: transaction.amount,
      currency: transaction.currency,
      receipt: transaction.transactionId,
      notes: {
        transactionId: transaction.transactionId,
        userId: transaction.userId.toString(),
        planId: transaction.planId,
      },
    });
  } catch (error) {
    transaction.status = BILLING_TRANSACTION_STATUS.FAILED;
    transaction.failureCode = "PAYMENT_ORDER_CREATION_FAILED";

    try {
      await transaction.save();
    } catch (saveError) {
      console.error(
        "Could not persist billing order failure status:",
        saveError.message,
      );
    }

    throw new AppError(
      "Unable to create a payment order. Please try again.",
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
    plan: {
      id: plan.id,
      name: plan.name,
      balanceCredit: plan.balanceCredit,
    },
    keyId,
  };
};
