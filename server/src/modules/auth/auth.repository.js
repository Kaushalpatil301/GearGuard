const pool = require("../../config/db");

class AuthRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email (unique)
   * @param {string} userData.password_hash - Bcrypt hashed password
   * @param {string} [userData.role='USER'] - User role
   * @returns {Promise<Object>} Created user (without password_hash)
   */
  async createUser({ name, email, password_hash, role = "USER" }) {
    const query = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, is_active, created_at, updated_at
    `;

    const result = await pool.query(query, [name, email, password_hash, role]);
    return result.rows[0];
  }

  /**
   * Find user by email (includes password_hash for authentication)
   * @param {string} email - User's email
   * @returns {Promise<Object|null>} User with password_hash or null
   */
  async findByEmailWithPassword(email) {
    const query = `
      SELECT id, name, email, password_hash, role, is_active, created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by email (safe, no password_hash)
   * @param {string} email - User's email
   * @returns {Promise<Object|null>} User without password_hash or null
   */
  async findByEmail(email) {
    const query = `
      SELECT id, name, email, role, is_active, created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by ID (safe, no password_hash)
   * @param {string} userId - User's UUID
   * @returns {Promise<Object|null>} User without password_hash or null
   */
  async findById(userId) {
    const query = `
      SELECT id, name, email, role, is_active, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Check if email already exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if exists
   */
  async emailExists(email) {
    const query = `
      SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0].exists;
  }
}

module.exports = new AuthRepository();
