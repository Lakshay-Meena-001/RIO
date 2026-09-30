import express from "express";

import {
  googleAuth,
  completeProfile,
  logout,
  useCoins,
  deductCoinsInternal,
  getUserBalanceInternal,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

// Firebase authentication → create Redis session.
authRouter.post("/login", googleAuth);

// Complete the minimum RIO account profile.
authRouter.patch("/profile", completeProfile);

// Destroy Redis session and clear authentication cookie.
authRouter.post("/logout", logout);

// Public authenticated-user coin deduction.
authRouter.post("/user-coins", useCoins);

// Internal service-to-service coin deduction.
authRouter.post("/internal/user-coins", deductCoinsInternal);

// Internal service-to-service get User Balance.
authRouter.post("/internal/user-balance", getUserBalanceInternal);

export default authRouter;
