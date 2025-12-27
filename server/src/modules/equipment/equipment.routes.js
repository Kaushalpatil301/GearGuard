/**
 * Equipment Routes
 *
 * Route definitions for equipment management endpoints.
 */

const express = require("express");
const router = express.Router();
const equipmentController = require("./equipment.controller");

// Equipment CRUD operations
router.post("/", equipmentController.createEquipment);
router.get("/", equipmentController.getAllEquipment);
router.get("/:id", equipmentController.getEquipmentById);
router.get("/:id/stats", equipmentController.getEquipmentWithStats);
router.patch("/:id", equipmentController.updateEquipment);

// Equipment-specific operations
router.patch("/:id/team", equipmentController.changeTeam);
router.patch("/:id/status", equipmentController.updateStatus);
router.post("/:id/scrap", equipmentController.markAsScrap);

// Equipment maintenance requests
router.get("/:id/requests", equipmentController.getEquipmentRequests);

module.exports = router;
