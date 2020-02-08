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

    let promiseWishListData = listLogic.getSteamWishList(steamUserId);

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