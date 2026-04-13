const { Booking } = require("../models/Booking");
const { User } = require("../models/User");
const { Event } = require("../models/Event");
const { Category } = require("../models/Category");
const { Zone } = require("../models/Zone");

async function createBooking(req, res) {
  const {
    vendorName,
    vendorEmail,
    mobile,
    businessName,
    eventId,
    zoneId,
    categoryId,
    stallSize,
    quantity,
    paymentMode,
    paymentRef,
    stallNumber,
  } = req.body || {};

  if (!vendorName || !vendorEmail || !mobile || !businessName || !eventId || !categoryId || !stallSize) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

  // Vendor validation removed - allow bookings without vendor existence check

  const event = await Event.findOne({ _id: eventId, deletedAt: null, status: "active", bookingEnabled: true });
  if (!event) return res.status(400).json({ message: "Invalid event" });
  const category = await Category.findOne({ _id: categoryId, type: "stall" });
  if (!category) return res.status(400).json({ message: "Invalid category" });
  let zone = null;
  if (zoneId) {
    zone = await Zone.findById(zoneId);
    // Zone validation relaxed - allow any zone ID
  }

  const booking = await Booking.create({
    vendorName,
    vendorEmail: String(vendorEmail).toLowerCase(),
    mobile,
    businessName,
    event: event._id,
    zone: zone?._id || null,
    category: category._id,
    stallSize,
    quantity: Number(quantity) || 1,
    paymentMode: paymentMode || "mock",
    paymentRef: paymentRef || "",
    status: "pending",
    allotment: {
      zone: zone?._id || "",
      stallNumber: stallNumber || "",
      updatedAt: new Date()
    }
  });

  const populated = await Booking.findById(booking._id).populate("event", "title startDate venueName").populate("zone", "zoneName").populate("category", "name");
  return res.status(201).json(populated);
}

async function listBookings(req, res) {
  const bookings = await Booking.find()
    .populate("event", "title startDate venueName")
    .populate("zone", "zoneName")
    .populate("category", "name")
    .sort({ createdAt: -1 });
  return res.json(bookings);
}

async function allotBooking(req, res) {
  const { id } = req.params;
  const { status, zone, stallNumber } = req.body || {};
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  booking.status = status;
  booking.allotment.zone = zone || "";
  booking.allotment.stallNumber = stallNumber || "";
  booking.allotment.updatedAt = new Date();
  await booking.save();

  const populated = await Booking.findById(id).populate("event", "title startDate venueName").populate("zone", "zoneName").populate("category", "name");
  return res.json(populated);
}

module.exports = { createBooking, listBookings, allotBooking };
