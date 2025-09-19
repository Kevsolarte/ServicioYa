require("dotenv").config();

const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL
};

if (!env.jwtSecret) {
  console.error("Falta JWT_SECRET en .env");
  process.exit(1);
}

module.exports = env;
