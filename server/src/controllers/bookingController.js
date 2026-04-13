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
  } = req.body || {};

  if (!vendorName || !vendorEmail || !mobile || !businessName || !eventId || !categoryId || !stallSize) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

  const vendor = await User.findOne({ email: String(vendorEmail).toLowerCase(), role: "vendor" });
  if (!vendor || vendor.status !== "approved") {
    return res.status(403).json({ message: "Only approved vendors can book stalls" });
  }

  const event = await Event.findOne({ _id: eventId, deletedAt: null, status: "active", bookingEnabled: true });
  if (!event) return res.status(400).json({ message: "Invalid event" });
  const category = await Category.findOne({ _id: categoryId, type: "stall" });
  if (!category) return res.status(400).json({ message: "Invalid category" });
  let zone = null;
  if (zoneId) {
    zone = await Zone.findOne({ _id: zoneId, event: event._id });
    if (!zone) return res.status(400).json({ message: "Invalid zone for selected event" });
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
