const express = require("express");
const userController = require("../controllers/user-controller");
const authMiddleware = require("../middleware/auth-middleware");
const router = express.Router();

router.get(
  "/register",
  authMiddleware.isNotLoggedIn,
  userController.showRegisterForm,
);
router.post(
  "/register",
  authMiddleware.isNotLoggedIn,
  userController.createUser,
);

router.get(
  "/login",
  authMiddleware.isNotLoggedIn,
  userController.showLoginForm,
);
router.post("/login", authMiddleware.isNotLoggedIn, userController.loginUser);

router.get(
  "/verify-otp",
  authMiddleware.isNotLoggedIn,
  userController.showVerifyOtpForm,
);

router.post(
  "/verify-otp",
  authMiddleware.isNotLoggedIn,
  userController.verifyOtp,
);

router.get(
  "/resend-otp",
  authMiddleware.isNotLoggedIn,
  userController.resendOtp,
);

// only for logged in users
router.get(
  "/profile",
  authMiddleware.isLoggedIn,
  userController.showProfilePage,
);
router.get(
  "/change-password",
  authMiddleware.isLoggedIn,
  userController.showChangePasswordPage,
);

router.post(
  "/change-password",
  authMiddleware.isLoggedIn,
  userController.changePassword,
);

router.get(
  "/delete",
  authMiddleware.isLoggedIn,
  userController.showDeleteUserPage,
);
router.post(
  "/delete",
  authMiddleware.isLoggedIn,
  userController.deleteUserAccount,
);

router.post("/logout", authMiddleware.isLoggedIn, userController.logoutUser);

module.exports = router;
