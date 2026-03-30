const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin-controller");
const authMiddleware = require("../middleware/auth-middleware");
const { handleUpload } = require("../middleware/upload-middleware");

router.get("/movies", authMiddleware.isAdmin, adminController.adminShowMovies);

router.get(
  "/movies/create",
  authMiddleware.isAdmin,
  adminController.adminShowCreateForm,
);
router.post(
  "/movies/create",
  authMiddleware.isAdmin,
  handleUpload,
  adminController.adminCreateMovie,
);

router.get(
  "/movies/:id/edit",
  authMiddleware.isAdmin,
  adminController.adminShowEditForm,
);
router.post(
  "/movies/:id/edit",
  authMiddleware.isAdmin,
  handleUpload,
  adminController.adminUpdateMovie,
);

router.post(
  "/movies/:id/delete",
  authMiddleware.isAdmin,
  adminController.adminDeleteMovie,
);



module.exports = router;
