/*
*
*
*/
const express = require('express');
const router = express.Router();

//extracting info of user, passing access_token as a string query parameter "localhost:3000/secret?access_token = <token>"
router.get('/secret', (req, res) => {
    res.status(200).json({
        status: "Up",
        secret: "Working",
        googleId: req.user.googleId,
        email: req.user.email,
        steamId: req.user.steamId
    });
});

//extracting info of user, passing Authorization as a header parameter "Authorization: Bearer <token>"
router.post('/secret', (req, res) => {
    res.status(200).json({
        status: "Up",
        secret: "Working",
        googleId: req.user.googleId,
        email: req.user.email,
        steamId: req.user.steamId
    });
});

module.exports = router;