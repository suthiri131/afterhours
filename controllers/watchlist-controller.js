const Watchlist = require("../models/watchlist-model");

exports.showWatchList = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const items = await Watchlist.find({ user: userId }).populate("movieId");

    const cleanMovies = items.filter(item => item.movieId !== null);
    res.render("watchlist", {
      movies: cleanMovies,
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

    const existing = await Watchlist.findOne({ user: userId, movieId: movieId }); 
    if (!existing) {
      await Watchlist.create({ user: userId, movieId: movieId });
      return res.redirect("/movies?msg=added");
    } else {
      return res.redirect("/movies?msg=exists");
    }
    res.redirect("/movies");
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

exports.markAsWatched = async (req, res) => {
  try {
    const { id } = req.params;

    await Watchlist.findByIdAndUpdate(req.params.id, { status: "Watched" });
    console.log("status updated to Watched!");
    res.redirect("/watchlist"); 
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating status.");
  }
};