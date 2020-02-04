/*
*   Router in order to get videogames' offers data
*
*/
const express = require('express');
const router = express.Router();

const fetchGamesData = require('../logic/videogame_logic');

router.get('/videogame', (req, res) => {
    let steamID = req.query.steamID;
    let name = req.query.name;

    if(steamID)
        fetchGamesData.getGamePrices(steamID)
            .then(gameDataPrice => res.status(200).json([gameDataPrice]))//return an array of a single element to be consistent wrt type of response
            .catch(err => res.status(404).json({}));

    else if(name && typeof(name)==='string' && name.length > 1)
        fetchGamesData.getMatchingGamesPrices(name)
            .then(gamesDataPrice => {
                console.log("FINISHED matching prices");
                res.status(200).json(gamesDataPrice)
            })
            .catch(err => {
                console.log(err);
                console.log("FINISHED with errors matching prices");
                res.status(404).json({})
            });

    else if(name)
        res.status(400).send("Bad request. \"name\" has to be a string of at least 2 characters!");

    else
        res.status(400).send("Bad request. One of the parameters: \"steamID\" or \"name\" is necessary!");

});

module.exports = router;