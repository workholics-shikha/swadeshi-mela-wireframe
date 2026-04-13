const { Event } = require("../models/Event");
const { Booking } = require("../models/Booking");
const { Category } = require("../models/Category");
const { Zone } = require("../models/Zone");

async function listEvents() {
  const events = await Event.find({ deletedAt: null }).populate("category", "name type status").sort({ startDate: 1 });
  const eventIds = events.map((event) => event._id);
  const zones = await Zone.find({ event: { $in: eventIds } }).sort({ createdAt: -1 });
  const zoneMap = new Map();
  for (const zone of zones) {
    const key = zone.event.toString();
    const next = zoneMap.get(key) || [];
    next.push(zone);
    zoneMap.set(key, next);
  }
  return events.map((event) => ({ ...event.toObject(), zones: zoneMap.get(event._id.toString()) || [] }));
}

async function createEvent(payload) {
  const categoryExists = await Category.findOne({ _id: payload.category, type: "event" });
  if (!categoryExists) throw new Error("Invalid event category");
  return Event.create(payload);
}

async function updateEvent(id, payload) {
  if (payload.category) {
    const categoryExists = await Category.findOne({ _id: payload.category, type: "event" });
    if (!categoryExists) throw new Error("Invalid event category");
  }
  const updated = await Event.findOneAndUpdate({ _id: id, deletedAt: null }, payload, {
    returnDocument: "after",
    runValidators: true,
  });
  return updated;
}

async function softDeleteEvent(id) {
  const bookings = await Booking.countDocuments({ event: id, status: { $in: ["pending", "approved"] } });
  if (bookings > 0) {
    const err = new Error("Cannot delete event with existing bookings");
    err.code = "BOOKINGS_EXIST";
    throw err;
  }
  return Event.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date(), status: "inactive" }, { returnDocument: "after" });
}

module.exports = { listEvents, createEvent, updateEvent, softDeleteEvent };
