const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movie-controller");
const authMiddleware = require("../middleware/auth-middleware");

router.get("/movies", authMiddleware.isAdmin, movieController.showAdminMovies);
router.get("/movies/create", authMiddleware.isAdmin, movieController.showCreateMovieForm);
router.post("/movies/create", authMiddleware.isAdmin, movieController.createMovie);
router.get("/movies/:id/edit", authMiddleware.isAdmin, movieController.showEditMovieForm);
router.post("/movies/:id/edit", authMiddleware.isAdmin, movieController.updateMovie);
router.post("/movies/:id/delete", authMiddleware.isAdmin, movieController.deleteMovie);

module.exports = router;