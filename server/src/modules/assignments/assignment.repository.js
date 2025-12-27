/**
 * Assignment Repository
 *
 * Data access layer for request assignments.
 * Contains raw SQL queries with transaction support.
 */

const db = require("../../config/db");

class AssignmentRepository {
  /**
   * Create a request assignment (should be called within a transaction)
   * @param {Object} client - Database client (transaction)
   * @param {Object} assignmentData - { request_id, assigned_to, assigned_by }
   * @returns {Promise<Object>} Created assignment
   */
  async create(client, { request_id, assigned_to, assigned_by }) {
    const query = `
      INSERT INTO request_assignments (request_id, assigned_to, assigned_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await client.query(query, [
      request_id,
      assigned_to,
      assigned_by,
    ]);
    return result.rows[0];
  }

  /**
   * Update request status (should be called within a transaction)
   * @param {Object} client - Database client (transaction)
   * @param {string} requestId - UUID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated request
   */
  async updateRequestStatus(client, requestId, status) {
    const query = `
      UPDATE maintenance_requests
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await client.query(query, [status, requestId]);
    return result.rows[0];
  }

  /**
   * Find request by ID (for validation)
   * @param {string} requestId - UUID
   * @returns {Promise<Object|null>} Request or null
   */
  async findRequestById(requestId) {
    const query = `
      SELECT * FROM maintenance_requests
      WHERE id = $1
    `;
    const result = await db.query(query, [requestId]);
    return result.rows[0] || null;
  }

  /**
   * Find request by ID with lock (within transaction)
   * @param {Object} client - Database client (transaction)
   * @param {string} requestId - UUID
   * @returns {Promise<Object|null>} Request or null
   */
  async findRequestByIdForUpdate(client, requestId) {
    const query = `
      SELECT * FROM maintenance_requests
      WHERE id = $1
      FOR UPDATE
    `;
    const result = await client.query(query, [requestId]);
    return result.rows[0] || null;
  }

  /**
   * Check if assignment exists for a request
   * @param {string} requestId - UUID
   * @returns {Promise<Object|null>} Assignment or null
   */
  async findAssignmentByRequestId(requestId) {
    const query = `
      SELECT 
        ra.*,
        u.name as assigned_to_name,
        u.email as assigned_to_email,
        ab.name as assigned_by_name
      FROM request_assignments ra
      LEFT JOIN users u ON ra.assigned_to = u.id
      LEFT JOIN users ab ON ra.assigned_by = ab.id
      WHERE ra.request_id = $1
    `;
    const result = await db.query(query, [requestId]);
    return result.rows[0] || null;
  }

  /**
   * Find assignment by ID
   * @param {string} assignmentId - UUID
   * @returns {Promise<Object|null>} Assignment or null
   */
  async findById(assignmentId) {
    const query = `
      SELECT 
        ra.*,
        u.name as assigned_to_name,
        u.email as assigned_to_email,
        ab.name as assigned_by_name
      FROM request_assignments ra
      LEFT JOIN users u ON ra.assigned_to = u.id
      LEFT JOIN users ab ON ra.assigned_by = ab.id
      WHERE ra.id = $1
    `;
    const result = await db.query(query, [assignmentId]);
    return result.rows[0] || null;
  }

  /**
   * Check if user is a member of a team
   * @param {string} userId - UUID
   * @param {string} teamId - UUID
   * @returns {Promise<boolean>} True if user is team member
   */
  async isUserInTeam(userId, teamId) {
    const query = `
      SELECT 1 FROM team_members
      WHERE user_id = $1 AND team_id = $2
    `;
    const result = await db.query(query, [userId, teamId]);
    return result.rowCount > 0;
  }

  /**
   * Get user by ID with role validation
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
   * Find all assignments for a technician
   * @param {string} technicianId - UUID
   * @param {Object} filters - { status? }
   * @returns {Promise<Array>} List of assignments
   */
  async findByTechnician(technicianId, filters = {}) {
    let query = `
      SELECT 
        ra.*,
        mr.title as request_title,
        mr.status as request_status,
        mr.priority as request_priority,
        mr.scheduled_date,
        e.name as equipment_name,
        t.name as team_name
      FROM request_assignments ra
      JOIN maintenance_requests mr ON ra.request_id = mr.id
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN teams t ON mr.team_id = t.id
      WHERE ra.assigned_to = $1
    `;
    const values = [technicianId];
    let paramCount = 2;

    if (filters.status) {
      query += ` AND mr.status = $${paramCount++}`;
      values.push(filters.status);
    }

    query += ` ORDER BY mr.scheduled_date ASC NULLS LAST, mr.created_at DESC`;

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Mark assignment as completed
   * @param {string} assignmentId - UUID
   * @param {string} notes - Completion notes
   * @returns {Promise<Object|null>} Updated assignment
   */
  async markCompleted(assignmentId, notes) {
    const query = `
      UPDATE request_assignments
      SET completed_at = CURRENT_TIMESTAMP,
          notes = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [notes || null, assignmentId]);
    return result.rows[0] || null;
  }

  /**
   * Begin a database transaction
   * @returns {Promise<Object>} Database client with transaction
   */
  async beginTransaction() {
    const client = await db.pool.connect();
    await client.query("BEGIN");
    return client;
  }

  /**
   * Commit a transaction
   * @param {Object} client - Database client
   */
  async commit(client) {
    await client.query("COMMIT");
    client.release();
  }

  /**
   * Rollback a transaction
   * @param {Object} client - Database client
   */
  async rollback(client) {
    await client.query("ROLLBACK");
    client.release();
  }
}

module.exports = new AssignmentRepository();
