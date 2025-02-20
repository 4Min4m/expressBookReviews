const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = {}; // Initialize users as an empty object

const isValid = (username) => {
    return !!users[username]; // Check if username exists
}

const authenticatedUser = (username, password) => {
    return users[username] && users[username].password === password;
}

module.exports = {
    isValid: isValid,
    authenticatedUser: authenticatedUser,
    users: users // Export the users object
};

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username) || !authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ username: username }, 'access', { expiresIn: '1h' }); // Create JWT
    return res.status(200).json({ message: "User logged in successfully", token: token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; // Get review from query parameter
    const token = req.headers.authorization.split(' ')[1]; // Extract token
    let decoded;

    try {
        decoded = jwt.verify(token, 'access');
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }

    const username = decoded.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review; // Add or update the review
    return res.status(200).json({ message: "Review added/updated successfully" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const token = req.headers.authorization.split(' ')[1];
    let decoded;

    try {
        decoded = jwt.verify(token, 'access');
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }

    const username = decoded.username;

    if (books[isbn] && books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "Review not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
