require("dotenv").config();

const { connectDB } = require("../config/db");
const { requiredEnv } = require("../utils/env");
const { User } = require("../models/User");

async function seedAdmin() {
  const MONGODB_URI = requiredEnv("MONGODB_URI");
  const adminName = process.env.ADMIN_NAME || "Default Admin";
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@swadeshi.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  await connectDB(MONGODB_URI);

  const password = await User.hashPassword(adminPassword);
  await User.findOneAndUpdate(
    { email: adminEmail },
    { name: adminName, email: adminEmail, password, role: "admin", status: "active" },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  console.log(`Default admin is ready: ${adminEmail}`);
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    
  });

