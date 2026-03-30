// thet
const Movie = require("../models/movie-model");
const Review = require("../models/review-model");
const Watchlist = require("../models/watchlist-model");

// helper: get logged-in user from session
function getSessionUser(req) {
  return req.session && req.session.user ? req.session.user : null;
}

// helper: parse all 4 ratings
function parseRatings(body) {
  const storyRating = Number(body.storyRating);
  const actingRating = Number(body.actingRating);
  const musicRating = Number(body.musicRating);
  const rewatchRating = Number(body.rewatchRating);

  return {
    storyRating,
    actingRating,
    musicRating,
    rewatchRating,
  };
}

// helper: validate all 4 ratings are between 1 and 5
function areRatingsValid({
  storyRating,
  actingRating,
  musicRating,
  rewatchRating,
}) {
  const ratings = [storyRating, actingRating, musicRating, rewatchRating];

  return ratings.every(
    (rating) => !Number.isNaN(rating) && rating >= 1 && rating <= 5,
  );
}

// helper: calculate overall average rating
function calculateOverallRating({
  storyRating,
  actingRating,
  musicRating,
  rewatchRating,
}) {
  const overall =
    (storyRating + actingRating + musicRating + rewatchRating) / 4;

  return Number(overall.toFixed(1));
}

// helper: load movie with genre
async function getMovie(movieId) {
  return await Movie.findMovieById(movieId).populate("genre");
}

// helper: check watched history
async function getWatchedRecord(userId, movieId) {
  return await Watchlist.findOne({
    user: userId,
    movieId: movieId,
    status: "Watched",
  });
}

// helper: keep old form values when validation fails
function buildFormData(body) {
  return {
    headline: body.headline ? body.headline.trim().replace(/\s+/g, " ") : "",
    storyRating: body.storyRating || "",
    actingRating: body.actingRating || "",
    musicRating: body.musicRating || "",
    rewatchRating: body.rewatchRating || "",
    reviewText: body.reviewText ? body.reviewText.trim() : "",
  };
}

exports.showCreateReviewForm = async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const user = getSessionUser(req);

    if (!user) {
      return res.redirect("/user/login");
    }

    const movie = await getMovie(movieId);
    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    const watchedRecord = await getWatchedRecord(user.id, movieId);
    if (!watchedRecord) {
      return res
        .status(403)
        .send("You can only review movies you have marked as Watched.");
    }

    const existingReview = await Review.findByMovieIdAndUserId(
      movieId,
      user.id,
    );
    if (existingReview) {
      return res.redirect(`/reviews/${existingReview._id}/edit`);
    }

    return res.render("user/create-review", {
      movie,
      user,
      error: null,
      formData: {},
    });
  } catch (err) {
    console.error(err);

    if (err.name === "CastError") {
      return res.status(404).send("Movie not found");
    }

    return res.status(500).send("Error loading create review form");
  }
};

exports.createReview = async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const user = getSessionUser(req);

    if (!user) {
      return res.redirect("/user/login");
    }

    const movie = await getMovie(movieId);
    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    const watchedRecord = await getWatchedRecord(user.id, movieId);
    if (!watchedRecord) {
      return res
        .status(403)
        .send("You can only review movies you have marked as Watched.");
    }

    const existingReview = await Review.findByMovieIdAndUserId(
      movieId,
      user.id,
    );
    if (existingReview) {
      return res.redirect(`/reviews/${existingReview._id}/edit`);
    }

    const headline = req.body.headline
      ? req.body.headline.trim().replace(/\s+/g, " ")
      : "";
    const ratings = parseRatings(req.body);
    const validRatings = areRatingsValid(ratings);

    if (!headline || !validRatings) {
      return res.render("user/create-review", {
        movie,
        user,
        error:
          "Please enter a headline and select all 4 category ratings from 1 to 5.",
        formData: buildFormData(req.body),
      });
    }

    const overallRating = calculateOverallRating(ratings);

    await Review.createReview({
      movieId,
      userId: user.id,
      headline,
      storyRating: ratings.storyRating,
      actingRating: ratings.actingRating,
      musicRating: ratings.musicRating,
      rewatchRating: ratings.rewatchRating,
      rating: overallRating,
      reviewText: req.body.reviewText ? req.body.reviewText.trim() : "",
    });

    return res.redirect(`/movies/${movieId}`);
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      const movieId = req.params.movieId;
      const user = getSessionUser(req);

      if (user) {
        const existingReview = await Review.findByMovieIdAndUserId(
          movieId,
          user.id,
        );
        if (existingReview) {
          return res.redirect(`/reviews/${existingReview._id}/edit`);
        }
      }

      return res.status(400).send("You have already reviewed this movie.");
    }

    if (err.name === "CastError") {
      return res.status(404).send("Movie not found");
    }

    return res.status(500).send("Error creating review");
  }
};

exports.showEditReviewForm = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const user = getSessionUser(req);

    if (!user) {
      return res.redirect("/user/login");
    }

    const review = await Review.findById(reviewId).populate({
      path: "movieId",
      populate: { path: "genre" },
    });

    if (!review) {
      return res.status(404).send("Review not found");
    }

    if (String(review.userId._id) !== String(user.id)) {
      return res.status(403).send("You can only edit your own review.");
    }

    return res.render("user/edit-review", {
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
        reviewText: review.reviewText || "",
      },
    });
  } catch (err) {
    console.error(err);

    if (err.name === "CastError") {
      return res.status(404).send("Review not found");
    }

    return res.status(500).send("Error loading edit review form");
  }
};

exports.updateReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const user = getSessionUser(req);

    if (!user) {
      return res.redirect("/user/login");
    }

    const review = await Review.findById(reviewId).populate({
      path: "movieId",
      populate: { path: "genre" },
    });

    if (!review) {
      return res.status(404).send("Review not found");
    }

    if (String(review.userId._id) !== String(user.id)) {
      return res.status(403).send("You can only edit your own review.");
    }

    const headline = req.body.headline
      ? req.body.headline.trim().replace(/\s+/g, " ")
      : "";
    const ratings = parseRatings(req.body);
    const validRatings = areRatingsValid(ratings);

    if (!headline || !validRatings) {
      return res.render("user/edit-review", {
        review,
        movie: review.movieId,
        user,
        error:
          "Please enter a headline and select all 4 category ratings from 1 to 5.",
        formData: buildFormData(req.body),
      });
    }

    const trimmedReviewText = req.body.reviewText
      ? req.body.reviewText.trim()
      : "";
    const overallRating = calculateOverallRating(ratings);

    const headlineChanged = (review.headline || "") !== headline;
    const storyChanged = review.storyRating !== ratings.storyRating;
    const actingChanged = review.actingRating !== ratings.actingRating;
    const musicChanged = review.musicRating !== ratings.musicRating;
    const rewatchChanged = review.rewatchRating !== ratings.rewatchRating;
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
      headline,
      storyRating: ratings.storyRating,
      actingRating: ratings.actingRating,
      musicRating: ratings.musicRating,
      rewatchRating: ratings.rewatchRating,
      rating: overallRating,
      reviewText: trimmedReviewText,
      isEdited: true,
    });

    return res.redirect(`/movies/${review.movieId._id}`);
  } catch (err) {
    console.error(err);

    if (err.name === "CastError") {
      return res.status(404).send("Review not found");
    }

    return res.status(500).send("Error updating review");
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const user = getSessionUser(req);

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

    return res.redirect(`/movies/${movieId}`);
  } catch (err) {
    console.error(err);

    if (err.name === "CastError") {
      return res.status(404).send("Review not found");
    }

    return res.status(500).send("Error deleting review");
  }
};
