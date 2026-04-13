require("dotenv").config();

const { connectDB } = require("./config/db");
const { createApp } = require("./app");
const { requiredEnv } = require("./utils/env");

async function start() {
  const PORT = Number(process.env.PORT || 5000);
  const MONGODB_URI = requiredEnv("MONGODB_URI");
  const JWT_SECRET = requiredEnv("JWT_SECRET");
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

  await connectDB(MONGODB_URI);

  const app = createApp({ jwtSecret: JWT_SECRET, jwtExpiresIn: JWT_EXPIRES_IN });

  app.listen(PORT, () => {
    // Intentionally minimal startup log
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

