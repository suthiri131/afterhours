const Movie = require("./../models/movie-model");
const Review = require("../models/review-model");
const Watchlist = require("../models/watchlist-model");
const Genre = require("../models/genre-model");

exports.showAllMovies = async (req, res) => {
  try {
    const genres = await Genre.findAll();
    let selectedGenre = req.query.genre || [];
    const search = req.query.search || "";
    let filter = {}; //create filter to search genre
    //genre filter
    if (!Array.isArray(selectedGenre)) {
      selectedGenre = selectedGenre ? [selectedGenre] : [];
    }

    if (selectedGenre.length > 0) {
      filter.genre = { $all: selectedGenre }; //use $all not $in to filter all selected genres
    } 
    //search movie filter
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    const movies = await Movie.find(filter).populate("genre").sort({ createdAt: -1 }); // populate to filter, sort for newest first

    let msg = "";
    if (req.query.msg === "added") msg = "Successfully added to watchlist!";
    if (req.query.msg === "exists") {
      msg = "This movie is already in your watchlist.";
    }
    if (req.query.msg === "error") msg = "Something went wrong. Try again!";

    res.render("movies", {
      movies,
      genres,
      selectedGenre,
      user: req.session.user,
      msg: msg,
      search
    });
  } catch (error) {
    console.error(error);
    res.render("movies", {
      movies: [],
      genres: [],
      selectedGenre: "",
      msg: "Error loading movies",
      search: ""
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

    let activeWatchlistMovieIds = [];
    if (user) {
      const activeWatchlistItems = await Watchlist.find({
        user: user.id,
        isRemoved: false,
      }).select("movieId");

      activeWatchlistMovieIds = activeWatchlistItems.map((item) =>
        item.movieId.toString(),
      );
    }

    const genreIds = Array.isArray(movie.genre)
      ? movie.genre.map((g) => g._id.toString())
      : [];

    let suggestedMovies = await Movie.find({
      _id: { $ne: movieId },
      genre: { $in: genreIds },
    }).populate("genre");

    suggestedMovies = suggestedMovies
      .map((suggestedMovie) => {
        const suggestedGenreIds = Array.isArray(suggestedMovie.genre)
          ? suggestedMovie.genre.map((g) => g._id.toString())
          : [];

        const overlapCount = suggestedGenreIds.filter((id) =>
          genreIds.includes(id),
        ).length;

        return {
          ...suggestedMovie.toObject(),
          overlapCount,
        };
      })
      .sort((a, b) => {
        if (b.overlapCount !== a.overlapCount) {
          return b.overlapCount - a.overlapCount;
        }
        return a.title.localeCompare(b.title);
      });

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
        isRemoved: false,
      });

      // updated by thet
      // check watched history even if the movie was removed from watchlist,
      // so user can still write a review later if it was watched before
      const watchedRecord = await Watchlist.findOne({
        user: user.id,
        movieId: movieId,
        status: "Watched",
      });

      hasWatched = !!watchedRecord;
    }

    let suggestedMsg = "";
    if (req.query.msg === "added")
      suggestedMsg = "Successfully added to watchlist!";
    if (req.query.msg === "error")
      suggestedMsg = "Something went wrong. try again!";

    res.render("movie-details", {
      movie,
      reviews,
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount,
      user,
      myReview,
      watchlistItem,
      hasWatched,
      isInWatchlist: !!watchlistItem,
      suggestedMovies,
      suggestedMsg,
      activeWatchlistMovieIds,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading movie details");
  }
};
