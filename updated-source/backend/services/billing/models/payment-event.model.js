import mongoose from "mongoose";

const paymentEventSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      enum: ["razorpay"],
      default: "razorpay",
      immutable: true,
    },

    providerEventId: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
      maxlength: 200,
    },

    eventType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      immutable: true,
    },

    processingStatus: {
      type: String,
      required: true,
      enum: ["received", "processing", "processed", "failed"],
      default: "received",
    },

    attempts: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    lastErrorCode: {
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

// One provider event must correspond to only one stored event.
paymentEventSchema.index(
  {
    provider: 1,
    providerEventId: 1,
  },
  {
    unique: true,
    name: "unique_provider_event",
  },
);

// Helps locate events that need retry or recovery.
paymentEventSchema.index({
  processingStatus: 1,
  updatedAt: 1,
});

const PaymentEvent =
  mongoose.models.PaymentEvent ||
  mongoose.model("PaymentEvent", paymentEventSchema);

export default PaymentEvent;
