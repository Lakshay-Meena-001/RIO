import mongoose from "mongoose";
import redis from "../../shared/redis/redis.js";

const SESSION_KEY_PREFIX = "session:";

const unauthorized = (res, message = "Unauthorized access.") => {
  return res.status(401).json({
    success: false,
    message,
  });
};

export const isAuth = async (req, res, next) => {
  const sessionId = req.cookies?.session;

  // Require a session ID in the expected UUID format.
  if (
    typeof sessionId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      sessionId,
    )
  ) {
    return unauthorized(res);
  }

  try {
    const sessionKey = `${SESSION_KEY_PREFIX}${sessionId}`;
    const rawSession = await redis.get(sessionKey);

    if (!rawSession) {
      return unauthorized(res, "Session expired. Please sign in again.");
    }

    let sessionData;

    try {
      sessionData = JSON.parse(rawSession);
    } catch {
      // Invalid session data must never be trusted.
      await redis.del(sessionKey);

      return unauthorized(res, "Invalid session. Please sign in again.");
    }

    // Validate the identity before downstream controllers use it.
    if (
      !sessionData ||
      typeof sessionData !== "object" ||
      Array.isArray(sessionData) ||
      typeof sessionData.userId !== "string" ||
      !mongoose.isObjectIdOrHexString(sessionData.userId)
    ) {
      await redis.del(sessionKey);

      return unauthorized(res, "Invalid session. Please sign in again.");
    }

    // Keep the session-backed user shape used by existing routes.
    req.user = sessionData;

    return next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    // Redis failure is an infrastructure error, not invalid credentials.
    return res.status(503).json({
      success: false,
      message: "Authentication is temporarily unavailable.",
    });
  }
};
