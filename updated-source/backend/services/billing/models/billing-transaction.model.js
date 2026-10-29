import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

import {
  BILLING_TRANSACTION_STATUS,
  BILLING_TRANSACTION_TYPE,
  PAYMENT_PROVIDER,
  BILLING_CURRENCY,
} from "../constants/billing.constants.js";

const billingTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      default: () => randomUUID(),
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      immutable: true,
    },

    type: {
      type: String,
      required: true,
      enum: Object.values(BILLING_TRANSACTION_TYPE),
      default: BILLING_TRANSACTION_TYPE.BALANCE_PURCHASE,
      immutable: true,
    },

    provider: {
      type: String,
      required: true,
      enum: Object.values(PAYMENT_PROVIDER),
      default: PAYMENT_PROVIDER.RAZORPAY,
      immutable: true,
    },

    planId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      immutable: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Amount must be a safe integer in paise",
      },
      immutable: true,
    },

    currency: {
      type: String,
      required: true,
      enum: [BILLING_CURRENCY],
      default: BILLING_CURRENCY,
      immutable: true,
    },

    balanceCredit: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Balance credit must be a positive safe integer",
      },
      immutable: true,
    },

    status: {
      type: String,
      required: true,
      enum: Object.values(BILLING_TRANSACTION_STATUS),
      default: BILLING_TRANSACTION_STATUS.CREATED,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    cancelRequestedAt: {
      type: Date,
      default: null,
    },

    expiredAt: {
      type: Date,
      default: null,
    },

    balanceCreditStatus: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    providerOrderId: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },

    providerPaymentId: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    balanceCreditedAt: {
      type: Date,
      default: null,
    },

    failureCode: {
      type: String,
      default: null,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  },
);

// Efficient, newest-first billing history for each user.
billingTransactionSchema.index({
  userId: 1,
  createdAt: -1,
});

// Find transactions whose payment succeeded but balance credit
// still needs recovery.
billingTransactionSchema.index({
  status: 1,
  balanceCreditStatus: 1,
});

billingTransactionSchema.index(
  {
    userId: 1,
    type: 1,
    provider: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [
          BILLING_TRANSACTION_STATUS.CREATED,
          BILLING_TRANSACTION_STATUS.PENDING,
        ],
      },
    },
    name: "one_active_billing_transaction_per_user",
  },
);

const BillingTransaction =
  mongoose.models.BillingTransaction ||
  mongoose.model("BillingTransaction", billingTransactionSchema);

export default BillingTransaction;
