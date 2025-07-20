require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db'); //  separate DB config file

// Register function
exports.register = async (req, res) => {
    const { fname, lname, email, password, passwordConfirm } = req.body;

    //Password validation

    if (password !== passwordConfirm) {
        return res.render('register', { message: 'Passwords do not match' });
    }

    //error handling for database
    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => {
        if (error) return res.status(500).send("Database error");
        //logiv for if email is already in database
        if (result.length > 0) {
            return res.render('register', { message: 'This email is already in use...' });
        }
        //hashing sensitive passwords in database
        let hashedPassword = await bcrypt.hash(password, 8);
        //Successful error handling or if user has logged in
        db.query('INSERT INTO users SET ?', { fname, lname, email, password: hashedPassword }, (error, results) => {
            if (error) return res.status(500).send("Error inserting user");

            console.log("User logged in success");
            //cookie for user
            const token = jwt.sign({ userId: results.insertId, fname }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                maxAge: 24 * 60 * 60 * 1000, // Cookie expiration (1 day)
            });
            res.redirect('/login');
            // Redirect to login so they can go log in to account and access info
        });
    });
};

// Login function
exports.login = (req, res) => {
    const { email, password } = req.body;

    // Check if the email exists
    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, result) => {
        if (error) {
            console.log(error);
            return res.status(500).send("Database error");
        }

        if (result.length === 0) {
            return res.render('login', { message: 'No user found with that email' });
        }

        const user = result[0];

        // Compare the entered password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Generate a JWT token with user's first name
            const token = jwt.sign({ userId: user.id, fname: user.fname }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // store the token in a cookie
            console.log("Passwords match, user logged in");
            res.cookie('token', token, { httpOnly: true });
            return res.redirect('/');
        } else {
            return res.render('login', { message: 'Invalid password' });
        }
    });
};


 // Render home page with user's name and login status
exports.renderHomePage = (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        // user is not logged in
        
        console.log("renderHomePage function isue: userLoggedIn: false ");
        
        return res.render('index', { message: 'Hello, Guest!', userLoggedIn: false });
        
    }

    // Verify the JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // If the token is invalid, clear the cookie and render home with "Hello, Guest!"
            console.log("Issue with JWT Token: userLoggedIn: false");
            res.clearCookie('token');
            return res.render('index', { message: 'Hello, Guest!', userLoggedIn: false });
        }

        // if logged in, personalize the greeting
        console.log(`Works fine, can greet with  ${decoded.fname},userLoggedIn: true   `);
        const message = `Hello, ${decoded.fname}!`;
        return res.render('index', { message, userLoggedIn: true });
    });
    
};

// render Checkout Page
exports.renderCheckoutPage = (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        // User is not logged in, redirect to login
        console.log("User not logged in, redirecting to login...");
        return res.redirect('/login');
    }

    // Verify the JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("Issue with JWT Token, redirecting to login...");
            res.clearCookie('token');
            return res.redirect('/login');
        }

        // Token is valid; render the checkout page
        console.log(`Rendering checkout page for ${decoded.fname}`);
        return res.render('checkout', { fname: decoded.fname });
    });
};



//Logout function
exports.logout = (req, res) => {
    console.log('Before clearing cookies:', req.cookies);
    res.clearCookie('token', { path: '/' });
    console.log('After clearing cookies:', req.cookies); // Should be empty
    res.redirect('/');
};


