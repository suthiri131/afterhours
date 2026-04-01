const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A movie must have a title"],
    trim: true,
    maxLength: [150, "Title cannot exceed 150 characters"],
  },

  genre: {
    type: [mongoose.Schema.Types.ObjectId], //to reuse generated genres
    ref: "Genre",
    required: [true, "A movie must have a genre"],
  },

  description: {
    type: String,
    trim: true,
    required: [true, "A movie must have a description"],
    maxLength: [2000, "Description cannot exceed 2000 characters"],
  },

  releaseYear: {
    type: Number,
    required: [true, "A movie must have a release year"],
    min: [1888, "Release year is invalid"],
    max: [2100, "Release year is invalid"],
  },

  director: {
    type: String,
    trim: true,
    required: [true, "A movie must have a director"],
    maxLength: [100, "Director name cannot exceed 100 characters"],
  },

  movieImage: {
    type: String,
    required: [true, "A movie must have an image"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  views: {
    type: Number,
    default: 0,
    min: [0, "Views cannot be negative"],
  },
});

movieSchema.index({ title: 1, releaseYear: 1 }, { unique: true });

const Movie = mongoose.model("Movie", movieSchema, "movies");

Movie.addMovie = function (newMovie) {
  return Movie.create(newMovie);
};

Movie.findAll = function () {
  return Movie.find().populate("genre").sort({ createdAt: -1 });
};

Movie.findMovieById = function (id) {
  return Movie.findById(id).populate("genre");
};

Movie.updateMovie = function (id, updatedData) {
  return Movie.findByIdAndUpdate(id, updatedData, {
    returnDocument: "after",
    runValidators: true,
  });
};

Movie.deleteMovie = function (id) {
  return Movie.findByIdAndDelete(id);
};

module.exports = Movie;
