const Movie = require("./../models/movie-model");

const Watchlist = require("../models/watchlist-model");

// START of admin functions for adding/editing/deleting movies

exports.adminShowCreateForm = (req, res) => {

  res.render("admin-create-movie", {
    user: req.session.user,
    msg: "",
    formData: {},
  });

};

exports.adminShowMovies = async (req, res) => {

  try {
    const movies = await Movie.findAll();
    res.render("admin-mainpage", {
      movies,
      user: req.session.user,
      msg: "",
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error Loading Admin Movie Management Page");
  }

};

exports.adminCreateMovie = async (req, res) => {

  const user = req.session.user;
  const currentYear = new Date().getFullYear();

  let { title, genre, description, releaseYear, director } = req.body;

  title = title?.trim();
  genre = genre?.trim();
  description = description?.trim();
  director = director?.trim();
  
  const formData = { title, genre, description, releaseYear, director };

  const cleanUpFile = () => {
    if (req.file) {

      const fs = require("fs");
      const path = require("path");

      fs.unlinkSync(path.join(__dirname, "../public/uploads/", req.file.filename));
    }
  };

  const renderForm = (msg) => {
    cleanUpFile();
    return res.render("admin-create-movie", { user, msg, formData });
  };

  if (!title || !genre) {
    return renderForm("Title and genre are required.");
  }

  if (releaseYear && (isNaN(releaseYear) || releaseYear < 1888 || releaseYear > currentYear)) {
    return renderForm("Release year must be between 1888 and " + currentYear + ".");
  }

  const movieData = {
    title,
    genre,
    description: description || "",
    releaseYear: releaseYear ? Number(releaseYear) : null,
    director: director || "",
    movieImage: req.file ? "/uploads/" + req.file.filename : null,
  };

  try {
    await Movie.addMovie(movieData);
    console.log("Movie created successfully:", title);
    res.redirect("/admin/movies");

  } catch (error) {
    console.error(error);
    return renderForm("Error creating movie. Please try again.");
  }

};

exports.adminShowEditForm = async (req, res) => {

  try {
    const movie = await Movie.findMovieById(req.params.id);

    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    res.render("admin-edit-movie", {
      movie,
      user: req.session.user,
      msg: "",
      formData: null,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error Loading Admin Edit Movie Page");
  }

};

exports.adminUpdateMovie = async (req, res) => {

  const user = req.session.user;
  const currentYear = new Date().getFullYear();

  let { title, genre, description, releaseYear, director } = req.body;

  title = title?.trim();
  genre = genre?.trim();
  description = description?.trim();
  director = director?.trim();

  const movie = await Movie.findMovieById(req.params.id);

  const formData = { title, genre, description, releaseYear, director };

  const cleanUpFile = () => {
    if (req.file) {

      const fs = require("fs");
      const path = require("path");
      
      fs.unlinkSync(path.join(__dirname, "../public/uploads/", req.file.filename));
    }
  };

  const renderForm = (msg) => {
     cleanUpFile();
    return res.render("admin-edit-movie", { movie, user, msg, formData });
  };

  if (!title || !genre) {
    return renderForm("Title and genre are required.");
  }

  if (releaseYear && (isNaN(releaseYear) || releaseYear < 1888 || releaseYear > currentYear)) {
    return renderForm("Release year must be between 1888 and " + currentYear + ".");
  }

  const movieData = {
    title,
    genre,
    description: description || "",
    releaseYear: releaseYear ? Number(releaseYear) : null,
    director: director || "",
    movieImage: req.file ? "/uploads/" + req.file.filename : movie.movieImage,
  };

  if (req.file && movie.movieImage) {

    const fs = require("fs");
    const path = require("path");

    const oldImagePath = path.join(__dirname, "../public", movie.movieImage);

    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
      console.log("Old image deleted:", movie.movieImage);
    }

  }

  try {
    await Movie.updateMovie(req.params.id, movieData);
    console.log("Movie updated successfully:", title);
    res.redirect("/admin/movies");

  } catch (error) {
    console.error(error);
    return renderForm("Error updating movie. Please try again.");
  }

};

exports.adminDeleteMovie = async (req, res) => {

  try {
    const watchlistEntries = await Watchlist.find({ movieId: req.params.id });

    if (watchlistEntries.length > 0) {
      const movies = await Movie.findAll();
      return res.render("admin-mainpage", {
        movies,
        user: req.session.user,
        msg: "Unable to delete as this movie is in one or more users' watchlists.",
      });
    }

    const movie = await Movie.findMovieById(req.params.id);
    
    if (!movie) {
      return res.status(404).send("Movie not found");
    }

     if (movie.movieImage) {

      const fs = require("fs");
      const path = require("path");

      const imagePath = path.join(__dirname, "../public", movie.movieImage);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Movie image deleted:", movie.movieImage);
      }
      
    }

    await Movie.deleteMovie(req.params.id);
    console.log("Movie deleted successfully:", movie.title);
    res.redirect("/admin/movies");
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting movie");
  }

};

// END of admin functions for adding/editing/deleting movies