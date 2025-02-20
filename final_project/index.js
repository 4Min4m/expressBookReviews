const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer/auth/*", function auth(req, res, next) {
    // Write the authentication mechanism here
    if (req.session && req.session.user) {
        // User is authenticated
        next();
    } else {
        // User is not authenticated
        const token = req.headers.authorization; // Assuming token is in Authorization header

        if (!token) {
            return res.status(401).json({ message: "Authentication failed. No token provided." });
        }

        try {
            const decoded = jwt.verify(token.split(' ')[1], 'access'); // Verify token, 'access' is your secret key.
            req.session.user = decoded; // Store decoded user info in session
            next(); // Proceed to the next middleware/route
        } catch (error) {
            return res.status(403).json({ message: "Authentication failed. Invalid token." });
        }
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
