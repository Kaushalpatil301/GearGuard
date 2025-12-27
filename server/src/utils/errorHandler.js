/**
 * Global Error Handler Middleware
 *
 * Catches all errors and returns consistent JSON responses.
 */

const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error("Error:", err);

  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Send JSON response
  res.status(statusCode).json({
    success: false,
    error: {
      name: err.name,
      message: message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
