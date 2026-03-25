// thet
const Movie = require("../models/movie-model");
const Review = require("../models/review-model");
const Watchlist = require("../models/watchlist-model");

exports.showCreateReviewForm = async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const user = req.session.user;

    if (!user) {
      return res.redirect("/user/login");
    }

    const movie = await Movie.findMovieById(movieId);
    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    const watchlistItem = await Watchlist.findOne({
      user: user.id,
      movieId: movieId
    });

    if (!watchlistItem || watchlistItem.status !== "Watched") {
      return res.status(403).send("You can only review movies marked as Watched in your watchlist.");
    }

    const existingReview = await Review.findByMovieIdAndUserId(movieId, user.id);
    if (existingReview) {
      return res.redirect(`/reviews/${existingReview._id}/edit`);
    }

    res.render("create-review", {
      movie,
      user,
      error: null,
      formData: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading create review form");
  }
};

exports.createReview = async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const user = req.session.user;
    const {
      headline,
      storyRating,
      actingRating,
      musicRating,
      rewatchRating,
      reviewText
    } = req.body;

    if (!user) {
      return res.redirect("/user/login");
    }

    const movie = await Movie.findMovieById(movieId);
    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    const watchlistItem = await Watchlist.findOne({
      user: user.id,
      movieId: movieId
    });

    if (!watchlistItem || watchlistItem.status !== "Watched") {
      return res.status(403).send("You can only review movies marked as Watched in your watchlist.");
    }

    const existingReview = await Review.findByMovieIdAndUserId(movieId, user.id);
    if (existingReview) {
      return res.status(400).send("You have already reviewed this movie.");
    }

    const numericStoryRating = Number(storyRating);
    const numericActingRating = Number(actingRating);
    const numericMusicRating = Number(musicRating);
    const numericRewatchRating = Number(rewatchRating);

    const validRatings =
      numericStoryRating >= 1 && numericStoryRating <= 5 &&
      numericActingRating >= 1 && numericActingRating <= 5 &&
      numericMusicRating >= 1 && numericMusicRating <= 5 &&
      numericRewatchRating >= 1 && numericRewatchRating <= 5;

    if (!headline || !headline.trim() || !validRatings) {
      return res.render("create-review", {
        movie,
        user,
        error: "Please enter a headline and select all 4 category ratings from 1 to 5.",
        formData: {
          headline,
          storyRating,
          actingRating,
          musicRating,
          rewatchRating,
          reviewText
        }
      });
    }

    const overallRating =
      (
        numericStoryRating +
        numericActingRating +
        numericMusicRating +
        numericRewatchRating
      ) / 4;

    await Review.createReview({
      movieId,
      userId: user.id,
      headline: headline.trim(),
      storyRating: numericStoryRating,
      actingRating: numericActingRating,
      musicRating: numericMusicRating,
      rewatchRating: numericRewatchRating,
      rating: Number(overallRating.toFixed(1)),
      reviewText: reviewText ? reviewText.trim() : ""
    });

    res.redirect(`/movies/${movieId}`);
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(400).send("You have already reviewed this movie.");
    }

    res.status(500).send("Error creating review");
  }
};

exports.showEditReviewForm = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const user = req.session.user;

    if (!user) {
      return res.redirect("/user/login");
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).send("Review not found");
    }

    if (String(review.userId._id) !== String(user.id)) {
      return res.status(403).send("You can only edit your own review.");
    }

    res.render("edit-review", {
      review,
      movie: review.movieId,
      user,
      error: null,
      formData: {
        headline: review.headline || "",
        storyRating: review.storyRating,
        actingRating: review.actingRating,
        musicRating: review.musicRating,
        rewatchRating: review.rewatchRating,
        reviewText: review.reviewText || ""
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading edit review form");
  }
};

exports.updateReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const user = req.session.user;
    const {
      headline,
      storyRating,
      actingRating,
      musicRating,
      rewatchRating,
      reviewText
    } = req.body;

    if (!user) {
      return res.redirect("/user/login");
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).send("Review not found");
    }

    if (String(review.userId._id) !== String(user.id)) {
      return res.status(403).send("You can only edit your own review.");
    }

    const numericStoryRating = Number(storyRating);
    const numericActingRating = Number(actingRating);
    const numericMusicRating = Number(musicRating);
    const numericRewatchRating = Number(rewatchRating);

    const validRatings =
      numericStoryRating >= 1 && numericStoryRating <= 5 &&
      numericActingRating >= 1 && numericActingRating <= 5 &&
      numericMusicRating >= 1 && numericMusicRating <= 5 &&
      numericRewatchRating >= 1 && numericRewatchRating <= 5;

    if (!headline || !headline.trim() || !validRatings) {
      return res.render("edit-review", {
        review,
        movie: review.movieId,
        user,
        error: "Please enter a headline and select all 4 category ratings from 1 to 5.",
        formData: {
          headline,
          storyRating,
          actingRating,
          musicRating,
          rewatchRating,
          reviewText
        }
      });
    }

    const overallRating =
      (
        numericStoryRating +
        numericActingRating +
        numericMusicRating +
        numericRewatchRating
      ) / 4;

    const trimmedHeadline = headline.trim();
    const trimmedReviewText = reviewText ? reviewText.trim() : "";

    const headlineChanged = (review.headline || "") !== trimmedHeadline;
    const storyChanged = review.storyRating !== numericStoryRating;
    const actingChanged = review.actingRating !== numericActingRating;
    const musicChanged = review.musicRating !== numericMusicRating;
    const rewatchChanged = review.rewatchRating !== numericRewatchRating;
    const textChanged = (review.reviewText || "") !== trimmedReviewText;

    if (
      !headlineChanged &&
      !storyChanged &&
      !actingChanged &&
      !musicChanged &&
      !rewatchChanged &&
      !textChanged
    ) {
      return res.redirect(`/movies/${review.movieId._id}`);
    }

    await Review.updateReview(reviewId, {
      headline: trimmedHeadline,
      storyRating: numericStoryRating,
      actingRating: numericActingRating,
      musicRating: numericMusicRating,
      rewatchRating: numericRewatchRating,
      rating: Number(overallRating.toFixed(1)),
      reviewText: trimmedReviewText,
      isEdited: true
    });

    res.redirect(`/movies/${review.movieId._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating review");
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const user = req.session.user;

    if (!user) {
      return res.redirect("/user/login");
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).send("Review not found");
    }

    if (String(review.userId._id) !== String(user.id)) {
      return res.status(403).send("You can only delete your own review.");
    }

    const movieId = review.movieId._id;

    await Review.deleteReview(reviewId);

    res.redirect(`/movies/${movieId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting review");
  }
};