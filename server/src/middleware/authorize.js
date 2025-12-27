const { AuthorizationError } = require("../utils/errors");

/**
 * Authorization Middleware (Role-Based Access Control)
 *
 * Checks if authenticated user has one of the allowed roles
 * MUST be used AFTER authenticate middleware
 *
 * Usage:
 *   // Single role
 *   router.post('/admin-only', authenticate, authorize('ADMIN'), controller.method);
 *
 *   // Multiple roles
 *   router.post('/teams', authenticate, authorize(['MANAGER', 'ADMIN']), controller.method);
 *
 * @param {string|string[]} allowedRoles - Role(s) that can access the route
 * @returns {Function} Express middleware function
 */
const authorize = (allowedRoles) => {
  // Normalize to array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    try {
      // Check if user is authenticated (should be set by authenticate middleware)
      if (!req.user) {
        throw new AuthorizationError("Authentication required");
      }

      // Check if user has required role
      if (!roles.includes(req.user.role)) {
        throw new AuthorizationError(
          `Access denied. Required role: ${roles.join(" or ")}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = authorize;
