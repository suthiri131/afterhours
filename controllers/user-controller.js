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
    const userId = req.session.user.id;
    const user = await User.findById(userId);

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
    const userId = req.session.user.id;
    const user = await User.findById(userId);
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

exports.showLoginForm = (req, res) => {
  let msg = "";
  let type = "";
  let email = "";

  if (req.query.deleted === "1") {
    msg = "Account deleted successfully.";
    type = "success";
  }

  if (req.session.loginMsg) {
    msg = req.session.loginMsg;
    type = req.session.loginMsgType || "success";
    delete req.session.loginMsg;
    delete req.session.loginMsgType;
  }

  res.render("loginUser", {
    msg,
    type,
    email,
  });
};

exports.loginUser = async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  email = email?.trim().toLowerCase();
  password = password?.trim();

  if (!email) {
    return res.render("loginUser", {
      msg: "Please enter your email",
      type: "error",
      email: "",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.render("loginUser", {
      msg: "Please enter a valid email address",
      type: "error",
      email: "",
    });
  }

  if (!password) {
    return res.render("loginUser", {
      msg: "Please enter your password",
      type: "error",
      email: email,
    });
  }

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      return res.render("loginUser", {
        msg: "Invalid email or password",
        type: "error",
        email: "",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("loginUser", {
        msg: "Invalid email or password",
        type: "error",
        email: "",
      });
    }
    req.session.user = {
      id: user._id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };

    return res.redirect("/movies");
  } catch (error) {
    console.error(error);
    return res.render("loginUser", {
      msg: "Error logging in",
      type: "error",
      email: "",
    });
  }
};

exports.logoutUser = (req, res) => {
  console.log("logout clicked");
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect("/movies");
    }

    res.clearCookie("connect.sid");
    return res.redirect("/user/login");
  });
};

exports.showForgotPasswordForm = (req, res) => {
  res.render("forgotPassword", {
    msg: "",
    email: "",
    username: "",
  });
};

exports.verifyForgotPassword = async (req, res) => {
  let { email, username } = req.body;

  email = email?.trim().toLowerCase();
  username = username?.trim();

  if (!email || !username) {
    return res.render("forgotPassword", {
      msg: "Please enter both email and username",
      email: email || "",
      username: username || "",
    });
  }

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      return res.render("forgotPassword", {
        msg: "Account not found",
        email,
        username,
      });
    }

    if (user.username !== username) {
      return res.render("forgotPassword", {
        msg: "Email and username do not match",
        email,
        username,
      });
    }

    return res.render("resetPassword", {
      msg: "",
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    return res.render("forgotPassword", {
      msg: "Error verifying account",
      email,
      username,
    });
  }
};

exports.showResetPasswordForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.render("forgotPassword", {
        msg: "Invalid reset request",
        email: "",
        username: "",
      });
    }

    return res.render("resetPassword", {
      msg: "",
      type: "",
      userId: req.params.id,
    });
  } catch (error) {
    console.error(error);
    return res.render("forgotPassword", {
      msg: "Invalid reset request",
      email: "",
      username: "",
    });
  }
};

exports.resetPassword = async (req, res) => {
  const userId = req.params.id;
  let newPassword = req.body.newPassword;
  let confirmPassword = req.body.confirmPassword;

  newPassword = newPassword?.trim();
  confirmPassword = confirmPassword?.trim();

  if (!newPassword || !confirmPassword) {
    return res.render("resetPassword", {
      msg: "Please fill in both password fields",
      type: "error",
      userId,
    });
  }

  if (newPassword.length < 6) {
    return res.render("resetPassword", {
      msg: "New password must be at least 6 characters long",
      type: "error",
      userId,
    });
  }

  if (confirmPassword.length < 6) {
    return res.render("resetPassword", {
      msg: "Confirm password must be at least 6 characters long",
      type: "error",
      userId,
    });
  }

  if (newPassword !== confirmPassword) {
    return res.render("resetPassword", {
      msg: "New password and confirm password do not match",
      type: "error",
      userId,
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.render("resetPassword", {
        msg: "User not found",
        type: "error",
        userId,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, hashedPassword);

    req.session.loginMsg =
      "Password reset successful. Please log in with your new password.";
    req.session.loginMsgType = "success";

    return res.redirect("/user/login");
  } catch (error) {
    console.error(error);
    return res.render("resetPassword", {
      msg: "Error resetting password",
      type: "error",
      userId,
    });
  }
};

exports.showDeleteUserPage = (req, res) => {
  return res.render("deleteUser", {
    msg: "",
    email: "",
    username: "",
  });
};

exports.deleteUserAccount = async (req, res) => {
  const userId = req.session.user.id;
  let password = req.body.password;

  password = password?.trim();

  if (!password) {
    return res.render("deleteUser", {
      msg: "Please enter your password",
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.redirect("/user/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("deleteUser", {
        msg: "Incorrect password",
      });
    }

    await User.deleteUser(userId);

    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.redirect("/user/profile");
      }

      res.clearCookie("connect.sid");
      return res.redirect("/user/login");
    });
  } catch (error) {
    console.error(error);
    return res.render("deleteUser", {
      msg: "Error deleting account",
    });
  }
};
