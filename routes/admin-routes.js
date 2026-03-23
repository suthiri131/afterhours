const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin-controller");

const authMiddleware = require("../middleware/auth-middleware");
const upload = require("../middleware/upload-middleware");

router.get("/movies", authMiddleware.isAdmin, adminController.adminShowMovies);

router.get("/movies/create", authMiddleware.isAdmin, adminController.adminShowCreateForm);
router.post("/movies/create", authMiddleware.isAdmin, upload.single("movieImage"), adminController.adminCreateMovie);

router.get("/movies/:id/edit", authMiddleware.isAdmin, adminController.adminShowEditForm);
router.post("/movies/:id/edit", authMiddleware.isAdmin, upload.single("movieImage"), adminController.adminUpdateMovie);

router.post("/movies/:id/delete", authMiddleware.isAdmin, adminController.adminDeleteMovie);

module.exports = router;