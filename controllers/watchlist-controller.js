const Watchlist = require("../models/watchlist-model");
const Review = require("../models/review-model"); 

exports.showWatchList = async (req, res) => {
  try {
    if (!req.session?.user) return res.redirect("/user/login");
    const userId = req.session.user.id || req.session.user._id;

    const items = await Watchlist.getUserWatchlist(userId);
    const cleanMovies = items.filter(item => item.movieId !== null);

    let msg = "";
    if (req.query.msg === "deleted") msg = "Movie has been removed from your watchlist.";
    if (req.query.msg === "watched") msg = "Movie status has been updated to: Watched";
    if (req.query.msg === "error") msg = "Oops! Something went wrong.";

    const moviesWithReviewStatus = await Promise.all(
      cleanMovies.map(async (item) => {
        const review = await Review.findByMovieIdAndUserId(item.movieId._id, userId);
        return {
          ...item.toObject(),
          hasReview: !!review,
          reviewId: review ? review._id : null
        };
      })
    );
    res.render("watchlist", { movies: moviesWithReviewStatus, user: req.session.user, msg: msg });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading watchlist.");
  }
};

exports.addToWatchList = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.session.user.id || req.session.user._id;
    const returnTo = req.body.returnTo || "/movies";
    const result = await Watchlist.upsertMovie(userId, movieId);
    const status = result === "exists" ? "exists" : "added";
    res.redirect(`${returnTo.split("#")[0]}?msg=${status}`);
  } catch (error) {
    res.redirect("/movies?msg=error");
  }
};

exports.markAsWatched = async (req, res) => {
  try {
    await Watchlist.updateStatus(req.params.id, "Watched");
    res.redirect("/watchlist?msg=watched");
  } catch (error) {
    res.status(500).send("Error updating status.");
  }
};

exports.deleteFromWatchlist = async (req, res) => {
  try {
    await Watchlist.softDelete(req.params.id);
    res.redirect("/watchlist?msg=deleted"); 
  } catch (error) {
    res.redirect("/watchlist?msg=error");
  }
};


