import BillingTransaction from "../models/billing-transaction.model.js";
import PaymentEvent from "../models/payment-event.model.js";
import { creditUserBalance } from "./wallet.service.js";
import {
  BILLING_TRANSACTION_STATUS,
  PAYMENT_PROVIDER,
} from "../constants/billing.constants.js";
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
      $set: {
        processingStatus: "failed",
        lastErrorCode: errorCode,
      },
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
    // Only captured payments can trigger a balance credit.
    // Other valid events are recorded but do not change balance.
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

    if (
      transaction.amount !== payment.amount ||
      transaction.currency !== payment.currency
    ) {
      throw new AppError(
        "Captured payment does not match the stored order amount",
        400,
        "PAYMENT_AMOUNT_MISMATCH",
      );
    }

    if (
      transaction.status === BILLING_TRANSACTION_STATUS.PAID &&
      transaction.providerPaymentId !== payment.id
    ) {
      throw new AppError(
        "A different payment is already associated with this transaction",
        409,
        "PAYMENT_ALREADY_ASSOCIATED",
      );
    }

    if (
      transaction.status !== BILLING_TRANSACTION_STATUS.PENDING &&
      transaction.status !== BILLING_TRANSACTION_STATUS.EXPIRED &&
      transaction.status !== BILLING_TRANSACTION_STATUS.PAID
    ) {
      throw new AppError(
        "Billing transaction is not eligible for captured payment processing",
        409,
        "BILLING_TRANSACTION_NOT_ELIGIBLE",
      );
    }
    let claimedTransaction = transaction;

    if (
      transaction.status === BILLING_TRANSACTION_STATUS.PENDING ||
      transaction.status === BILLING_TRANSACTION_STATUS.EXPIRED
    ) {
      claimedTransaction = await BillingTransaction.findOneAndUpdate(
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
            providerPaymentId: payment.id,
            paidAt: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!claimedTransaction) {
        // Another request may have processed the same payment.
        const latestTransaction = await BillingTransaction.findById(
          transaction._id,
        );

        if (
          latestTransaction?.status !== BILLING_TRANSACTION_STATUS.PAID ||
          latestTransaction.providerPaymentId !== payment.id
        ) {
          throw new AppError(
            "Payment processing encountered a transaction conflict",
            409,
            "PAYMENT_PROCESSING_CONFLICT",
          );
        }

        claimedTransaction = latestTransaction;
      }
    }

    // The Auth Service must enforce idempotency using transactionId.
    // If the response is lost, retrying this call must not credit twice.
    if (claimedTransaction.balanceCreditStatus !== "completed") {
      await creditUserBalance({
        userId: claimedTransaction.userId.toString(),
        transactionId: claimedTransaction.transactionId,
        amount: claimedTransaction.balanceCredit,
      });

      await BillingTransaction.updateOne(
        {
          _id: claimedTransaction._id,
          status: BILLING_TRANSACTION_STATUS.PAID,
          providerPaymentId: payment.id,
          balanceCreditStatus: { $ne: "completed" },
        },
        {
          $set: {
            balanceCreditStatus: "completed",
            balanceCreditedAt: new Date(),
            failureCode: null,
          },
        },
      );
    }

    await markEventProcessed(eventRecord);

    return {
      processed: true,
      balanceCredited: true,
      transactionId: claimedTransaction.transactionId,
    };
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
