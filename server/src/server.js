/**
 * Server Startup
 *
 * Starts the Express server and connects to database.
 */

require("dotenv").config();
const app = require("./app");
const { pool } = require("./config/db");

const PORT = process.env.PORT || 3000;

// Test database connection before starting server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query("SELECT NOW()");
    console.log("✓ Database connection verified");

    // Start server
    app.listen(PORT, () => {
      console.log("");
      console.log("═══════════════════════════════════════════");
      console.log("  GearGuard Maintenance Management System");
      console.log("═══════════════════════════════════════════");
      console.log(`  ✓ Server running on port ${PORT}`);
      console.log(`  ✓ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`  ✓ Health check: http://localhost:${PORT}/health`);
      console.log(`  ✓ API Base URL: http://localhost:${PORT}/api`);
      console.log("═══════════════════════════════════════════");
      console.log("");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server...");
  pool.end(() => {
    console.log("Database pool closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received. Closing server...");
  pool.end(() => {
    console.log("Database pool closed");
    process.exit(0);
  });
});

startServer();
