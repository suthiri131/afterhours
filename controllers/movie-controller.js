const Movie = require("./../models/movie-model");
const Review = require("../models/review-model");
const Watchlist = require("../models/watchlist-model");
const Genre = require("../models/genre-model");

exports.showAllMovies = async (req, res) => {
  try {
    const genres = await Genre.findAll();
    const selectedGenre = req.query.genre || "";

    let filter = {}; //create filter to search genre
    if (selectedGenre) {
      filter.genre = selectedGenre; //filter by genre_id, this is correct if genre is stored as ObjectId in movie
    }    
    const movies = await Movie.find(filter).populate("genre"); //use filter;

    let msg = "";
    if (req.query.msg === "added") msg = "Successfully added to watchlist!";
    if (req.query.msg === "exists") msg = "This movie is already in your watchlist.";
    if (req.query.msg === "error") msg = "Something went wrong. try again!";

    res.render("movies", {
      movies,
      genres,
      selectedGenre,
      user: req.session.user,
      msg: msg
    });
  } catch (error) {
    console.error(error);
    res.render("movies", {
      movies: [],
      genres: [],
      selectedGenre: "",
      user: req.session.user,
      msg: "Error loading movies",
    });
  }
};

// thet
// load movie details, public reviews, the current user's review,
// and check watched history so removed watched movies are still remembered
exports.showMovieDetails = async (req, res) => {
  try {
    const movieId = req.params.id;
    const user = req.session.user || null;

    const movie = await Movie.findMovieById(movieId).populate("genre");
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

      // updated by thet
      // find the active watchlist item only, so movie details page
      // does not depend on removed entries for current watchlist actions
      watchlistItem = await Watchlist.findOne({
        user: user.id,
        movieId: movieId,
        isRemoved: false
      });

      // updated by thet
      // check watched history even if the movie was removed from watchlist,
      // so user can still write a review later if it was watched before
      const watchedRecord = await Watchlist.findOne({
        user: user.id,
        movieId: movieId,
        status: "Watched"
      });

      hasWatched = !!watchedRecord;
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