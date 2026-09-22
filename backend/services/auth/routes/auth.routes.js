import express from "express";

import { googleAuth, logout } from "../controllers/auth.controller.js";

const authRouter = express.Router();

// Firebase authentication → create Redis session.
authRouter.post("/login", googleAuth);

// Destroy Redis session and clear authentication cookie.
authRouter.post("/logout", logout);

export default authRouter;