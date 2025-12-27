const express = require("express");
const router = express.Router();
const requestController = require("./request.controller");

router.get("/views/kanban", requestController.getKanbanView);
router.get("/views/calendar", requestController.getCalendarView);
router.get("/sla/breached", requestController.getSlaBreachedRequests);
router.get("/sla/at-risk", requestController.getSlaAtRiskRequests);

router.post("/", requestController.createRequest);
router.get("/", requestController.getAllRequests);
router.get("/:id", requestController.getRequestById);
router.patch("/:id", requestController.updateRequest);

router.patch("/:id/status", requestController.updateStatus);

module.exports = router;
