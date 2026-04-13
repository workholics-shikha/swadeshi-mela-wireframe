const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const { listCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");

function createCategoryRouter({ jwtSecret }) {
  const router = express.Router();
  router.get("/", listCategories);
  router.post("/", authRequired({ jwtSecret }), requireRole(["admin"]), createCategory);
  router.put("/:id", authRequired({ jwtSecret }), requireRole(["admin"]), updateCategory);
  router.delete("/:id", authRequired({ jwtSecret }), requireRole(["admin"]), deleteCategory);
  return router;
}

module.exports = { createCategoryRouter };
