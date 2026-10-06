export const errorHandler = (error, req, res, next) => {
  console.error("Roadmap service error:", {
    message: error.message,
    stack: error.stack,
    method: req.method,
    path: req.originalUrl,
  });

  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid request data.",
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Invalid roadmap data.",
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A conflicting roadmap already exists.",
    });
  }

  if (error.message === "Roadmap not found.") {
    return res.status(404).json({
      success: false,
      message: "Roadmap not found.",
    });
  }

  if (error.message === "User ID is required.") {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (error.message === "Roadmap ID is required.") {
    return res.status(400).json({
      success: false,
      message: "Roadmap ID is required.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};
