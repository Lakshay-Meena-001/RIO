import crypto from "node:crypto";

import AppError from "../utils/AppError.js";

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

const gatewayAuthMiddleware = (req, res, next) => {
  const expectedSecret = process.env.BILLING_INTERNAL_SECRET;
  const providedSecret = req.get("x-internal-service-secret");
  const userId = req.get("x-user-id");

  // Fail closed if service configuration is missing.
  if (!expectedSecret?.trim()) {
    return next(
      new AppError(
        "Billing internal authentication is not configured",
        500,
        "BILLING_AUTH_CONFIGURATION_ERROR",
      ),
    );
  }

  if (typeof providedSecret !== "string" || providedSecret.length === 0) {
    return next(
      new AppError(
        "Internal service authentication is required",
        401,
        "INTERNAL_AUTH_REQUIRED",
      ),
    );
  }

  const expectedBuffer = Buffer.from(expectedSecret);
  const providedBuffer = Buffer.from(providedSecret);

  // timingSafeEqual requires buffers of equal length.
  const secretMatches =
    expectedBuffer.length === providedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, providedBuffer);

  if (!secretMatches) {
    return next(
      new AppError(
        "Internal service authentication failed",
        401,
        "INTERNAL_AUTH_FAILED",
      ),
    );
  }

  if (typeof userId !== "string" || !OBJECT_ID_REGEX.test(userId)) {
    return next(
      new AppError(
        "A valid user identity is required",
        401,
        "INVALID_USER_IDENTITY",
      ),
    );
  }

  // Only use identity after validating the trusted Gateway headers.
  req.internalUserId = userId;

  next();
};

export default gatewayAuthMiddleware;
