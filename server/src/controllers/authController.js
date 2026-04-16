const { User } = require("../models/User");
const { signToken } = require("../utils/jwt");

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials-1" });
  }

  console.log("INPUT PASSWORD:", password);
  console.log("DB HASH:", user.password);

  const ok = await user.verifyPassword(String(password));
  console.log("MATCH RESULT:", ok);
 

  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials-2" });
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

async function me(req, res) {
  const id = req.user?.sub;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ id: user._id.toString(), name: user.name, email: user.email, role: user.role, status: user.status });
}

module.exports = { login, me };
