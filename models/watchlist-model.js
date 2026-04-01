const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  },
  status: { 
    type: String, 
    default: 'Plan to Watch' 
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  isRemoved: {
    type: Boolean,
    default: false
  }
});

watchlistSchema.index({ user: 1, movieId: 1 }, { unique: true });

const Watchlist = mongoose.model("Watchlist", watchlistSchema);

Watchlist.getUserWatchlist = function(userId) {
  return Watchlist.find({ user: userId, isRemoved: false }).populate("movieId");
};

Watchlist.softDelete = function(id) {
  return Watchlist.findByIdAndUpdate(id, { isRemoved: true });
};

Watchlist.upsertMovie = async function(userId, movieId) {
  const existing = await Watchlist.findOne({ user: userId, movieId });
  if (!existing) {
    return Watchlist.create({ user: userId, movieId });
  } else if (existing.isRemoved) {
    existing.isRemoved = false;
    return existing.save();
  }
  return "exists";
};

Watchlist.updateStatus = function(id, status) {
  return Watchlist.findByIdAndUpdate(id, { status: status });
};

module.exports = Watchlist;
