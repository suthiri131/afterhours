const express = require("express");
const movieController = require("./../controllers/movie-controller");
const router = express.Router();
const authMiddleware = require("./../middleware/auth-middleware");

router.get("/", authMiddleware.isLoggedIn, movieController.showAllMovies);

// thet
router.get("/:id", movieController.showMovieDetails);

module.exports = router;