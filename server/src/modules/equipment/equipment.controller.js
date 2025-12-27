/**
 * Equipment Controller
 *
 * HTTP request handlers for equipment endpoints.
 * Thin layer - delegates all logic to service.
 */

const equipmentService = require("./equipment.service");

class EquipmentController {
  /**
   * Create new equipment
   * POST /api/equipment
   */
  async createEquipment(req, res, next) {
    try {
      const equipmentData = req.body;

      const equipment = await equipmentService.createEquipment(equipmentData);

      res.status(201).json({
        success: true,
        data: equipment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all equipment
   * GET /api/equipment?team_id=xxx&status=xxx
   */
  async getAllEquipment(req, res, next) {
    try {
      const filters = {
        team_id: req.query.team_id,
        status: req.query.status,
      };

      const equipment = await equipmentService.getAllEquipment(filters);

      res.status(200).json({
        success: true,
        data: equipment,
        count: equipment.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get equipment by ID
   * GET /api/equipment/:id
   */
  async getEquipmentById(req, res, next) {
    try {
      const { id } = req.params;

      const equipment = await equipmentService.getEquipmentById(id);

      res.status(200).json({
        success: true,
        data: equipment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get equipment with statistics
   * GET /api/equipment/:id/stats
   */
  async getEquipmentWithStats(req, res, next) {
    try {
      const { id } = req.params;

      const equipment = await equipmentService.getEquipmentWithStats(id);

      res.status(200).json({
        success: true,
        data: equipment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update equipment
   * PATCH /api/equipment/:id
   */
  async updateEquipment(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const equipment = await equipmentService.updateEquipment(id, updates);

      res.status(200).json({
        success: true,
        data: equipment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change equipment maintenance team
   * PATCH /api/equipment/:id/team
   */
  async changeTeam(req, res, next) {
    try {
      const { id } = req.params;
      const { team_id } = req.body;

      const equipment = await equipmentService.changeMaintenanceTeam(
        id,
        team_id
      );

      res.status(200).json({
        success: true,
        message: "Maintenance team changed successfully",
        data: equipment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update equipment status
   * PATCH /api/equipment/:id/status
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const equipment = await equipmentService.updateEquipmentStatus(
        id,
        status
      );

      res.status(200).json({
        success: true,
        message: "Equipment status updated successfully",
        data: equipment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark equipment as scrapped
   * POST /api/equipment/:id/scrap
   */
  async markAsScrap(req, res, next) {
    try {
      const { id } = req.params;

      const equipment = await equipmentService.markAsScrap(id);

      res.status(200).json({
        success: true,
        message: "Equipment marked as scrapped",
        data: equipment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get maintenance requests for equipment
   * GET /api/equipment/:id/requests
   */
  async getEquipmentRequests(req, res, next) {
    try {
      const { id } = req.params;

      const requests = await equipmentService.getEquipmentRequests(id);

      res.status(200).json({
        success: true,
        data: requests,
        count: requests.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EquipmentController();
