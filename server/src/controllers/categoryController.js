const { Category } = require("../models/Category");

async function listCategories(req, res) {
  const categories = await Category.find().sort({ createdAt: -1 });
  return res.json(categories);
}

async function createCategory(req, res) {
  const { name, type, status } = req.body || {};
  if (!name) return res.status(400).json({ message: "Category name is required" });
  if (!["event", "stall"].includes(type)) return res.status(400).json({ message: "Category type is required" });

  const category = await Category.create({ name: String(name).trim(), type, status: status || "active" });
  return res.status(201).json(category);
}

async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, type, status } = req.body || {};
  if (type && !["event", "stall"].includes(type)) return res.status(400).json({ message: "Invalid category type" });
  const category = await Category.findByIdAndUpdate(
    id,
    { ...(name ? { name: String(name).trim() } : {}), ...(type ? { type } : {}), ...(status ? { status } : {}) },
    { returnDocument: "after", runValidators: true },
  );
  if (!category) return res.status(404).json({ message: "Category not found" });
  return res.json(category);
}

async function deleteCategory(req, res) {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  return res.json({ message: "Category deleted" });
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
