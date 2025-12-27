/**
 * Team Repository
 *
 * Data access layer for maintenance teams.
 * Contains raw SQL queries with no business logic.
 */

const db = require("../../config/db");

class TeamRepository {
  /**
   * Create a new maintenance team
   * @param {Object} teamData - { name, description }
   * @returns {Promise<Object>} Created team
   */
  async create({ name, description }) {
    const query = `
      INSERT INTO teams (name, description)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await db.query(query, [name, description]);
    return result.rows[0];
  }

  /**
   * Find team by ID
   * @param {string} teamId - UUID
   * @returns {Promise<Object|null>} Team or null
   */
  async findById(teamId) {
    const query = `
      SELECT * FROM teams
      WHERE id = $1
    `;
    const result = await db.query(query, [teamId]);
    return result.rows[0] || null;
  }

  /**
   * Find all active teams
   * @returns {Promise<Array>} List of teams
   */
  async findAll() {
    const query = `
      SELECT * FROM teams
      WHERE is_active = TRUE
      ORDER BY name ASC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Update team details
   * @param {string} teamId - UUID
   * @param {Object} updates - { name?, description? }
   * @returns {Promise<Object|null>} Updated team or null
   */
  async update(teamId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }

    if (fields.length === 0) {
      return this.findById(teamId);
    }

    values.push(teamId);
    const query = `
      UPDATE teams
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Soft delete team (set is_active to false)
   * @param {string} teamId - UUID
   * @returns {Promise<Object|null>} Deactivated team or null
   */
  async deactivate(teamId) {
    const query = `
      UPDATE teams
      SET is_active = FALSE
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [teamId]);
    return result.rows[0] || null;
  }

  /**
   * Add a user to a team
   * @param {string} teamId - UUID
   * @param {string} userId - UUID
   * @returns {Promise<Object>} Created team_member record
   */
  async addMember(teamId, userId) {
    const query = `
      INSERT INTO team_members (team_id, user_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await db.query(query, [teamId, userId]);
    return result.rows[0];
  }

  /**
   * Remove a user from a team
   * @param {string} teamId - UUID
   * @param {string} userId - UUID
   * @returns {Promise<boolean>} True if removed, false if not found
   */
  async removeMember(teamId, userId) {
    const query = `
      DELETE FROM team_members
      WHERE team_id = $1 AND user_id = $2
      RETURNING id
    `;
    const result = await db.query(query, [teamId, userId]);
    return result.rowCount > 0;
  }

  /**
   * Get all members of a team with user details
   * @param {string} teamId - UUID
   * @returns {Promise<Array>} List of team members with user info
   */
  async findMembers(teamId) {
    const query = `
      SELECT 
        tm.id as membership_id,
        tm.joined_at,
        u.id as user_id,
        u.name,
        u.email,
        u.role
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = $1 AND u.is_active = TRUE
      ORDER BY tm.joined_at ASC
    `;
    const result = await db.query(query, [teamId]);
    return result.rows;
  }

  /**
   * Check if user is already a member of the team
   * @param {string} teamId - UUID
   * @param {string} userId - UUID
   * @returns {Promise<boolean>} True if user is in team
   */
  async isMember(teamId, userId) {
    const query = `
      SELECT 1 FROM team_members
      WHERE team_id = $1 AND user_id = $2
    `;
    const result = await db.query(query, [teamId, userId]);
    return result.rowCount > 0;
  }

  /**
   * Get user details by ID
   * @param {string} userId - UUID
   * @returns {Promise<Object|null>} User or null
   */
  async findUserById(userId) {
    const query = `
      SELECT id, name, email, role, is_active
      FROM users
      WHERE id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Get team with member count
   * @param {string} teamId - UUID
   * @returns {Promise<Object|null>} Team with member_count
   */
  async findByIdWithStats(teamId) {
    const query = `
      SELECT 
        t.*,
        COUNT(tm.id) as member_count
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE t.id = $1
      GROUP BY t.id
    `;
    const result = await db.query(query, [teamId]);
    return result.rows[0] || null;
  }
}

module.exports = new TeamRepository();
