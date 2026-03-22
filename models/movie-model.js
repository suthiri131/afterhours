const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A movie must have a title"],
    trim: true,
  },
  genre: {
    type: String,
    required: [true, "A movie must have a genre"],
    trim: true,
  },
  watchStatus: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating must be at most 5"],
    default: null,
  },
  review: {
    type: String,
    trim: true,
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User does not exist"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Movie = mongoose.model("Movie", movieSchema, "movies");

exports.addMovie = function (newMovie) {
  return Movie.create(newMovie);
};

exports.deleteMovie = function (id) {
  return Movie.findByIdAndDelete(id);
};

// thet
exports.findMovieById = function (id) {
  return Movie.findById(id);
};