const db = require("../../config/db");

class EquipmentRepository {
  /**
   * Create new equipment
   * @param {Object} equipmentData - { name, description, serial_number, department, owner_id, team_id, location, purchase_date, warranty_end_date }
   * @returns {Promise<Object>} Created equipment
   */
  async create({
    name,
    description,
    serial_number,
    department,
    owner_id,
    team_id,
    location,
    purchase_date,
    warranty_end_date,
  }) {
    const query = `
      INSERT INTO equipment (name, description, serial_number, department, owner_id, team_id, location, purchase_date, warranty_end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await db.query(query, [
      name,
      description || null,
      serial_number,
      department || null,
      owner_id || null,
      team_id,
      location || null,
      purchase_date || null,
      warranty_end_date || null,
    ]);
    return result.rows[0];
  }

  /**
   * Find equipment by ID
   * @param {string} equipmentId - UUID
   * @returns {Promise<Object|null>} Equipment or null
   */
  async findById(equipmentId) {
    const query = `
      SELECT * FROM equipment
      WHERE id = $1
    `;
    const result = await db.query(query, [equipmentId]);
    return result.rows[0] || null;
  }

  /**
   * Find equipment by ID with team details
   * @param {string} equipmentId - UUID
   * @returns {Promise<Object|null>} Equipment with team info
   */
  async findByIdWithTeam(equipmentId) {
    const query = `
      SELECT 
        e.*,
        t.name as team_name,
        t.description as team_description
      FROM equipment e
      LEFT JOIN teams t ON e.team_id = t.id
      WHERE e.id = $1
    `;
    const result = await db.query(query, [equipmentId]);
    return result.rows[0] || null;
  }

  /**
   * Find equipment by serial number
   * @param {string} serialNumber
   * @returns {Promise<Object|null>} Equipment or null
   */
  async findBySerialNumber(serialNumber) {
    const query = `
      SELECT * FROM equipment
      WHERE serial_number = $1
    `;
    const result = await db.query(query, [serialNumber]);
    return result.rows[0] || null;
  }

  /**
   * Find all equipment with optional filters
   * @param {Object} filters - { team_id?, status?, limit?, offset? }
   * @returns {Promise<Array>} List of equipment
   */
  async findAll(filters = {}) {
    let query = `
      SELECT 
        e.*,
        t.name as team_name
      FROM equipment e
      LEFT JOIN teams t ON e.team_id = t.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.team_id) {
      query += ` AND e.team_id = $${paramCount++}`;
      values.push(filters.team_id);
    }

    if (filters.status) {
      query += ` AND e.status = $${paramCount++}`;
      values.push(filters.status);
    }

    query += ` ORDER BY e.name ASC`;

    const limit = filters.limit || 100;
    const offset = filters.offset || 0;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(limit, offset);

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Update equipment details
   * @param {string} equipmentId - UUID
   * @param {Object} updates - { name?, description?, department?, owner_id?, location?, purchase_date?, warranty_end_date? }
   * @returns {Promise<Object|null>} Updated equipment or null
   */
  async update(equipmentId, updates) {
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

    if (updates.department !== undefined) {
      fields.push(`department = $${paramCount++}`);
      values.push(updates.department);
    }

    if (updates.owner_id !== undefined) {
      fields.push(`owner_id = $${paramCount++}`);
      values.push(updates.owner_id);
    }

    if (updates.location !== undefined) {
      fields.push(`location = $${paramCount++}`);
      values.push(updates.location);
    }

    if (updates.purchase_date !== undefined) {
      fields.push(`purchase_date = $${paramCount++}`);
      values.push(updates.purchase_date);
    }

    if (updates.warranty_end_date !== undefined) {
      fields.push(`warranty_end_date = $${paramCount++}`);
      values.push(updates.warranty_end_date);
    }

    if (fields.length === 0) {
      return this.findById(equipmentId);
    }

    values.push(equipmentId);
    const query = `
      UPDATE equipment
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Change equipment status
   * @param {string} equipmentId - UUID
   * @param {string} status - equipment_status enum value
   * @returns {Promise<Object|null>} Updated equipment or null
   */
  async updateStatus(equipmentId, status) {
    const query = `
      UPDATE equipment
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [status, equipmentId]);
    return result.rows[0] || null;
  }

  /**
   * Change equipment maintenance team
   * @param {string} equipmentId - UUID
   * @param {string} teamId - UUID
   * @returns {Promise<Object|null>} Updated equipment or null
   */
  async changeTeam(equipmentId, teamId) {
    const query = `
      UPDATE equipment
      SET team_id = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [teamId, equipmentId]);
    return result.rows[0] || null;
  }

  /**
   * Get maintenance requests for equipment
   * @param {string} equipmentId - UUID
   * @returns {Promise<Array>} List of maintenance requests
   */
  async findRequests(equipmentId) {
    const query = `
      SELECT 
        mr.*,
        u.name as created_by_name,
        t.name as team_name
      FROM maintenance_requests mr
      LEFT JOIN users u ON mr.created_by = u.id
      LEFT JOIN teams t ON mr.team_id = t.id
      WHERE mr.equipment_id = $1
      ORDER BY mr.created_at DESC
    `;
    const result = await db.query(query, [equipmentId]);
    return result.rows;
  }

  /**
   * Count maintenance requests by status for equipment
   * @param {string} equipmentId - UUID
   * @returns {Promise<Object>} Count by status
   */
  async countRequestsByStatus(equipmentId) {
    const query = `
      SELECT 
        status,
        COUNT(*) as count
      FROM maintenance_requests
      WHERE equipment_id = $1
      GROUP BY status
    `;
    const result = await db.query(query, [equipmentId]);

    const counts = {
      NEW: 0,
      IN_PROGRESS: 0,
      REPAIRED: 0,
      SCRAP: 0,
    };

    result.rows.forEach((row) => {
      counts[row.status] = parseInt(row.count);
    });

    return counts;
  }

  /**
   * Verify team exists
   * @param {string} teamId - UUID
   * @returns {Promise<boolean>} True if team exists and is active
   */
  async teamExists(teamId) {
    const query = `
      SELECT 1 FROM teams
      WHERE id = $1 AND is_active = TRUE
    `;
    const result = await db.query(query, [teamId]);
    return result.rowCount > 0;
  }
}

module.exports = new EquipmentRepository();
