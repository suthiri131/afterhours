const express = require("express");
const userController = require("./../controllers/user-controller");
const router = express.Router();

router.get("/register", userController.showRegisterForm);
router.post("/register", userController.createUser);

router.get("/profile", userController.showProfilePage);
router.get("/change-password", userController.showChangePasswordPage);
router.post("/change-password", userController.changePassword);

module.exports = router;
