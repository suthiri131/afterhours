// thet
const express = require("express");
const reviewController = require("../controllers/review-controller");

const router = express.Router();

router.get("/movie/:movieId/new", reviewController.showCreateReviewForm);
router.post("/movie/:movieId", reviewController.createReview);

router.get("/:reviewId/edit", reviewController.showEditReviewForm);
router.post("/:reviewId/edit", reviewController.updateReview);

router.post("/:reviewId/delete", reviewController.deleteReview);

module.exports = router;