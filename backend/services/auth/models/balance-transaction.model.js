import mongoose from "mongoose";

const balanceTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    transactionId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Transaction amount must be a safe integer.",
      },
    },

    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Human-readable service responsible for the deduction.
    // Examples: "Resume Scorer", "Interview".
    serviceName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },

    // The particular resource/session used by the service.
    // Examples: uploaded resume filename or interview name.
    resourceName: {
      type: String,
      trim: true,
      maxlength: 255,
      default: null,
    },

    // Optional identifier for finding the associated resource/report.
    resourceId: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },

    // Optional internal route to the related report.
    // The application must verify that the report exists and is
    // accessible to the authenticated user before navigating.
    reportUrl: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Balance must be a safe integer.",
      },
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate processing of the same transaction for a user.
balanceTransactionSchema.index(
  { userId: 1, transactionId: 1 },
  { unique: true },
);

const BalanceTransaction = mongoose.model(
  "BalanceTransaction",
  balanceTransactionSchema,
);

export default BalanceTransaction;