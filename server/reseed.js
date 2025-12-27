const fs = require("fs");
const { Pool } = require("pg");

const seedSQL = fs.readFileSync("./src/database/seed.sql", "utf8");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "gearguard",
  password: "postgres",
  port: 5432,
});

pool
  .query(seedSQL)
  .then(() => {
    console.log("Database reseeded successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error reseeding database:", err);
    process.exit(1);
  });
