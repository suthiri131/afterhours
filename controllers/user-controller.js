const User = require("./../models/user-model");
const bcrypt = require("bcrypt");

exports.showRegisterForm = (req, res) => {
  res.render("registerUser", { msg: "" });
};

exports.createUser = async (req, res) => {
  let { fullName, username, email, password, confirmPassword } = req.body;

  fullName = fullName?.trim();
  username = username?.trim();
  email = email?.trim().toLowerCase();

  if (!fullName || !username || !email || !password || !confirmPassword) {
    return res.render("registerUser", {
      msg: "Please fill in all required fields",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render("registerUser", {
      msg: "Please enter a valid email address",
    });
  }

  if (email.endsWith("@gmal.com")) {
    return res.render("registerUser", {
      msg: "Did you mean gmail.com?",
    });
  }
  if (password.length < 6) {
    return res.render("registerUser", {
      msg: "Password must be at least 6 characters",
    });
  }

  if (password !== confirmPassword) {
    return res.render("registerUser", {
      msg: "Passwords do not match",
    });
  }

  try {
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.render("registerUser", {
        msg: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.addUser({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    return res.redirect("/login");
  } catch (error) {
    console.error(error);

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.render("registerUser", {
        msg: "Email already exists",
      });
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      return res.render("registerUser", {
        msg: firstError.message,
      });
    }

    return res.render("registerUser", {
      msg: "Error registering user",
    });
  }
};
