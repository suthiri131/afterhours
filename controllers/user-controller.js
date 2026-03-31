const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const sendOtpEmail = require("../utils/sendOtpEmail");
const Review = require("../models/review-model");
const Watchlist = require("../models/watchlist-model");

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.showRegisterForm = (req, res) => {
  const msg = req.session.registerMsg || "";
  const formData = req.session.registerFormData || {};

  req.session.registerMsg = null;
  req.session.registerFormData = null;

  res.render("auth/register", {
    msg,
    formData,
  });
};

exports.createUser = async (req, res) => {
  let { fullName, username, email, password, confirmPassword } = req.body;

  fullName = fullName?.trim().replace(/\s+/g, " ");
  username = username?.trim().toLowerCase();
  email = email?.trim().toLowerCase();

  const formData = {
    fullName,
    username,
    email,
  };

  if (!fullName) {
    req.session.registerMsg = "Full name is required";
    req.session.registerFormData = formData;
    return res.redirect("/user/register");
  }

  if (!username) {
    req.session.registerMsg = "Username is required";
    req.session.registerFormData = formData;
    return res.redirect("/user/register");
  }

  if (!email) {
    req.session.registerMsg = "Email is required";
    req.session.registerFormData = formData;
    return res.redirect("/user/register");
  }

  if (fullName.length > 100) {
    req.session.registerMsg = "Full name cannot exceed 100 characters";
    req.session.registerFormData = formData;
    return res.redirect("/user/register");
  }

  if (username.length > 30) {
    req.session.registerMsg = "Username cannot exceed 30 characters";
    req.session.registerFormData = formData;
    return res.redirect("/user/register");
  }

  if (!password || !password.trim()) {
    req.session.registerMsg = "Password is required";
    req.session.registerFormData = formData;
    return res.redirect("/user/register");
  }

  if (!confirmPassword || !confirmPassword.trim()) {
    req.session.registerMsg = "Please confirm your password";
    req.session.registerFormData = formData;
    return res.redirect("/user/register");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.session.registerMsg = "Please enter a valid email address";
    req.session.registerFormData = formData;
    return res.redirect("/user/register");
  }

  if (
    password !== password.trim() ||
    confirmPassword !== confirmPassword.trim()
  ) {
    req.session.registerMsg = "Password cannot start or end with spaces";
    req.session.registerFormData = formData;
    return res.redirect("/user/register");
  }

  if (password.length < 6) {
    req.session.registerMsg = "Password must be at least 6 characters";
    req.session.registerFormData = formData;
    return res.redirect("/user/register");
  }

  if (password.length > 100) {
    req.session.registerMsg = "Password cannot exceed 100 characters";
    req.session.registerFormData = formData;
    return res.redirect("/user/register");
  }

  if (password !== confirmPassword) {
    req.session.registerMsg = "Passwords do not match";
    req.session.registerFormData = formData;
    return res.redirect("/user/register");
  }

  try {
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      if (existingUser.isVerified) {
        req.session.registerMsg = "Email is already registered";
        req.session.registerFormData = formData;
        return res.redirect("/user/register");
      }

      const hasValidOtp =
        existingUser.otp &&
        existingUser.otp.code &&
        existingUser.otp.expiresAt &&
        new Date(existingUser.otp.expiresAt) > new Date();

      if (hasValidOtp) {
        return res.redirect(
          `/user/verify-otp?email=${encodeURIComponent(email)}&msg=${encodeURIComponent(
            "You already registered but have not verified your email. Please check your email for the OTP.",
          )}`,
        );
      }

      const otp = generateOtp();
      const hashedOtp = await bcrypt.hash(otp, 10);
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await User.updateByEmail(email, {
        otp: {
          code: hashedOtp,
          expiresAt: otpExpiresAt,
        },
      });

      try {
        await sendOtpEmail(email, otp);
      } catch (emailError) {
        console.error("Email sending error:", emailError);

        return res.redirect(
          `/user/verify-otp?email=${encodeURIComponent(email)}&msg=${encodeURIComponent(
            "You already registered but have not verified your email. Failed to send a new OTP. Please use resend OTP.",
          )}`,
        );
      }

      return res.redirect(
        `/user/verify-otp?email=${encodeURIComponent(email)}&msg=${encodeURIComponent(
          "You already registered but have not verified your email. A new OTP has been sent.",
        )}`,
      );
    }

    const existingUsername = await User.findByUsername(username);

    if (existingUsername) {
      req.session.registerMsg = "Username is already taken";
      req.session.registerFormData = formData;
      return res.redirect("/user/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await User.addUser({
      fullName,
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      otp: {
        code: hashedOtp,
        expiresAt: otpExpiresAt,
      },
    });

    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error("Email sending error:", emailError);

      return res.redirect(
        `/user/verify-otp?email=${encodeURIComponent(email)}&msg=${encodeURIComponent(
          "Account created, but failed to send OTP email. Please resend OTP.",
        )}`,
      );
    }

    return res.redirect(`/user/verify-otp?email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error(error);

    if (error.code === 11000 && error.keyPattern?.email) {
      req.session.registerMsg = "Email is already registered";
      req.session.registerFormData = formData;
      return res.redirect("/user/register");
    }

    if (error.code === 11000 && error.keyPattern?.username) {
      req.session.registerMsg = "Username is already taken";
      req.session.registerFormData = formData;
      return res.redirect("/user/register");
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      req.session.registerMsg = firstError.message;
      req.session.registerFormData = formData;
      return res.redirect("/user/register");
    }

    req.session.registerMsg = "Error registering user";
    req.session.registerFormData = formData;
    return res.redirect("/user/register");
  }
};

exports.showVerifyOtpForm = (req, res) => {
  const { email, msg = "" } = req.query;

  return res.render("auth/verify-otp", {
    email: email || "",
    msg,
  });
};

exports.verifyOtp = async (req, res) => {
  let { email, otp } = req.body;

  email = email?.trim().toLowerCase();
  otp = otp?.trim();

  if (!email || !otp) {
    return res.render("auth/verify-otp", {
      email,
      msg: "Please enter the OTP",
    });
  }

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      return res.render("auth/verify-otp", {
        email,
        msg: "User not found",
      });
    }

    if (user.isVerified) {
      req.session.loginMsg = "Your email is already verified. Please log in.";
      req.session.loginMsgType = "success";

      return res.redirect("/user/login");
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return res.render("auth/verify-otp", {
        email,
        msg: "No OTP found. Please resend OTP.",
      });
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      return res.render("auth/verify-otp", {
        email,
        msg: "OTP has expired. Please resend OTP.",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp.code);

    if (!isOtpValid) {
      return res.render("auth/verify-otp", {
        email,
        msg: "Invalid OTP",
      });
    }

    await User.updateByEmail(email, {
      isVerified: true,
      otp: {
        code: null,
        expiresAt: null,
      },
    });

    req.session.loginMsg = "Email verified successfully. You can now log in.";
    req.session.loginMsgType = "success";

    return res.redirect("/user/login");
  } catch (error) {
    console.error(error);

    return res.render("auth/verify-otp", {
      email,
      msg: "Error verifying OTP",
    });
  }
};

exports.resendOtp = async (req, res) => {
  let email = req.query.email || req.body.email;

  email = email?.trim().toLowerCase();

  if (!email) {
    return res.redirect("/user/register");
  }

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      return res.redirect("/user/register");
    }

    if (user.isVerified) {
      req.session.loginMsg = "Your email is already verified. Please log in.";
      req.session.loginMsgType = "success";
      return res.redirect("/user/login");
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await User.updateByEmail(email, {
      otp: {
        code: hashedOtp,
        expiresAt: otpExpiresAt,
      },
    });

    await sendOtpEmail(email, otp);

    return res.redirect(
      `/user/verify-otp?email=${encodeURIComponent(email)}&msg=${encodeURIComponent(
        "A new OTP has been sent to your email.",
      )}`,
    );
  } catch (error) {
    console.error(error);

    return res.redirect(
      `/user/verify-otp?email=${encodeURIComponent(email)}&msg=${encodeURIComponent(
        "Failed to resend OTP. Please try again.",
      )}`,
    );
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
    email = req.session.loginEmail || "";

    delete req.session.loginMsg;
    delete req.session.loginMsgType;
    delete req.session.loginEmail;
  }

  res.render("auth/login", {
    msg,
    type,
    email,
  });
};

exports.loginUser = async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  email = email?.trim().toLowerCase();
  password = password ?? "";

  if (!email) {
    req.session.loginMsg = "Please enter your email";
    req.session.loginMsgType = "error";
    req.session.loginEmail = "";
    return res.redirect("/user/login");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    req.session.loginMsg = "Please enter a valid email address";
    req.session.loginMsgType = "error";
    req.session.loginEmail = email;
    return res.redirect("/user/login");
  }

  if (!password.trim()) {
    req.session.loginMsg = "Please enter your password";
    req.session.loginMsgType = "error";
    req.session.loginEmail = email;
    return res.redirect("/user/login");
  }

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      req.session.loginMsg = "Invalid email or password";
      req.session.loginMsgType = "error";
      req.session.loginEmail = email;
      return res.redirect("/user/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      req.session.loginMsg = "Invalid email or password";
      req.session.loginMsgType = "error";
      req.session.loginEmail = email;
      return res.redirect("/user/login");
    }

    if (!user.isVerified) {
      const hasValidOtp =
        user.otp &&
        user.otp.code &&
        user.otp.expiresAt &&
        new Date(user.otp.expiresAt) > new Date();

      if (hasValidOtp) {
        return res.redirect(
          `/user/verify-otp?email=${encodeURIComponent(email)}&msg=${encodeURIComponent(
            "Please verify your email first. Enter the OTP sent to your email.",
          )}`,
        );
      }

      return res.redirect(
        `/user/verify-otp?email=${encodeURIComponent(email)}&msg=${encodeURIComponent(
          "Please verify your email first. Your OTP has expired or is missing. Please resend OTP.",
        )}`,
      );
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

    req.session.loginMsg = "Error logging in";
    req.session.loginMsgType = "error";
    req.session.loginEmail = email;
    return res.redirect("/user/login");
  }
};

exports.showProfilePage = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.render("user/profile", {
        user: null,
        msg: "No user found.",
        type: "error",
      });
    }

    return res.render("user/profile", {
      user,
      msg: "",
      type: "",
    });
  } catch (error) {
    console.error(error);
    return res.render("user/profile", {
      user: null,
      msg: "Error loading profile.",
      type: "error",
    });
  }
};

exports.showChangePasswordPage = async (req, res) => {
  try {
    const msg = req.session.msg || "";
    const type = req.session.type || "";

    req.session.msg = null;
    req.session.type = null;

    return res.render("auth/update-password", {
      msg,
      type,
    });
  } catch (error) {
    console.error(error);
    return res.render("auth/update-password", {
      msg: "Error loading update password page.",
      type: "error",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !currentPassword.trim()) {
      req.session.msg = "Current password is required.";
      req.session.type = "error";
      return res.redirect("/user/change-password");
    }

    if (!newPassword || !newPassword.trim()) {
      req.session.msg = "New password is required.";
      req.session.type = "error";
      return res.redirect("/user/change-password");
    }

    if (!confirmPassword || !confirmPassword.trim()) {
      req.session.msg = "Please confirm your new password.";
      req.session.type = "error";
      return res.redirect("/user/change-password");
    }

    if (
      newPassword !== newPassword.trim() ||
      confirmPassword !== confirmPassword.trim()
    ) {
      req.session.msg = "New password cannot start or end with spaces.";
      req.session.type = "error";
      return res.redirect("/user/change-password");
    }

    if (newPassword.length < 6) {
      req.session.msg = "New password must be at least 6 characters long.";
      req.session.type = "error";
      return res.redirect("/user/change-password");
    }

    if (newPassword.length > 100) {
      req.session.msg = "Password cannot exceed 100 characters.";
      req.session.type = "error";
      return res.redirect("/user/change-password");
    }

    if (newPassword !== confirmPassword) {
      req.session.msg = "New password and confirm password do not match.";
      req.session.type = "error";
      return res.redirect("/user/change-password");
    }

    const userId = req.session.user?.id;

    if (!userId) {
      req.session.msg = "Please log in again.";
      req.session.type = "error";
      return res.redirect("/user/login");
    }

    const user = await User.findById(userId);

    if (!user) {
      req.session.msg = "User not found.";
      req.session.type = "error";
      return res.redirect("/user/change-password");
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordCorrect) {
      req.session.msg = "Current password is incorrect.";
      req.session.type = "error";
      return res.redirect("/user/change-password");
    }

    const isSameAsOldPassword = await bcrypt.compare(
      newPassword,
      user.password,
    );

    if (isSameAsOldPassword) {
      req.session.msg = "New password must be different from current password.";
      req.session.type = "error";
      return res.redirect("/user/change-password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updatePassword(user._id, hashedPassword);

    req.session.msg = "Password changed successfully.";
    req.session.type = "success";

    return res.redirect("/user/change-password");
  } catch (error) {
    console.error(error);

    req.session.msg = "Error changing password.";
    req.session.type = "error";
    return res.redirect("/user/change-password");
  }
};

exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect("/movies");
    }

    res.clearCookie("connect.sid");
    return res.redirect("/user/login");
  });
};

exports.showDeleteUserPage = (req, res) => {
  const msg = req.session.deleteMsg || "";
  req.session.deleteMsg = null;
  return res.render("user/delete-user", {
    msg,
  });
};

exports.deleteUserAccount = async (req, res) => {
  const userId = req.session.user?.id;
  let password = req.body.password ?? "";

  if (!userId) {
    return res.redirect("/user/login");
  }

  if (!password.trim()) {
    req.session.deleteMsg = "Please enter your password";
    return res.redirect("/user/delete");
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.redirect("/user/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      req.session.deleteMsg = "Incorrect password";
      return res.redirect("/user/delete");
    }

    await Review.deleteReviewsByUserId(userId);
    //uncomment this after watchlist model is completed.
    //     exports.deleteWatchlistByUserId = function (userId) {
    //   return Watchlist.deleteMany({ user: userId });
    // };
    //await Watchlist.deleteWatchlistByUserId(userId);
    await User.deleteUser(userId);

    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.redirect("/user/profile");
      }

      res.clearCookie("connect.sid");
      return res.redirect("/user/login?deleted=1");
    });
  } catch (error) {
    console.error(error);
    req.session.deleteMsg = "Error deleting account";
    return res.redirect("/user/delete");
  }
};
