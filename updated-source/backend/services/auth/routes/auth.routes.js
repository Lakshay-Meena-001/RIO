import express from "express";

import {
  googleAuth,
  completeProfile,
  logout,
  useBalance,
  deductBalanceInternal,
  deductResumeScorerBalanceInternal,
  getUserBalanceInternal,
  getUserBalanceTransactionsInternal,
  creditBalanceInternal,
  getCurrentUser,
  updateProfessionalProfile,
} from "../controllers/auth.controller.js";

import { internalAuthMiddleware } from "../middleware/internal-auth.middleware.js";

const authRouter = express.Router();

// Public-facing authentication routes.
authRouter.get("/me", getCurrentUser);
authRouter.post("/login", googleAuth);
authRouter.patch("/profile", completeProfile);
authRouter.patch("/auth/professional-profile", updateProfessionalProfile);
authRouter.post("/logout", logout);

// Existing balance deduction route.
// Preserve the current URL for existing callers.
authRouter.post("/user-coins", useBalance);

// Internal service-to-service routes.
authRouter.post(
  "/internal/deduct-balance",
  internalAuthMiddleware,
  deductBalanceInternal,
);

authRouter.post(
  "/internal/deduct-resume-scorer",
  internalAuthMiddleware,
  deductResumeScorerBalanceInternal,
);

authRouter.post(
  "/internal/user-balance",
  internalAuthMiddleware,
  getUserBalanceInternal,
);

authRouter.post(
  "/internal/balance-transactions",
  internalAuthMiddleware,
  getUserBalanceTransactionsInternal,
);

authRouter.post(
  "/internal/credit-balance",
  internalAuthMiddleware,
  creditBalanceInternal,
);

export default authRouter;
