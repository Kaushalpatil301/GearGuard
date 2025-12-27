const express = require("express");
const router = express.Router();
const teamController = require("./team.controller");

router.post("/", teamController.createTeam);
router.get("/", teamController.getAllTeams);
router.get("/:id", teamController.getTeamById);
router.patch("/:id", teamController.updateTeam);
router.delete("/:id", teamController.deactivateTeam);

router.post("/:id/members", teamController.addMember);
router.delete("/:id/members/:userId", teamController.removeMember);
router.get("/:id/members", teamController.getTeamMembers);

module.exports = router;
