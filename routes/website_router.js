/*
*
*
*/
const userProcess = require('../process_centric_services/user_process');
const gameProcess = require('../process_centric_services/price_checker');
const listProcess = require('../process_centric_services/userlist_process');
const express = require('express');
const router = express.Router();

const utilities = require('../db/utilities');

function loggedUser(gToken, sToken, userBaseInfo, res, createNew){
    return new Promise((resolve, reject) => {
        userProcess.tryGetUserInfo(gToken, sToken)
            .then( userInfo => resolve(userInfo))
            .catch(err => {
                if(createNew && parseInt(err) === 404 && userBaseInfo && utilities.isUserNoId(userBaseInfo)){
                    userProcess.createNewUser(userBaseInfo, gToken || sToken).then(user => {
                        res.render('index', {user: user, err: null});
                    }).catch(err => reject(err));
                }else{
                    res.clearCookie('gToken');
                    res.clearCookie('sToken');
                    reject(err);
                }
            });
    });

}

//Render for the index page, which changes on the fact that the user is logged in or not
router.get(['/', '/index'], (req, res) => {
    let gToken = req.cookies['gToken'];
    let sToken = req.cookies['sToken'];
    let userBaseInfo = req.cookies['userInfo'];

    let customErr = {};
    if(req.query.session_expired)
        customErr['session_expired'] = (req.query.session_expired);

    loggedUser(gToken, sToken, userBaseInfo, res, true)
        .then(userInfo => res.render('index', {user: userInfo, err: customErr}))
        .catch(err => res.render('index', {user: null, err: err}));
    
});


router.get('/gameSearch', (req, res) => {
    let gToken = req.cookies['gToken'];
    let sToken = req.cookies['sToken'];
    let userBaseInfo = req.cookies['userInfo'];

    let steamID = req.query.steamID;
    let gameName = req.query.name;

    let getUser = userProcess.tryGetUserInfo(gToken, sToken);

    let priceChecker;
    if(steamID)
        priceChecker = gameProcess.getGameOffer(steamID);
    else
        priceChecker = gameProcess.getGameOffers(gameName);

    Promise.all([getUser, priceChecker])
        .then( results => {
            listProcess.tryGetUserList(gToken, sToken, false, false)
                .then(lists => res.render('gameListResult', {user: results[0], err: null, searchResults: results[1], userLists: lists }))
                .catch(lists => res.render('gameListResult', {user: results[0], err: null, searchResults: results[1], userLists: [] }))
        })
        .catch(err => {
            res.clearCookie('gToken');
            res.clearCookie('sToken');
            res.redirect('/index?session_expired=true');
        });
});
    

router.get('/lists', (req, res) => {

    let gToken = req.cookies['gToken'];
    let sToken = req.cookies['sToken'];
    let userBaseInfo = req.cookies['userInfo'];

    loggedUser(gToken, sToken, userBaseInfo, res, true)
        .then(userInfo => {
            listProcess.tryGetUserList(gToken, sToken, true, true)
                .then( lists => {
                    res.render('myLists', {listsResult : lists, user: userInfo, err: null});
                })
                .catch(err => {
                    res.redirect('/index?session_expired=true');
                });
        })
        .catch(err =>  res.redirect('/index?session_expired=true'));


});

router.get('/lists/:id/delete', (req, res) => {
    let input = {
        //id della lista da eliminare
    }

    let output = {
        //boolean che indica l'eliminazione con successo o meno
    }
    res.render('index', vgObj);
});

router.get('/editList', (req, res) => {
    let input = {
        //id della lista da modificare
    }
    
    //la pagina viene caricata con lista con i dati vecchi che ora saranno modificati
    let output =
        [
            {
                "id": 123,
                "name": "Ciao",
                "notifyMe": false,
                "items": [
                    {
                        "steamID": "10",
                        "name": "Counter-Strike",
                        "description": "Play the world's number 1 online action game. Engage in an incredibly realistic brand of terrorist warfare in this wildly popular team-based game. Ally with teammates to complete strategic missions. Take out enemy sites. Rescue hostages. Your role affects your team's success. Your team's success affects your role.",
                        "image": "https://steamcdn-a.akamaihd.net/steam/apps/10/header.jpg?t=1568751918",
                        "lastUpdate": "2020-02-04T19:14:44.000Z",
                        "offers": [
                            {
                                "steamID": "10",
                                "reseller": "Gamivo",
                                "link": "https://www.gamivo.com/product/counter-strike-steam-gift",
                                "availability": 1,
                                "price": 7.87
                            },
                            {
                                "steamID": "10",
                                "reseller": "Steam",
                                "link": "https://store.steampowered.com/app/10",
                                "availability": 1,
                                "price": 8.19
                            }
                        ]
                    },
                    {
                        "steamID": "10",
                        "name": "Counter-Strike",
                        "description": "Play the world's number 1 online action game. Engage in an incredibly realistic brand of terrorist warfare in this wildly popular team-based game. Ally with teammates to complete strategic missions. Take out enemy sites. Rescue hostages. Your role affects your team's success. Your team's success affects your role.",
                        "image": "https://steamcdn-a.akamaihd.net/steam/apps/10/header.jpg?t=1568751918",
                        "lastUpdate": "2020-02-04T19:14:44.000Z",
                        "offers": [
                            {
                                "steamID": "10",
                                "reseller": "Gamivo",
                                "link": "https://www.gamivo.com/product/counter-strike-steam-gift",
                                "availability": 1,
                                "price": 7.87
                            },
                            {
                                "steamID": "10",
                                "reseller": "Steam",
                                "link": "https://store.steampowered.com/app/10",
                                "availability": 1,
                                "price": 8.19
                            },
                            {
                                "steamID": "10",
                                "reseller": "HRK",
                                "link": "https://store.steampowered.com/app/10",
                                "availability": 1,
                                "price": 8.19
                            },
                            {
                                "steamID": "10",
                                "reseller": "CDKeys",
                                "link": "https://store.steampowered.com/app/10",
                                "availability": 1,
                                "price": 8.19
                            }
                        ]
                    }
                ]
            }
        ]

    //lista aggiornata + boolean che indica la modifica avvenuta con successo o meno
    res.render('EditList', {list : output});
});

router.get('/user', (req, res) => {

    let gToken = req.cookies['gToken'];
    let sToken = req.cookies['sToken'];
    let userBaseInfo = req.cookies['userInfo'];

    loggedUser(gToken, sToken, userBaseInfo, res, true)
        .then(userInfo => res.render('editUser', {user: userInfo, err: null}))
        .catch(err => res.redirect('/index?session_expired=true'));

});

module.exports = router;