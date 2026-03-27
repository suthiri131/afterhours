const Genre = require("../models/genre-model");

// Show all available genres (for only admins page)
exports.showGenres = async (req, res) => {
  try {
    const genres = await Genre.findAll();
    res.render("admin/genre", { 
      genres, 
      user: req.session.user,
      errors: [],
      formData: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading genres");
  }
};

// Show create genre form
exports.adminShowCreateGenreForm = async (req, res) => {
  try {
    const genres = await Genre.findAll();

    res.render("admin/admin-create-movie", {
      user: req.session.user,
      errors: [],
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
  const genres = await Genre.findAll(); 
  const formData = { name };
  const errors = [];
  //check for empty & white space input
  if (!name) {
    errors.push("Genre name is required and cannot be blank.");
  }
  //second check for invalid charaters
  if (name && !/^[a-zA-Z0-9 ]+$/.test(name)) {
    errors.push("Genre name can only contain letters, numbers, and spaces.");
  }

  try {
    // third check for duplicates
    if (name) {
      const existing = await Genre.findByName(name);
      if (existing) {
        errors.push(`"${name}" has already been created! Please create a different genre.`);
      }
    }

    //render form with all errors if got error
    if (errors.length > 0) {
      return res.render("admin/genre", {
        user: req.session.user,
        errors, // array of errors
        formData,
        genres,
      });
    }

    //create genre if above validation is okay
    await Genre.createGenre({ name });
    res.redirect("/admin/genre");

  } catch (err) {
    console.error(err);
    const genres = await Genre.findAll();
    res.render("admin/genre", {
      user: req.session.user,
      errors: ["Error creating genre. Please try again."],
      formData,
      genres
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

    res.render("admin/edit-genre-form", {
      genre,
      user: req.session.user,
      errors: [],
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

  const errors = [];

  //check empty or whitespace-only input
  if (!name) {
    errors.push("Genre name is required and cannot be blank.");
  }

  // second check for invalid characters (only letters, numbers, spaces)
  if (name && !/^[a-zA-Z0-9 ]+$/.test(name)) {
    errors.push("Genre name can only contain letters, numbers, and spaces.");
  }

  try {
    // third check for duplicates
    if (name) {
      const existing = await Genre.findByName(name);
      if (existing && existing._id.toString() !== req.params.id) {
        errors.push(`"${name}" has already been created! Please choose a different name.`);
      }
    }

    // If errors exist, re-render the edit form with errors
    if (errors.length > 0) {
      const genre = await Genre.findById(req.params.id);
      return res.render("admin/edit-genre-form", {
        genre,
        user: req.session.user,
        errors,
      });
    }

    //update genre if above validation is ok
    await Genre.updateGenre(req.params.id, { name });
    res.redirect("/admin/genre");

  } catch (err) {
    console.error(err);
    const genre = await Genre.findById(req.params.id);
    res.render("admin/edit-genre-form", {
      genre,
      user: req.session.user,
      errors: ["Error updating genre. Please try again."],
    });
  }
};

// Delete genre
exports.deleteGenre = async (req, res) => {
  try {
    await Genre.deleteGenre(req.params.id);
    res.redirect("/admin/genre");

  } catch (err) {
    console.error(err);
    res.send("Error deleting genre");
  }
};