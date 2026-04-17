const { User } = require("../models/User");
const { Booking } = require("../models/Booking");

async function listVendors(req, res) {
  const vendors = await User.find({ role: "vendor" }).sort({ createdAt: -1 }).lean();
  const emails = vendors.map((vendor) => vendor.email).filter(Boolean);

  const latestBookings = await Booking.aggregate([
    { $match: { vendorEmail: { $in: emails } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$vendorEmail",
        mobile: { $first: "$mobile" },
      },
    },
  ]);

  const mobileByEmail = new Map(
    latestBookings.map((booking) => [String(booking._id).toLowerCase(), booking.mobile || ""]),
  );

  return res.json(
    vendors.map((vendor) => ({
      ...vendor,
      mobile: vendor.mobile || mobileByEmail.get(String(vendor.email).toLowerCase()) || "",
    })),
  );
}

async function updateVendorStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!["pending", "approved", "active"].includes(status)) {
    return res.status(400).json({ message: "Invalid vendor status" });
  }

  const vendor = await User.findOneAndUpdate(
    { _id: id, role: "vendor" },
    { status },
    { returnDocument: "after" },
  );

  if (!vendor) return res.status(404).json({ message: "Vendor not found" });
  return res.json(vendor);
}

module.exports = { listVendors, updateVendorStatus };
