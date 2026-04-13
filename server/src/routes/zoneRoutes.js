const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const { addZone, editZone, getZones, removeZone } = require("../controllers/zoneController");

function createZoneRouter({ jwtSecret }) {
  const router = express.Router();
  router.get("/", getZones);
  router.post("/", authRequired({ jwtSecret }), requireRole(["admin"]), addZone);
  router.put("/:id", authRequired({ jwtSecret }), requireRole(["admin"]), editZone);
  router.delete("/:id", authRequired({ jwtSecret }), requireRole(["admin"]), removeZone);
  return router;
}

module.exports = { createZoneRouter };
