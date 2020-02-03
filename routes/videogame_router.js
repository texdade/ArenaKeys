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
            .then(gameDataPrice => res.status(200).json(gameDataPrice))
            .catch(err => res.status(404).json({}));

    else if(name && name.length > 1)
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

    else
        res.status(400).send("Bad request. One of the parameters: \"steamID\" or \"name\" is necessary!");

});

module.exports = router;