/**
 * Request Routes
 *
 * Route definitions for maintenance request endpoints.
 */

const express = require("express");
const router = express.Router();
const requestController = require("./request.controller");

// Special views (must be before :id routes to avoid conflicts)
router.get("/views/kanban", requestController.getKanbanView);
router.get("/views/calendar", requestController.getCalendarView);

// Request CRUD operations
router.post("/", requestController.createRequest);
router.get("/", requestController.getAllRequests);
router.get("/:id", requestController.getRequestById);
router.patch("/:id", requestController.updateRequest);

// Request status management
router.patch("/:id/status", requestController.updateStatus);

module.exports = router;
