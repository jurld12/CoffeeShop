const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// importing the routers to be used from the routes folder
const authRoutes = require('./routes/auth');
const pageRoutes = require('./routes/pages');

// setting up view engine to be able to see handlebar files
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// middleware for cookie
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// using the routers 
app.use('/', pageRoutes);
app.use('/auth', authRoutes);

// using join to access static files under the folder public
app.use(express.static(path.join(__dirname, 'public')));

// starting the server at port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
