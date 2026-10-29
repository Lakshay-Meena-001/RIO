import crypto from "node:crypto";

const internalAuth = (req, res, next) => {
  const expected = process.env.RESUME_INTERNAL_SECRET;
  const received = req.headers["x-internal-service-secret"];
  const userId = req.headers["x-user-id"];

  if (
    !expected ||
    typeof received !== "string" ||
    Buffer.byteLength(received) !== Buffer.byteLength(expected) ||
    !crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected))
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized internal service request",
    });
  }

  if (typeof userId !== "string" || !/^[a-f\d]{24}$/i.test(userId)) {
    return res.status(401).json({
      success: false,
      message: "Invalid authenticated user identity",
    });
  }

  req.internalUserId = userId;
  next();
};

export default internalAuth;
