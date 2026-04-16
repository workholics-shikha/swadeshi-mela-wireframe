const { Booking } = require("../models/Booking");
const { Event } = require("../models/Event");
const { Category } = require("../models/Category");
const { ZoneMaster } = require("../models/ZoneMaster");
const { User } = require("../models/User");

function parseStallNumbers(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatStallNumber(index) {
  return String(index).padStart(2, "0");
}

async function getBookingAvailability(req, res) {
  const { eventId, zoneId, categoryId } = req.query || {};

  if (!eventId || !zoneId || !categoryId) {
    return res.status(400).json({ message: "eventId, zoneId and categoryId are required" });
  }

  const event = await Event.findOne({ _id: eventId, deletedAt: null, status: "active", bookingEnabled: true });
  if (!event) return res.status(400).json({ message: "Invalid event" });

  const category = await Category.findOne({ _id: categoryId, type: "stall" });
  if (!category) return res.status(400).json({ message: "Invalid category" });

  const mapping = (event.categoryZoneMappings || []).find(
    (row) => row && row.categoryName === category.name && String(row.zoneId || "") === String(zoneId),
  );
  if (!mapping) {
    return res.status(404).json({ message: "No stall mapping found for selected category and zone" });
  }

  const totalStalls = Number(mapping.stalls) || 0;
  const bookings = await Booking.find({
    event: eventId,
    category: categoryId,
    status: { $in: ["pending", "approved"] },
    $or: [{ zone: zoneId }, { "allotment.zone": zoneId }],
  }).select("quantity allotment.stallNumber");

  const reservedNumbers = new Set();
  let reservedCount = 0;

  for (const booking of bookings) {
    reservedCount += Number(booking.quantity) || 0;
    for (const stallNumber of parseStallNumbers(booking.allotment?.stallNumber)) {
      reservedNumbers.add(stallNumber);
    }
  }

  const allStallNumbers = Array.from({ length: totalStalls }, (_, index) => formatStallNumber(index + 1));
  const provisionalAvailable = allStallNumbers.filter((stallNumber) => !reservedNumbers.has(stallNumber));
  const missingReservedCount = Math.max(reservedCount - reservedNumbers.size, 0);
  const withheldNumbers = provisionalAvailable.slice(0, missingReservedCount);
  const unavailableNumbers = new Set([...reservedNumbers, ...withheldNumbers]);
  const availableStallNumbers = allStallNumbers.filter((stallNumber) => !unavailableNumbers.has(stallNumber));

  return res.json({
    totalStalls,
    reservedCount,
    availableCount: availableStallNumbers.length,
    availableStallNumbers,
    reservedStallNumbers: Array.from(unavailableNumbers),
  });
}

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
    paymentAmount,
    finalAmount,
    paymentOption,
  } = req.body || {};

  if (!vendorName || !vendorEmail || !mobile || !businessName || !eventId || !categoryId || !stallSize) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

  // Vendor validation removed - allow bookings without vendor existence check

  const event = await Event.findOne({ _id: eventId, deletedAt: null, status: "active", bookingEnabled: true });
  if (!event) return res.status(400).json({ message: "Invalid event" });
  const category = await Category.findOne({ _id: categoryId, type: "stall" });
  if (!category) return res.status(400).json({ message: "Invalid category" });
  const requestedQuantity = Number(quantity) || 1;
  const requestedStallNumbers = parseStallNumbers(stallNumber);
  const normalizedEmail = String(vendorEmail).toLowerCase();
  const totalAmount = Number(finalAmount) || 0;
  const paidAmount = Number(paymentAmount) || 0;
  const normalizedPaymentOption = paymentOption === "partial" ? "partial" : "full";
  let zone = null;
  if (zoneId) {
    zone = await ZoneMaster.findById(zoneId);
    if (!zone) return res.status(400).json({ message: "Invalid zone" });
  }

  const mapping = zone
    ? (event.categoryZoneMappings || []).find(
        (row) => row && row.categoryName === category.name && String(row.zoneId || "") === String(zone._id),
      )
    : null;

  if (zone && !mapping) {
    return res.status(400).json({ message: "Selected category is not available in this zone" });
  }

  const totalMappedStalls = Number(mapping?.stalls) || 0;
  if (zone && requestedQuantity > totalMappedStalls) {
    return res.status(400).json({ message: `Only ${totalMappedStalls} stalls are configured for this zone` });
  }

  const existingBookings = zone
    ? await Booking.find({
        event: event._id,
        category: category._id,
        status: { $in: ["pending", "approved"] },
        $or: [{ zone: zone._id }, { "allotment.zone": String(zone._id) }],
      }).select("quantity allotment.stallNumber")
    : [];

  const reservedNumbers = new Set();
  let reservedCount = 0;
  for (const booking of existingBookings) {
    reservedCount += Number(booking.quantity) || 0;
    for (const bookedStallNumber of parseStallNumbers(booking.allotment?.stallNumber)) {
      reservedNumbers.add(bookedStallNumber);
    }
  }

  if (zone) {
    const remainingStalls = Math.max(totalMappedStalls - reservedCount, 0);
    if (requestedQuantity > remainingStalls) {
      return res.status(400).json({ message: `Only ${remainingStalls} stall(s) are currently available` });
    }

    if (requestedStallNumbers.length !== requestedQuantity) {
      return res.status(400).json({ message: "Please select stall numbers matching the requested quantity" });
    }

    const validStallNumbers = new Set(
      Array.from({ length: totalMappedStalls }, (_, index) => formatStallNumber(index + 1)),
    );
    for (const requestedStallNumber of requestedStallNumbers) {
      if (!validStallNumbers.has(requestedStallNumber)) {
        return res.status(400).json({ message: `Invalid stall number selected: ${requestedStallNumber}` });
      }
      if (reservedNumbers.has(requestedStallNumber)) {
        return res.status(400).json({ message: `Stall ${requestedStallNumber} is already booked` });
      }
    }
  }

  if (totalAmount <= 0) {
    return res.status(400).json({ message: "Final amount must be greater than zero" });
  }

  if (paidAmount <= 0) {
    return res.status(400).json({ message: "Payment amount must be greater than zero" });
  }

  if (paidAmount > totalAmount) {
    return res.status(400).json({ message: "Payment amount cannot be more than final amount" });
  }

  if (normalizedPaymentOption === "full" && paidAmount !== totalAmount) {
    return res.status(400).json({ message: "Full payment must match final amount" });
  }

  if (normalizedPaymentOption === "partial" && paidAmount >= totalAmount) {
    return res.status(400).json({ message: "Use full payment option when paying the full amount" });
  }

  const bookingStatus = paidAmount >= totalAmount ? "approved" : "pending";
  const userStatus = bookingStatus === "approved" ? "approved" : "pending";

  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const hashedPassword = await User.hashPassword(String(mobile));
    user = await User.create({
      name: String(vendorName).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "vendor",
      status: userStatus,
    });
  } else if (user.role === "vendor") {
    user.name = String(vendorName).trim() || user.name;
    user.status = userStatus;
    await user.save();
  }

  const booking = await Booking.create({
    vendorName,
    vendorEmail: normalizedEmail,
    mobile,
    businessName,
    event: event._id,
    zone: zone?._id || null,
    category: category._id,
    stallSize,
    quantity: requestedQuantity,
    paymentMode: paymentMode || "mock",
    paymentRef: paymentRef || "",
    status: bookingStatus,
    allotment: {
      zone: zone?._id ? String(zone._id) : "",
      stallNumber: requestedStallNumbers.join(", "),
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

module.exports = { createBooking, listBookings, allotBooking, getBookingAvailability };
