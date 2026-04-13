const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const { listVendors, updateVendorStatus } = require("../controllers/vendorController");

function createVendorRouter({ jwtSecret }) {
  const router = express.Router();
  router.get("/", authRequired({ jwtSecret }), requireRole(["admin"]), listVendors);
  router.patch("/:id/status", authRequired({ jwtSecret }), requireRole(["admin"]), updateVendorStatus);
  return router;
}

module.exports = { createVendorRouter };
