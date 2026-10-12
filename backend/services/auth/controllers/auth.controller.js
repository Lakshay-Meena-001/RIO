import crypto from "crypto";

import { getAuth } from "firebase-admin/auth";

import { app } from "../config/firebase.js";
import User from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";

import mongoose from "mongoose";
import BalanceTransaction from "../models/balance-transaction.model.js";

const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days

const normalizeEmail = (email) => {
  if (!email) {
    return null;
  }

  return email.trim().toLowerCase();
};

const getSessionKey = (sessionId) => {
  return `session:${sessionId}`;
};

const getUserSessionsKey = (userId) => {
  return `user:sessions:${userId}`;
};

/*
 * Build the exact data that should live inside
 * the Redis session.
 *
 * MongoDB remains the source of truth.
 */
const buildSessionData = (user) => ({
  userId: user._id.toString(),
  name: user.name,
  email: user.email,
  phoneNumber: user.phoneNumber,
  balance: Number(user.balance),
  profileCompleted: user.profileCompleted,
});

/*
 * Return only user fields that are safe for API responses.
 * Never expose Firebase identity or internal transaction history.
 */
const buildPublicUser = (user) => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  phoneNumber: user.phoneNumber,
  profileCompleted: user.profileCompleted,

  headline: user.headline,
  bio: user.bio,
  location: user.location,
  profileImage: user.profileImage,

  currentRole: user.currentRole,
  targetRole: user.targetRole,
  skills: user.skills,

  linkedinUrl: user.linkedinUrl,
  githubUrl: user.githubUrl,
  portfolioUrl: user.portfolioUrl,

  balance: Number(user.balance),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/*
 * Create/update a Redis session while keeping
 * the session structure consistent everywhere.
 */
const saveSession = async (sessionId, user) => {
  const userId = user._id.toString();

  await redis.set(
    getSessionKey(sessionId),
    JSON.stringify(buildSessionData(user)),
    "EX",
    SESSION_TTL,
  );

  await redis.sadd(getUserSessionsKey(userId), sessionId);
  await redis.expire(getUserSessionsKey(userId), SESSION_TTL);
};

const syncUserSessions = async (sessionId, user) => {
  const userId = user._id.toString();

  // Ensure the current session is registered and up to date.
  await saveSession(sessionId, user);

  // Find all active sessions belonging to this account.
  const sessionIds = await redis.smembers(getUserSessionsKey(userId));

  const sessionData = JSON.stringify(buildSessionData(user));

  // Update every active session with the latest MongoDB data.
  const results = await Promise.allSettled(
    sessionIds.map((activeSessionId) =>
      redis.set(getSessionKey(activeSessionId), sessionData, "EX", SESSION_TTL),
    ),
  );

  if (results.some((result) => result.status === "rejected")) {
    console.error("Some active Redis sessions could not be synchronized.");
  }

  await redis.expire(getUserSessionsKey(userId), SESSION_TTL);
};

/*
 * Safely read the authenticated Redis session.
 */
const getAuthenticatedSession = async (req) => {
  const sessionId = req.cookies?.session;

  if (!sessionId) {
    return null;
  }

  const rawSession = await redis.get(getSessionKey(sessionId));

  if (!rawSession) {
    return null;
  }

  try {
    return {
      sessionId,
      data: JSON.parse(rawSession),
    };
  } catch (error) {
    console.error("Invalid Redis session data:", error);

    return null;
  }
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
    const { token } = req.body ?? {};

    if (typeof token !== "string" || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid authentication token is required.",
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

    // Store the current MongoDB user state in Redis.
    await syncUserSessions(sessionId, user);

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
      user: buildPublicUser(user),
    });
  } catch (error) {
    console.error("Firebase Authentication Error:", error);

    // Invalid Firebase ID tokens should return 401, not 500.
    const invalidTokenCodes = new Set([
      "auth/id-token-expired",
      "auth/id-token-revoked",
      "auth/invalid-id-token",
      "auth/id-token-invalid",
    ]);

    if (invalidTokenCodes.has(error.code)) {
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

export const getCurrentUser = async (req, res) => {
  try {
    const authenticatedSession = await getAuthenticatedSession(req);

    if (!authenticatedSession) {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please sign in again.",
      });
    }

    const { sessionId, data: sessionData } = authenticatedSession;

    // MongoDB is the source of truth, not the cached Redis session.
    const user = await User.findById(sessionData.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Refresh the current session and all other active sessions.
    await syncUserSessions(sessionId, user);

    return res.status(200).json({
      success: true,
      user: buildPublicUser(user),
    });
  } catch (error) {
    console.error("Get Current User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch the current user.",
    });
  }
};

// Complete the minimum RIO account profile.
export const completeProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body ?? {};

    const trimmedName = name?.trim();
    const normalizedEmail = normalizeEmail(email);
    const trimmedPhoneNumber = phoneNumber?.trim();

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters.",
      });
    }

    if (trimmedName.toLowerCase() === "user") {
      return res.status(400).json({
        success: false,
        message: "Name cannot be User.",
      });
    }

    if (!normalizedEmail && !trimmedPhoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Email or contact is required.",
      });
    }

    const authenticatedSession = await getAuthenticatedSession(req);

    if (!authenticatedSession) {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please sign in again.",
      });
    }

    const { sessionId, data: sessionData } = authenticatedSession;

    const user = await User.findById(sessionData.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Email changes require a separate verified-email flow.
    if (normalizedEmail && normalizedEmail !== user.email) {
      return res.status(400).json({
        success: false,
        code: "EMAIL_VERIFICATION_REQUIRED",
        message: "Please verify your email before changing it.",
      });
    }

    user.name = trimmedName;

    if (trimmedPhoneNumber) {
      user.phoneNumber = trimmedPhoneNumber;
    }

    user.profileCompleted = true;

    await user.save();

    /*
     * Rebuild the Redis session from the saved MongoDB user.
     * This automatically keeps balance synchronized as well.
     */
    await syncUserSessions(sessionId, user);

    return res.status(200).json({
      success: true,
      message: "Account setup completed successfully.",
      user: buildPublicUser(user),
    });
  } catch (error) {
    console.error("Account setup failed:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email or phone number is already in use.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to complete account setup. Please try again.",
    });
  }
};

// Destroy the Redis session, remove it from the user's
// session index, and clear the browser cookie.
export const logout = async (req, res) => {
  const sessionId = req.cookies?.session;
  let logoutFailed = false;

  try {
    if (sessionId) {
      const sessionKey = getSessionKey(sessionId);
      const rawSession = await redis.get(sessionKey);

      let userId = null;

      if (rawSession) {
        try {
          const sessionData = JSON.parse(rawSession);
          userId = sessionData.userId;
        } catch {
          console.warn("Invalid session data encountered during logout.");
        }
      }

      if (userId) {
        const results = await redis
          .multi()
          .del(sessionKey)
          .srem(getUserSessionsKey(userId), sessionId)
          .exec();

        if (!results || results.some(([commandError]) => commandError)) {
          throw new Error("Redis logout cleanup failed.");
        }
      } else {
        await redis.del(sessionKey);
      }
    }
  } catch (error) {
    logoutFailed = true;
    console.error("Server-side logout failed:", error.message);
  } finally {
    res.clearCookie("session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }

  if (logoutFailed) {
    return res.status(503).json({
      success: false,
      message:
        "Your browser cookie was cleared, but server-side logout could not be confirmed. Please retry.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

/*
 * Deduct balance from the authenticated user.
 * MongoDB is the source of truth.
 * Redis session is synchronized only after the MongoDB update succeeds.
 */
export const useBalance = async (req, res) => {
  const transactionId =
    typeof req.body?.transactionId === "string"
      ? req.body.transactionId.trim()
      : "";

  const { amount, action } = req.body ?? {};
  const balanceAmount = Number(amount);

  const normalizedAction =
    typeof action === "string" && action.trim()
      ? action.trim().slice(0, 100)
      : "balance-deduction";

  let mongoSession;

  try {
    const authenticatedSession = await getAuthenticatedSession(req);

    if (!authenticatedSession) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { data: sessionData } = authenticatedSession;
    const userId = sessionData.userId;

    if (!transactionId || transactionId.length > 200) {
      return res.status(400).json({
        success: false,
        message: "A valid transaction ID is required.",
      });
    }

    if (!Number.isSafeInteger(balanceAmount) || balanceAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive safe integer.",
      });
    }

    let outcome;

    mongoSession = await mongoose.startSession();

    await mongoSession.withTransaction(async () => {
      const existingTransaction = await BalanceTransaction.findOne({
        userId,
        transactionId,
      }).session(mongoSession);

      if (existingTransaction) {
        if (
          existingTransaction.amount !== balanceAmount ||
          existingTransaction.action !== normalizedAction
        ) {
          outcome = { type: "conflict" };
          return;
        }

        const currentUser = await User.findById(userId)
          .select("balance")
          .session(mongoSession);

        outcome = currentUser
          ? {
              type: "already-processed",
              balance: Number(existingTransaction.balanceAfter),
            }
          : { type: "user-not-found" };

        return;
      }

      const currentUser = await User.findById(userId)
        .select("balance")
        .session(mongoSession);

      if (!currentUser) {
        outcome = { type: "user-not-found" };
        return;
      }

      const updatedUser = await User.findOneAndUpdate(
        {
          _id: userId,
          balance: { $gte: balanceAmount },
        },
        {
          $inc: { balance: -balanceAmount },
        },
        {
          new: true,
          runValidators: true,
          session: mongoSession,
        },
      );

      if (!updatedUser) {
        outcome = {
          type: "insufficient-balance",
          balance: Number(currentUser.balance),
        };
        return;
      }

      await BalanceTransaction.create(
        [
          {
            userId,
            transactionId,
            amount: balanceAmount,
            action: normalizedAction,
            balanceAfter: Number(updatedUser.balance),
          },
        ],
        { session: mongoSession },
      );

      outcome = {
        type: "success",
        previousBalance: Number(currentUser.balance),
        balance: Number(updatedUser.balance),
      };
    });

    if (!outcome) {
      throw new Error("Balance transaction completed without an outcome.");
    }

    if (outcome.type === "conflict") {
      return res.status(409).json({
        success: false,
        message: "Transaction ID was already used with different details.",
      });
    }

    if (outcome.type === "user-not-found") {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (outcome.type === "insufficient-balance") {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance.",
        balance: outcome.balance,
      });
    }

    // MongoDB is authoritative. Redis is only a session cache.
    try {
      const sessionIds = await redis.smembers(getUserSessionsKey(userId));

      const latestUser = await User.findById(userId);

      if (latestUser) {
        const sessionDataJson = JSON.stringify(buildSessionData(latestUser));

        const results = await Promise.allSettled(
          sessionIds.map((activeSessionId) =>
            redis.set(
              getSessionKey(activeSessionId),
              sessionDataJson,
              "EX",
              SESSION_TTL,
            ),
          ),
        );

        if (results.some((result) => result.status === "rejected")) {
          console.error(
            "Some Redis sessions could not be synchronized after balance deduction.",
          );
        }
      }

      await redis.expire(getUserSessionsKey(userId), SESSION_TTL);
    } catch (redisError) {
      console.error(
        "Redis synchronization failed after balance deduction:",
        redisError.message,
      );
    }

    const alreadyProcessed = outcome.type === "already-processed";

    return res.status(200).json({
      success: true,
      message: alreadyProcessed
        ? "Balance transaction already processed."
        : "Balance deducted successfully.",
      action: normalizedAction,
      balance: outcome.balance,

      // Include deduction details only for a newly processed transaction.
      ...(!alreadyProcessed
        ? {
            previousBalance: outcome.previousBalance,
            deductedAmount: balanceAmount,
          }
        : {}),

      ...(alreadyProcessed ? { alreadyProcessed: true } : {}),
    });
  } catch (error) {
    // A concurrent request may have committed the same transaction first.
    try {
      if (transactionId) {
        const authenticatedSession = await getAuthenticatedSession(req);
        const userId = authenticatedSession?.data?.userId;

        if (userId) {
          const existingTransaction = await BalanceTransaction.findOne({
            userId,
            transactionId,
          });

          if (existingTransaction) {
            if (
              existingTransaction.amount !== balanceAmount ||
              existingTransaction.action !== normalizedAction
            ) {
              return res.status(409).json({
                success: false,
                message:
                  "Transaction ID was already used with different details.",
              });
            }

            const currentUser = await User.findById(userId).select("balance");

            if (currentUser) {
              return res.status(200).json({
                success: true,
                message: "Balance transaction already processed.",
                action: existingTransaction.action,
                balance: Number(existingTransaction.balanceAfter),
                alreadyProcessed: true,
              });
            }
          }
        }
      }
    } catch (recoveryError) {
      console.error(
        "Balance transaction recovery failed:",
        recoveryError.message,
      );
    }

    console.error("Balance deduction failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update balance. Please try again.",
    });
  } finally {
    if (mongoSession) {
      await mongoSession.endSession();
    }
  }
};

/**
 * Deduct balance for an authenticated internal service request.
 *
 * MongoDB is the source of truth.
 * Redis sessions are synchronized after the transaction commits.
 */

export const deductBalanceInternal = async (req, res) => {
  const userId = req.internalUserId;

  const transactionId =
    typeof req.body?.transactionId === "string"
      ? req.body.transactionId.trim()
      : "";

  const { amount, action } = req.body ?? {};
  const balanceAmount = Number(amount);

  const normalizedAction =
    typeof action === "string" && action.trim()
      ? action.trim().slice(0, 100)
      : "balance-deduction";

  let mongoSession;

  try {
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    if (!transactionId || transactionId.length > 200) {
      return res.status(400).json({
        success: false,
        message: "A valid transaction ID is required.",
      });
    }

    if (!Number.isSafeInteger(balanceAmount) || balanceAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive safe integer.",
      });
    }

    let outcome;

    mongoSession = await mongoose.startSession();

    await mongoSession.withTransaction(async () => {
      // 1. Check whether this transaction was already processed.
      const existingTransaction = await BalanceTransaction.findOne({
        userId,
        transactionId,
      }).session(mongoSession);

      if (existingTransaction) {
        // A transaction ID cannot be reused with different details.
        if (
          existingTransaction.amount !== balanceAmount ||
          existingTransaction.action !== normalizedAction
        ) {
          outcome = { type: "conflict" };
          return;
        }

        const currentUser = await User.findById(userId)
          .select("balance")
          .session(mongoSession);

        outcome = currentUser
          ? {
              type: "already-processed",
              balance: Number(existingTransaction.balanceAfter),
            }
          : { type: "user-not-found" };

        return;
      }

      // 2. Read the current account balance.
      const currentUser = await User.findById(userId)
        .select("balance")
        .session(mongoSession);

      if (!currentUser) {
        outcome = { type: "user-not-found" };
        return;
      }

      // 3. Deduct atomically only if sufficient balance exists.
      const updatedUser = await User.findOneAndUpdate(
        {
          _id: userId,
          balance: { $gte: balanceAmount },
        },
        {
          $inc: { balance: -balanceAmount },
        },
        {
          new: true,
          runValidators: true,
          session: mongoSession,
        },
      );

      if (!updatedUser) {
        outcome = {
          type: "insufficient-balance",
          balance: Number(currentUser.balance),
        };
        return;
      }

      // 4. Record the transaction in the same MongoDB transaction.
      await BalanceTransaction.create(
        [
          {
            userId,
            transactionId,
            amount: balanceAmount,
            action: normalizedAction,
            balanceAfter: Number(updatedUser.balance),
          },
        ],
        { session: mongoSession },
      );

      outcome = {
        type: "success",
        previousBalance: Number(currentUser.balance),
        balance: Number(updatedUser.balance),
      };
    });

    if (!outcome) {
      throw new Error("Balance transaction completed without an outcome.");
    }

    if (outcome.type === "conflict") {
      return res.status(409).json({
        success: false,
        message: "Transaction ID was already used with different details.",
      });
    }

    if (outcome.type === "user-not-found") {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (outcome.type === "insufficient-balance") {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance.",
        balance: outcome.balance,
      });
    }

    // 5. MongoDB is authoritative; synchronize Redis sessions afterward.
    try {
      const sessionIds = await redis.smembers(getUserSessionsKey(userId));

      if (sessionIds.length > 0) {
        const latestUser = await User.findById(userId);

        if (latestUser) {
          const sessionData = JSON.stringify(buildSessionData(latestUser));

          const results = await Promise.allSettled(
            sessionIds.map((sessionId) =>
              redis.set(
                getSessionKey(sessionId),
                sessionData,
                "EX",
                SESSION_TTL,
              ),
            ),
          );

          if (results.some((result) => result.status === "rejected")) {
            console.error(
              "Some Redis sessions could not be synchronized after balance deduction.",
            );
          }
        }
      }

      await redis.expire(getUserSessionsKey(userId), SESSION_TTL);
    } catch (redisError) {
      console.error(
        "Redis session synchronization failed after balance deduction:",
        redisError.message,
      );
    }

    const alreadyProcessed = outcome.type === "already-processed";

    return res.status(200).json({
      success: true,
      message: alreadyProcessed
        ? "Balance transaction already processed."
        : "Balance deducted successfully.",
      action: normalizedAction,
      balance: outcome.balance,

      // Include deduction details only for a newly processed transaction.
      ...(!alreadyProcessed
        ? {
            previousBalance: outcome.previousBalance,
            deductedAmount: balanceAmount,
          }
        : {}),

      ...(alreadyProcessed ? { alreadyProcessed: true } : {}),
    });
  } catch (error) {
    // Recover a concurrent duplicate transaction safely.
    try {
      if (userId && transactionId) {
        const existingTransaction = await BalanceTransaction.findOne({
          userId,
          transactionId,
        });

        if (existingTransaction) {
          if (
            existingTransaction.amount !== balanceAmount ||
            existingTransaction.action !== normalizedAction
          ) {
            return res.status(409).json({
              success: false,
              message:
                "Transaction ID was already used with different details.",
            });
          }

          const currentUser = await User.findById(userId).select("balance");

          if (currentUser) {
            return res.status(200).json({
              success: true,
              message: "Balance transaction already processed.",
              action: existingTransaction.action,
              balance: Number(existingTransaction.balanceAfter),
              alreadyProcessed: true,
            });
          }
        }
      }
    } catch (recoveryError) {
      console.error(
        "Balance transaction recovery lookup failed:",
        recoveryError.message,
      );
    }

    console.error("Internal balance deduction failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update balance. Please try again.",
    });
  } finally {
    if (mongoSession) {
      await mongoSession.endSession();
    }
  }
};

export const getUserBalanceInternal = async (req, res) => {
  try {
    const userId = req.internalUserId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const user = await User.findById(userId).select("balance");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      balance: Number(user.balance),
    });
  } catch (error) {
    console.error("Internal user balance lookup failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user balance.",
    });
  }
};
