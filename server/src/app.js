const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const { createAuthRouter } = require("./routes/authRoutes");
const { createCategoryRouter } = require("./routes/categoryRoutes");
const { createEventRouter } = require("./routes/eventRoutes");
const { createBookingRouter } = require("./routes/bookingRoutes");
const { createVendorRouter } = require("./routes/vendorRoutes");
const { createZoneRouter } = require("./routes/zoneRoutes");
const { createZoneMasterRouter } = require("./routes/zoneMasterRoutes");

function createApp({ jwtSecret, jwtExpiresIn }) {
  const app = express();

  app.set("jwtSecret", jwtSecret);
  app.set("jwtExpiresIn", jwtExpiresIn);

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.get("/health", (req, res) => res.json({ ok: true }));
  app.use("/api/auth", createAuthRouter({ jwtSecret }));
  app.use("/api/categories", createCategoryRouter({ jwtSecret }));
  app.use("/api/events", createEventRouter({ jwtSecret }));
  app.use("/api/bookings", createBookingRouter({ jwtSecret }));
  app.use("/api/vendors", createVendorRouter({ jwtSecret }));
  app.use("/api/zones", createZoneRouter({ jwtSecret }));
  app.use("/api/zone-master", createZoneMasterRouter({ jwtSecret }));

  // 404
  app.use((req, res) => res.status(404).json({ message: "Not found" }));

  // Error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // Avoid leaking stack traces in production by default
    const status = err.statusCode || 500;
    const message = status >= 500 ? "Internal server error" : err.message;
    return res.status(status).json({ message });
  });

  return app;
}

module.exports = { createApp };
