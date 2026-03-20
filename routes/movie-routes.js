const express = require("express");
const movieController = require("./../controllers/movie-controller");
const router = express.Router();

router.get("/add-movies", movieController.showAddMovieForm);
router.post("/add-movies", movieController.addMovieToWatch);
router.post("/delete-movies/:id", movieController.deleteMovie);

module.exports = router;