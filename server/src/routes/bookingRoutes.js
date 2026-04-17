const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const { createBooking, listBookings, allotBooking, getBookingAvailability, payBookingBalance } = require("../controllers/bookingController");

function createBookingRouter({ jwtSecret }) {
  const router = express.Router();
  router.get("/availability", getBookingAvailability);
  router.post("/", createBooking);
  router.get("/", authRequired({ jwtSecret }), requireRole(["admin", "vendor"]), listBookings);
  router.patch("/:id/allot", authRequired({ jwtSecret }), requireRole(["admin"]), allotBooking);
  router.patch("/:id/pay-balance", authRequired({ jwtSecret }), requireRole(["admin", "vendor"]), payBookingBalance);
  return router;
}

module.exports = { createBookingRouter };
