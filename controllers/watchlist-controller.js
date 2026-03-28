const Watchlist = require("../models/watchlist-model");
const Review = require("../models/review-model");

exports.showWatchList = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/user/login");
    }

    const userId = req.session.user.id;

    const items = await Watchlist.find({ 
          user: userId, 
          isRemoved: false 
        }).populate("movieId");

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

exports.addToWatchList = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.session.user.id || req.session.user._id;
    const returnTo = req.body.returnTo || "/movies";

    const [basePath, hash] = returnTo.split("#");

    const buildRedirectUrl = (msg) => {
      return `${basePath}?msg=${msg}${hash ? `#${hash}` : ""}`;
    };

    const existing = await Watchlist.findOne({ user: userId, movieId: movieId });

    if (!existing) {
      await Watchlist.create({ user: userId, movieId: movieId });
      return res.redirect(buildRedirectUrl("added"));
    } else if (existing.isRemoved) {
      existing.isRemoved = false;
      await existing.save();
      return res.redirect(buildRedirectUrl("added"));
    } else {
      return res.redirect(buildRedirectUrl("exists"));
    }
  } catch (error) {
    console.error(error);
    const returnTo = req.body.returnTo || "/movies";
    const [basePath, hash] = returnTo.split("#");
    return res.redirect(`${basePath}?msg=error${hash ? `#${hash}` : ""}`);
  }
};

exports.deleteFromWatchlist = async (req, res) => {
  try {
    const {id} = req.params;
    await Watchlist.findByIdAndUpdate(id, {isRemoved: true});
    res.redirect("/watchlist");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting movie from the watchlist.");
  }
};

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