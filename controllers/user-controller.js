const User = require("./../models/user-model");
const bcrypt = require("bcrypt");

exports.showRegisterForm = (req, res) => {
  res.render("register-user", {
    msg: "",
    formData: {},
  });
};

exports.createUser = async (req, res) => {
  let { fullName, username, email, password, confirmPassword } = req.body;

  fullName = fullName?.trim();
  username = username?.trim();
  email = email?.trim().toLowerCase();

  const formData = {
    fullName,
    username,
    email,
  };

  if (!fullName || !username || !email || !password || !confirmPassword) {
    return res.render("register-user", {
      msg: "Please fill in all required fields",
      formData,
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render("register-user", {
      msg: "Please enter a valid email address",
      formData,
    });
  }

  if (email.endsWith("@gmal.com")) {
    return res.render("register-user", {
      msg: "Did you mean gmail.com?",
      formData,
    });
  }

  if (password.length < 6) {
    return res.render("register-user", {
      msg: "Password must be at least 6 characters",
      formData,
    });
  }

  if (password !== confirmPassword) {
    return res.render("register-user", {
      msg: "Passwords do not match",
      formData,
    });
  }

  try {
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.render("register-user", {
        msg: "Email already exists",
        formData,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.addUser({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    return res.redirect("/user/login");
  } catch (error) {
    console.error(error);

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.render("register-user", {
        msg: "Email already exists",
        formData,
      });
    }

    if (error.code === 11000 && error.keyPattern?.username) {
      return res.render("register-user", {
        msg: "Username already exists",
        formData,
      });
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      return res.render("register-user", {
        msg: firstError.message,
        formData,
      });
    }

    return res.render("register-user", {
      msg: "Error registering user",
      formData,
    });
  }
};

exports.showProfilePage = async (req, res) => {
  try {
    const user = await User.findOne();

    if (!user) {
      return res.render("profile", {
        user: null,
        msg: "No user found.",
      });
    }

    res.render("profile", {
      user,
      msg: "",
    });
  } catch (error) {
    console.error(error);
    res.render("profile", {
      user: null,
      msg: "Error loading profile.",
    });
  }
};

exports.showChangePasswordPage = async (req, res) => {
  try {
    res.render("update-password", {
      msg: "",
      type: "",
    });
  } catch (error) {
    console.error(error);
    res.render("update-password", {
      msg: "Error loading update password page.",
      type: "error",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.render("update-password", {
        msg: "Please fill in all fields.",
        type: "error",
      });
    }

    const user = await User.findOne();

    if (!user) {
      return res.render("update-password", {
        msg: "User not found.",
        type: "error",
      });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordCorrect) {
      return res.render("update-password", {
        msg: "Current password is incorrect.",
        type: "error",
      });
    }

    if (newPassword.length < 6) {
      return res.render("update-password", {
        msg: "New password must be at least 6 characters long.",
        type: "error",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render("update-password", {
        msg: "New password and confirm password do not match.",
        type: "error",
      });
    }

    const isSameAsOldPassword = await bcrypt.compare(
      newPassword,
      user.password,
    );

    if (isSameAsOldPassword) {
      return res.render("update-password", {
        msg: "New password must be different from current password.",
        type: "error",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updatePassword(user._id, hashedPassword);

    return res.render("update-password", {
      msg: "Password changed successfully.",
      type: "success",
    });
  } catch (error) {
    console.error(error);
    return res.render("update-password", {
      msg: "Error changing password.",
      type: "error",
    });
  }
};
