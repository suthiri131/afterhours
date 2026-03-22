const express = require("express");
const movieController = require("./../controllers/movie-controller");
const router = express.Router();
const authMiddleware = require("./../middleware/auth-middleware");

// For testing without logging in (HS)
// router.get("/movies", movieController.showAdminMovies);
// router.get("/movies/create", movieController.showCreateMovieForm);
// router.post("/movies/create", movieController.createMovie);
// router.get("/movies/:id/edit", movieController.showEditMovieForm);
// router.post("/movies/:id/edit", movieController.updateMovie);
// router.post("/movies/:id/delete", movieController.deleteMovie);

// START of admin routes
router.get("/admin/movies", authMiddleware.isAdmin, movieController.showAdminMovies);
router.get("/admin/movies/create", authMiddleware.isAdmin, movieController.showCreateMovieForm);
router.post("/admin/movies/create", authMiddleware.isAdmin, movieController.createMovie);
router.get("/admin/movies/:id/edit", authMiddleware.isAdmin, movieController.showEditMovieForm);
router.post("/admin/movies/:id/edit", authMiddleware.isAdmin, movieController.updateMovie);
router.post("/admin/movies/:id/delete", authMiddleware.isAdmin, movieController.deleteMovie);
// END of admin routes

router.get("/", authMiddleware.isLoggedIn, movieController.showAllMovies);

// thet
router.get("/:id", movieController.showMovieDetails);

module.exports = router;