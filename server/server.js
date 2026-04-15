require("dotenv").config();

const { connectDB } = require("./src/config/db");
const { createApp } = require("./src/app");
const { requiredEnv } = require("./src/utils/env");

async function start() {
  const PORT = Number(process.env.PORT || 5000);

  const MONGODB_URI = requiredEnv("MONGODB_URI"); // ✅ correct
  const JWT_SECRET = requiredEnv("JWT_SECRET");
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
  const seedAdmin = require("./src/seed/seedAdmin");

  await connectDB(MONGODB_URI); // ✅ FIX HERE

  const app = createApp({
    jwtSecret: JWT_SECRET,
    jwtExpiresIn: JWT_EXPIRES_IN,
  });

  app.get("/seed-admin", async (req, res) => {
    try {
      await seedAdmin(); // tumhara seeder function
      res.send("✅ Admin Seeded");
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});