const fs = require("fs/promises");

// Get Service model
const Book = require("./../models/book-model");

// Controller function to get all the documents in the db and display it
exports.showBooks = async (req, res) => {
  try {
    let bookList = await Book.retrieveAll(); // fetch all the list
    console.log(bookList);
    res.render("display-book", { bookList }); // Render the EJS form view and pass the posts
  } catch (error) {
    console.error(error);
    res.send("Error reading database"); // Send error message if fetching fails
  }
};

exports.showForm = async (req, res) => {
  let result = "";
  res.render("search", { result });
};

exports.submitBook = async (req, res) => {
  const isbnNo = req.body.isbn;
  if (!isbnNo) {
    res.redirect("/search-book");
    return;
  }
  try {
    let result = await Book.findByIsbn(isbnNo);
    res.render("search", { result: result || null });
  } catch (error) {
    console.error(error);
    res.send("Error reading database");
  }
};

exports.showAddForm = async (req, res) => {
  let msg = "";
  let result = "";
  res.render("add-book", { result, msg });
};

exports.createBook = async (req, res) => {
  const title = req.body.title;
  const isbn = req.body.isbn;
  const rating = req.body.rating;
  const price = req.body.price;

  if (!title || !isbn || !rating) {
    return res.render("add-book", {
      result: null,
      msg: "Please fill in all required fields",
    });
  }

  let newBook = {
    title: title,
    isbn: isbn,
    rating: rating,
    price: price,
  };

  try {
    let msg = "Book has been added successfully.";
    let result = await Book.addBook(newBook);
    res.render("add-book", { result: result || null, msg });
  } catch (error) {
    console.error(error);
    let result = null;
    let msg = "Error adding book";
    res.render("add-book", { result, msg });
  }
};
