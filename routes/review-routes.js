// thet
const express = require("express");
const reviewController = require("../controllers/review-controller");
const authMiddleware = require("../middleware/auth-middleware");

const router = express.Router();

router.get("/movie/:movieId/new", authMiddleware.isLoggedIn, reviewController.showCreateReviewForm);
router.post("/movie/:movieId", authMiddleware.isLoggedIn, reviewController.createReview);

router.get("/:reviewId/edit", authMiddleware.isLoggedIn, reviewController.showEditReviewForm);
router.post("/:reviewId/edit", authMiddleware.isLoggedIn, reviewController.updateReview);

router.post("/:reviewId/delete", authMiddleware.isLoggedIn, reviewController.deleteReview);

module.exports = router;