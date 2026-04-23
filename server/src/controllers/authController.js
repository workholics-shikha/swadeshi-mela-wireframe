const crypto = require("crypto");
const { User } = require("../models/User");
const { signToken } = require("../utils/jwt");

const RESET_CODE_TTL_MS = 10 * 60 * 1000;

function createResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashResetCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await user.verifyPassword(String(password));

  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.role === "vendor" && !["approved", "active"].includes(user.status)) {
    return res.status(403).json({ message: "Your vendor account is not approved yet." });
  }

  const token = signToken(
    { sub: user._id.toString(), role: user.role, email: user.email },
    { secret: req.app.get("jwtSecret"), expiresIn: req.app.get("jwtExpiresIn") },
  );

  return res.json({
    token,
    user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role, status: user.status },
  });
}

async function requestPasswordReset(req, res) {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select("+resetPasswordCode +resetPasswordExpiresAt");

  if (!user) {
    return res.json({
      message: "If an account exists for this email, a reset code has been generated.",
    });
  }

  const resetCode = createResetCode();
  user.resetPasswordCode = hashResetCode(resetCode);
  user.resetPasswordExpiresAt = new Date(Date.now() + RESET_CODE_TTL_MS);
  await user.save();

  return res.json({
    message: "Reset code generated. Use it to create a new password.",
    resetCode,
    expiresInMinutes: RESET_CODE_TTL_MS / (60 * 1000),
  });
}

async function resetPassword(req, res) {
  const { email, code, newPassword } = req.body || {};

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "Email, reset code, and new password are required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password +resetPasswordCode +resetPasswordExpiresAt",
  );

  if (!user || !user.resetPasswordCode || !user.resetPasswordExpiresAt) {
    return res.status(400).json({ message: "Invalid or expired reset code" });
  }

  if (user.resetPasswordExpiresAt.getTime() < Date.now()) {
    user.resetPasswordCode = null;
    user.resetPasswordExpiresAt = null;
    await user.save();
    return res.status(400).json({ message: "Invalid or expired reset code" });
  }

  if (user.resetPasswordCode !== hashResetCode(code)) {
    return res.status(400).json({ message: "Invalid or expired reset code" });
  }

  user.password = await User.hashPassword(String(newPassword));
  user.resetPasswordCode = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  return res.json({ message: "Password updated successfully. Please sign in with your new password." });
}

async function me(req, res) {
  const id = req.user?.sub;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ id: user._id.toString(), name: user.name, email: user.email, role: user.role, status: user.status });
}

module.exports = { login, requestPasswordReset, resetPassword, me };
