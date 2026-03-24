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

Movie.addMovie = function (newMovie) {
  return Movie.create(newMovie);
};

Movie.findAll = function () {
  return Movie.find().sort({ createdAt: -1 });
};

// thet
Movie.addMovie = function (newMovie) {
  return Movie.create(newMovie);
};

Movie.findAll = function () {
  return Movie.find().sort({ createdAt: -1 });
};

Movie.findMovieById = function (id) {
  return Movie.findById(id);
};

Movie.updateMovie = function (id, updatedData) {
  return Movie.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });
};

Movie.deleteMovie = function (id) {
  return Movie.findByIdAndDelete(id);
};

module.exports = Movie;