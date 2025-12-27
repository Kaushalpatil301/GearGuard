const assignmentRepository = require("./assignment.repository");
const logService = require("../logs/log.service");
const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require("../../utils/errors");
const { REQUEST_STATUS } = require("../../config/constants");

class AssignmentService {
  /**
   * Assign a technician to a maintenance request
   *
   * Business Rules:
   * - Only NEW requests can be assigned
   * - Technician must be a member of the request's team
   * - One request can only have one assignment (DB constraint enforces this)
   * - Assignment automatically moves request status from NEW to IN_PROGRESS
   * - Must be atomic and concurrency-safe (uses transactions)
   *
   * @param {Object} assignmentData - { request_id, assigned_to, assigned_by }
   * @returns {Promise<Object>} Created assignment with request details
   */
  async assignTechnician({ request_id, assigned_to, assigned_by }) {
    // Validate required fields
    if (!request_id) {
      throw new ValidationError("Request ID is required");
    }

    if (!assigned_to) {
      throw new ValidationError("Technician ID (assigned_to) is required");
    }

    if (!assigned_by) {
      throw new ValidationError("Assigner ID (assigned_by) is required");
    }

    // Verify assigned_by user exists
    const assignerUser = await assignmentRepository.findUserById(assigned_by);
    if (!assignerUser) {
      throw new NotFoundError("Assigner user not found");
    }

    if (!assignerUser.is_active) {
      throw new ValidationError("Assigner user is inactive");
    }

    // Verify technician exists and is active
    const technician = await assignmentRepository.findUserById(assigned_to);
    if (!technician) {
      throw new NotFoundError("Technician not found");
    }

    if (!technician.is_active) {
      throw new ValidationError("Cannot assign to inactive technician");
    }

    // BUSINESS RULE: Only technicians can be assigned
    if (technician.role !== "technician") {
      throw new ValidationError(
        'Can only assign requests to users with role "technician"'
      );
    }

    // BUSINESS RULE: Prevent self-assignment
    if (assigned_to === assigned_by) {
      throw new ValidationError(
        "Cannot self-assign requests. Assignment must be done by a manager."
      );
    }

    // Check if request is already assigned
    const existingAssignment =
      await assignmentRepository.findAssignmentByRequestId(request_id);
    if (existingAssignment) {
      throw new ConflictError(
        `Request is already assigned to ${existingAssignment.assigned_to_name}`
      );
    }

    // Start transaction for concurrency safety
    const client = await assignmentRepository.beginTransaction();

    try {
      // Lock the request row to prevent concurrent assignments
      const request = await assignmentRepository.findRequestByIdForUpdate(
        client,
        request_id
      );

      if (!request) {
        throw new NotFoundError("Maintenance request not found");
      }

      // BUSINESS RULE: Only NEW requests can be assigned
      if (request.status !== REQUEST_STATUS.NEW) {
        throw new ValidationError(
          `Cannot assign request with status "${request.status}". Only NEW requests can be assigned.`
        );
      }

      // BUSINESS RULE: Technician must be a member of the request's team
      const isTeamMember = await assignmentRepository.isUserInTeam(
        assigned_to,
        request.team_id
      );
      if (!isTeamMember) {
        throw new ValidationError(
          `Technician must be a member of the request's maintenance team`
        );
      }

      // Create the assignment
      const assignment = await assignmentRepository.create(client, {
        request_id,
        assigned_to,
        assigned_by,
      });

      // Update request status from NEW to IN_PROGRESS
      await assignmentRepository.updateRequestStatus(
        client,
        request_id,
        REQUEST_STATUS.IN_PROGRESS
      );

      // Commit transaction
      await assignmentRepository.commit(client);

      // Log the assignment action (after commit, non-critical)
      try {
        await logService.logAction({
          request_id,
          user_id: assigned_by,
          action: "request_assigned",
          details: {
            assigned_to,
            assigned_to_name: technician.name,
            assigned_by_name: assignerUser.name,
            previous_status: REQUEST_STATUS.NEW,
            new_status: REQUEST_STATUS.IN_PROGRESS,
          },
        });
      } catch (logError) {
        // Log errors should not fail the assignment
        console.error("Failed to log assignment action:", logError);
      }

      // Return enriched assignment data
      return {
        ...assignment,
        assigned_to_name: technician.name,
        assigned_to_email: technician.email,
        assigned_by_name: assignerUser.name,
        request_status: REQUEST_STATUS.IN_PROGRESS,
      };
    } catch (error) {
      // Rollback transaction on any error
      try {
        await assignmentRepository.rollback(client);
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
        client.release();
      }

      // Handle unique constraint violation (race condition)
      if (
        error.code === "23505" &&
        error.constraint === "uq_assignment_request"
      ) {
        throw new ConflictError(
          "Request is already assigned (race condition detected)"
        );
      }

      throw error;
    }
  }

  /**
   * Get assignment for a request
   * @param {string} requestId - UUID
   * @returns {Promise<Object|null>} Assignment or null
   */
  async getAssignmentByRequestId(requestId) {
    if (!requestId) {
      throw new ValidationError("Request ID is required");
    }

    const assignment = await assignmentRepository.findAssignmentByRequestId(
      requestId
    );
    return assignment;
  }

  /**
   * Get assignment by ID
   * @param {string} assignmentId - UUID
   * @returns {Promise<Object>} Assignment details
   */
  async getAssignmentById(assignmentId) {
    if (!assignmentId) {
      throw new ValidationError("Assignment ID is required");
    }

    const assignment = await assignmentRepository.findById(assignmentId);

    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    return assignment;
  }

  /**
   * Get all assignments for a technician
   * @param {string} technicianId - UUID
   * @param {Object} filters - { status? }
   * @returns {Promise<Array>} List of assignments
   */
  async getTechnicianAssignments(technicianId, filters = {}) {
    if (!technicianId) {
      throw new ValidationError("Technician ID is required");
    }

    // Verify technician exists
    const technician = await assignmentRepository.findUserById(technicianId);
    if (!technician) {
      throw new NotFoundError("Technician not found");
    }

    // Validate status filter
    if (
      filters.status &&
      !Object.values(REQUEST_STATUS).includes(filters.status)
    ) {
      throw new ValidationError(
        `Invalid status. Must be one of: ${Object.values(REQUEST_STATUS).join(
          ", "
        )}`
      );
    }

    const assignments = await assignmentRepository.findByTechnician(
      technicianId,
      filters
    );
    return assignments;
  }

  /**
   * Mark assignment as completed
   * @param {string} assignmentId - UUID
   * @param {string} notes - Optional completion notes
   * @returns {Promise<Object>} Updated assignment
   */
  async completeAssignment(assignmentId, notes) {
    if (!assignmentId) {
      throw new ValidationError("Assignment ID is required");
    }

    const assignment = await assignmentRepository.findById(assignmentId);

    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    if (assignment.completed_at) {
      throw new ValidationError("Assignment is already marked as completed");
    }

    // Verify request status allows completion
    const request = await assignmentRepository.findRequestById(
      assignment.request_id
    );
    if (request && request.status === "IN_PROGRESS") {
      throw new ValidationError(
        "Cannot complete assignment while request status is IN_PROGRESS. Update request status to REPAIRED or SCRAP first."
      );
    }

    const updated = await assignmentRepository.markCompleted(
      assignmentId,
      notes
    );

    // Log completion (non-critical)
    try {
      await logService.logAction({
        request_id: assignment.request_id,
        user_id: assignment.assigned_to,
        action: "assignment_completed",
        details: {
          assignment_id: assignmentId,
          notes: notes || null,
        },
      });
    } catch (logError) {
      console.error("Failed to log assignment completion:", logError);
    }

    return updated;
  }
}

module.exports = new AssignmentService();
