import express from "express";

import {
  googleAuth,
  completeProfile,
  logout,
  useBalance,
  deductBalanceInternal,
  getUserBalanceInternal,
  getCurrentUser,
} from "../controllers/auth.controller.js";

import { internalAuthMiddleware } from "../middleware/internal-auth.middleware.js";

const authRouter = express.Router();

// Public-facing authentication routes.

authRouter.get("/me", getCurrentUser);
authRouter.post("/login", googleAuth);
authRouter.patch("/profile", completeProfile);
authRouter.post("/logout", logout);

// Balance deduction route.
// Keep the existing URL temporarily to avoid breaking existing frontend callers.
authRouter.post("/user-coins", useBalance);

// Internal service-to-service routes.
authRouter.post(
  "/internal/deduct-balance",
  internalAuthMiddleware,
  deductBalanceInternal,
);

authRouter.post(
  "/internal/user-balance",
  internalAuthMiddleware,
  getUserBalanceInternal,
);

export default authRouter;
