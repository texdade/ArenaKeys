/*
*
*
*/
const userProcess = require('../process_centric_services/user_process');
const express = require('express');
const router = express.Router();

const utilities = require('../db/utilities');

//extracting info of user, passing access_token as a string query parameter "localhost:3000/secret?access_token = <token>"
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
    let input = {
        //stringa nome gioco   
    };

    let output = {
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
    };

    res.render('gameListResult', output);
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
    
    let output = {
        "list": [
            {
                "id": -100000000,
                "name": "",
                "notifyMe": false,
                "items": [
                    {
                    "name": "",
                    "priceNotifier": false,
                    "imageLink": "",
                    "offers": [
                        {
                        "reseller": "",
                        "price": -100000000,
                        "link": "",
                        "availability": false
                        }
                    ],
                    "steamID": -100000000,
                    "description": ""
                    }
                ]
            }
        ]
    }
    res.render('MyLists', vgObj);
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

router.get('/performAuthGoogle', (req, res) => {
    
    res.render('index', vgObj);
});

router.get('/editList', (req, res) => {
    let input = {
        //id della lista da modificare
    }

    let output = {
        //la pagina viene caricata con lista con i dati vecchi che ora saranno modificati
        "list": [
            {
                "id": -100000000,
                "name": "",
                "notifyMe": false,
                "items": [
                    {
                        "name": "",
                        "priceNotifier": false,
                        "imageLink": "",
                        "offers": [
                            {
                                "reseller": "",
                                "price": -100000000,
                                "link": "",
                                "availability": false
                            }
                        ],
                        "steamID": -100000000,
                        "description": ""
                    }
                ]
            }
        ]

        //lista aggiornata + boolean che indica la modifica avvenuta con successo o meno
    }
    res.render('EditList', vgObj);
});

router.get('/editList/edit', (req, res) => {
    let input = {
        //lista modificata da inserire nel db + id lista
    }

    let output = {
        //lista aggiornata + boolean che indica la modifica avvenuta con successo o meno
    }
    res.render('EditList', vgObj);
});

router.get('/user', (req, res) => {
    let input = {
        // user token o id
    }
    let output = {
        /*i vecchi dati che l'utente ha inserito 
        (in questo caso può cambiare solo l'email e il link dell'account di Steam che serve in caso volesse importare sempre le liste
        da un altro account rispetto a quello con cui è loggato)*/
    }
    res.render('EditUser', vgObj);
});

router.get('/user/:id/edit', (req, res) => {
    let input = {
        // user token o id
    }
    let output = {
        /*i vecchi dati che l'utente ha inserito 
        (in questo caso può cambiare solo l'email e il link dell'account di Steam che serve in caso volesse importare sempre le liste
        da un altro account rispetto a quello con cui è loggato)*/
    }
    res.render('EditUser', vgObj);
});



module.exports = router;