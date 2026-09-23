import crypto from "crypto";

import { getAuth } from "firebase-admin/auth";

import { app } from "../config/firebase.js";
import User from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";

const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days

// Firebase authentication + Redis session creation.
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    // Firebase verifies the token and gives us the trusted user identity.
    const decoded = await getAuth(app).verifyIdToken(token);

    // Email/password accounts must verify their email before
    // RIO creates a server-side session.
    //
    // OAuth providers such as Google/GitHub may not require this
    // check because Firebase handles their provider verification.
    if (
      decoded.firebase?.sign_in_provider === "password" &&
      decoded.email_verified !== true
    ) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email before continuing.",
      });
    }

    let user = await User.findOne({ firebaseID: decoded.uid });

    // Create the user only on their first successful login.
    if (!user) {
      user = await User.create({
        firebaseID: decoded.uid,
        name: decoded.name || "User",
        email: decoded.email,
      });
    }

    // Generate a random session ID instead of storing Firebase credentials
    // directly in the application session.
    const sessionId = crypto.randomUUID();

    // Redis stores the server-side session with automatic expiration.
    await redis.set(
      `session:${sessionId}`,
      JSON.stringify({
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        coins: user.coins,
      }),
      "EX",
      SESSION_TTL,
    );

    // HTTP-only cookie prevents client-side JavaScript from reading
    // the session ID, reducing the impact of XSS attacks.
    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_TTL * 1000,
    });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Firebase Authentication Error:", error);

    // Invalid/expired Firebase tokens should not be treated as
    // internal server errors.
    if (
      error.code === "auth/id-token-expired" ||
      error.code === "auth/id-token-invalid"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed. Please try again.",
    });
  }
};

// Destroy the Redis session and remove the browser cookie.
export const logout = async (req, res) => {
  try {
    const sessionId = req.cookies?.session;

    if (sessionId) {
      // Keep the Redis key exactly consistent with googleAuth().
      await redis.del(`session:${sessionId}`);
    }

    res.clearCookie("session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed. Please try again.",
    });
  }
};
