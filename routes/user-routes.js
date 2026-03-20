const express = require("express");
const userController = require("./../controllers/user-controller");
const router = express.Router();

router.get("/register", userController.showRegisterForm);
router.post("/register", userController.createUser);

router.get("/profile", userController.showProfilePage);
router.get("/change-password", userController.showChangePasswordPage);
router.post("/change-password", userController.changePassword);

router.get("/login", userController.showLoginForm);
router.post("/login", userController.loginUser);
router.post("/logout", userController.logoutUser);

router.get("/forgot-password", userController.showForgotPasswordForm);
router.post("/forgot-password", userController.verifyForgotPassword);
router.get("/reset-password/:id", userController.showResetPasswordForm);
router.post("/reset-password/:id", userController.resetPassword);

module.exports = router;
