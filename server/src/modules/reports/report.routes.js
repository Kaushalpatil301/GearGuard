const express = require("express");
const router = express.Router();
const reportController = require("./report.controller");

// Report routes
router.get("/requests-by-team", reportController.getRequestsByTeam);
router.get("/requests-by-equipment", reportController.getRequestsByEquipment);
router.get("/equipment-downtime", reportController.getEquipmentDowntime);
router.get("/technician-workload", reportController.getTechnicianWorkload);
router.get("/sla-compliance", reportController.getSLACompliance);
router.get(
  "/sla-breach-stats-by-priority",
  reportController.getSLABreachStatsByPriority
);
router.get(
  "/sla-breach-stats-by-team",
  reportController.getSLABreachStatsByTeam
);
router.get("/request-aging", reportController.getRequestAging);

module.exports = router;
