const reportRepository = require("./report.repository");

class ReportController {
  /**
   * Get requests by team report
   * GET /api/reports/requests-by-team
   */
  async getRequestsByTeam(req, res, next) {
    try {
      const report = await reportRepository.getRequestsByTeam();
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get requests by equipment report
   * GET /api/reports/requests-by-equipment
   */
  async getRequestsByEquipment(req, res, next) {
    try {
      const report = await reportRepository.getRequestsByEquipment();
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get equipment downtime report
   * GET /api/reports/equipment-downtime
   */
  async getEquipmentDowntime(req, res, next) {
    try {
      const report = await reportRepository.getEquipmentDowntime();
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get technician workload report
   * GET /api/reports/technician-workload
   */
  async getTechnicianWorkload(req, res, next) {
    try {
      const report = await reportRepository.getTechnicianWorkload();
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get SLA compliance report
   * GET /api/reports/sla-compliance
   */
  async getSLACompliance(req, res, next) {
    try {
      const report = await reportRepository.getSlaBreachStatsByPriority();
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get SLA breach statistics by priority
   * GET /api/reports/sla-breach-stats-by-priority
   */
  async getSLABreachStatsByPriority(req, res, next) {
    try {
      const report = await reportRepository.getSlaBreachStatsByPriority();
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get SLA breach statistics by team
   * GET /api/reports/sla-breach-stats-by-team
   */
  async getSLABreachStatsByTeam(req, res, next) {
    try {
      const report = await reportRepository.getSlaBreachStatsByTeam();
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get request aging report
   * GET /api/reports/request-aging
   */
  async getRequestAging(req, res, next) {
    try {
      const report = await reportRepository.getRequestAging();
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
