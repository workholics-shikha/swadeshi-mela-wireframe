const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    vendorName: { type: String, required: true, trim: true },
    vendorEmail: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    businessName: { type: String, required: true, trim: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    stallSize: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    paymentMode: { type: String, default: "mock" },
    paymentRef: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    allotment: {
      zone: { type: String, default: "" },
      stallNumber: { type: String, default: "" },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true },
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = { Booking };
