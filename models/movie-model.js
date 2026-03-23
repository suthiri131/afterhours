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

  description: {
    type: String,
    trim: true,
    default: "",
  },

  releaseYear: {
    type: Number,
    default: null,
  },

  director: {
    type: String,
    trim: true,
    default: "",
  },

  movieImage: {
    type: String,
    default: null,
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

exports.findAll = function () {
  return Movie.find().sort({ createdAt: -1 });
};

// thet
exports.findMovieById = function (id) {
  return Movie.findById(id);
};

exports.updateMovie = function (id, updatedData) {
  return Movie.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });
};

exports.deleteMovie = function (id) {
  return Movie.findByIdAndDelete(id);
};