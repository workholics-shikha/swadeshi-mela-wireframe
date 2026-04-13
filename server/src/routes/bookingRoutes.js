const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const { createBooking, listBookings, allotBooking } = require("../controllers/bookingController");

function createBookingRouter({ jwtSecret }) {
  const router = express.Router();
  router.post("/", createBooking);
  router.get("/", authRequired({ jwtSecret }), requireRole(["admin"]), listBookings);
  router.patch("/:id/allot", authRequired({ jwtSecret }), requireRole(["admin"]), allotBooking);
  return router;
}

module.exports = { createBookingRouter };
