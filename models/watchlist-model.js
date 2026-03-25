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

module.exports = mongoose.model("Watchlist", watchlistSchema);