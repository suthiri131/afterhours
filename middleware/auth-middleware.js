exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    console.log("User not logged in");
    req.session.returnTo = req.originalUrl;
    return res.redirect("/user/login");
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.session.user) {
    console.log("User not logged in");
    return res.redirect("/user/login");
  }
  if (req.session.user.role !== "admin") {
    console.log("Access denied: not admin");
    return res.status(403).send("Access denied. Admins only.");
  }

  next();
};

exports.attachUser = (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
};

exports.isNotLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/movies");
  }
  next();
};
