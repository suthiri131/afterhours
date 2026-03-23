const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin-controller");
const authMiddleware = require("../middleware/auth-middleware");

router.get("/movies", authMiddleware.isAdmin, adminController.showAdminMovies);
router.get("/movies/create", authMiddleware.isAdmin, adminController.showCreateMovieForm);
router.post("/movies/create", authMiddleware.isAdmin, adminController.createMovie);
router.get("/movies/:id/edit", authMiddleware.isAdmin, adminController.showEditMovieForm);
router.post("/movies/:id/edit", authMiddleware.isAdmin, adminController.updateMovie);
router.post("/movies/:id/delete", authMiddleware.isAdmin, adminController.deleteMovie);

module.exports = router;