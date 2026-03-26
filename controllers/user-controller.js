const User = require("./../models/user-model");
const bcrypt = require("bcrypt");
const sendOtpEmail = require("../utils/sendOtpEmail");

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.showRegisterForm = (req, res) => {
  res.render("auth/register", {
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
    return res.render("auth/register", {
      msg: "Please fill in all required fields",
      formData,
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render("auth/register", {
      msg: "Please enter a valid email address",
      formData,
    });
  }

  if (password.length < 6) {
    return res.render("auth/register", {
      msg: "Password must be at least 6 characters",
      formData,
    });
  }

  if (password !== confirmPassword) {
    return res.render("auth/register", {
      msg: "Passwords do not match",
      formData,
    });
  }

  try {
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.render("auth/register", {
          msg: "Email already exists",
          formData,
        });
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
      return res.render("auth/register", {
        msg: "Email already exists",
        formData,
      });
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      return res.render("auth/register", {
        msg: firstError.message,
        formData,
      });
    }

    return res.render("auth/register", {
      msg: "Error registering user",
      formData,
    });
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

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.render("auth/update-password", {
        msg: "Please fill in all fields.",
        type: "error",
      });
    }

    const userId = req.session.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.render("auth/update-password", {
        msg: "User not found.",
        type: "error",
      });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordCorrect) {
      return res.render("auth/update-password", {
        msg: "Current password is incorrect.",
        type: "error",
      });
    }

    if (newPassword.length < 6) {
      return res.render("auth/update-password", {
        msg: "New password must be at least 6 characters long.",
        type: "error",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render("auth/update-password", {
        msg: "New password and confirm password do not match.",
        type: "error",
      });
    }

    const isSameAsOldPassword = await bcrypt.compare(
      newPassword,
      user.password,
    );

    if (isSameAsOldPassword) {
      return res.render("auth/update-password", {
        msg: "New password must be different from current password.",
        type: "error",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updatePassword(user._id, hashedPassword);

    // ✅ store message in session
    req.session.msg = "Password changed successfully.";
    req.session.type = "success";

    // ✅ redirect back to same page
    return res.redirect("/user/change-password");
  } catch (error) {
    console.error(error);

    return res.render("auth/update-password", {
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
  password = password?.trim();

  if (!email) {
    return res.render("auth/login", {
      msg: "Please enter your email",
      type: "error",
      email: "",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.render("auth/login", {
      msg: "Please enter a valid email address",
      type: "error",
      email: "",
    });
  }

  if (!password) {
    return res.render("auth/login", {
      msg: "Please enter your password",
      type: "error",
      email,
    });
  }

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      return res.render("auth/login", {
        msg: "Invalid email or password",
        type: "error",
        email: "",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("auth/login", {
        msg: "Invalid email or password",
        type: "error",
        email: "",
      });
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

    return res.render("auth/login", {
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
