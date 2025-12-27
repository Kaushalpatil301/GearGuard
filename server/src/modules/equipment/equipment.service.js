/**
 * Equipment Service
 *
 * Business logic for equipment management.
 * Enforces business rules and orchestrates repository calls.
 */

const equipmentRepository = require("./equipment.repository");
const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require("../../utils/errors");
const { EQUIPMENT_STATUS } = require("../../config/constants");

class EquipmentService {
  /**
   * Create new equipment
   * Business Rule: Equipment must always have a maintenance team
   * @param {Object} equipmentData - Equipment details
   * @returns {Promise<Object>} Created equipment
   */
  async createEquipment({
    name,
    description,
    serial_number,
    team_id,
    location,
    purchase_date,
  }) {
    // Validate required fields
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Equipment name is required");
    }

    if (name.length < 3) {
      throw new ValidationError("Equipment name must be at least 3 characters");
    }

    if (!serial_number || serial_number.trim().length === 0) {
      throw new ValidationError("Serial number is required");
    }

    // BUSINESS RULE: Equipment must always have a maintenance team
    if (!team_id) {
      throw new ValidationError("Maintenance team is required");
    }

    // Verify team exists and is active
    const teamExists = await equipmentRepository.teamExists(team_id);
    if (!teamExists) {
      throw new NotFoundError("Maintenance team not found or inactive");
    }

    // Check serial number uniqueness
    const existing = await equipmentRepository.findBySerialNumber(
      serial_number.trim()
    );
    if (existing) {
      throw new ConflictError(
        `Equipment with serial number "${serial_number}" already exists`
      );
    }

    try {
      const equipment = await equipmentRepository.create({
        name: name.trim(),
        description: description?.trim() || null,
        serial_number: serial_number.trim(),
        team_id,
        location: location?.trim() || null,
        purchase_date: purchase_date || null,
      });

      return equipment;
    } catch (error) {
      // Handle foreign key constraint violations
      if (error.code === "23503") {
        throw new NotFoundError("Referenced team does not exist");
      }
      // Handle unique constraint violations
      if (error.code === "23505") {
        throw new ConflictError(
          "Equipment with this serial number already exists"
        );
      }
      throw error;
    }
  }

  /**
   * Get equipment by ID with team details
   * @param {string} equipmentId - UUID
   * @returns {Promise<Object>} Equipment with team info
   */
  async getEquipmentById(equipmentId) {
    if (!equipmentId) {
      throw new ValidationError("Equipment ID is required");
    }

    const equipment = await equipmentRepository.findByIdWithTeam(equipmentId);

    if (!equipment) {
      throw new NotFoundError("Equipment not found");
    }

    return equipment;
  }

  /**
   * Get all equipment with optional filters
   * @param {Object} filters - { team_id?, status? }
   * @returns {Promise<Array>} List of equipment
   */
  async getAllEquipment(filters = {}) {
    // Validate status filter if provided
    if (
      filters.status &&
      !Object.values(EQUIPMENT_STATUS).includes(filters.status)
    ) {
      throw new ValidationError(
        `Invalid status. Must be one of: ${Object.values(EQUIPMENT_STATUS).join(
          ", "
        )}`
      );
    }

    const equipment = await equipmentRepository.findAll(filters);
    return equipment;
  }

  /**
   * Update equipment details
   * @param {string} equipmentId - UUID
   * @param {Object} updates - Equipment fields to update
   * @returns {Promise<Object>} Updated equipment
   */
  async updateEquipment(equipmentId, updates) {
    if (!equipmentId) {
      throw new ValidationError("Equipment ID is required");
    }

    // Validate name if provided
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim().length === 0) {
        throw new ValidationError("Equipment name cannot be empty");
      }
      if (updates.name.length < 3) {
        throw new ValidationError(
          "Equipment name must be at least 3 characters"
        );
      }
      updates.name = updates.name.trim();
    }

    // Trim string fields
    if (updates.description !== undefined && updates.description !== null) {
      updates.description = updates.description.trim();
    }

    if (updates.location !== undefined && updates.location !== null) {
      updates.location = updates.location.trim();
    }

    const equipment = await equipmentRepository.update(equipmentId, updates);

    if (!equipment) {
      throw new NotFoundError("Equipment not found");
    }

    return equipment;
  }

  /**
   * Change equipment maintenance team
   * Business Rule: Equipment must always have a maintenance team
   * @param {string} equipmentId - UUID
   * @param {string} newTeamId - UUID
   * @returns {Promise<Object>} Updated equipment
   */
  async changeMaintenanceTeam(equipmentId, newTeamId) {
    if (!equipmentId) {
      throw new ValidationError("Equipment ID is required");
    }

    if (!newTeamId) {
      throw new ValidationError("New team ID is required");
    }

    // Verify equipment exists
    const equipment = await equipmentRepository.findById(equipmentId);
    if (!equipment) {
      throw new NotFoundError("Equipment not found");
    }

    // Verify new team exists and is active
    const teamExists = await equipmentRepository.teamExists(newTeamId);
    if (!teamExists) {
      throw new NotFoundError("New maintenance team not found or inactive");
    }

    // Check if already assigned to this team
    if (equipment.team_id === newTeamId) {
      throw new ValidationError("Equipment is already assigned to this team");
    }

    const updated = await equipmentRepository.changeTeam(
      equipmentId,
      newTeamId
    );
    return updated;
  }

  /**
   * Mark equipment as scrapped
   * Business Rule: Scrapped equipment cannot accept new requests (enforced in request module)
   * @param {string} equipmentId - UUID
   * @returns {Promise<Object>} Updated equipment
   */
  async markAsScrap(equipmentId) {
    if (!equipmentId) {
      throw new ValidationError("Equipment ID is required");
    }

    const equipment = await equipmentRepository.findById(equipmentId);
    if (!equipment) {
      throw new NotFoundError("Equipment not found");
    }

    if (equipment.status === EQUIPMENT_STATUS.SCRAPPED) {
      throw new ValidationError("Equipment is already marked as scrapped");
    }

    const updated = await equipmentRepository.updateStatus(
      equipmentId,
      EQUIPMENT_STATUS.SCRAPPED
    );
    return updated;
  }

  /**
   * Update equipment status
   * @param {string} equipmentId - UUID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated equipment
   */
  async updateEquipmentStatus(equipmentId, status) {
    if (!equipmentId) {
      throw new ValidationError("Equipment ID is required");
    }

    if (!status) {
      throw new ValidationError("Status is required");
    }

    if (!Object.values(EQUIPMENT_STATUS).includes(status)) {
      throw new ValidationError(
        `Invalid status. Must be one of: ${Object.values(EQUIPMENT_STATUS).join(
          ", "
        )}`
      );
    }

    const equipment = await equipmentRepository.findById(equipmentId);
    if (!equipment) {
      throw new NotFoundError("Equipment not found");
    }

    const updated = await equipmentRepository.updateStatus(equipmentId, status);
    return updated;
  }

  /**
   * Get maintenance requests for equipment
   * @param {string} equipmentId - UUID
   * @returns {Promise<Array>} List of maintenance requests
   */
  async getEquipmentRequests(equipmentId) {
    if (!equipmentId) {
      throw new ValidationError("Equipment ID is required");
    }

    // Verify equipment exists
    const equipment = await equipmentRepository.findById(equipmentId);
    if (!equipment) {
      throw new NotFoundError("Equipment not found");
    }

    const requests = await equipmentRepository.findRequests(equipmentId);
    return requests;
  }

  /**
   * Get equipment with maintenance statistics
   * @param {string} equipmentId - UUID
   * @returns {Promise<Object>} Equipment with stats
   */
  async getEquipmentWithStats(equipmentId) {
    if (!equipmentId) {
      throw new ValidationError("Equipment ID is required");
    }

    const equipment = await equipmentRepository.findByIdWithTeam(equipmentId);
    if (!equipment) {
      throw new NotFoundError("Equipment not found");
    }

    const requestCounts = await equipmentRepository.countRequestsByStatus(
      equipmentId
    );

    return {
      ...equipment,
      request_counts: requestCounts,
      total_requests: Object.values(requestCounts).reduce(
        (sum, count) => sum + count,
        0
      ),
    };
  }
}

module.exports = new EquipmentService();
