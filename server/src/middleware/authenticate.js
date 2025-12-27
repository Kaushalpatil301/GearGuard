const authService = require("../modules/auth/auth.service");
const { AuthenticationError } = require("../utils/errors");

/**
 * Authentication Middleware
 *
 * Verifies JWT token from Authorization header and attaches user to req.user
 *
 * Usage:
 *   router.get('/protected', authenticate, controller.method);
 *
 * Expected Header:
 *   Authorization: Bearer <jwt_token>
 *
 * Sets req.user to:
 *   { id, name, email, role, is_active, created_at, updated_at }
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError("No authorization token provided");
    }

    // Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError(
        "Invalid authorization format. Expected: Bearer <token>"
      );
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      throw new AuthenticationError("No token provided");
    }

    // Verify token and get user
    const user = await authService.verifyToken(token);

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    // Pass authentication errors to error handler
    next(error);
  }
};

module.exports = authenticate;
