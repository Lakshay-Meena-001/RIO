export const errorHandler = (err, req, res, next) => {
  console.error("Interview Service Error:", err);

  const statusCode = Number.isInteger(err.statusCode)
    ? err.statusCode
    : 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error."
        : err.message || "Request failed.",
  });
};