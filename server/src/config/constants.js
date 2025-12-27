// Equipment status values (matches equipment_status enum in DB)
const EQUIPMENT_STATUS = {
  OPERATIONAL: "OPERATIONAL",
  UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
  SCRAPPED: "SCRAPPED",
};

// Request type values (matches request_type enum in DB)
const REQUEST_TYPE = {
  CORRECTIVE: "CORRECTIVE",
  PREVENTIVE: "PREVENTIVE",
};

// Request status values (matches request_status enum in DB)
const REQUEST_STATUS = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  REPAIRED: "REPAIRED",
  SCRAP: "SCRAP",
};

// Priority levels
const PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

module.exports = {
  EQUIPMENT_STATUS,
  REQUEST_TYPE,
  REQUEST_STATUS,
  PRIORITY,
};
