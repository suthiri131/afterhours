const express = require("express");

const booksController = require("./../controllers/books-controller");

const router = express.Router(); // sub application

// Define a GET route to display the list of books
router.get("/book-list", booksController.showBooks);
router.get("/search-book", booksController.showForm);
router.post("/search-book", booksController.submitBook);
router.get("/add-book", booksController.showAddForm);
router.post("/add-book", booksController.createBook);

// EXPORT
module.exports = router;
