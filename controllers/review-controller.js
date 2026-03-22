// thet
const Movie = require("../models/movie-model");
const Review = require("../models/review-model");

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

    const existingReview = await Review.findByMovieIdAndUserId(movieId, user.id);
    if (existingReview) {
      return res.redirect(`/reviews/${existingReview._id}/edit`);
    }

    res.render("create-review", {
      movie,
      user,
      error: null,
      formData: {},
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
    const { rating, reviewText } = req.body;

    if (!user) {
      return res.redirect("/user/login");
    }

    const movie = await Movie.findMovieById(movieId);
    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    const existingReview = await Review.findByMovieIdAndUserId(movieId, user.id);
    if (existingReview) {
      return res.status(400).send("You have already reviewed this movie.");
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.render("create-review", {
        movie,
        user,
        error: "Please select a rating from 1 to 5.",
        formData: { rating, reviewText },
      });
    }

    await Review.createReview({
      movieId,
      userId: user.id,
      rating: numericRating,
      reviewText: reviewText ? reviewText.trim() : "",
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
        rating: review.rating,
        reviewText: review.reviewText || "",
      },
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
    const { rating, reviewText } = req.body;

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

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.render("edit-review", {
        review,
        movie: review.movieId,
        user,
        error: "Please select a rating from 1 to 5.",
        formData: {
          rating,
          reviewText,
        },
      });
    }

    await Review.updateReview(reviewId, {
      rating: numericRating,
      reviewText: reviewText ? reviewText.trim() : "",
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