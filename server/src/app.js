/**
 * Express Application Setup
 *
 * Configures Express app with middleware and routes.
 */

const express = require("express");
const errorHandler = require("./utils/errorHandler");

// Import existing routes
const teamRoutes = require("./modules/teams/team.routes");
const equipmentRoutes = require("./modules/equipment/equipment.routes");
const requestRoutes = require("./modules/requests/request.routes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "GearGuard API",
  });
});

// API Routes
app.use("/api/teams", teamRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/requests", requestRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
    },
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
