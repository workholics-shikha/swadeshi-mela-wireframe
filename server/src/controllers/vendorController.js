const { User } = require("../models/User");

async function listVendors(req, res) {
  const vendors = await User.find({ role: "vendor" }).sort({ createdAt: -1 });
  return res.json(vendors);
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
