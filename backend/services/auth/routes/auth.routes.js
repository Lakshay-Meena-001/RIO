import express from "express";

import {
  googleAuth,
  completeProfile,
  logout,
  useCoins,
  deductCoinsInternal,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

// Firebase authentication → create Redis session.
authRouter.post("/login", googleAuth);

// Complete the minimum RIO account profile.
authRouter.patch("/profile", completeProfile);

// Destroy Redis session and clear authentication cookie.
authRouter.post("/logout", logout);

// Deduct coins from the authenticated user's balance.
authRouter.post("/user-coins", useCoins);

authRouter.post("/internal/user-coins", deductCoinsInternal);

export default authRouter;