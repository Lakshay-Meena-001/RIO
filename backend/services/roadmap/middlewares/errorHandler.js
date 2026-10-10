const HTTP_STATUS_BY_CODE = Object.freeze({
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INVALID_INPUT: 400,
  VALIDATION_ERROR: 400,
  ROADMAP_NOT_FOUND: 404,
  PHASE_NOT_FOUND: 404,
  TOPIC_NOT_FOUND: 404,
  ROADMAP_NOT_READY: 409,
  ROADMAP_GENERATION_IN_PROGRESS: 409,
  PHASE_PREREQUISITES_INCOMPLETE: 409,
  INVALID_AI_RESPONSE: 502,
  LLM_OUTPUT_TRUNCATED: 502,
  ROADMAP_LLM_FAILED: 502,
  ROADMAP_GENERATION_FAILED: 502,
  RESOURCE_LIMIT_EXCEEDED: 413,
});

export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    code: "ROUTE_NOT_FOUND",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || HTTP_STATUS_BY_CODE[error.code] || 500;

  // Log the complete error on the server, never expose internal details.
  if (statusCode >= 500) {
    console.error("[Roadmap Service Error]", {
      method: req.method,
      path: req.originalUrl,
      code: error.code || "INTERNAL_SERVER_ERROR",
      message: error.message,
      cause: error.cause?.message,
    });
  }

  return res.status(statusCode).json({
    success: false,
    code: error.code || "INTERNAL_SERVER_ERROR",
    message:
      statusCode >= 500
        ? "The roadmap service could not complete the request."
        : error.message || "The request could not be completed.",
  });
}

export default errorHandler;
