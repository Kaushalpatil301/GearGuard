const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRepository = require("./auth.repository");
const { ValidationError, AuthenticationError } = require("../../utils/errors");
const { USER_ROLE } = require("../../config/constants");

// Security constants
const SALT_ROUNDS = 12; // Bcrypt salt rounds (higher = more secure but slower)
const JWT_EXPIRY = "7d"; // Token expiration time
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

class AuthService {
  /**
   * Register a new user
   * @param {Object} signupData - Signup data
   * @param {string} signupData.name - User's full name
   * @param {string} signupData.email - User's email
   * @param {string} signupData.password - Plain text password
   * @param {string} [signupData.role='USER'] - User role
   * @returns {Promise<Object>} User object and JWT token
   */
  async signup({ name, email, password, role = USER_ROLE.USER }) {
    // Validation
    if (!name || !email || !password) {
      throw new ValidationError("Name, email, and password are required");
    }

    if (!this.isValidEmail(email)) {
      throw new ValidationError("Invalid email format");
    }

    if (password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long");
    }

    // Validate role
    if (!Object.values(USER_ROLE).includes(role)) {
      throw new ValidationError(
        `Invalid role. Must be one of: ${Object.values(USER_ROLE).join(", ")}`
      );
    }

    // Check if email already exists
    const emailExists = await authRepository.emailExists(email);
    if (emailExists) {
      throw new ValidationError("Email already registered");
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await authRepository.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      role,
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  /**
   * Login user with email and password
   * @param {Object} loginData - Login credentials
   * @param {string} loginData.email - User's email
   * @param {string} loginData.password - Plain text password
   * @returns {Promise<Object>} User object and JWT token
   */
  async login({ email, password }) {
    // Validation
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    // Find user by email (with password hash)
    const user = await authRepository.findByEmailWithPassword(
      email.toLowerCase().trim()
    );

    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Check if user is active
    if (!user.is_active) {
      throw new AuthenticationError("Account is deactivated");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Remove password_hash from user object
    const { password_hash, ...safeUser } = user;

    // Generate JWT token
    const token = this.generateToken(safeUser);

    return {
      user: safeUser,
      token,
    };
  }

  /**
   * Verify JWT token and return user data
   * @param {string} token - JWT token
   * @returns {Promise<Object>} User data from token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Optionally verify user still exists and is active
      const user = await authRepository.findById(decoded.id);

      if (!user || !user.is_active) {
        throw new AuthenticationError("Invalid or expired token");
      }

      return user;
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        throw new AuthenticationError("Invalid token");
      }
      if (error.name === "TokenExpiredError") {
        throw new AuthenticationError("Token expired");
      }
      throw error;
    }
  }

  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      issuer: "gearguard-api",
    });
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = new AuthService();
