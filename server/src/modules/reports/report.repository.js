const db = require("../../config/db");

class ReportRepository {
  /**
   * Get request statistics by team
   * @returns {Promise<Array>} Requests grouped by team with counts
   */
  async getRequestsByTeam() {
    const query = `
      SELECT 
        t.id as team_id,
        t.name as team_name,
        COUNT(mr.id) as total_requests,
        COUNT(CASE WHEN mr.status = 'NEW' THEN 1 END) as new_requests,
        COUNT(CASE WHEN mr.status = 'IN_PROGRESS' THEN 1 END) as in_progress_requests,
        COUNT(CASE WHEN mr.status = 'REPAIRED' THEN 1 END) as repaired_requests,
        COUNT(CASE WHEN mr.status = 'SCRAP' THEN 1 END) as scrap_requests,
        COUNT(CASE WHEN mr.request_type = 'PREVENTIVE' THEN 1 END) as preventive_requests,
        COUNT(CASE WHEN mr.request_type = 'CORRECTIVE' THEN 1 END) as corrective_requests
      FROM teams t
      LEFT JOIN maintenance_requests mr ON t.id = mr.team_id
      WHERE t.is_active = TRUE
      GROUP BY t.id, t.name
      ORDER BY total_requests DESC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get request statistics by equipment
   * @returns {Promise<Array>} Requests grouped by equipment
   */
  async getRequestsByEquipment() {
    const query = `
      SELECT 
        e.id as equipment_id,
        e.name as equipment_name,
        e.serial_number,
        e.status as equipment_status,
        t.name as team_name,
        COUNT(mr.id) as total_requests,
        COUNT(CASE WHEN mr.status = 'NEW' THEN 1 END) as new_requests,
        COUNT(CASE WHEN mr.status = 'IN_PROGRESS' THEN 1 END) as in_progress_requests,
        COUNT(CASE WHEN mr.status = 'REPAIRED' THEN 1 END) as repaired_requests,
        COUNT(CASE WHEN mr.status = 'SCRAP' THEN 1 END) as scrap_requests,
        MAX(mr.created_at) as last_request_date
      FROM equipment e
      LEFT JOIN teams t ON e.team_id = t.id
      LEFT JOIN maintenance_requests mr ON e.id = mr.equipment_id
      GROUP BY e.id, e.name, e.serial_number, e.status, t.name
      ORDER BY total_requests DESC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get overdue requests (computed at query time)
   * Business Rule: Overdue = scheduled_date < now AND status NOT IN (REPAIRED, SCRAP)
   * @returns {Promise<Array>} List of overdue requests
   */
  async getOverdueRequests() {
    const query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        t.name as team_name,
        u.name as created_by_name,
        ra.assigned_to,
        tech.name as assigned_to_name,
        (CURRENT_TIMESTAMP - mr.scheduled_date) as overdue_duration
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN teams t ON mr.team_id = t.id
      LEFT JOIN users u ON mr.created_by = u.id
      LEFT JOIN request_assignments ra ON mr.id = ra.request_id
      LEFT JOIN users tech ON ra.assigned_to = tech.id
      WHERE mr.scheduled_date IS NOT NULL
        AND mr.scheduled_date < CURRENT_TIMESTAMP
        AND mr.status NOT IN ('REPAIRED', 'SCRAP')
      ORDER BY mr.scheduled_date ASC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get overdue requests by team
   * @param {string} teamId - UUID (optional)
   * @returns {Promise<Array>} Overdue requests grouped by team
   */
  async getOverdueRequestsByTeam(teamId = null) {
    let query = `
      SELECT 
        t.id as team_id,
        t.name as team_name,
        COUNT(mr.id) as overdue_count,
        json_agg(
          json_build_object(
            'request_id', mr.id,
            'title', mr.title,
            'equipment_name', e.name,
            'scheduled_date', mr.scheduled_date,
            'priority', mr.priority,
            'assigned_to_name', tech.name
          ) ORDER BY mr.scheduled_date ASC
        ) FILTER (WHERE mr.id IS NOT NULL) as overdue_requests
      FROM teams t
      LEFT JOIN maintenance_requests mr ON t.id = mr.team_id 
        AND mr.scheduled_date IS NOT NULL
        AND mr.scheduled_date < CURRENT_TIMESTAMP
        AND mr.status NOT IN ('REPAIRED', 'SCRAP')
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN request_assignments ra ON mr.id = ra.request_id
      LEFT JOIN users tech ON ra.assigned_to = tech.id
      WHERE t.is_active = TRUE
    `;

    const values = [];
    if (teamId) {
      query += ` AND t.id = $1`;
      values.push(teamId);
    }

    query += ` GROUP BY t.id, t.name ORDER BY overdue_count DESC`;

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Get calendar view with all scheduled requests
   * @param {Object} filters - { start_date?, end_date?, team_id? }
   * @returns {Promise<Array>} Scheduled requests for calendar
   */
  async getCalendarData(filters = {}) {
    let query = `
      SELECT 
        mr.id,
        mr.title,
        mr.description,
        mr.request_type,
        mr.status,
        mr.priority,
        mr.scheduled_date,
        e.id as equipment_id,
        e.name as equipment_name,
        t.id as team_id,
        t.name as team_name,
        ra.assigned_to,
        tech.name as assigned_to_name,
        CASE 
          WHEN mr.scheduled_date < CURRENT_TIMESTAMP 
            AND mr.status NOT IN ('REPAIRED', 'SCRAP')
          THEN TRUE
          ELSE FALSE
        END as is_overdue
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN teams t ON mr.team_id = t.id
      LEFT JOIN request_assignments ra ON mr.id = ra.request_id
      LEFT JOIN users tech ON ra.assigned_to = tech.id
      WHERE mr.scheduled_date IS NOT NULL
    `;

    const values = [];
    let paramCount = 1;

    if (filters.start_date) {
      query += ` AND mr.scheduled_date >= $${paramCount++}`;
      values.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ` AND mr.scheduled_date <= $${paramCount++}`;
      values.push(filters.end_date);
    }

    if (filters.team_id) {
      query += ` AND mr.team_id = $${paramCount++}`;
      values.push(filters.team_id);
    }

    query += ` ORDER BY mr.scheduled_date ASC`;

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Get technician workload statistics
   * @returns {Promise<Array>} Workload per technician
   */
  async getTechnicianWorkload() {
    const query = `
      SELECT 
        u.id as technician_id,
        u.name as technician_name,
        u.email as technician_email,
        COUNT(ra.id) as total_assignments,
        COUNT(CASE WHEN mr.status = 'IN_PROGRESS' THEN 1 END) as active_assignments,
        COUNT(CASE WHEN mr.status = 'REPAIRED' THEN 1 END) as completed_assignments,
        COUNT(CASE 
          WHEN mr.scheduled_date IS NOT NULL 
            AND mr.scheduled_date < CURRENT_TIMESTAMP 
            AND mr.status NOT IN ('REPAIRED', 'SCRAP')
          THEN 1 
        END) as overdue_assignments,
        json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as teams
      FROM users u
      LEFT JOIN request_assignments ra ON u.id = ra.assigned_to
      LEFT JOIN maintenance_requests mr ON ra.request_id = mr.id
      LEFT JOIN team_members tm ON u.id = tm.user_id
      LEFT JOIN teams t ON tm.team_id = t.id
      WHERE u.role = 'technician' AND u.is_active = TRUE
      GROUP BY u.id, u.name, u.email
      ORDER BY active_assignments DESC, overdue_assignments DESC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get request statistics by priority
   * @returns {Promise<Array>} Requests grouped by priority
   */
  async getRequestsByPriority() {
    const query = `
      SELECT 
        mr.priority,
        COUNT(mr.id) as total_requests,
        COUNT(CASE WHEN mr.status = 'NEW' THEN 1 END) as new_requests,
        COUNT(CASE WHEN mr.status = 'IN_PROGRESS' THEN 1 END) as in_progress_requests,
        COUNT(CASE WHEN mr.status = 'REPAIRED' THEN 1 END) as repaired_requests,
        COUNT(CASE WHEN mr.status = 'SCRAP' THEN 1 END) as scrap_requests,
        COUNT(CASE 
          WHEN mr.scheduled_date IS NOT NULL 
            AND mr.scheduled_date < CURRENT_TIMESTAMP 
            AND mr.status NOT IN ('REPAIRED', 'SCRAP')
          THEN 1 
        END) as overdue_requests,
        AVG(CASE 
          WHEN mr.status IN ('REPAIRED', 'SCRAP') 
          THEN EXTRACT(EPOCH FROM (mr.updated_at - mr.created_at)) / 3600 
        END) as avg_completion_hours
      FROM maintenance_requests mr
      GROUP BY mr.priority
      ORDER BY 
        CASE mr.priority
          WHEN 'CRITICAL' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'MEDIUM' THEN 3
          WHEN 'LOW' THEN 4
        END
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get request statistics by type
   * @returns {Promise<Array>} Requests grouped by type (PREVENTIVE vs CORRECTIVE)
   */
  async getRequestsByType() {
    const query = `
      SELECT 
        mr.request_type,
        COUNT(mr.id) as total_requests,
        COUNT(CASE WHEN mr.status = 'NEW' THEN 1 END) as new_requests,
        COUNT(CASE WHEN mr.status = 'IN_PROGRESS' THEN 1 END) as in_progress_requests,
        COUNT(CASE WHEN mr.status = 'REPAIRED' THEN 1 END) as repaired_requests,
        COUNT(CASE WHEN mr.status = 'SCRAP' THEN 1 END) as scrap_requests,
        COUNT(CASE WHEN mr.scheduled_date IS NOT NULL THEN 1 END) as scheduled_requests,
        COUNT(CASE 
          WHEN mr.scheduled_date IS NOT NULL 
            AND mr.scheduled_date < CURRENT_TIMESTAMP 
            AND mr.status NOT IN ('REPAIRED', 'SCRAP')
          THEN 1 
        END) as overdue_requests,
        AVG(CASE 
          WHEN mr.status IN ('REPAIRED', 'SCRAP') 
          THEN EXTRACT(EPOCH FROM (mr.updated_at - mr.created_at)) / 3600 
        END) as avg_completion_hours
      FROM maintenance_requests mr
      GROUP BY mr.request_type
      ORDER BY mr.request_type
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get equipment health summary
   * @returns {Promise<Array>} Equipment with health indicators
   */
  async getEquipmentHealthSummary() {
    const query = `
      SELECT 
        e.id as equipment_id,
        e.name as equipment_name,
        e.serial_number,
        e.status as equipment_status,
        e.location,
        t.name as team_name,
        COUNT(mr.id) as total_requests,
        COUNT(CASE WHEN mr.status IN ('NEW', 'IN_PROGRESS') THEN 1 END) as active_requests,
        COUNT(CASE WHEN mr.status = 'SCRAP' THEN 1 END) as scrap_requests,
        MAX(mr.created_at) as last_request_date,
        COUNT(CASE 
          WHEN mr.scheduled_date IS NOT NULL 
            AND mr.scheduled_date < CURRENT_TIMESTAMP 
            AND mr.status NOT IN ('REPAIRED', 'SCRAP')
          THEN 1 
        END) as overdue_requests,
        CASE 
          WHEN e.status = 'SCRAPPED' THEN 'CRITICAL'
          WHEN COUNT(CASE WHEN mr.status = 'SCRAP' THEN 1 END) > 0 THEN 'CRITICAL'
          WHEN COUNT(CASE 
            WHEN mr.scheduled_date IS NOT NULL 
              AND mr.scheduled_date < CURRENT_TIMESTAMP 
              AND mr.status NOT IN ('REPAIRED', 'SCRAP')
            THEN 1 
          END) > 0 THEN 'WARNING'
          WHEN COUNT(CASE WHEN mr.status IN ('NEW', 'IN_PROGRESS') THEN 1 END) > 2 THEN 'WARNING'
          ELSE 'GOOD'
        END as health_status
      FROM equipment e
      LEFT JOIN teams t ON e.team_id = t.id
      LEFT JOIN maintenance_requests mr ON e.id = mr.equipment_id
      GROUP BY e.id, e.name, e.serial_number, e.status, e.location, t.name
      ORDER BY 
        CASE 
          WHEN e.status = 'SCRAPPED' THEN 1
          WHEN COUNT(CASE WHEN mr.status = 'SCRAP' THEN 1 END) > 0 THEN 2
          ELSE 3
        END,
        overdue_requests DESC,
        active_requests DESC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get request trends over time
   * @param {Object} params - { period: 'day'|'week'|'month', limit?: number }
   * @returns {Promise<Array>} Time-series data of requests
   */
  async getRequestTrends(params = {}) {
    const period = params.period || "day";
    const limit = params.limit || 30;

    let dateFormat;
    let dateInterval;

    switch (period) {
      case "month":
        dateFormat = "YYYY-MM";
        dateInterval = "1 month";
        break;
      case "week":
        dateFormat = "IYYY-IW";
        dateInterval = "1 week";
        break;
      case "day":
      default:
        dateFormat = "YYYY-MM-DD";
        dateInterval = "1 day";
        break;
    }

    const query = `
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${limit} ${period}',
          CURRENT_DATE,
          INTERVAL '${dateInterval}'
        )::date as period_date
      )
      SELECT 
        TO_CHAR(ds.period_date, '${dateFormat}') as period,
        COUNT(mr.id) as total_created,
        COUNT(CASE WHEN mr.request_type = 'PREVENTIVE' THEN 1 END) as preventive_created,
        COUNT(CASE WHEN mr.request_type = 'CORRECTIVE' THEN 1 END) as corrective_created,
        COUNT(CASE WHEN mr.status = 'REPAIRED' THEN 1 END) as repaired_count,
        COUNT(CASE WHEN mr.status = 'SCRAP' THEN 1 END) as scrap_count
      FROM date_series ds
      LEFT JOIN maintenance_requests mr ON DATE(mr.created_at) = ds.period_date
      GROUP BY ds.period_date
      ORDER BY ds.period_date DESC
      LIMIT ${limit}
    `;

    const result = await db.query(query);
    return result.rows.reverse(); // Return chronological order
  }

  /**
   * Get team performance metrics
   * @returns {Promise<Array>} Performance metrics by team
   */
  async getTeamPerformanceMetrics() {
    const query = `
      SELECT 
        t.id as team_id,
        t.name as team_name,
        COUNT(DISTINCT tm.user_id) as member_count,
        COUNT(mr.id) as total_requests,
        COUNT(CASE WHEN mr.status = 'REPAIRED' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN mr.status IN ('NEW', 'IN_PROGRESS') THEN 1 END) as active_requests,
        COUNT(CASE 
          WHEN mr.scheduled_date IS NOT NULL 
            AND mr.scheduled_date < CURRENT_TIMESTAMP 
            AND mr.status NOT IN ('REPAIRED', 'SCRAP')
          THEN 1 
        END) as overdue_requests,
        ROUND(
          CASE 
            WHEN COUNT(mr.id) > 0 
            THEN (COUNT(CASE WHEN mr.status = 'REPAIRED' THEN 1 END)::numeric / COUNT(mr.id)::numeric) * 100
            ELSE 0 
          END, 2
        ) as completion_rate_percent,
        AVG(CASE 
          WHEN mr.status IN ('REPAIRED', 'SCRAP') 
          THEN EXTRACT(EPOCH FROM (mr.updated_at - mr.created_at)) / 3600 
        END) as avg_resolution_hours
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN maintenance_requests mr ON t.id = mr.team_id
      WHERE t.is_active = TRUE
      GROUP BY t.id, t.name
      ORDER BY completion_rate_percent DESC, avg_resolution_hours ASC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get SLA breach statistics by team
   * @returns {Promise<Array>} SLA breach counts grouped by team
   */
  async getSlaBreachStatsByTeam() {
    const query = `
      SELECT 
        t.id as team_id,
        t.name as team_name,
        COUNT(mr.id) as total_active_requests,
        COUNT(CASE 
          WHEN (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) > mr.sla_hours 
          THEN 1 
        END) as breached_requests,
        COUNT(CASE 
          WHEN (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) <= mr.sla_hours
            AND (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) >= (mr.sla_hours * 0.8)
          THEN 1 
        END) as at_risk_requests,
        COUNT(CASE 
          WHEN (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) < (mr.sla_hours * 0.8)
          THEN 1 
        END) as on_track_requests,
        ROUND(
          AVG(CASE 
            WHEN (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) > mr.sla_hours 
            THEN ((EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) - mr.sla_hours)
          END), 
          2
        ) as avg_breach_hours
      FROM teams t
      LEFT JOIN maintenance_requests mr ON t.id = mr.team_id
        AND mr.status NOT IN ('REPAIRED', 'SCRAP')
      WHERE t.is_active = TRUE
      GROUP BY t.id, t.name
      ORDER BY breached_requests DESC, at_risk_requests DESC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get SLA breach statistics by priority
   * @returns {Promise<Array>} SLA breach counts grouped by priority
   */
  async getSlaBreachStatsByPriority() {
    const query = `
      SELECT 
        mr.priority,
        COUNT(mr.id) as total_active_requests,
        COUNT(CASE 
          WHEN (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) > mr.sla_hours 
          THEN 1 
        END) as breached_requests,
        COUNT(CASE 
          WHEN (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) <= mr.sla_hours
            AND (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) >= (mr.sla_hours * 0.8)
          THEN 1 
        END) as at_risk_requests,
        COUNT(CASE 
          WHEN (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) < (mr.sla_hours * 0.8)
          THEN 1 
        END) as on_track_requests,
        ROUND(
          AVG(CASE 
            WHEN (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) > mr.sla_hours 
            THEN ((EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mr.created_at)) / 3600) - mr.sla_hours)
          END), 
          2
        ) as avg_breach_hours,
        ROUND(AVG(mr.sla_hours), 2) as avg_sla_hours
      FROM maintenance_requests mr
      WHERE mr.status NOT IN ('REPAIRED', 'SCRAP')
      GROUP BY mr.priority
      ORDER BY 
        CASE mr.priority
          WHEN 'CRITICAL' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'MEDIUM' THEN 3
          WHEN 'LOW' THEN 4
        END
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get dashboard summary statistics
   * @returns {Promise<Object>} Overall system statistics
   */
  async getDashboardSummary() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM equipment WHERE status != 'SCRAPPED') as active_equipment,
        (SELECT COUNT(*) FROM equipment WHERE status = 'SCRAPPED') as scrapped_equipment,
        (SELECT COUNT(*) FROM teams WHERE is_active = TRUE) as active_teams,
        (SELECT COUNT(*) FROM users WHERE role = 'technician' AND is_active = TRUE) as active_technicians,
        (SELECT COUNT(*) FROM maintenance_requests WHERE status = 'NEW') as new_requests,
        (SELECT COUNT(*) FROM maintenance_requests WHERE status = 'IN_PROGRESS') as in_progress_requests,
        (SELECT COUNT(*) FROM maintenance_requests WHERE status = 'REPAIRED') as completed_requests,
        (SELECT COUNT(*) FROM maintenance_requests 
          WHERE scheduled_date IS NOT NULL 
            AND scheduled_date < CURRENT_TIMESTAMP 
            AND status NOT IN ('REPAIRED', 'SCRAP')
        ) as overdue_requests,
        (SELECT COUNT(*) FROM request_assignments WHERE completed_at IS NULL) as active_assignments,
        (SELECT COUNT(*) FROM maintenance_requests WHERE request_type = 'PREVENTIVE') as preventive_requests,
        (SELECT COUNT(*) FROM maintenance_requests WHERE request_type = 'CORRECTIVE') as corrective_requests
    `;

    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = new ReportRepository();
