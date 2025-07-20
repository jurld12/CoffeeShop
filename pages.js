const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Home route (checks login status and shows the home page with user info)
router.get('/', authController.renderHomePage);


// router.get('/',(req, res) => {
//     res.render('login');
// });

// Login route (renders login page)
router.get('/login', (req, res) => {
    res.render('login'); // Serve the login page
});

// Register route (renders register page)
router.get('/register', (req, res) => {
    res.render('register'); 
});

// Register book (renders booking page)
router.get('/book', (req, res) => {
    res.render('book'); // Serve the book page
});
// Register checkout (renders checkout page)
router.get('/checkout', (req, res) => {
    res.render('checkout'); 
});





module.exports = router;
