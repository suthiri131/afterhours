const express = require("express");
const userController = require("./../controllers/user-controller");
const router = express.Router();

router.get("/register", userController.showRegisterForm);
router.post("/register", userController.createUser);

module.exports = router;
