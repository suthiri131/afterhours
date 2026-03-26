const User = require("../models/user-model");

exports.showManageUsers = async (req, res) => {
  try {
    const users = await User.findAllUsers();
    res.render("superAdmin/manage-users", { users });
  } catch (error) {
    console.error("Error loading users:", error);
    res.status(500).send("Server error");
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!["user", "admin", "superAdmin"].includes(role)) {
      return res.status(400).send("Invalid role");
    }

    await User.updateUserRole(userId, role);
    res.redirect("/superAdmin/users");
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).send("Server error");
  }
};
