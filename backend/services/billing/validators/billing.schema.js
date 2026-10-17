import { z } from "zod";

import { BILLING_LIMITS } from "../constants/billing.constants.js";

const positiveIntegerSchema = z
  .string()
  .regex(/^[1-9]\d*$/, "Must be a positive integer")
  .transform(Number)
  .pipe(z.number().int().safe().positive());

export const paginationSchema = z
  .object({
    page: positiveIntegerSchema
      .optional()
      .transform((value) => value ?? BILLING_LIMITS.DEFAULT_PAGE),

    pageSize: positiveIntegerSchema
      .optional()
      .transform((value) => value ?? BILLING_LIMITS.DEFAULT_PAGE_SIZE)
      .pipe(
        z
          .number()
          .max(
            BILLING_LIMITS.MAX_PAGE_SIZE,
            `Page size cannot exceed ${BILLING_LIMITS.MAX_PAGE_SIZE}`,
          ),
      ),
  })
  .strict()
  .transform(({ page, pageSize }) => ({
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  }));

export const createOrderSchema = z
  .object({
    planId: z
      .string()
      .trim()
      .min(1, "Plan ID is required")
      .max(50, "Plan ID cannot exceed 50 characters"),
  })
  .strict();

export const verifyPaymentSchema = z
  .object({
    orderId: z
      .string()
      .trim()
      .min(1, "Order ID is required")
      .max(100, "Order ID is too long"),

    paymentId: z
      .string()
      .trim()
      .min(1, "Payment ID is required")
      .max(100, "Payment ID is too long"),

    signature: z
      .string()
      .regex(/^[a-f\d]{64}$/i, "Invalid payment signature format"),
  })
  .strict();
