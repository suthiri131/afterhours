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
exports.updateUser = function (id, updatedData) {
  return User.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });
};
exports.deleteUser = function (id) {
  return User.findByIdAndDelete(id);
};
