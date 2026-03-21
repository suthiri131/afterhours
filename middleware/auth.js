exports.isLoggedIn = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/user/login");
  }
  next();
};

exports.isLoggedOut = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect("/movies");
  }
  next();
};