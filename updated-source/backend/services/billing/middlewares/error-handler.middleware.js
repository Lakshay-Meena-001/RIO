import { ZodError } from "zod";

import AppError from "../utils/AppError.js";

const errorHandler = (error, req, res, _next) => {
  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Expected application errors
  if (error instanceof AppError && error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
    });
  }

  // Unexpected errors: log details internally, not in the response.
  console.error("Billing Service unexpected error:", {
    message: error.message,
    method: req.method,
    path: req.originalUrl,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });

  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
};

export default errorHandler;
