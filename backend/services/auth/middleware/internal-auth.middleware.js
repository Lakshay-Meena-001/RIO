import crypto from "node:crypto";
import mongoose from "mongoose";

const INTERNAL_SECRET_HEADER = "x-internal-service-secret";
const USER_ID_HEADER = "x-user-id";

export const internalAuthMiddleware = (req, res, next) => {
  const expectedSecret = process.env.AUTH_INTERNAL_SECRET;

  // Fail closed if server configuration is incomplete.
  if (
    typeof expectedSecret !== "string" ||
    expectedSecret.trim().length === 0
  ) {
    console.error("AUTH_INTERNAL_SECRET is not configured for Auth Service.");

    return res.status(503).json({
      success: false,
      message: "Internal authentication is unavailable.",
    });
  }

  const suppliedSecret = req.get(INTERNAL_SECRET_HEADER);

  if (typeof suppliedSecret !== "string" || suppliedSecret.length === 0) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized internal request.",
    });
  }

  const expectedBuffer = Buffer.from(expectedSecret, "utf8");
  const suppliedBuffer = Buffer.from(suppliedSecret, "utf8");

  // timingSafeEqual requires equal-length buffers.
  const secretIsValid =
    expectedBuffer.length === suppliedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);

  if (!secretIsValid) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized internal request.",
    });
  }

  const userId = req.get(USER_ID_HEADER);

  if (typeof userId !== "string" || !mongoose.isObjectIdOrHexString(userId)) {
    return res.status(400).json({
      success: false,
      message: "A valid user identity is required.",
    });
  }

  // Downstream controllers must use this verified identity.
  req.internalUserId = userId;

  return next();
};
