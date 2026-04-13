const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const { listZones, createZone, updateZone, deleteZone } = require("../controllers/zoneController");

function createZoneRouter({ jwtSecret }) {
  const router = express.Router();
  router.get("/", listZones);
  router.post("/", authRequired({ jwtSecret }), requireRole(["admin"]), createZone);
  router.put("/:id", authRequired({ jwtSecret }), requireRole(["admin"]), updateZone);
  router.delete("/:id", authRequired({ jwtSecret }), requireRole(["admin"]), deleteZone);
  return router;
}

module.exports = { createZoneRouter };
