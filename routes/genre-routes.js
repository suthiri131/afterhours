const express = require("express");
const genreController = require("../controllers/genre-controller");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");

router.get("/", authMiddleware.isAdmin, genreController.showGenres);

router.get("/create", authMiddleware.isAdmin, genreController.adminShowCreateGenreForm);
router.post("/create", authMiddleware.isAdmin, genreController.createGenre);

router.get("/:id/edit", authMiddleware.isAdmin, genreController.showEditGenreForm);
router.post("/:id/edit", authMiddleware.isAdmin, genreController.updateGenre);

router.post("/:id/delete", authMiddleware.isAdmin, genreController.deleteGenre);

module.exports = router;