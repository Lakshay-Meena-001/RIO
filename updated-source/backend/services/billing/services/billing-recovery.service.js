import BillingTransaction from "../models/billing-transaction.model.js";
import { getRazorpayClient } from "../config/razorpay.js";
import { fetchProviderOrderPayments } from "./razorpay.service.js";
import { creditUserBalance } from "./wallet.service.js";
import { settleCapturedPayment } from "./payment-settlement.service.js";
import { BILLING_TRANSACTION_STATUS } from "../constants/billing.constants.js";
import { canExpireCheckout } from "./payment-state.js";

const BATCH_SIZE = 50;
const RECOVERY_INTERVAL_MS = 30_000;

let recoveryTimer;
let recoveryRunning = false;

const recoverBalanceCredits = async () => {
  const transactions = await BillingTransaction.find({
    status: BILLING_TRANSACTION_STATUS.PAID,
    balanceCreditStatus: { $ne: "completed" },
  })
    .sort({ paidAt: 1 })
    .limit(BATCH_SIZE);

  for (const transaction of transactions) {
    try {
      await creditUserBalance({
        userId: transaction.userId.toString(),
        transactionId: transaction.transactionId,
        amount: transaction.balanceCredit,
      });

      await BillingTransaction.updateOne(
        {
          _id: transaction._id,
          status: BILLING_TRANSACTION_STATUS.PAID,
          providerPaymentId: transaction.providerPaymentId,
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
    } catch (error) {
      // Auth Service is idempotent by transactionId, so a later retry is safe
      // even if its previous response was lost after the credit committed.
      await BillingTransaction.updateOne(
        {
          _id: transaction._id,
          status: BILLING_TRANSACTION_STATUS.PAID,
          balanceCreditStatus: { $ne: "completed" },
        },
        {
          $set: {
            balanceCreditStatus: "failed",
            failureCode: "BALANCE_CREDIT_RECOVERY_REQUIRED",
          },
        },
      );
      console.error(
        "Billing balance-credit recovery deferred:",
        error.code || error.message,
      );
    }
  }
};

const reconcileExpiredPayments = async () => {
  const now = new Date();

  // No provider order ID was persisted or returned to the browser, so checkout
  // could not have started. Release this stale active transaction.
  await BillingTransaction.updateMany(
    {
      status: BILLING_TRANSACTION_STATUS.CREATED,
      $or: [{ providerOrderId: { $exists: false } }, { providerOrderId: null }],
      expiresAt: { $lte: now },
    },
    {
      $set: {
        status: BILLING_TRANSACTION_STATUS.FAILED,
        failureCode: "PAYMENT_ORDER_CREATION_FAILED",
      },
    },
  );

  const expired = await BillingTransaction.find({
    status: BILLING_TRANSACTION_STATUS.PENDING,
    expiresAt: { $lte: now },
    providerOrderId: { $exists: true, $ne: null },
  })
    .sort({ expiresAt: 1 })
    .limit(BATCH_SIZE);

  for (const transaction of expired) {
    try {
      const payments = await fetchProviderOrderPayments(
        transaction.providerOrderId,
      );
      const capturedPayment = payments.find(
        (payment) => payment.status === "captured",
      );

      if (capturedPayment) {
        const confirmedPayment = await getRazorpayClient().payments.fetch(
          capturedPayment.id,
        );
        await settleCapturedPayment({ transaction, payment: confirmedPayment });
        continue;
      }

      // Empty lists or all-failed attempts expire the local checkout window.
      // A later captured webhook can still settle the transaction.
      if (canExpireCheckout(payments)) {
        await BillingTransaction.updateOne(
          { _id: transaction._id, status: BILLING_TRANSACTION_STATUS.PENDING },
          {
            $set: {
              status: BILLING_TRANSACTION_STATUS.EXPIRED,
              failureCode: "PAYMENT_WINDOW_EXPIRED",
              expiredAt: now,
            },
          },
        );
      }
    } catch (error) {
      // Keep the transaction recoverable if the provider is temporarily down.
      console.error(
        "Billing payment reconciliation deferred:",
        error.code || error.message,
      );
    }
  }
};

export const runBillingRecovery = async () => {
  if (recoveryRunning) return;
  recoveryRunning = true;
  try {
    await recoverBalanceCredits();
    await reconcileExpiredPayments();
  } catch (error) {
    console.error("Billing recovery pass failed:", error.message);
  } finally {
    recoveryRunning = false;
  }
};

export const startBillingRecovery = () => {
  if (recoveryTimer) return;
  void runBillingRecovery();
  recoveryTimer = setInterval(
    () => void runBillingRecovery(),
    RECOVERY_INTERVAL_MS,
  );
  recoveryTimer.unref?.();
};

export const stopBillingRecovery = () => {
  if (!recoveryTimer) return;
  clearInterval(recoveryTimer);
  recoveryTimer = undefined;
};
