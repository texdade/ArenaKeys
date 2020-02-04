/*
*
*
*/
const videoGameLogic = require('../website_processes/price_checker');
const express = require('express');
const router = express.Router();

//extracting info of user, passing access_token as a string query parameter "localhost:3000/secret?access_token = <token>"
router.get('/', (req, res) => {
    let vgObj = videoGameLogic.getGameOffer('');
    res.render('index_test', vgObj);
});

module.exports = router;