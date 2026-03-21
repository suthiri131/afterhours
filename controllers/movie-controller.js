const Movie = require("./../models/movie-model");

exports.showAddMovieForm = (req, res) => {
  res.render("addMovie", { msg: "" });
};

exports.addMovieToWatch = async (req, res) => {
  let { title, genre } = req.body;

  title = title?.trim();
  genre = genre?.trim();

  try {
    await Movie.addMovie({
      title,
      genre,
      watchStatus: false,
      rating: null,
      review: null,
      userId: req.session.userId,
    });

    res.redirect("/movies/add-movies");
  } catch (error) {
    return res.render("addMovie", { msg: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    await Movie.deleteMovie(req.params.id);
    res.redirect("/movies/add-movies");
  } catch (error) {
    console.error(error);
    res.redirect("/movies/add-movies");
  }
};

exports.showAllMovies = async (req, res) => {
  res.render("movies", {
    user: req.session.user,
  });
};
