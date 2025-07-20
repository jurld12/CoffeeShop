// Check if user is logged in
router.get('/auth/check-login', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        // If no token, user is not logged in
        return res.json({ loggedIn: false });
    }

    // verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // Token may be invalid or expired
            return res.json({ loggedIn: false });
        }

        // User is logged in, send back the user's name
        return res.json({ loggedIn: true, userName: decoded.fname });
    });
});
