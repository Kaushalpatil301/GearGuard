const authService = require("./auth.service");

class AuthController {
  /**
   * User signup
   * POST /api/auth/signup
   * Body: { name, email, password, role? }
   */
  async signup(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      const result = await authService.signup({ name, email, password, role });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User login
   * POST /api/auth/login
   * Body: { email, password }
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   * Requires authentication middleware
   */
  async getProfile(req, res, next) {
    try {
      // req.user is populated by authenticate middleware
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
