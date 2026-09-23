import crypto from "crypto";

import { getAuth } from "firebase-admin/auth";

import { app } from "../config/firebase.js";
import User from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";

const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days

const normalizeEmail = (email) => {
  if (!email) {
    return null;
  }

  return email.trim().toLowerCase();
};

/*
 * Resolve the RIO user from a verified Firebase identity.
 *
 * Firebase UID is the primary identity.
 * Verified email is only used as a safe fallback when the UID
 * is not currently linked to a MongoDB user.
 */
const resolveUser = async (decoded) => {
  const firebaseID = decoded.uid;
  const email = normalizeEmail(decoded.email);
  const emailVerified = decoded.email_verified === true;

  // 1. Primary lookup: Firebase UID.
  let user = await User.findOne({ firebaseID });

  if (user) {
    return user;
  }

  // 2. Safe fallback: verified Firebase email.
  //
  // Never reconcile MongoDB users using an unverified email.
  if (email && emailVerified) {
    let firebaseUser;

    try {
      firebaseUser = await getAuth(app).getUserByEmail(email);
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    /*
     * If Firebase itself says this email belongs to another
     * Firebase UID, do not merge the accounts automatically.
     */
    if (firebaseUser && firebaseUser.uid !== firebaseID) {
      const error = new Error(
        "This email is already linked to another Firebase account.",
      );

      error.code = "AUTH_ACCOUNT_CONFLICT";

      throw error;
    }

    user = await User.findOne({ email });

    if (user) {
      /*
       * The Firebase account owns this verified email, and the
       * existing MongoDB record belongs to the same logical account.
       *
       * Reconnect the MongoDB record to the current Firebase UID.
       */
      user.firebaseID = firebaseID;

      if (decoded.name?.trim() && user.name === "User") {
        user.name = decoded.name.trim();
      }

      if (decoded.phone_number && !user.phoneNumber) {
        user.phoneNumber = decoded.phone_number;
      }

      await user.save();

      return user;
    }
  }

  // 3. No existing RIO user found.
  //
  // This is a genuinely new Firebase identity.
  const userData = {
    firebaseID,
    name: decoded.name?.trim() || "User",
  };

  if (email) {
    userData.email = email;
  }

  if (decoded.phone_number) {
    userData.phoneNumber = decoded.phone_number;
  }

  try {
    return await User.create(userData);
  } catch (error) {
    /*
     * Two simultaneous login requests can both reach User.create().
     * If another request created the user first, resolve it again
     * instead of exposing MongoDB's duplicate-key error.
     */
    if (error.code === 11000) {
      const existingUserByFirebaseID = await User.findOne({
        firebaseID,
      });

      if (existingUserByFirebaseID) {
        return existingUserByFirebaseID;
      }

      if (email && emailVerified) {
        const existingUserByEmail = await User.findOne({
          email,
        });

        if (existingUserByEmail) {
          const firebaseUser = await getAuth(app).getUserByEmail(email);

          if (firebaseUser.uid !== firebaseID) {
            const conflictError = new Error(
              "This email is already linked to another Firebase account.",
            );

            conflictError.code = "AUTH_ACCOUNT_CONFLICT";

            throw conflictError;
          }

          existingUserByEmail.firebaseID = firebaseID;

          await existingUserByEmail.save();

          return existingUserByEmail;
        }
      }
    }

    throw error;
  }
};

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

    const signInProvider = decoded.firebase?.sign_in_provider;

    // Email/password accounts must verify their email before
    // RIO creates a server-side session.
    if (signInProvider === "password" && decoded.email_verified !== true) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email before continuing.",
      });
    }

    // Resolve an existing RIO user or create a new one safely.
    const user = await resolveUser(decoded);

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
        phoneNumber: user.phoneNumber,
        coins: user.coins,
        profileCompleted: user.profileCompleted,
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

    // Do not merge two different Firebase identities automatically.
    if (error.code === "AUTH_ACCOUNT_CONFLICT") {
      return res.status(409).json({
        success: false,
        code: "AUTH_ACCOUNT_CONFLICT",
        message:
          "This email is already linked to another authentication account.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed. Please try again.",
    });
  }
};

// Complete the minimum RIO account profile.
export const completeProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;

    const trimmedName = name?.trim();

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (trimmedName.toLowerCase() === "user") {
      return res.status(400).json({
        success: false,
        message: "Name cannot be User.",
      });
    }

    if (!email && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Email or contact is required.",
      });
    }

    const sessionId = req.cookies?.session;

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const sessionData = await redis.get(`session:${sessionId}`);

    if (!sessionData) {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please sign in again.",
      });
    }

    const session = JSON.parse(sessionData);

    const user = await User.findById(session.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    user.name = trimmedName;

    if (email) {
      user.email = email.trim().toLowerCase();
    }

    if (phoneNumber) {
      user.phoneNumber = phoneNumber.trim();
    }

    user.profileCompleted = true;

    await user.save();

    await redis.set(
      `session:${sessionId}`,
      JSON.stringify({
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        coins: user.coins,
        profileCompleted: user.profileCompleted,
      }),
      "EX",
      SESSION_TTL,
    );

    return res.status(200).json({
      success: true,
      message: "Account setup completed successfully.",
      user,
    });
  } catch (error) {
    console.error("Account setup failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete account setup. Please try again.",
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
