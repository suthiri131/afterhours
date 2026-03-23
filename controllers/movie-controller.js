const Movie = require("./../models/movie-model");
const Review = require("../models/review-model");

exports.showAllMovies = async (req, res) => {
  try {
    const movies = await Movie.findAll();

    res.render("movies", {
      movies,
    });
  } catch (error) {
    console.error(error);
    res.render("movies", {
      movies: [],
      msg: "Error loading movies",
    });
  }
};

// thet
exports.showMovieDetails = async (req, res) => {
  try {
    const movieId = req.params.id;
    const user = req.session.user || null;

    const movie = await Movie.findMovieById(movieId);
    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    const reviews = await Review.findByMovieId(movieId);
    const stats = await Review.getMovieReviewStats(movieId);

    let existingReview = null;
    if (user) {
      existingReview = await Review.findByMovieIdAndUserId(movieId, user.id);
    }

    res.render("movie-details", {
      movie,
      reviews,
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount,
      user,
      existingReview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading movie details");
  }
};
