const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const USER_ROLES = ["admin", "vendor"];
const USER_STATUS = ["active", "pending", "approved"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
      default: "vendor",
    },
    status: {
      type: String,
      enum: USER_STATUS,
      required: true,
      default: "pending",
    },
  },
  { timestamps: true },
);

userSchema.methods.verifyPassword = async function verifyPassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = async function hashPassword(password) {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

const User = mongoose.model("User", userSchema);

module.exports = { User, USER_ROLES, USER_STATUS };
