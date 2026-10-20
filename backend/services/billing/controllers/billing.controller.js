import {
  cancelBillingPayment,
  createBillingOrder,
} from "../services/billing.service.js";

import {
  getBillingSummary,
  getBillingTransactions,
  getBillingTransactionById,
} from "../services/billing-query.service.js";

import { verifyBillingPayment } from "../services/payment-verification.service.js";

import AppError from "../utils/AppError.js";

export const getSummary = async (req, res, next) => {
  try {
    const userId = req.internalUserId;

    const summary = await getBillingSummary(userId);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.internalUserId;
    const query = req.validated?.query;

    if (!query) {
      throw new AppError(
        "Validated pagination parameters are required",
        400,
        "VALIDATED_QUERY_REQUIRED",
      );
    }

    const result = await getBillingTransactions(userId, query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    const userId = req.internalUserId;
    const { transactionId } = req.params;

    const transaction = await getBillingTransactionById(userId, transactionId);

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.internalUserId;
    const { amount } = req.validated?.body ?? {};

    if (amount === undefined) {
      throw new AppError(
        "Validated INR amount is required",
        400,
        "VALIDATED_AMOUNT_REQUIRED",
      );
    }

    const order = await createBillingOrder({
      userId,
      amount,
    });

    return res.status(201).json({
      success: true,
      message: "Billing order created",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const userId = req.internalUserId;
    const { orderId, paymentId, signature } = req.validated?.body ?? {};

    if (!orderId || !paymentId || !signature) {
      throw new AppError(
        "Validated payment details are required",
        400,
        "VALIDATED_PAYMENT_DETAILS_REQUIRED",
      );
    }

    const result = await verifyBillingPayment({
      userId,
      orderId,
      paymentId,
      signature,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verification completed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelPayment = async (req, res, next) => {
  try {
    const userId = req.internalUserId;
    const { transactionId } = req.params;

    const result = await cancelBillingPayment({
      userId,
      transactionId,
    });

    return res.status(200).json({
      success: true,
      message: "Payment cancellation processed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
