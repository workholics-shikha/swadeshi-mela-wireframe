const { createZone, deleteZone, listZones, updateZone } = require("../services/zoneService");

async function getZones(req, res) {
  const zones = await listZones(req.query.eventId);
  return res.json(zones);
}

async function addZone(req, res) {
  try {
    const { event, zoneName, description, status } = req.body || {};
    if (!event || !zoneName) return res.status(400).json({ message: "event and zoneName are required" });
    const zone = await createZone({ event, zoneName, description: description || "", status: status || "active" });
    return res.status(201).json(zone);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to create zone" });
  }
}

async function editZone(req, res) {
  try {
    const updated = await updateZone(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ message: "Zone not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to update zone" });
  }
}

async function removeZone(req, res) {
  const deleted = await deleteZone(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Zone not found" });
  return res.json({ message: "Zone deleted" });
}

module.exports = { getZones, addZone, editZone, removeZone };
