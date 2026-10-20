import { Router } from "express";

import gatewayAuthMiddleware from "../middlewares/gateway-auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  paginationSchema,
  createOrderSchema,
  verifyPaymentSchema,
} from "../validators/billing.schema.js";

import {
  getSummary,
  getTransactions,
  getTransactionById,
  createOrder,
  verifyPayment,
  cancelPayment,
} from "../controllers/billing.controller.js";

const router = Router();

// All routes in this router require trusted Gateway authentication.
router.use(gatewayAuthMiddleware);

// GET /api/billing/summary
router.get("/summary", getSummary);

// GET /api/billing/transactions?page=1&pageSize=10
router.get(
  "/transactions",
  validate(paginationSchema, "query"),
  getTransactions,
);

// GET /api/billing/transactions/:transactionId
router.get("/transactions/:transactionId", getTransactionById);

// POST /api/billing/orders
router.post("/orders", validate(createOrderSchema), createOrder);

// POST /api/billing/verify
router.post("/verify", validate(verifyPaymentSchema), verifyPayment);

// POST /api/billing/transactions/:transactionId/cancel
router.post(
  "/transactions/:transactionId/cancel",
  cancelPayment,
);

export default router;
