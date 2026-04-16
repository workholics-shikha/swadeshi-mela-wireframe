const mongoose = require("mongoose");

async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    dbName: "swadeshi_mela", // ✅ correct place
  });

  console.log("✅ Connected DB:", mongoose.connection.name);

  return mongoose.connection;
}

module.exports = { connectDB };