const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { authRequired, requireRole } = require("../middleware/auth");
const { createBooking, listBookings, allotBooking, getBookingAvailability, payBookingBalance } = require("../controllers/bookingController");

const uploadDirectory = path.join(process.cwd(), "uploads", "bookings");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirectory),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});
const upload = multer({ storage });

function createBookingRouter({ jwtSecret }) {
  const router = express.Router();
  router.get("/availability", getBookingAvailability);
  router.post("/", upload.single("receiptImage"), createBooking);
  router.get("/", authRequired({ jwtSecret }), requireRole(["admin", "vendor"]), listBookings);
  router.patch("/:id/allot", authRequired({ jwtSecret }), requireRole(["admin"]), allotBooking);
  router.patch("/:id/pay-balance", authRequired({ jwtSecret }), requireRole(["admin", "vendor"]), payBookingBalance);
  return router;
}

module.exports = { createBookingRouter };
