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

function normalizePaymentRecords(booking) {
  const records = Array.isArray(booking?.paymentRecords) ? booking.paymentRecords.filter((record) => Number(record?.amount) > 0) : [];
  if (records.length > 0) {
    return records.map((record, index) => ({
      installmentNumber: Number(record.installmentNumber) || index + 1,
      amount: Number(record.amount) || 0,
      paymentRef: record.paymentRef || "",
      paymentMode: record.paymentMode || "mock",
      paymentType: record.paymentType || "part-payment",
      paidAt: record.paidAt || booking.createdAt || new Date(),
    }));
  }

  if (Number(booking?.paymentAmount) > 0) {
    return [
      {
        installmentNumber: 1,
        amount: Number(booking.paymentAmount) || 0,
        paymentRef: booking.paymentRef || "",
        paymentMode: booking.paymentMode || "mock",
        paymentType: "part-payment",
        paidAt: booking.createdAt || new Date(),
      },
    ];
  }

  return [];
}

function applyPaymentSummary(booking, records) {
  const totalPaid = records.reduce((sum, record) => sum + (Number(record.amount) || 0), 0);
  booking.paymentRecords = records;
  booking.paymentAmount = totalPaid;
  booking.paymentRef = records.length ? records[records.length - 1].paymentRef || booking.paymentRef || "" : "";
  booking.paymentMode = records.length ? records[records.length - 1].paymentMode || booking.paymentMode || "mock" : booking.paymentMode || "mock";
  booking.paymentOption = totalPaid >= Number(booking.finalAmount || 0) ? "full" : "partial";
  if (booking.status !== "rejected") {
    booking.status = "pending";
  }
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
    ownerName,
    gstNumber,
    address,
    city,
    state,
    pincode,
    note,
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
  const receiptImage = req.file?.filename ? `/uploads/bookings/${req.file.filename}` : "";

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

  const bookingStatus = "pending";
  const userStatus = "pending";

  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const hashedPassword = await User.hashPassword(String(mobile));
    user = await User.create({
      name: String(vendorName).trim(),
      email: normalizedEmail,
      mobile: String(mobile).trim(),
      password: hashedPassword,
      role: "vendor",
      status: userStatus,
    });
  } else if (user.role === "vendor") {
    user.name = String(vendorName).trim() || user.name;
    user.mobile = String(mobile).trim() || user.mobile;
    user.status = userStatus;
    await user.save();
  }

  const booking = await Booking.create({
    vendorName: String(vendorName).trim(),
    vendorEmail: normalizedEmail,
    mobile: String(mobile).trim(),
    businessName: String(businessName).trim(),
    ownerName: ownerName ? String(ownerName).trim() : "",
    gstNumber: gstNumber ? String(gstNumber).trim() : "",
    address: address ? String(address).trim() : "",
    city: city ? String(city).trim() : "",
    state: state ? String(state).trim() : "",
    pincode: pincode ? String(pincode).trim() : "",
    note: note ? String(note).trim() : "",
    event: event._id,
    zone: zone?._id || null,
    category: category._id,
    stallSize: String(stallSize).trim(),
    quantity: requestedQuantity,
    paymentMode: paymentMode || "mock",
    paymentRef: paymentRef || "",
    receiptImage,
    paymentAmount: paidAmount,
    finalAmount: totalAmount,
    paymentOption: normalizedPaymentOption,
    paymentRecords: [
      {
        amount: paidAmount,
        installmentNumber: 1,
        paymentRef: paymentRef || "",
        paymentMode: paymentMode || "mock",
        paymentType: "part-payment",
        paidAt: new Date(),
      },
    ],
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
  const query = req.user?.role === "vendor"
    ? { vendorEmail: String(req.user.email || "").toLowerCase() }
    : {};

  const bookings = await Booking.find(query)
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
  booking.allotment.zone = zone || booking.allotment.zone || "";
  booking.allotment.stallNumber = stallNumber || booking.allotment.stallNumber || "";
  booking.allotment.updatedAt = new Date();
  await booking.save();

  const populated = await Booking.findById(id).populate("event", "title startDate venueName").populate("zone", "zoneName").populate("category", "name");
  return res.json(populated);
}

async function payBookingBalance(req, res) {
  const { id } = req.params;
  const { paymentAmount, paymentRef, paymentMode, paymentType } = req.body || {};

  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  if (req.user?.role === "vendor" && String(booking.vendorEmail || "").toLowerCase() !== String(req.user?.email || "").toLowerCase()) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (booking.status === "rejected") {
    return res.status(400).json({ message: "Rejected bookings cannot receive payments" });
  }

  const nextAmount = Number(paymentAmount) || 0;
  if (nextAmount <= 0) {
    return res.status(400).json({ message: "Payment amount must be greater than zero" });
  }

  const existingRecords = normalizePaymentRecords(booking);
  const currentPaid = existingRecords.reduce((sum, record) => sum + (Number(record.amount) || 0), 0);
  const finalAmount = Number(booking.finalAmount) || 0;
  const remainingAmount = Math.max(finalAmount - currentPaid, 0);

  if (remainingAmount <= 0) {
    return res.status(400).json({ message: "This booking is already fully paid" });
  }

  if (nextAmount > remainingAmount) {
    return res.status(400).json({ message: `Payment amount cannot exceed remaining Rs ${remainingAmount}` });
  }

  const nextRecords = [
    ...existingRecords,
    {
      installmentNumber: existingRecords.length + 1,
      amount: nextAmount,
      paymentRef: paymentRef ? String(paymentRef).trim() : "",
      paymentMode: paymentMode ? String(paymentMode).trim() : booking.paymentMode || "mock",
      paymentType: paymentType ? String(paymentType).trim() : "part-payment",
      paidAt: new Date(),
    },
  ];

  applyPaymentSummary(booking, nextRecords);
  await booking.save();

  const populated = await Booking.findById(id).populate("event", "title startDate venueName").populate("zone", "zoneName").populate("category", "name");
  return res.json(populated);
}

module.exports = { createBooking, listBookings, allotBooking, getBookingAvailability, payBookingBalance };
