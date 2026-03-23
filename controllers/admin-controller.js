const Movie = require("./../models/movie-model");
const Watchlist = require("../models/watchlist-model");

// START of admin functions for adding/editing/deleting movies

exports.showCreateMovieForm = (req, res) => {

  res.render("admin-create-movie", {
    user: req.session.user,
    msg: "",
    formData: {},
  });

};

exports.showAdminMovies = async (req, res) => {

  try {
    const movies = await Movie.findAll();
    res.render("admin-movie-list", {
      movies,
      user: req.session.user,
      msg: "",
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error Loading Admin Movie Management Page");
  }

};

exports.createMovie = async (req, res) => {

  const user = req.session.user;
  const currentYear = new Date().getFullYear();
  let { title, genre, description, releaseYear, director } = req.body;

  title = title?.trim();
  genre = genre?.trim();
  description = description?.trim();
  director = director?.trim();
  
  const formData = { title, genre, description, releaseYear, director };

  const renderForm = (msg) => {
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
  };

  try {
    await Movie.addMovie(movieData);
    res.redirect("/admin/movies");

  } catch (error) {
    console.error(error);
    return renderForm("Error creating movie. Please try again.");
  }

};

exports.showEditMovieForm = async (req, res) => {

  try {
    const movie = await Movie.findMovieById(req.params.id);
    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    res.render("admin-edit-movie", {
      movie,
      user: req.session.user,
      msg: "",
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error Loading Admin Edit Movie Page");
  }

};

exports.updateMovie = async (req, res) => {

  const user = req.session.user;
  const currentYear = new Date().getFullYear();

  let { title, genre, description, releaseYear, director } = req.body;

  title = title?.trim();
  genre = genre?.trim();
  description = description?.trim();
  director = director?.trim();

  const movie = await Movie.findMovieById(req.params.id);

  const renderForm = (msg) => {
    return res.render("admin-edit-movie", { movie, user, msg });
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
  };

  try {
    await Movie.updateMovie(req.params.id, movieData);
    res.redirect("/admin/movies");

  } catch (error) {
    console.error(error);
    return renderForm("Error updating movie. Please try again.");
  }

};

exports.deleteMovie = async (req, res) => {

  try {
    // I comment out this portion first, after watchlist is done,
    // then I will comment it back in (HS)

    // const watchlistEntries = await Watchlist.findByMovieId(req.params.id);
    // if (watchlistEntries.length > 0) {
    //   const movies = await Movie.findAll();
    //   return res.render("admin-movies", {
    //     movies,
    //     user: req.session.user,
    //     msg: "Unable to delete as this movie is in one or more users' watchlists.",
    //   });
    // }

    const movie = await Movie.findMovieById(req.params.id);
    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    await Movie.deleteMovie(req.params.id);
    res.redirect("/admin/movies");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting movie");
  }

};

// END of admin functions for adding/editing/deleting movies