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
exports.Watchlist = Watchlist;

exports.getUserWatchlist = function(userId) {
  return Watchlist.find({ user: userId, isRemoved: false }).populate("movieId");
};

exports.softDelete = function(id) {
  return this.findByIdAndUpdate(id, { isRemoved: true });
};

exports.upsertMovie = async function(userId, movieId) {
  const existing = await this.findOne({ user: userId, movieId });
  
  if (!existing) {
    return this.create({ user: userId, movieId });
  } else if (existing.isRemoved) {
    existing.isRemoved = false;
    return existing.save();
  }
  return "exists"; 
};

exports.updateStatus = function(id, status) {
  return this.findByIdAndUpdate(id, { status: status });
};

