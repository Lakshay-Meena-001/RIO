import mongoose from "mongoose";

const balanceTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
