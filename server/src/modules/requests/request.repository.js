const db = require("../../config/db");

class RequestRepository {
  /**
   * Create a new maintenance request
   * @param {Object} requestData - Request details
   * @returns {Promise<Object>} Created request
   */
  async create({
    equipment_id,
    team_id,
    request_type,
    title,
    description,
    priority,
    scheduled_date,
    sla_hours,
    created_by,
  }) {
    const query = `
      INSERT INTO maintenance_requests 
        (equipment_id, team_id, request_type, title, description, priority, scheduled_date, sla_hours, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await db.query(query, [
      equipment_id,
      team_id,
      request_type,
      title,
      description,
      priority || "MEDIUM",
      scheduled_date || null,
      sla_hours || 48,
      created_by,
    ]);
    return result.rows[0];
  }

  /**
   * Find request by ID
   * @param {string} requestId - UUID
   * @returns {Promise<Object|null>} Request or null
   */
  async findById(requestId) {
    const query = `
      SELECT * FROM maintenance_requests
      WHERE id = $1
    `;
    const result = await db.query(query, [requestId]);
    return result.rows[0] || null;
  }

  /**
   * Get SLA breached requests (dynamically computed)
   * @returns {Promise<Array>} Requests that have breached SLA
   */
  async findSlaBreached() {
    const query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number,
        t.name as team_name,
        (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600)::DECIMAL(10,2) as hours_elapsed,
        CASE 
          WHEN (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) > mr.sla_hours 
          THEN true 
          ELSE false 
        END as is_breached
      FROM maintenance_requests mr
      JOIN equipment e ON mr.equipment_id = e.id
      JOIN teams t ON mr.team_id = t.id
      WHERE mr.status NOT IN ('REPAIRED', 'SCRAP')
        AND (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) > mr.sla_hours
      ORDER BY mr.created_at ASC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get SLA at-risk requests (within 20% of breach)
   * @returns {Promise<Array>} Requests at risk of SLA breach
   */
  async findSlaAtRisk() {
    const query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number,
        t.name as team_name,
        (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600)::DECIMAL(10,2) as hours_elapsed,
        (mr.sla_hours - (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600))::DECIMAL(10,2) as hours_remaining,
        ((EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) / mr.sla_hours * 100)::DECIMAL(5,2) as sla_percentage
      FROM maintenance_requests mr
      JOIN equipment e ON mr.equipment_id = e.id
      JOIN teams t ON mr.team_id = t.id
      WHERE mr.status NOT IN ('REPAIRED', 'SCRAP')
        AND (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) <= mr.sla_hours
        AND (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) >= (mr.sla_hours * 0.8)
      ORDER BY hours_remaining ASC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Find request by ID with related data
   * @param {string} requestId - UUID
   * @returns {Promise<Object|null>} Request with equipment, team, creator info
   */
  async findByIdWithDetails(requestId) {
    const query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        e.status as equipment_status,
        t.name as team_name,
        u.name as created_by_name,
        u.email as created_by_email,
        ra.assigned_to,
        ra.assigned_at,
        tech.name as assigned_to_name,
        -- SLA calculations (only for open requests)
        CASE 
          WHEN mr.status IN ('REPAIRED', 'SCRAP') THEN NULL
          ELSE (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600)::DECIMAL(10,2)
        END as sla_hours_elapsed,
        CASE 
          WHEN mr.status IN ('REPAIRED', 'SCRAP') THEN NULL
          ELSE (mr.sla_hours - (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600))::DECIMAL(10,2)
        END as sla_hours_remaining,
        CASE 
          WHEN mr.status IN ('REPAIRED', 'SCRAP') THEN FALSE
          WHEN (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) > mr.sla_hours THEN TRUE
          ELSE FALSE
        END as sla_breached
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN teams t ON mr.team_id = t.id
      LEFT JOIN users u ON mr.created_by = u.id
      LEFT JOIN request_assignments ra ON mr.id = ra.request_id
      LEFT JOIN users tech ON ra.assigned_to = tech.id
      WHERE mr.id = $1
    `;
    const result = await db.query(query, [requestId]);
    return result.rows[0] || null;
  }

  /**
   * Find all requests with optional filters
   * @param {Object} filters - { status?, team_id?, equipment_id?, request_type?, priority?, limit?, offset? }
   * @returns {Promise<Array>} List of requests
   */
  async findAll(filters = {}) {
    let query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        t.name as team_name,
        u.name as created_by_name,
        ra.assigned_to,
        tech.name as assigned_to_name
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN teams t ON mr.team_id = t.id
      LEFT JOIN users u ON mr.created_by = u.id
      LEFT JOIN request_assignments ra ON mr.id = ra.request_id
      LEFT JOIN users tech ON ra.assigned_to = tech.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND mr.status = $${paramCount++}`;
      values.push(filters.status);
    }

    if (filters.team_id) {
      query += ` AND mr.team_id = $${paramCount++}`;
      values.push(filters.team_id);
    }

    if (filters.equipment_id) {
      query += ` AND mr.equipment_id = $${paramCount++}`;
      values.push(filters.equipment_id);
    }

    if (filters.request_type) {
      query += ` AND mr.request_type = $${paramCount++}`;
      values.push(filters.request_type);
    }

    if (filters.priority) {
      query += ` AND mr.priority = $${paramCount++}`;
      values.push(filters.priority);
    }

    query += ` ORDER BY mr.created_at DESC`;

    const limit = filters.limit || 100;
    const offset = filters.offset || 0;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(limit, offset);

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Update request status
   * @param {string} requestId - UUID
   * @param {string} status - New status
   * @returns {Promise<Object|null>} Updated request or null
   */
  async updateStatus(requestId, status) {
    const query = `
      UPDATE maintenance_requests
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [status, requestId]);
    return result.rows[0] || null;
  }

  /**
   * Update request details
   * @param {string} requestId - UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated request or null
   */
  async update(requestId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }

    if (updates.priority !== undefined) {
      fields.push(`priority = $${paramCount++}`);
      values.push(updates.priority);
    }

    if (updates.scheduled_date !== undefined) {
      fields.push(`scheduled_date = $${paramCount++}`);
      values.push(updates.scheduled_date);
    }

    if (updates.duration_hours !== undefined) {
      fields.push(`duration_hours = $${paramCount++}`);
      values.push(updates.duration_hours);
    }

    if (fields.length === 0) {
      return this.findById(requestId);
    }

    values.push(requestId);
    const query = `
      UPDATE maintenance_requests
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Get requests grouped by status (Kanban view)
   * @param {Object} filters - Optional filters (team_id, equipment_id)
   * @returns {Promise<Object>} Requests grouped by status
   */
  async getKanbanView(filters = {}) {
    let query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        t.name as team_name,
        creator.name as created_by_name,
        ra.assigned_to,
        tech.name as assigned_to_name,
        -- SLA calculations (only for open requests)
        CASE 
          WHEN mr.status IN ('REPAIRED', 'SCRAP') THEN NULL
          ELSE (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600)::DECIMAL(10,2)
        END as sla_hours_elapsed,
        CASE 
          WHEN mr.status IN ('REPAIRED', 'SCRAP') THEN NULL
          ELSE (mr.sla_hours - (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600))::DECIMAL(10,2)
        END as sla_hours_remaining,
        CASE 
          WHEN mr.status IN ('REPAIRED', 'SCRAP') THEN FALSE
          WHEN (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) > mr.sla_hours THEN TRUE
          ELSE FALSE
        END as sla_breached
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN teams t ON mr.team_id = t.id
      LEFT JOIN users creator ON mr.created_by = creator.id
      LEFT JOIN request_assignments ra ON mr.id = ra.request_id
      LEFT JOIN users tech ON ra.assigned_to = tech.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.team_id) {
      query += ` AND mr.team_id = $${paramCount++}`;
      values.push(filters.team_id);
    }

    if (filters.equipment_id) {
      query += ` AND mr.equipment_id = $${paramCount++}`;
      values.push(filters.equipment_id);
    }

    query += ` ORDER BY mr.created_at DESC`;

    const result = await db.query(query, values);

    // Group by status
    const grouped = {
      NEW: [],
      IN_PROGRESS: [],
      REPAIRED: [],
      SCRAP: [],
    };

    result.rows.forEach((request) => {
      grouped[request.status].push(request);
    });

    return grouped;
  }

  /**
   * Get scheduled requests for calendar view
   * @param {Object} filters - { start_date?, end_date?, team_id? }
   * @returns {Promise<Array>} Scheduled requests
   */
  async getCalendarView(filters = {}) {
    let query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        t.name as team_name,
        ra.assigned_to,
        tech.name as assigned_to_name,
        creator.name as created_by_name,
        COALESCE(mr.scheduled_date, mr.created_at) as event_date
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN teams t ON mr.team_id = t.id
      LEFT JOIN request_assignments ra ON mr.id = ra.request_id
      LEFT JOIN users tech ON ra.assigned_to = tech.id
      LEFT JOIN users creator ON mr.created_by = creator.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.start_date) {
      query += ` AND COALESCE(mr.scheduled_date, mr.created_at) >= $${paramCount++}`;
      values.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ` AND COALESCE(mr.scheduled_date, mr.created_at) <= $${paramCount++}`;
      values.push(filters.end_date);
    }

    if (filters.team_id) {
      query += ` AND mr.team_id = $${paramCount++}`;
      values.push(filters.team_id);
    }

    query += ` ORDER BY COALESCE(mr.scheduled_date, mr.created_at) ASC`;

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Get equipment by ID
   * @param {string} equipmentId - UUID
   * @returns {Promise<Object|null>} Equipment or null
   */
  async getEquipment(equipmentId) {
    const query = `
      SELECT id, name, serial_number, team_id, status
      FROM equipment
      WHERE id = $1
    `;
    const result = await db.query(query, [equipmentId]);
    return result.rows[0] || null;
  }

  /**
   * Verify user exists
   * @param {string} userId - UUID
   * @returns {Promise<boolean>} True if user exists and is active
   */
  async userExists(userId) {
    const query = `
      SELECT 1 FROM users
      WHERE id = $1 AND is_active = TRUE
    `;
    const result = await db.query(query, [userId]);
    return result.rowCount > 0;
  }
}

module.exports = new RequestRepository();
