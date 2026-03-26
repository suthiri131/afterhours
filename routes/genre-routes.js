const express = require("express");
const genreController = require("../controllers/genre-controller");
const router = express.Router();

router.get("/", genreController.showGenres);
router.get("/create", genreController.adminShowCreateGenreForm);
router.get("/edit/:id", genreController.showEditGenreForm);
router.get("/delete/:id", genreController.deleteGenre);
router.post("/edit/:id", genreController.updateGenre);
router.post("/create", genreController.createGenre);


module.exports = router;