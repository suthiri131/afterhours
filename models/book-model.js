const mongoose = require("mongoose");

// Create a new ‘book' schema
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A book must have a title"],
  },
  isbn: {
    type: String,
    required: [true, "A book must have a isbn call number"],
    unique: true,
  },
  rating: {
    type: Number,
    default: 3.0,
  },
  price: {
    type: Number,
    required: [true, "A book must have a price"],
  },
});

const Book = mongoose.model("Book", bookSchema, "books");

//Methods here

exports.retrieveAll = function () {
  return Book.find();
};

exports.findByIsbn = function (isbn) {
  return Book.findOne({ isbn: isbn });
};

exports.addBook = function (newBook) {
  return Book.create(newBook);
};
