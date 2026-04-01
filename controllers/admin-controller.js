const fs = require("fs");
const path = require("path");

const Genre = require("../models/genre-model");
const Movie = require("./../models/movie-model");
const Review = require("./../models/review-model");
const Watchlist = require("../models/watchlist-model");

exports.adminShowCreateForm = async (req, res) => {
  try {
    const genres = await Genre.findAll();

    res.render("admin/admin-create-movie", {
      user: req.session.user,
      errors: [],
      formData: {},
      genres,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading create form");
  }
};

exports.adminShowMovies = async (req, res) => {
  try {
    const movies = await Movie.findAll();

    res.render("admin/admin-mainpage", {
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
  description = description?.trim();
  director = director?.trim();

  const genreArray = Array.isArray(genre) ? genre : genre ? [genre] : [];

  const formData = {
    title,
    genre: genreArray,
    description,
    releaseYear,
    director,
  };

  const cleanUpFile = () => {
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "../public/uploads/", req.file.filename),
      );
    }
  };

  const renderForm = async (errors) => {
    cleanUpFile();
    const genres = await Genre.findAll();
    return res.render("admin/admin-create-movie", {
      user,
      errors,
      formData,
      genres,
    });
  };

  const errors = [];

  if (!title) {
    errors.push("Title is required.");
  } else if (title.length > 150) {
    errors.push("Title cannot exceed 150 characters.");
  }

  if (!genreArray || genreArray.length === 0) errors.push("Genre is required.");

  if (!director) {
    errors.push("Director is required.");
  } else if (director.length > 100) {
    errors.push("Director name cannot exceed 100 characters.");
  }

  if (!releaseYear) errors.push("Release Year is required.");

  if (
    releaseYear &&
    (isNaN(Number(releaseYear)) ||
      Number(releaseYear) < 1888 ||
      Number(releaseYear) > currentYear)
  ) {
    errors.push("Release Year must be between 1888 and " + currentYear + ".");
  }
  if (!description) {
    errors.push("Description is required.");
  } else if (description.length > 2000) {
    errors.push("Description cannot exceed 2000 characters.");
  }

  if (req.uploadError) {
    errors.push(req.uploadError);
  } else if (!req.file) {
    errors.push("Movie Image is required.");
  }

  if (errors.length > 0) {
    return renderForm(errors);
  }

  const movieData = {
    title,
    genre: genreArray,
    description,
    releaseYear: releaseYear ? Number(releaseYear) : null,
    director,
    movieImage: req.file ? "/uploads/" + req.file.filename : null,
  };

  try {
    await Movie.addMovie(movieData);
    console.log("Movie created successfully:", title);
    return res.redirect("/admin/movies");
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return renderForm([
        "A movie with this title and release year already exists.",
      ]);
    }

    return renderForm(["Error creating movie. Please try again."]);
  }
};

exports.adminShowEditForm = async (req, res) => {
  try {
    const movie = await Movie.findMovieById(req.params.id);
    const genres = await Genre.findAll();

    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    res.render("admin/admin-edit-movie", {
      movie,
      user: req.session.user,
      errors: [],
      formData: null,
      genres,
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
  description = description?.trim();
  director = director?.trim();

  const genreArray = Array.isArray(genre) ? genre : genre ? [genre] : [];

  const movie = await Movie.findMovieById(req.params.id);
  if (!movie) {
    return res.status(404).send("Movie not found.");
  }

  const formData = {
    title,
    genre: genreArray || [],
    description,
    releaseYear,
    director,
  };

  const cleanUpFile = () => {
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "../public/uploads/", req.file.filename),
      );
    }
  };

  const renderForm = async (errors) => {
    cleanUpFile();
    const genres = await Genre.findAll();
    return res.render("admin/admin-edit-movie", {
      movie,
      user,
      errors,
      formData,
      genres,
    });
  };

  const errors = [];

  if (!title) {
    errors.push("Title is required.");
  } else if (title.length > 150) {
    errors.push("Title cannot exceed 150 characters.");
  }

  if (!genreArray || genreArray.length === 0) errors.push("Genre is required.");

  if (!director) {
    errors.push("Director is required.");
  } else if (director.length > 100) {
    errors.push("Director name cannot exceed 100 characters.");
  }

  if (!releaseYear) errors.push("Release Year is required.");

  if (
    releaseYear &&
    (isNaN(Number(releaseYear)) ||
      Number(releaseYear) < 1888 ||
      Number(releaseYear) > currentYear)
  ) {
    errors.push("Release Year must be between 1888 and " + currentYear + ".");
  }

  if (!description) {
    errors.push("Description is required.");
  } else if (description.length > 2000) {
    errors.push("Description cannot exceed 2000 characters.");
  }

  if (req.uploadError) {
    errors.push(req.uploadError);
  } else if (!req.file && !movie.movieImage) {
    errors.push("Movie Image is required.");
  }

  if (errors.length > 0) {
    return renderForm(errors);
  }

  const movieData = {
    title,
    genre: genreArray,
    description,
    releaseYear: releaseYear ? Number(releaseYear) : null,
    director,
    movieImage: req.file ? "/uploads/" + req.file.filename : movie.movieImage,
  };

  if (req.file && movie.movieImage) {
    const oldImagePath = path.join(__dirname, "../public", movie.movieImage);

    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
      console.log("Old image deleted:", movie.movieImage);
    }
  }

  try {
    await Movie.updateMovie(req.params.id, movieData);
    console.log("Movie updated successfully:", title);
    return res.redirect("/admin/movies");
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return renderForm([
        "A movie with this title and release year already exists.",
      ]);
    }

    return renderForm(["Error updating movie. Please try again."]);
  }
};

exports.adminDeleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findMovieById(req.params.id);

    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    if (movie.movieImage) {
      const imagePath = path.join(__dirname, "../public", movie.movieImage);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Movie image deleted:", movie.movieImage);
      }
    }

    await Review.deleteReviewsByMovieId(req.params.id);
    await Watchlist.deleteMany({ movieId: req.params.id });

    await Movie.deleteMovie(req.params.id);
    console.log(
      "Movie, related reviews and watchlist entries deleted successfully:",
      movie.title,
    );
    res.redirect("/admin/movies");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting movie");
  }
};
