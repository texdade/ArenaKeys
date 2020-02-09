/*
*
*
*/
const userProcess = require('../process_centric_services/user_process');
const gameProcess = require('../process_centric_services/price_checker');
const express = require('express');
const router = express.Router();

const utilities = require('../db/utilities');

//Render for the index page, which changes on the fact that the user is logged in or not
router.get('/', (req, res) => {
    let gToken = req.cookies['gToken'];
    let sToken = req.cookies['sToken'];
    let userBaseInfo = req.cookies['userInfo'];

    userProcess.tryGetUserInfo(gToken, sToken)
        .then( userInfo => res.render('index', {user: userInfo, err: null}))
        .catch(err => {
            if(parseInt(err) === 404 && userBaseInfo && utilities.isUserNoId(userBaseInfo)){
                userProcess.createNewUser(userBaseInfo, gToken || sToken).then(user => { 
                    res.render('index', {user: user, err: null});
                }).catch(err => res.render('index', {user: null, err: err}));
            }else{
                res.clearCookie('gToken');
                res.clearCookie('sToken');
                res.render('index', {user: null, err: err});
            }
        });
    
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

    Promise.all([getUser,priceChecker])
        .then( results => res.render('gameListResult', {user: results[0], err: null, searchResults: results[1], userLists: [] }))
        .catch(err => {
            res.clearCookie('gToken');
            res.clearCookie('sToken');
            res.render('gameListResult', {user: null, err: err, searchResults: null, userLists: [] });
        });
    //res.render('gameListResult', {searchResults: output, userLists: userLists});
});

router.get('/addGame', (req, res) => {
    let input = {
        //id del gioco e id della lista dove verrà aggiunto
    }
    
    let output = {
        //
    }
    res.render('MyLists', vgObj);
});

router.get('/lists', (req, res) => {
    let input = {
        //user token o id
    }
    
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
                },
                {
                    "id": 124,
                    "name": "Come",
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
                },
                {
                    "id": 125,
                    "name": "Va",
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
    res.render('MyLists', {listsResult : output});
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
/*
router.get('/editList/edit', (req, res) => {
    let input = {
        //lista modificata da inserire nel db + id lista
    }

    let output = {
        //lista aggiornata + boolean che indica la modifica avvenuta con successo o meno
    }
    res.render('EditList', vgObj);
});*/

router.get('/user', (req, res) => {
    let gToken = req.cookies['gToken'];
    let sToken = req.cookies['sToken'];

    userProcess.tryGetUserInfo(gToken, sToken)
        .then( userInfo => res.render('editUser', {user: userInfo, err: null}))
        .catch(err => res.render('editUser', {user: null, err: err}));
});

module.exports = router;