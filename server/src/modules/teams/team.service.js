/**
 * Team Service
 *
 * Business logic for maintenance teams.
 * Enforces business rules and orchestrates repository calls.
 */

const teamRepository = require("./team.repository");
const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require("../../utils/errors");

class TeamService {
  /**
   * Create a new maintenance team
   * @param {Object} teamData - { name, description }
   * @returns {Promise<Object>} Created team
   */
  async createTeam({ name, description }) {
    // Validate input
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Team name is required");
    }

    if (name.length < 3) {
      throw new ValidationError("Team name must be at least 3 characters");
    }

    try {
      const team = await teamRepository.create({
        name: name.trim(),
        description: description?.trim() || null,
      });

      return team;
    } catch (error) {
      // Handle unique constraint violation
      if (error.code === "23505") {
        throw new ConflictError(`Team with name "${name}" already exists`);
      }
      throw error;
    }
  }

  /**
   * Get team by ID with statistics
   * @param {string} teamId - UUID
   * @returns {Promise<Object>} Team with stats
   */
  async getTeamById(teamId) {
    if (!teamId) {
      throw new ValidationError("Team ID is required");
    }

    const team = await teamRepository.findByIdWithStats(teamId);

    if (!team) {
      throw new NotFoundError("Team not found");
    }

    return team;
  }

  /**
   * Get all active teams
   * @returns {Promise<Array>} List of teams
   */
  async getAllTeams() {
    const teams = await teamRepository.findAll();
    return teams;
  }

  /**
   * Update team details
   * @param {string} teamId - UUID
   * @param {Object} updates - { name?, description? }
   * @returns {Promise<Object>} Updated team
   */
  async updateTeam(teamId, updates) {
    if (!teamId) {
      throw new ValidationError("Team ID is required");
    }

    // Validate updates
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim().length === 0) {
        throw new ValidationError("Team name cannot be empty");
      }
      if (updates.name.length < 3) {
        throw new ValidationError("Team name must be at least 3 characters");
      }
      updates.name = updates.name.trim();
    }

    if (updates.description !== undefined && updates.description !== null) {
      updates.description = updates.description.trim();
    }

    try {
      const team = await teamRepository.update(teamId, updates);

      if (!team) {
        throw new NotFoundError("Team not found");
      }

      return team;
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictError(
          `Team with name "${updates.name}" already exists`
        );
      }
      throw error;
    }
  }

  /**
   * Deactivate a team
   * @param {string} teamId - UUID
   * @returns {Promise<Object>} Deactivated team
   */
  async deactivateTeam(teamId) {
    if (!teamId) {
      throw new ValidationError("Team ID is required");
    }

    const team = await teamRepository.deactivate(teamId);

    if (!team) {
      throw new NotFoundError("Team not found");
    }

    return team;
  }

  /**
   * Add a technician to a team
   * Business Rule: Only users with role 'technician' can be added to teams
   * @param {string} teamId - UUID
   * @param {string} userId - UUID
   * @returns {Promise<Object>} Team member record
   */
  async addTechnicianToTeam(teamId, userId) {
    if (!teamId || !userId) {
      throw new ValidationError("Team ID and User ID are required");
    }

    // Verify team exists
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new NotFoundError("Team not found");
    }

    if (!team.is_active) {
      throw new ValidationError("Cannot add members to inactive team");
    }

    // Verify user exists and is a technician
    const user = await teamRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.is_active) {
      throw new ValidationError("Cannot add inactive user to team");
    }

    // BUSINESS RULE: Only technicians can be added to teams
    if (user.role !== "technician") {
      throw new ValidationError(
        "Only technicians can be added to maintenance teams"
      );
    }

    // Check if already a member
    const isMember = await teamRepository.isMember(teamId, userId);
    if (isMember) {
      throw new ConflictError("User is already a member of this team");
    }

    // Add member
    const membership = await teamRepository.addMember(teamId, userId);

    return {
      membership_id: membership.id,
      team_id: teamId,
      user_id: userId,
      user_name: user.name,
      user_email: user.email,
      joined_at: membership.joined_at,
    };
  }

  /**
   * Remove a technician from a team
   * @param {string} teamId - UUID
   * @param {string} userId - UUID
   * @returns {Promise<boolean>} True if removed
   */
  async removeTechnicianFromTeam(teamId, userId) {
    if (!teamId || !userId) {
      throw new ValidationError("Team ID and User ID are required");
    }

    // Verify team exists
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new NotFoundError("Team not found");
    }

    // Remove member
    const removed = await teamRepository.removeMember(teamId, userId);

    if (!removed) {
      throw new NotFoundError("User is not a member of this team");
    }

    return true;
  }

  /**
   * Get all members of a team
   * @param {string} teamId - UUID
   * @returns {Promise<Array>} List of team members
   */
  async getTeamMembers(teamId) {
    if (!teamId) {
      throw new ValidationError("Team ID is required");
    }

    // Verify team exists
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new NotFoundError("Team not found");
    }

    const members = await teamRepository.findMembers(teamId);
    return members;
  }
}

module.exports = new TeamService();
