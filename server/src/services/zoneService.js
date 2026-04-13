const { Zone } = require("../models/Zone");
const { Event } = require("../models/Event");

async function listZones(eventId) {
  const filter = eventId ? { event: eventId } : {};
  return Zone.find(filter).populate("event", "title startDate").sort({ createdAt: -1 });
}

async function createZone(payload) {
  const eventExists = await Event.findOne({ _id: payload.event, deletedAt: null });
  if (!eventExists) throw new Error("Invalid event");
  return Zone.create(payload);
}

async function updateZone(id, payload) {
  if (payload.event) {
    const eventExists = await Event.findOne({ _id: payload.event, deletedAt: null });
    if (!eventExists) throw new Error("Invalid event");
  }
  return Zone.findByIdAndUpdate(id, payload, { returnDocument: "after", runValidators: true });
}

async function deleteZone(id) {
  return Zone.findByIdAndDelete(id);
}

module.exports = { listZones, createZone, updateZone, deleteZone };
