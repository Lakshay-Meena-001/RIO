export const errorHandler = (err, req, res, next) => {
  const inferredStatus =
    err?.type === "entity.too.large"
      ? 413
      : Number.isInteger(err?.statusCode)
        ? err.statusCode
        : Number.isInteger(err?.status)
          ? err.status
          : 500;

  const statusCode =
    inferredStatus >= 400 && inferredStatus <= 599 ? inferredStatus : 500;

  if (statusCode >= 500) {
    console.error(
      "Interview Service request failed:",
      err?.message || "Unknown error",
    );
  }

  return res.status(statusCode).json({
    success: false,
    code: statusCode === 413 ? "PAYLOAD_TOO_LARGE" : "REQUEST_FAILED",
    message:
      err?.type === "entity.too.large"
        ? "Request body is too large."
        : statusCode >= 500
          ? "Internal server error."
          : err?.message || "Request failed.",
  });
};
