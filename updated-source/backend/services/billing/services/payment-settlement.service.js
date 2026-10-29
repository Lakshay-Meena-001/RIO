import BillingTransaction from "../models/billing-transaction.model.js";
import { creditUserBalance } from "./wallet.service.js";
import { BILLING_TRANSACTION_STATUS } from "../constants/billing.constants.js";
import AppError from "../utils/AppError.js";

const CAPTURE_ELIGIBLE_STATUSES = [
  BILLING_TRANSACTION_STATUS.CREATED,
  BILLING_TRANSACTION_STATUS.PENDING,
  BILLING_TRANSACTION_STATUS.EXPIRED,
  BILLING_TRANSACTION_STATUS.FAILED,
  BILLING_TRANSACTION_STATUS.CANCELLED,
];

const markCreditFailed = async (transaction) => {
  await BillingTransaction.updateOne(
    {
      _id: transaction._id,
      status: BILLING_TRANSACTION_STATUS.PAID,
      providerPaymentId: transaction.providerPaymentId,
      balanceCreditStatus: { $ne: "completed" },
    },
    {
      $set: {
        balanceCreditStatus: "failed",
        failureCode: "BALANCE_CREDIT_RECOVERY_REQUIRED",
      },
    },
  );
};

export const settleCapturedPayment = async ({ transaction, payment }) => {
  if (
    !transaction ||
    !payment ||
    payment.status !== "captured" ||
    typeof payment.id !== "string" ||
    typeof payment.order_id !== "string" ||
    payment.order_id !== transaction.providerOrderId ||
    payment.amount !== transaction.amount ||
    payment.currency !== transaction.currency
  ) {
    throw new AppError(
      "Captured payment does not match the billing transaction",
      409,
      "PAYMENT_TRANSACTION_MISMATCH",
    );
  }

  let settled = transaction;

  if (transaction.status === BILLING_TRANSACTION_STATUS.PAID) {
    if (transaction.providerPaymentId !== payment.id) {
      throw new AppError(
        "A different payment is already associated with this transaction",
        409,
        "PAYMENT_ALREADY_ASSOCIATED",
      );
    }
  } else {
    try {
      settled = await BillingTransaction.findOneAndUpdate(
        {
          _id: transaction._id,
          status: { $in: CAPTURE_ELIGIBLE_STATUSES },
          $or: [
            { providerPaymentId: null },
            { providerPaymentId: { $exists: false } },
            { providerPaymentId: payment.id },
          ],
        },
        {
          $set: {
            status: BILLING_TRANSACTION_STATUS.PAID,
            providerPaymentId: payment.id,
            paidAt: new Date(),
            failureCode: null,
          },
        },
        { new: true, runValidators: true },
      );
    } catch (error) {
      if (error?.code === 11000) {
        throw new AppError(
          "This payment is already associated with another transaction",
          409,
          "PAYMENT_ALREADY_ASSOCIATED",
        );
      }
      throw error;
    }

    if (!settled) {
      settled = await BillingTransaction.findById(transaction._id);
      if (
        settled?.status !== BILLING_TRANSACTION_STATUS.PAID ||
        settled.providerPaymentId !== payment.id
      ) {
        throw new AppError(
          "Payment status changed during settlement. Retry reconciliation.",
          409,
          "PAYMENT_PROCESSING_CONFLICT",
        );
      }
    }
  }

  if (settled.balanceCreditStatus !== "completed") {
    try {
      await creditUserBalance({
        userId: settled.userId.toString(),
        transactionId: settled.transactionId,
        amount: settled.balanceCredit,
      });
    } catch {
      await markCreditFailed(settled);
      throw new AppError(
        "Payment succeeded, but balance credit needs recovery",
        503,
        "BALANCE_CREDIT_RECOVERY_REQUIRED",
      );
    }

    await BillingTransaction.updateOne(
      {
        _id: settled._id,
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
      { runValidators: true },
    );
  }

  const completed = await BillingTransaction.findById(settled._id).select(
    "transactionId status balanceCreditStatus",
  );

  if (completed?.status !== BILLING_TRANSACTION_STATUS.PAID || completed.balanceCreditStatus !== "completed") {
    throw new AppError(
      "Payment is confirmed, but balance credit requires recovery",
      503,
      "BALANCE_CREDIT_RECOVERY_REQUIRED",
    );
  }

  return {
    transactionId: completed.transactionId,
    status: completed.status,
    balanceCreditStatus: completed.balanceCreditStatus,
  };
};
