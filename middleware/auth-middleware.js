exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    console.log("User not logged in");
    return res.redirect("/");
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.session.user) {
    console.log("User not logged in");
    return res.redirect("/user/login");
  }

  if (
    req.session.user.role !== "admin" &&
    req.session.user.role !== "superAdmin"
  ) {
    console.log("Access denied: not admin");
    return res.status(403).send("Access denied. Admins only.");
  }

  next();
};

exports.isSuperAdmin = (req, res, next) => {
  if (!req.session.user) {
    console.log("User not logged in");
    return res.redirect("/user/login");
  }

  if (req.session.user.role !== "superAdmin") {
    console.log("Access denied: not superAdmin");
    return res.status(403).send("Access denied. Super admins only.");
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
