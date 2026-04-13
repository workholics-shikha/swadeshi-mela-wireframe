const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { authRequired, requireRole } = require("../middleware/auth");
const { listEvents, createEvent, updateEvent, deleteEvent } = require("../controllers/eventController");

const uploadDirectory = path.join(process.cwd(), "uploads", "events");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirectory),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});
const upload = multer({ storage });

function createEventRouter({ jwtSecret }) {
  const router = express.Router();
  router.get("/", listEvents);
  router.post(
    "/",
    authRequired({ jwtSecret }),
    requireRole(["admin"]),
    upload.fields([{ name: "bannerImage", maxCount: 1 }, { name: "galleryImages", maxCount: 8 }]),
    createEvent,
  );
  router.put("/:id", authRequired({ jwtSecret }), requireRole(["admin"]), updateEvent);
  router.delete("/:id", authRequired({ jwtSecret }), requireRole(["admin"]), deleteEvent);
  return router;
}

module.exports = { createEventRouter };
