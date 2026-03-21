const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");
const session = require("express-session");

const booksRoutes = require("./routes/books-routes");
const userRoutes = require("./routes/user-routes");
const movieRoutes = require("./routes/movie-routes");

const server = express();

// make sure u add this line when you are using Express to do form (POST)
server.use(express.urlencoded({ extended: true }));

// express.json() is a middleware
server.use(express.json());

server.use(
  session({
    secret: process.env.SESSION_SECRET || "afterhours_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
  })
);

// Set EJS as the view engine for rendering dynamic HTML pages
server.set("view engine", "ejs");

// root routes
server.use("/", booksRoutes);
server.use("/user", userRoutes);
server.use("/movies", movieRoutes);

// Specify the path to the environment variablef file 'config.env'
dotenv.config({ path: "./config.env" });

// async function to connect to DB
async function connectDB() {
  try {
    // connecting to Database with our config.env file and DB is constant in config.env
    await mongoose.connect(process.env.DB);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

function startServer() {
  const hostname = "localhost"; // Define server hostname
  const port = 8000; // Define port number

  // Start the server and listen on the specified hostname and port
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

// call connectDB first and when connection is ready we start the web server
connectDB().then(startServer);
