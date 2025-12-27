const requestService = require("./request.service");
const assignmentService = require("../assignments/assignment.service");
const logService = require("../logs/log.service");

class RequestController {
  /**
   * Create a new maintenance request
   * POST /api/requests
   */
  async createRequest(req, res, next) {
    try {
      const requestData = req.body;

      const request = await requestService.createRequest(requestData);

      res.status(201).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all maintenance requests
   * GET /api/requests?status=xxx&team_id=xxx&equipment_id=xxx&request_type=xxx&priority=xxx
   */
  async getAllRequests(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        team_id: req.query.team_id,
        equipment_id: req.query.equipment_id,
        request_type: req.query.request_type,
        priority: req.query.priority,
      };

      const requests = await requestService.getAllRequests(filters);

      res.status(200).json({
        success: true,
        data: requests,
        count: requests.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get request by ID
   * GET /api/requests/:id
   */
  async getRequestById(req, res, next) {
    try {
      const { id } = req.params;

      const request = await requestService.getRequestById(id);

      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update request details
   * PATCH /api/requests/:id
   */
  async updateRequest(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const request = await requestService.updateRequest(id, updates);

      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update request status
   * PATCH /api/requests/:id/status
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const request = await requestService.updateRequestStatus(id, status);

      res.status(200).json({
        success: true,
        message: "Request status updated successfully",
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Kanban view (requests grouped by status)
   * GET /api/requests/views/kanban?team_id=xxx&equipment_id=xxx
   */
  async getKanbanView(req, res, next) {
    try {
      const filters = {
        team_id: req.query.team_id,
        equipment_id: req.query.equipment_id,
      };

      const kanban = await requestService.getKanbanView(filters);

      res.status(200).json({
        success: true,
        data: kanban,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Calendar view (scheduled requests)
   * GET /api/requests/views/calendar?start_date=xxx&end_date=xxx&team_id=xxx
   */
  async getCalendarView(req, res, next) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        team_id: req.query.team_id,
      };

      const calendar = await requestService.getCalendarView(filters);

      res.status(200).json({
        success: true,
        data: calendar,
        count: calendar.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get SLA breached requests
   * GET /api/requests/sla/breached
   */
  async getSlaBreachedRequests(req, res, next) {
    try {
      const requests = await requestService.getSlaBreachedRequests();

      res.status(200).json({
        success: true,
        data: requests,
        count: requests.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get SLA at-risk requests (within 20% of breach)
   * GET /api/requests/sla/at-risk
   */
  async getSlaAtRiskRequests(req, res, next) {
    try {
      const requests = await requestService.getSlaAtRiskRequests();

      res.status(200).json({
        success: true,
        data: requests,
        count: requests.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign technician to a request
   * POST /api/requests/:id/assign
   */
  async assignTechnician(req, res, next) {
    try {
      const { id } = req.params;
      const { assigned_to, assigned_by } = req.body;

      const assignment = await assignmentService.assignTechnician({
        request_id: id,
        assigned_to,
        assigned_by,
      });

      res.status(200).json({
        success: true,
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get request logs/history
   * GET /api/requests/:id/logs
   */
  async getRequestLogs(req, res, next) {
    try {
      const { id } = req.params;

      const logs = await logService.getRequestLogs(id);

      res.status(200).json({
        success: true,
        data: logs,
        count: logs.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RequestController();
