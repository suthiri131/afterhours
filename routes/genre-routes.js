const express = require("express");
const genreController = require("../controllers/genre-controller");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");

// Show all genres
router.get("/", authMiddleware.isAdmin, genreController.showGenres);

// Create genre
router.get("/create", authMiddleware.isAdmin, genreController.adminShowCreateGenreForm);
router.post("/create", authMiddleware.isAdmin, genreController.createGenre);

// Edit genre
router.get("/:id/edit", authMiddleware.isAdmin, genreController.showEditGenreForm);
router.post("/:id/edit", authMiddleware.isAdmin, genreController.updateGenre);

// Delete genre
router.post("/:id/delete", authMiddleware.isAdmin, genreController.deleteGenre);



module.exports = router;