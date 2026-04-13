const {
  createEvent: createEventInService,
  listEvents: listEventsInService,
  softDeleteEvent,
  updateEvent: updateEventInService,
} = require("../services/eventService");

async function listEvents(req, res) {
  const events = await listEventsInService();
  return res.json(events);
}

async function createEvent(req, res) {
  const {
    title,
    category,
    description,
    startDate,
    endDate,
    openingTime,
    closingTime,
    venueName,
    fullAddress,
    city,
    state,
    pincode,
    totalStalls,
    bookingEnabled,
    status,
    categoryZoneMappings,
  } = req.body || {};

  const bannerImage = req.files?.bannerImage?.[0]?.filename
    ? `/uploads/events/${req.files.bannerImage[0].filename}`
    : "";
  const galleryImages = (req.files?.galleryImages || []).map((file) => `/uploads/events/${file.filename}`);
  let parsedCategoryZoneMappings = [];
  if (categoryZoneMappings) {
    try {
      const parsed = JSON.parse(categoryZoneMappings);
      if (Array.isArray(parsed)) {
        parsedCategoryZoneMappings = parsed
          .filter((row) => row && row.categoryName)
          .map((row) => ({
            categoryName: String(row.categoryName).trim(),
            zoneId: row.zoneId ? String(row.zoneId) : null,
            stalls: Number(row.stalls) || 0,
          }));
      }
    } catch (_error) {
      return res.status(400).json({ message: "Invalid categoryZoneMappings format" });
    }
  }

  if (!title || !category || !description || !startDate || !endDate || !openingTime || !closingTime || !venueName || !fullAddress || !city || !state || !pincode) {
    return res.status(400).json({ message: "Missing required event fields" });
  }

  const event = await createEventInService({
    title: String(title).trim(),
    category,
    description: String(description).trim(),
    startDate,
    endDate,
    openingTime: String(openingTime).trim(),
    closingTime: String(closingTime).trim(),
    venueName: String(venueName).trim(),
    fullAddress: String(fullAddress).trim(),
    city: String(city).trim(),
    state: String(state).trim(),
    pincode: String(pincode).trim(),
    bannerImage,
    galleryImages,
    totalStalls: Number(totalStalls) || 0,
    categoryZoneMappings: parsedCategoryZoneMappings,
    bookingEnabled: bookingEnabled === true || bookingEnabled === "true",
    status: status || "active",
  });

  return res.status(201).json(event);
}

async function updateEvent(req, res) {
  try {
    const payload = req.body || {};
    const updated = await updateEventInService(req.params.id, payload);
    if (!updated) return res.status(404).json({ message: "Event not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to update event" });
  }
}

async function deleteEvent(req, res) {
  try {
    const deleted = await softDeleteEvent(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Event not found" });
    return res.json({ message: "Event deleted" });
  } catch (error) {
    if (error.code === "BOOKINGS_EXIST") {
      return res.status(400).json({ message: "Cannot delete event because bookings exist" });
    }
    return res.status(400).json({ message: error.message || "Failed to delete event" });
  }
}

module.exports = { listEvents, createEvent, updateEvent, deleteEvent };
