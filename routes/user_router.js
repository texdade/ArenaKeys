/*
*   Router in order to get users'  data
*/
const express = require('express');
const router = express.Router();

const manageUserData = require('../adapters/user_adapter');

router.get('/user', (req, res) => {
    let googleId = req.user.googleUserId;
    let steamId = req.user.steamUserId;

    if(googleId == undefined){ //section for users logged with steam
        manageUserData.getUser(steamId)
            .then(userData => res.status(200).json(userData))
            .catch(err => res.status(404).json({}));
    }else if(steamId == undefined){ //section for users logged with google
        manageUserData.getUser(googleId)
            .then(userData => res.status(200).json(userData))
            .catch(err => res.status(404).json({}));
    }else{ //this should be impossible, but you never know!
        res.status(403).json({});
    }
});

router.post('/user', (req, res) => {
    let googleId = req.user.googleUserId;
    let steamId = req.user.steamUserId;
    let name = req.user.name;
    let imageLink = req.user.imageLink;
    let steamProfileUrl = req.user.steamProfileUrl;
    let email = req.user.email;

    if(googleId == undefined){ //section for users logged with steam
        manageUserData.createUser(steamId, null, name, imageLink, steamProfileUrl, email)
            .then(userData => res.status(201).json(userData)) //return id of the newly created user
            .catch(err => res.status(400).json({}));
    }else if(steamId == undefined){ //section for users logged with google
        manageUserData.createUser(null, googleId, name, imageLink, steamProfileUrl, email)
            .then(userData => res.status(201).json(userData)) //return id of the newly created user
            .catch(err => res.status(400).json({}));
    }else{ //this should be impossible, but you never know!
        res.status(403).json({});
    }
});

router.put('/user', (req, res) => {
    let googleId = req.user.googleUserId;
    let steamId = req.user.steamUserId;
    let name = req.user.name;
    let imageLink = req.user.imageLink;
    let steamProfileUrl = req.user.steamProfileUrl;
    let email = req.user.email;

    if(googleId == undefined){ //section for users logged with steam
        manageUserData.createUser(steamId, null, name, imageLink, steamProfileUrl, email)
            .then(userData => res.status(200).json(userData)) //return id of the newly created user
            .catch(err => res.status(404).json({}));
    }else if(steamId == undefined){ //section for users logged with google
        manageUserData.createUser(null, googleId, name, imageLink, steamProfileUrl, email)
            .then(userData => res.status(200).json(userData)) //return id of the newly created user
            .catch(err => res.status(404).json({}));
    }else{ //this should be impossible, but you never know!
        res.status(403).json({});
    }
});

router.delete('/user', (req, res) => {
    let googleId = req.user.googleUserId;
    let steamId = req.user.steamUserId;

    if(googleId == undefined){ //section for users logged with steam
        manageUserData.deleteUser(steamId)
            .then(userData => res.status(200).json(userData))
            .catch(err => res.status(404).json({}));
    }else if(steamId == undefined){ //section for users logged with google
        manageUserData.deleteUser(googleId)
            .then(userData => res.status(200).json(userData))
            .catch(err => res.status(404).json({}));
    }else{ //this should be impossible, but you never know!
        res.status(403).json({});
    }
});

module.exports = router;