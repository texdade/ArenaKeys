/*
*   Router in order to get videogames' offers data
*
*/
const express = require('express');
const router = express.Router();

const videogameLogic = require('../logic/videogame_logic');

router.get('/videogame', (req, res) => {
    let name = req.query.name;

    let offers = true; //default value is true
    let details = true; //default value is true

    if(req.query.offers && ( (req.query.offers === "false") || (parseInt(req.query.offers) === 0) ) )
        offers = false;

    if(req.query.details && ( (req.query.details === "false") || (parseInt(req.query.details) === 0) ) )
        details = false;

    if(name && typeof(name)==='string' && name.length > 1)
        videogameLogic.getMatchingGames(name, details, offers)
            .then(gamesDataPrice => {
                res.status(200).json(gamesDataPrice)
            })
            .catch(err => {
                console.log(err);
                res.status(404).json({})
            });

    else if(name)
        res.status(400).send("Bad request. \"name\" has to be a string of at least 2 characters!");

    else
        res.status(400).send("Bad request. The query parameter \"name\" is necessary!");

});

router.get('/videogame/:id', (req, res) => {
    let steamID = req.params.id;

    let offers = true; //default value is true
    let details = true; //default value is true

    if(req.query.offers && ( (req.query.offers === "false") || (parseInt(req.query.offers) === 0) ) )
        offers = false;

    if(req.query.details && ( (req.query.details === "false") || (parseInt(req.query.details) === 0) ) )
        details = false;

    if(steamID)
        videogameLogic.getGame(steamID, details, offers)
            .then(gameDataPrice => res.status(200).json([gameDataPrice]))//return an array of a single element to be consistent wrt type of response
            .catch(err => res.status(404).json({}));
    else
        res.status(400).send("Bad request. steamID is necessary!");

});

module.exports = router;