const requestRepository = require("./request.repository");
const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require("../../utils/errors");
const {
  REQUEST_TYPE,
  REQUEST_STATUS,
  EQUIPMENT_STATUS,
  PRIORITY,
} = require("../../config/constants");

class RequestService {
  /**
   * Create a new maintenance request
   * Business Rules:
   * - Auto-fills team_id from equipment
   * - PREVENTIVE requests require scheduled_date
   * - CORRECTIVE requests may have scheduled_date
   * - Scrapped equipment cannot accept new requests
   *
   * @param {Object} requestData - Request details
   * @returns {Promise<Object>} Created request
   */
  async createRequest({
    equipment_id,
    request_type,
    title,
    description,
    priority,
    scheduled_date,
    created_by,
  }) {
    // Validate required fields
    if (!equipment_id) {
      throw new ValidationError("Equipment ID is required");
    }

    if (!request_type) {
      throw new ValidationError("Request type is required");
    }

    if (!Object.values(REQUEST_TYPE).includes(request_type)) {
      throw new ValidationError(
        `Invalid request type. Must be: ${Object.values(REQUEST_TYPE).join(
          " or "
        )}`
      );
    }

    if (!title || title.trim().length < 5) {
      throw new ValidationError("Title must be at least 5 characters");
    }

    if (!description || description.trim().length < 10) {
      throw new ValidationError("Description must be at least 10 characters");
    }

    if (!created_by) {
      throw new ValidationError("Created by user ID is required");
    }

    // Validate priority if provided
    if (priority && !Object.values(PRIORITY).includes(priority)) {
      throw new ValidationError(
        `Invalid priority. Must be one of: ${Object.values(PRIORITY).join(
          ", "
        )}`
      );
    }

    // Verify user exists
    const userExists = await requestRepository.userExists(created_by);
    if (!userExists) {
      throw new NotFoundError("User not found or inactive");
    }

    // Get equipment and auto-fill team
    const equipment = await requestRepository.getEquipment(equipment_id);
    if (!equipment) {
      throw new NotFoundError("Equipment not found");
    }

    // BUSINESS RULE: Scrapped equipment cannot accept new requests
    if (equipment.status === EQUIPMENT_STATUS.SCRAPPED) {
      throw new ValidationError(
        "Cannot create maintenance request for scrapped equipment"
      );
    }

    // BUSINESS RULE: PREVENTIVE requests MUST have scheduled_date
    if (request_type === REQUEST_TYPE.PREVENTIVE) {
      if (!scheduled_date) {
        throw new ValidationError(
          "Preventive maintenance requests must have a scheduled date"
        );
      }

      // Validate scheduled_date is in the future
      const scheduledTime = new Date(scheduled_date).getTime();
      const now = new Date().getTime();

      if (scheduledTime < now) {
        throw new ValidationError(
          "Scheduled date must be in the future for preventive maintenance"
        );
      }
    }

    // Validate scheduled_date format if provided
    if (scheduled_date) {
      const date = new Date(scheduled_date);
      if (isNaN(date.getTime())) {
        throw new ValidationError("Invalid scheduled date format");
      }
    }

    // Auto-fill team_id from equipment
    const team_id = equipment.team_id;

    try {
      const request = await requestRepository.create({
        equipment_id,
        team_id,
        request_type,
        title: title.trim(),
        description: description.trim(),
        priority: priority || PRIORITY.MEDIUM,
        scheduled_date: scheduled_date || null,
        created_by,
      });

      return request;
    } catch (error) {
      // Handle foreign key constraint violations
      if (error.code === "23503") {
        throw new NotFoundError(
          "Referenced equipment, team, or user does not exist"
        );
      }
      throw error;
    }
  }

  /**
   * Get request by ID with full details
   * @param {string} requestId - UUID
   * @returns {Promise<Object>} Request with details and computed fields
   */
  async getRequestById(requestId) {
    if (!requestId) {
      throw new ValidationError("Request ID is required");
    }

    const request = await requestRepository.findByIdWithDetails(requestId);

    if (!request) {
      throw new NotFoundError("Maintenance request not found");
    }

    // Add computed field: is_overdue (not stored in DB)
    return this._enrichRequestWithComputedFields(request);
  }

  /**
   * Get all requests with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} List of requests with computed fields
   */
  async getAllRequests(filters = {}) {
    // Validate filters
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

    if (
      filters.request_type &&
      !Object.values(REQUEST_TYPE).includes(filters.request_type)
    ) {
      throw new ValidationError(
        `Invalid request type. Must be: ${Object.values(REQUEST_TYPE).join(
          " or "
        )}`
      );
    }

    if (
      filters.priority &&
      !Object.values(PRIORITY).includes(filters.priority)
    ) {
      throw new ValidationError(
        `Invalid priority. Must be one of: ${Object.values(PRIORITY).join(
          ", "
        )}`
      );
    }

    const requests = await requestRepository.findAll(filters);

    // Enrich with computed fields
    return requests.map((req) => this._enrichRequestWithComputedFields(req));
  }

  /**
   * Update request status with transition validation
   * Business Rule: Only allow valid status transitions
   * NEW → IN_PROGRESS → REPAIRED or SCRAP
   *
   * @param {string} requestId - UUID
   * @param {string} newStatus - New status
   * @returns {Promise<Object>} Updated request
   */
  async updateRequestStatus(requestId, newStatus) {
    if (!requestId) {
      throw new ValidationError("Request ID is required");
    }

    if (!newStatus) {
      throw new ValidationError("New status is required");
    }

    if (!Object.values(REQUEST_STATUS).includes(newStatus)) {
      throw new ValidationError(
        `Invalid status. Must be one of: ${Object.values(REQUEST_STATUS).join(
          ", "
        )}`
      );
    }

    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Maintenance request not found");
    }

    // Validate status transition
    this._validateStatusTransition(request.status, newStatus);

    const updated = await requestRepository.updateStatus(requestId, newStatus);
    return this._enrichRequestWithComputedFields(updated);
  }

  /**
   * Update request details
   * @param {string} requestId - UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated request
   */
  async updateRequest(requestId, updates) {
    if (!requestId) {
      throw new ValidationError("Request ID is required");
    }

    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Maintenance request not found");
    }

    // Validate updates
    if (updates.title !== undefined) {
      if (!updates.title || updates.title.trim().length < 5) {
        throw new ValidationError("Title must be at least 5 characters");
      }
      updates.title = updates.title.trim();
    }

    if (updates.description !== undefined) {
      if (!updates.description || updates.description.trim().length < 10) {
        throw new ValidationError("Description must be at least 10 characters");
      }
      updates.description = updates.description.trim();
    }

    if (
      updates.priority !== undefined &&
      !Object.values(PRIORITY).includes(updates.priority)
    ) {
      throw new ValidationError(
        `Invalid priority. Must be one of: ${Object.values(PRIORITY).join(
          ", "
        )}`
      );
    }

    if (updates.scheduled_date !== undefined) {
      // Validate for PREVENTIVE requests
      if (
        request.request_type === REQUEST_TYPE.PREVENTIVE &&
        !updates.scheduled_date
      ) {
        throw new ValidationError(
          "Preventive requests must have a scheduled date"
        );
      }

      if (updates.scheduled_date) {
        const date = new Date(updates.scheduled_date);
        if (isNaN(date.getTime())) {
          throw new ValidationError("Invalid scheduled date format");
        }
      }
    }

    if (updates.duration_hours !== undefined) {
      const duration = parseFloat(updates.duration_hours);
      if (isNaN(duration) || duration < 0 || duration > 999.99) {
        throw new ValidationError(
          "Duration must be a positive number less than 1000 hours"
        );
      }
      updates.duration_hours = duration;
    }

    const updated = await requestRepository.update(requestId, updates);
    return this._enrichRequestWithComputedFields(updated);
  }

  /**
   * Get Kanban view (requests grouped by status)
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Requests grouped by status with computed fields
   */
  async getKanbanView(filters = {}) {
    const grouped = await requestRepository.getKanbanView(filters);

    // Enrich each group with computed fields
    const enriched = {};
    for (const [status, requests] of Object.entries(grouped)) {
      enriched[status] = requests.map((req) =>
        this._enrichRequestWithComputedFields(req)
      );
    }

    return enriched;
  }

  /**
   * Get Calendar view (scheduled requests)
   * @param {Object} filters - { start_date?, end_date?, team_id? }
   * @returns {Promise<Array>} Scheduled requests with computed fields
   */
  async getCalendarView(filters = {}) {
    // Validate date filters
    if (filters.start_date) {
      const date = new Date(filters.start_date);
      if (isNaN(date.getTime())) {
        throw new ValidationError("Invalid start_date format");
      }
    }

    if (filters.end_date) {
      const date = new Date(filters.end_date);
      if (isNaN(date.getTime())) {
        throw new ValidationError("Invalid end_date format");
      }
    }

    const requests = await requestRepository.getCalendarView(filters);
    return requests.map((req) => this._enrichRequestWithComputedFields(req));
  }

  /**
   * Validate status transition
   * @private
   * @param {string} currentStatus - Current status
   * @param {string} newStatus - Desired new status
   * @throws {ValidationError} If transition is invalid
   */
  _validateStatusTransition(currentStatus, newStatus) {
    // Same status is allowed (idempotent)
    if (currentStatus === newStatus) {
      return;
    }

    const validTransitions = {
      [REQUEST_STATUS.NEW]: [REQUEST_STATUS.IN_PROGRESS],
      [REQUEST_STATUS.IN_PROGRESS]: [
        REQUEST_STATUS.REPAIRED,
        REQUEST_STATUS.SCRAP,
      ],
      [REQUEST_STATUS.REPAIRED]: [], // Terminal state
      [REQUEST_STATUS.SCRAP]: [], // Terminal state
    };

    const allowedNextStates = validTransitions[currentStatus] || [];

    if (!allowedNextStates.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition: ${currentStatus} → ${newStatus}. ` +
          `Allowed transitions: ${currentStatus} → ${
            allowedNextStates.join(", ") || "none (terminal state)"
          }`
      );
    }
  }

  /**
   * Enrich request with computed fields
   * @private
   * @param {Object} request - Request object
   * @returns {Object} Request with computed fields
   */
  _enrichRequestWithComputedFields(request) {
    if (!request) return request;

    const enriched = { ...request };

    // Compute is_overdue (not stored in DB)
    enriched.is_overdue = false;
    if (
      request.scheduled_date &&
      request.status !== REQUEST_STATUS.REPAIRED &&
      request.status !== REQUEST_STATUS.SCRAP
    ) {
      const scheduledTime = new Date(request.scheduled_date).getTime();
      const now = new Date().getTime();
      enriched.is_overdue = scheduledTime < now;
    }

    return enriched;
  }
}

module.exports = new RequestService();
