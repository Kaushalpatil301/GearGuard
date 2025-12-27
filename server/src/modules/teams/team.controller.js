const teamService = require("./team.service");

class TeamController {
  /**
   * Create a new team
   * POST /api/teams
   */
  async createTeam(req, res, next) {
    try {
      const { name, description } = req.body;

      const team = await teamService.createTeam({ name, description });

      res.status(201).json({
        success: true,
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all teams
   * GET /api/teams
   */
  async getAllTeams(req, res, next) {
    try {
      const teams = await teamService.getAllTeams();

      res.status(200).json({
        success: true,
        data: teams,
        count: teams.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get team by ID
   * GET /api/teams/:id
   */
  async getTeamById(req, res, next) {
    try {
      const { id } = req.params;

      const team = await teamService.getTeamById(id);

      res.status(200).json({
        success: true,
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update team
   * PATCH /api/teams/:id
   */
  async updateTeam(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const team = await teamService.updateTeam(id, updates);

      res.status(200).json({
        success: true,
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate team
   * DELETE /api/teams/:id
   */
  async deactivateTeam(req, res, next) {
    try {
      const { id } = req.params;

      const team = await teamService.deactivateTeam(id);

      res.status(200).json({
        success: true,
        message: "Team deactivated successfully",
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add technician to team
   * POST /api/teams/:id/members
   */
  async addMember(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const membership = await teamService.addTechnicianToTeam(id, userId);

      res.status(201).json({
        success: true,
        message: "Technician added to team successfully",
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove technician from team
   * DELETE /api/teams/:id/members/:userId
   */
  async removeMember(req, res, next) {
    try {
      const { id, userId } = req.params;

      await teamService.removeTechnicianFromTeam(id, userId);

      res.status(200).json({
        success: true,
        message: "Technician removed from team successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get team members
   * GET /api/teams/:id/members
   */
  async getTeamMembers(req, res, next) {
    try {
      const { id } = req.params;

      const members = await teamService.getTeamMembers(id);

      res.status(200).json({
        success: true,
        data: members,
        count: members.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TeamController();
