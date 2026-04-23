const express = require("express");
const { login, requestPasswordReset, resetPassword, me } = require("../controllers/authController");
const { authRequired } = require("../middleware/auth");

function createAuthRouter({ jwtSecret }) {
  const router = express.Router();

  router.post("/login", login);
  router.post("/forgot-password", requestPasswordReset);
  router.post("/reset-password", resetPassword);
  router.get("/me", authRequired({ jwtSecret }), me);

  return router;
}

module.exports = { createAuthRouter };
