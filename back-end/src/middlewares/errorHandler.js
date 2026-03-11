function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = statusCode >= 500 ? "Server error" : err.message || "Request error";

  if (statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).json({ message });
}

module.exports = errorHandler;
