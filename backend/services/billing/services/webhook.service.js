import BillingTransaction from "../models/billing-transaction.model.js";
import PaymentEvent from "../models/payment-event.model.js";
import { PAYMENT_PROVIDER } from "../constants/billing.constants.js";
import { settleCapturedPayment } from "./payment-settlement.service.js";
import AppError from "../utils/AppError.js";

const markEventProcessed = async (eventRecord) => {
  await PaymentEvent.updateOne(
    { _id: eventRecord._id },
    {
      $set: {
        processingStatus: "processed",
        processedAt: new Date(),
        lastErrorCode: null,
      },
      $inc: { attempts: 1 },
    },
  );
};

const markEventFailed = async (eventRecord, errorCode) => {
  await PaymentEvent.updateOne(
    { _id: eventRecord._id },
    {
      $set: { processingStatus: "failed", lastErrorCode: errorCode },
      $inc: { attempts: 1 },
    },
  );
};

export const processRazorpayWebhookEvent = async ({ eventRecord, event }) => {
  if (!eventRecord?._id || !event?.event) {
    throw new AppError(
      "A stored webhook event and valid payload are required",
      400,
      "INVALID_WEBHOOK_PROCESSING_INPUT",
    );
  }

  try {
    if (event.event !== "payment.captured") {
      await markEventProcessed(eventRecord);
      return {
        processed: true,
        balanceCredited: false,
        reason: "EVENT_RECORDED_WITHOUT_BALANCE_CHANGE",
      };
    }

    const payment = event.payload?.payment?.entity;
    if (
      !payment ||
      typeof payment.id !== "string" ||
      typeof payment.order_id !== "string" ||
      payment.status !== "captured" ||
      !Number.isSafeInteger(payment.amount) ||
      payment.amount <= 0 ||
      typeof payment.currency !== "string"
    ) {
      throw new AppError(
        "Captured payment payload is invalid",
        400,
        "INVALID_CAPTURED_PAYMENT",
      );
    }

    const transaction = await BillingTransaction.findOne({
      provider: PAYMENT_PROVIDER.RAZORPAY,
      providerOrderId: payment.order_id,
    });
    if (!transaction) {
      throw new AppError(
        "No billing transaction matches this provider order",
        404,
        "BILLING_TRANSACTION_NOT_FOUND",
      );
    }

    const result = await settleCapturedPayment({ transaction, payment });
    await markEventProcessed(eventRecord);
    return { processed: true, balanceCredited: true, ...result };
  } catch (error) {
    try {
      await markEventFailed(
        eventRecord,
        error.code || "WEBHOOK_PROCESSING_FAILED",
      );
    } catch (persistError) {
      console.error(
        "Failed to persist webhook processing status:",
        persistError.message,
      );
    }
    throw error;
  }
};
