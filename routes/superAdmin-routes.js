const express = require("express");
const superAdminController = require("../controllers/superAdmin-controller");
const authMiddleware = require("../middleware/auth-middleware");
const router = express.Router();

router.get(
  "/users",
  authMiddleware.isSuperAdmin,
  superAdminController.showManageUsers,
);

router.post(
  "/users/:id/role",
  authMiddleware.isSuperAdmin,
  superAdminController.updateUserRole,
);

module.exports = router;
