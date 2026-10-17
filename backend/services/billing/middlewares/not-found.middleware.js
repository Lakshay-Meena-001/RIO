const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    success: false,
    code: "ROUTE_NOT_FOUND",
    message: "The requested billing route was not found",
    path: req.originalUrl,
  });
};

export default notFoundMiddleware;