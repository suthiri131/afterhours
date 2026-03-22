const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");
const session = require("express-session");


dotenv.config({ path: "./config.env" });
const authMiddleware = require("./middleware/auth-middleware");

const userRoutes = require("./routes/user-routes");
const movieRoutes = require("./routes/movie-routes");
const reviewRoutes = require("./routes/review-routes");

const server = express();

server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.set("view engine", "ejs");

server.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //   httpOnly: true,
    // },
  }),
);
server.use(authMiddleware.attachUser);

server.use("/user", userRoutes);
server.use("/movies", movieRoutes);
server.use("/reviews", reviewRoutes);

server.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/movies");
  } else {
    return res.redirect("/user/login");
  }
});

async function connectDB() {
  try {
    await mongoose.connect(process.env.DB);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

function startServer() {
  const hostname = "localhost";
  const port = 8000;
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

connectDB().then(startServer);
