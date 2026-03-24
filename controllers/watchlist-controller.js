const Watchlist = require("../models/watchlist-model");
const Review = require("../models/review-model");

// updated by thet
// load watchlist items and check whether the current user
// already wrote a review for each movie
// if yes, pass hasReview and reviewId so watchlist page can show Edit Review
// if no, keep showing Write a Review
exports.showWatchList = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const items = await Watchlist.find({ user: userId }).populate("movieId");

    const cleanMovies = items.filter(item => item.movieId !== null);

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
    
    res.render("watchlist", {
      movies: moviesWithReviewStatus,
      user: req.session.user,
      msg: req.query.msg || ""
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading watchlist.");
  }
};

// updated by thet
// add movie to watchlist
// if returnTo is sent from another page, redirect there after adding
// otherwise go back to the movies page with a success/existing message

exports.addToWatchList = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.session.user.id || req.session.user._id;
    const returnTo = req.body.returnTo;

    const existing = await Watchlist.findOne({ user: userId, movieId: movieId });

    if (!existing) {
      await Watchlist.create({ user: userId, movieId: movieId });
      return res.redirect(returnTo || "/movies?msg=added");
    } else {
      return res.redirect(returnTo || "/movies?msg=exists");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding to watchlist.");
  }
};

exports.deleteFromWatchlist = async (req, res) => {
  try {
    const {id} = req.params;
    await Watchlist.findByIdAndDelete(id);
    res.redirect("/watchlist");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting movie from the watchlist.");
  }
};

// updated by thet
// Mark movie as watched and return to the previous page (or watchlist by default)
exports.markAsWatched = async (req, res) => {
  try {
    const { id } = req.params;

    await Watchlist.findByIdAndUpdate(id, { status: "Watched" });
    console.log("status updated to Watched!");

    const returnTo = req.body.returnTo;
    res.redirect(returnTo || "/watchlist");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating status.");
  }
};