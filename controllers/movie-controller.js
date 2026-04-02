const Movie = require("../models/movie-model");
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

    const movies = await Movie.find(filter)
      .populate("genre")
      .sort({ createdAt: -1 }); // populate to filter, sort for newest first

    const moviesWithStats = await Promise.all(
      movies.map(async (movie) => {
        const stats = await Review.getMovieReviewStats(movie._id);

        const views = movie.views || 0;
        const avgRating = stats.averageRating || 0;
        const reviewCount = stats.reviewCount || 0;

        const trendingScore = //what's determinant of being trending:
          views * 0.4 + //40% on number of movie details views
          avgRating * 20 * 0.4 + //40% on average rating of movie
          reviewCount * 0.2; //remaing 20% on number of reviews

        return {
          ...movie.toObject(),
          trendingScore,
          views,
          avgRating,
          reviewCount,
        };
      }),
    );

    //sort by tabulated trending scores, slide to limit top 4 trending movies
    const trendingMovies = [...moviesWithStats]
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 4);
    let msg = "";
    if (req.query.msg === "added") msg = "Successfully added to watchlist!";
    if (req.query.msg === "exists") {
      msg = "This movie is already in your watchlist.";
    }
    if (req.query.msg === "error") msg = "Something went wrong. Try again!";

    res.render("user/movies", {
      movies: moviesWithStats,
      trendingMovies,
      genres,
      selectedGenre,
      user: req.session.user,
      msg: msg,
      search,
    });
  } catch (error) {
    console.error(error);
    res.render("user/movies", {
      movies: [],
      genres: [],
      selectedGenre: "",
      msg: "Error loading movies",
      search: "",
    });
  }
};

exports.showMovieDetails = async (req, res) => {
  try {
    const movieId = req.params.id;
    const user = req.session.user || null;
    const reviewSort = req.query.sort || "mostRecent";

    const movie = await Movie.findMovieById(movieId).populate("genre");
    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    await Movie.findByIdAndUpdate(movieId, { $inc: { views: 1 } });
     
    let reviews = await Review.findByMovieId(movieId);

    if (reviewSort === "oldest") {
      reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (reviewSort === "mostRated") {
      reviews.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (reviewSort === "leastRated") {
      reviews.sort((a, b) => Number(a.rating) - Number(b.rating));
    } else {
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

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
          genreIds.includes(id)
        ).length;

        return {
          ...suggestedMovie.toObject(),
          overlapCount
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

      watchlistItem = await Watchlist.findOne({
        user: user.id,
        movieId: movieId,
        isRemoved: false,
      });

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
      suggestedMsg = "Something went wrong. Try again!";

    res.render("user/movie-details", {
      movie,
      reviews,
      reviewSort,
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount,
      user,
      myReview,
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