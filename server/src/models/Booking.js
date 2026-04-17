const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    vendorName: { type: String, required: true, trim: true },
    vendorEmail: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, trim: true, default: "" },
    gstNumber: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "" },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "ZoneMaster", default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    stallSize: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    paymentMode: { type: String, default: "mock" },
    paymentRef: { type: String, default: "" },
    paymentAmount: { type: Number, min: 0, default: 0 },
    finalAmount: { type: Number, min: 0, default: 0 },
    paymentOption: {
      type: String,
      enum: ["full", "partial"],
      default: "full",
    },
    paymentRecords: [
      {
        amount: { type: Number, min: 0, required: true },
        paymentRef: { type: String, trim: true, default: "" },
        paymentMode: { type: String, trim: true, default: "mock" },
        paidAt: { type: Date, default: Date.now },
      },
    ],
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
