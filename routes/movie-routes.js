const express = require("express");
const movieController = require("./../controllers/movie-controller");
const router = express.Router();
const authMiddleware = require("./../middleware/auth-middleware");

router.get("/", authMiddleware.isLoggedIn, movieController.showAllMovies);

router.get("/add-movies", movieController.showAddMovieForm);
router.post("/add-movies", movieController.addMovieToWatch);
router.post("/delete-movies/:id", movieController.deleteMovie);

// thet
router.get("/:id", movieController.showMovieDetails);

module.exports = router;
