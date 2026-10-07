const errorHandler = (err, req, res, next) => {
  console.error("Roadmap Service Error:", err);

  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message: statusCode === 500 ? "Internal server error." : err.message,
  };

  /*
   * In development, expose the stack trace
   * to make debugging easier.
   *
   * Never expose it in production.
   */
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
