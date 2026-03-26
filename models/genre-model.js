const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Genre name is required"],
    unique: true,
    trim: true,
  },
});

const Genre = mongoose.model("Genre", genreSchema);

exports.findAll = function () {
  return Genre.find().sort({ name: 1 });
};

exports.findById = function (id) {
  return Genre.findById(id);
};

exports.createGenre = function (data) {
  return Genre.create(data);
};

exports.updateGenre = function (id, data) {
  return Genre.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteGenre = function (id) {
  return Genre.findByIdAndDelete(id);
};

exports.findByName = function (name) {
  return Genre.findOne({ name });
};