const { ZoneMaster } = require("../models/ZoneMaster");

async function listZones(req, res) {
  const { eventId } = req.query;
  let query = {};
  
  if (eventId) {
    query.event = eventId;
  }
  
  const zones = await ZoneMaster.find(query).sort({ createdAt: -1 });
  return res.json(zones);
}

async function createZone(req, res) {
  const { zoneName, description, status } = req.body || {};
  if (!zoneName) return res.status(400).json({ message: "zoneName is required" });
  const zone = await ZoneMaster.create({
    zoneName: String(zoneName).trim(),
    description: String(description || "").trim(),
    status: status || "active",
  });
  return res.status(201).json(zone);
}

async function updateZone(req, res) {
  const { id } = req.params;
  const { zoneName, description, status } = req.body || {};
  const zone = await ZoneMaster.findByIdAndUpdate(
    id,
    {
      ...(zoneName ? { zoneName: String(zoneName).trim() } : {}),
      ...(description !== undefined ? { description: String(description).trim() } : {}),
      ...(status ? { status } : {}),
    },
    { returnDocument: "after", runValidators: true },
  );
  if (!zone) return res.status(404).json({ message: "Zone not found" });
  return res.json(zone);
}

async function deleteZone(req, res) {
  const zone = await ZoneMaster.findByIdAndDelete(req.params.id);
  if (!zone) return res.status(404).json({ message: "Zone not found" });
  return res.json({ message: "Zone deleted" });
}

module.exports = { listZones, createZone, updateZone, deleteZone };