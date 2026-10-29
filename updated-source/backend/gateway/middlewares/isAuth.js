import redis from "../../shared/redis/redis.js";

const sessionKeyPrefix = "session:";
const sessionIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const objectIdPattern = /^[a-f\d]{24}$/i;

function sendUnauthorized(res, req, code, message) {
  return res.status(401).json({
    success: false,
    error: { code, message },
    requestId: req.requestId,
  });
}

export async function isAuth(req, res, next) {
  const sessionId = req.cookies?.session;

  if (typeof sessionId !== "string" || !sessionIdPattern.test(sessionId)) {
    return sendUnauthorized(
      res,
      req,
      "AUTHENTICATION_REQUIRED",
      "Please sign in to continue.",
    );
  }

  const sessionKey = `${sessionKeyPrefix}${sessionId}`;

  try {
    const rawSession = await redis.get(sessionKey);

    if (!rawSession) {
      return sendUnauthorized(
        res,
        req,
        "SESSION_EXPIRED",
        "Your session has expired. Please sign in again.",
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(rawSession);
    } catch {
      await redis.del(sessionKey);
      return sendUnauthorized(
        res,
        req,
        "INVALID_SESSION",
        "Your session is invalid. Please sign in again.",
      );
    }

    if (
      !sessionData ||
      typeof sessionData !== "object" ||
      Array.isArray(sessionData) ||
      typeof sessionData.userId !== "string" ||
      !objectIdPattern.test(sessionData.userId)
    ) {
      await redis.del(sessionKey);
      return sendUnauthorized(
        res,
        req,
        "INVALID_SESSION",
        "Your session is invalid. Please sign in again.",
      );
    }

    req.user = sessionData;
    return next();
  } catch (error) {
    console.error("Session validation failed", {
      requestId: req.requestId,
      error: error?.message,
    });

    return res.status(503).json({
      success: false,
      error: {
        code: "SESSION_STORE_UNAVAILABLE",
        message: "Authentication is temporarily unavailable. Please try again.",
      },
      requestId: req.requestId,
    });
  }
}
