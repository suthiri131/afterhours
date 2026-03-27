const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({

  title: {
    type: String,
    required: [true, "A movie must have a title"],
    trim: true,
  },

  genre: {
    type: [mongoose.Schema.Types.ObjectId], //to reuse generated genres
    ref: "Genre",
    required: [true, "A movie must have a genre"],
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
  
  views: {
    type: Number,
    default: 0,
},

});

const Movie = mongoose.model("Movie", movieSchema, "movies");

Movie.addMovie = function (newMovie) {
  return Movie.create(newMovie);
};

Movie.findAll = function () {
  return Movie.find().populate("genre").sort({ createdAt: -1 });
};

Movie.findMovieById = function (id) {
  return Movie.findById(id).populate("genre");;
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