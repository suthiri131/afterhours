const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie does not exist"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User does not exist"],
    },

    headline: {
      type: String,
      required: [true, "Headline is required"],
      trim: true,
      maxLength: [150, "Headline cannot exceed 150 characters"],
    },

    storyRating: {
      type: Number,
      required: [true, "Story rating is required"],
      min: [1, "Story rating must be at least 1"],
      max: [5, "Story rating must be at most 5"],
    },

    actingRating: {
      type: Number,
      required: [true, "Acting/Cast rating is required"],
      min: [1, "Acting/Cast rating must be at least 1"],
      max: [5, "Acting/Cast rating must be at most 5"],
    },

    musicRating: {
      type: Number,
      required: [true, "Music rating is required"],
      min: [1, "Music rating must be at least 1"],
      max: [5, "Music rating must be at most 5"],
    },

    rewatchRating: {
      type: Number,
      required: [true, "Rewatch value rating is required"],
      min: [1, "Rewatch value rating must be at least 1"],
      max: [5, "Rewatch value rating must be at most 5"],
    },

    rating: {
      type: Number,
      required: [true, "Overall rating is required"],
      min: [1, "Overall rating must be at least 1"],
      max: [5, "Overall rating must be at most 5"],
    },

    reviewText: {
      type: String,
      trim: true,
      default: "",
      maxLength: [1000, "Review text cannot exceed 1000 characters"],
    },

    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

reviewSchema.index({ movieId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema, "reviews");

exports.createReview = function (newReview) {
  return Review.create(newReview);
};

exports.findByMovieId = function (movieId) {
  return Review.find({ movieId })
    .populate("userId", "username fullName")
    .sort({ createdAt: -1 });
};

exports.findByMovieIdAndUserId = function (movieId, userId) {
  return Review.findOne({ movieId, userId });
};

exports.findById = function (id) {
  return Review.findById(id)
    .populate("userId", "username fullName")
    .populate("movieId", "title genre");
};

exports.updateReview = function (id, updatedData) {
  return Review.findByIdAndUpdate(id, updatedData, {
    returnDocument: "after",
    runValidators: true,
  });
};

exports.deleteReview = function (id) {
  return Review.findByIdAndDelete(id);
};

exports.getMovieReviewStats = async function (movieId) {
  const result = await Review.aggregate([
    {
      $match: {
        movieId: new mongoose.Types.ObjectId(movieId),
      },
    },
    {
      $group: {
        _id: "$movieId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      reviewCount: 0,
    };
  }

  return {
    averageRating: Number(result[0].averageRating.toFixed(1)),
    reviewCount: result[0].reviewCount,
  };
};

exports.deleteReviewsByMovieId = function (movieId) {
  return Review.deleteMany({ movieId });
};

exports.deleteReviewsByUserId = function (userId) {
  return Review.deleteMany({ userId });
};
