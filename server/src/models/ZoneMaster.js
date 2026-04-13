const mongoose = require("mongoose");

const zoneMasterSchema = new mongoose.Schema(
  {
    zoneName: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "", trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

const ZoneMaster = mongoose.model("ZoneMaster", zoneMasterSchema);

module.exports = { ZoneMaster };
