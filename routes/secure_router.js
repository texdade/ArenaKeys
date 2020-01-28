/*
*
*
*/
const express = require('express');
const router = express.Router();

router.get('/secret', (req, res) => {
    res.status(200).json({
        status: "Up",
        secret: "Working"
    });
});

module.exports = router;