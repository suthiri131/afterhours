const Watchlist = require("../models/watchlist-model");

exports.showWatchList = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const items = await Watchlist.find({ user: userId }).populate("movieId");

    res.render("watchlist", {
      movies: items,
      user: req.session.user,
      msg: ""
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading watchlist.");
  }
};

exports.addToWatchList = async (req, res) => {
  try {
    console.log("--- DEBUG START ---");
    console.log("Params:", req.params);
    console.log("Session User:", req.session.user);
    console.log("--- DEBUG END ---");
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
    await Watchlist.findByIdAndDelete(req.params.id);
    res.redirect("/watchlist");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting movie from the watchlist.");
  }
};