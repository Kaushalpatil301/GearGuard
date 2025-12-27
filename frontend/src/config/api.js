// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Equipment Status Constants (matching backend)
export const EQUIPMENT_STATUS = {
  OPERATIONAL: "OPERATIONAL",
  UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
  SCRAPPED: "SCRAPPED",
};

// Request Type Constants (matching backend)
export const REQUEST_TYPE = {
  CORRECTIVE: "CORRECTIVE",
  PREVENTIVE: "PREVENTIVE",
};

// Request Status Constants (matching backend)
export const REQUEST_STATUS = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  REPAIRED: "REPAIRED",
  SCRAP: "SCRAP",
};

// Priority Levels (matching backend)
export const PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};
