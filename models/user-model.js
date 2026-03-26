const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "A user must have a full name"],
    trim: true,
  },
  username: {
    type: String,
    required: [true, "A user must have a username"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "A user must have a password"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  role: {
    type: String,
    enum: ["user", "admin", "superAdmin"],
    default: "user",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    code: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema, "users");
exports.addUser = function (newUser) {
  return User.create(newUser);
};
exports.findById = function (id) {
  return User.findById(id);
};
exports.findByEmail = function (email) {
  return User.findOne({ email: email });
};
exports.findByUsername = function (username) {
  return User.findOne({ username: username });
};

exports.updateByEmail = function (email, updatedData) {
  return User.findOneAndUpdate({ email }, updatedData, { new: true });
};
exports.deleteUser = function (id) {
  return User.findByIdAndDelete(id);
};

exports.updatePassword = function (id, hashedPassword) {
  return User.findByIdAndUpdate(
    id,
    { password: hashedPassword },
    { returnDocument: "after" },
  );
};

// super admin
exports.findAllUsers = function () {
  return User.find().sort({ createdAt: -1 });
};

exports.updateUserRole = function (id, role) {
  return User.findByIdAndUpdate(
    id,
    { role },
    { returnDocument: "after", runValidators: true },
  );
};
