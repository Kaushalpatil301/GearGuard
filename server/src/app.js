const express = require("express");
const errorHandler = require("./utils/errorHandler");
const teamRoutes = require("./modules/teams/team.routes");
const equipmentRoutes = require("./modules/equipment/equipment.routes");
const requestRoutes = require("./modules/requests/request.routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "GearGuard API",
  });
});

app.use("/api/teams", teamRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/requests", requestRoutes);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
    },
  });
});

app.use(errorHandler);

module.exports = app;
