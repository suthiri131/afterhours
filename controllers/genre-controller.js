const Genre = require("../models/genre-model");

// Show all available genres (for only admins page)
exports.showGenres = async (req, res) => {
  try {
    const genres = await Genre.findAll();
    res.render("genre", { genres });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading genres");
  }
};

// Show create genre form
exports.adminShowCreateGenreForm = async (req, res) => {
  try {
    const genres = await Genre.findAll();

    res.render("admin-create-movie", {
      user: req.session.user,
      msg: "",
      formData: {},
      genres,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading create form");
  }
};

// Create genre
exports.createGenre = async (req, res) => {
  let { name } = req.body;
  name = name?.trim();

  const formData = { name };

  if (!name) {
    return res.render("admin-create-genre", {
      user: req.session.user,
      msg: "Genre name is required",
      formData,
    });
  }

  try {
    const existing = await Genre.findByName(name);

    if (existing) {
      return res.render("admin-create-genre", {
        user: req.session.user,
        msg: "Genre already exists",
        formData,
      });
    }

    await Genre.createGenre({ name });

    res.redirect("/admin/genres");

  } catch (err) {
    console.error(err);
    res.render("admin-create-genre", {
      user: req.session.user,
      msg: "Error creating genre",
      formData,
    });
  }
};

// Show edit genre form
exports.showEditGenreForm = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      return res.status(404).send("Genre not found");
    }

    res.render("edit-genre-form", {
      genre,
      user: req.session.user,
      msg: "",
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading edit form");
  }
};

// Update genre name
exports.updateGenre = async (req, res) => {
  let { name } = req.body;
  name = name?.trim();

  if (!name) {
    return res.send("Genre name is required");
  }

  try {
    await Genre.updateGenre(req.params.id, { name });
    res.redirect("/admin/genres");

  } catch (err) {
    console.error(err);
    res.send("Error updating genre");
  }
};

// Delete genre
exports.deleteGenre = async (req, res) => {
  try {
    await Genre.deleteGenre(req.params.id);
    res.redirect("/admin/genres");

  } catch (err) {
    console.error(err);
    res.send("Error deleting genre");
  }
};