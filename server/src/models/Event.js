const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    openingTime: { type: String, required: true, trim: true },
    closingTime: { type: String, required: true, trim: true },
    venueName: { type: String, required: true, trim: true },
    fullAddress: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    bannerImage: { type: String, default: "" },
    galleryImages: { type: [String], default: [] },
    totalStalls: { type: Number, required: true, min: 0, default: 0 },
    categoryZoneMappings: {
      type: [
        {
          categoryName: { type: String, required: true, trim: true },
          zoneId: { type: mongoose.Schema.Types.ObjectId, ref: "ZoneMaster", default: null },
          stalls: { type: Number, min: 0, default: 0 },
        },
      ],
      default: [],
    },
    bookingEnabled: { type: Boolean, default: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

const Event = mongoose.model("Event", eventSchema);

module.exports = { Event };
