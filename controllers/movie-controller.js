const Movie = require("./../models/movie-model");
const Review = require("../models/review-model");
const Watchlist = require("../models/watchlist-model");

exports.showAllMovies = async (req, res) => {
  try {
    const movies = await Movie.findAll();

    let msg = "";
    if (req.query.msg === "added") msg = "Successfully added to watchlist!";
    if (req.query.msg === "exists") msg = "This movie is already in your watchlist.";
    if (req.query.msg === "error") msg = "Something went wrong. try again!";

    res.render("movies", {
      movies,
      user: req.session.user,
      msg: msg
    });
  } catch (error) {
    console.error(error);
    res.render("movies", {
      movies: [],
      user: req.session.user,
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

    let myReview = null;
    let watchlistItem = null;
    let hasWatched = false;

    if (user) {
      myReview = await Review.findByMovieIdAndUserId(movieId, user.id);

      watchlistItem = await Watchlist.findOne({
        user: user.id,
        movieId: movieId
      });

      hasWatched = !!watchlistItem && watchlistItem.status === "Watched";
    }

    res.render("movie-details", {
      movie,
      reviews,
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount,
      user,
      myReview,
      watchlistItem,
      hasWatched
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading movie details");
  }
};