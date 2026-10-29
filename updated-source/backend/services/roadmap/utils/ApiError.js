/** A consistent, safe application error for service-layer failures. */
export default class ApiError extends Error {
  constructor(statusCode, message, code = "INTERNAL_SERVER_ERROR", options = {}) {
    super(message, options);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace?.(this, ApiError);
  }
}
