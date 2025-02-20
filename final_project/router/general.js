const express = require('express');
const axios = require('axios'); // Import Axios
let books = require("./booksdb.js"); // Assuming booksdb is used for registration
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users[username]) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users[username] = { "password": password };
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop (using async-await with Axios)
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/');
        res.send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ message: "Error fetching books" });
    }
});

// Get book details based on ISBN (using async-await with Axios)
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        res.send(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).json({ message: "Book not found" });
        } else {
            console.error("Error fetching book by ISBN:", error);
            res.status(500).json({ message: "Error fetching book" });
        }
    }
});

// Get book details based on author (using async-await with Axios)
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        res.send(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).json({ message: "Books by author not found" });
        } else {
            console.error("Error fetching books by author:", error);
            res.status(500).json({ message: "Error fetching books" });
        }
    }
});

// Get all books based on title (using async-await with Axios)
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        res.send(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).json({ message: "Books with title not found" });
        } else {
            console.error("Error fetching books by title:", error);
            res.status(500).json({ message: "Error fetching books" });
        }
    }
});

// Get book review (using original implementation, as it directly accesses booksdb)
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn] && books[isbn].reviews) {
        return res.send(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book or reviews not found" });
    }
});

module.exports.general = public_users;
