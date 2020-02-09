/*
*   Router in order to get lists'  data
*/
const express = require('express');
const router = express.Router();

const listLogic = require('../logic/list_logic');

//given a userID return its wishlist formatted following the standard of gamekeys arena
router.get('/steamwishlist/:steamUserID', (req, res) => {
    let steamUserId = req.params.steamUserID;

    if(!steamUserId){
        res.status(400).json({}); //bad request!
    }

    let offers = true; //default value is true
    let details = true; //default value is true

    if(req.query.offers && ( (req.query.offers === "false") || (parseInt(req.query.offers) === 0) ) )
        offers = false;

    if(req.query.details && ( (req.query.details === "false") || (parseInt(req.query.details) === 0) ) )
        details = false;

    let promiseWishListData = listLogic.getSteamWishList(steamUserId, details, offers);

    promiseWishListData
        .then(list => res.status(200).json(list))
        .catch(err => {
            if(err && !isNaN(parseInt(err)) && parseInt(err)>=400)
                res.status(err).json({});
            else
                res.status(500).send(err);
        });

});

module.exports = router;