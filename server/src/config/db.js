const { Pool } = require("pg");

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "gearguard",
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
  console.log("✓ Database connection established");
});

pool.on("error", (err) => {
  console.error("Database pool error:", err);
  process.exit(-1);
});

const query = (text, params) => pool.query(text, params);

const healthCheck = async () => {
  try {
    const result = await pool.query("SELECT 1 as health");
    return {
      healthy: true,
      timestamp: new Date(),
      connections: pool.totalCount,
    };
  } catch (error) {
    return { healthy: false, error: error.message, timestamp: new Date() };
  }
};

const withTransaction = async (callback) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  withTransaction,
  healthCheck,
};
