const express = require("express");
const { login, me } = require("../controllers/authController");
const { authRequired } = require("../middleware/auth");

function createAuthRouter({ jwtSecret }) {
  const router = express.Router();

  router.post("/login", login);
  router.get("/me", authRequired({ jwtSecret }), me);

  return router;
}

module.exports = { createAuthRouter };
