/*
*   Router in order to get users'  data
*/
const express = require('express');
const router = express.Router();

const manageUserData = require('../logic/user_logic');

router.get('/user', (req, res) => {
    let googleId = req.user.googleUserId;
    let steamId = req.user.steamUserId;

    if(!googleId && steamId){ //section for users logged with steam
        manageUserData.getUser(steamId)
            .then(userData => res.status(200).json(userData))
            .catch(err => res.status(404).json({}));

    }else if(googleId && !steamId){ //section for users logged with google
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
    let name = req.body.name;
    let imageLink = req.body.imageLink;
    let steamProfileUrl = req.body.steamProfileUrl;
    let email = req.body.email;

    console.log({steamUserId: steamId, googleUserId: googleId, name: name, imageLink: imageLink, steamProfileUrl: steamProfileUrl, email: email});

    if(!googleId && steamId){ //section for users logged with steam
        manageUserData.createUser({steamUserId: steamId, googleUserId: null, name: name, imageLink: imageLink, steamProfileUrl: steamProfileUrl, email: email})
            .then(userData => res.status(201).json(userData)) //return the newly created user
            .catch(err => res.status(400).json({}));

    }else if(googleId && !steamId){ //section for users logged with google
        manageUserData.createUser({steamUserId: null, googleUserId: googleId, name: name, imageLink: imageLink, steamProfileUrl: steamProfileUrl, email: email})
            .then(userData => res.status(201).json(userData)) //return the newly created user
            .catch(err => res.status(400).json({}));

    }else{ //this should be impossible, but you never know!
        res.status(403).json({});
    }
});

router.put('/user', (req, res) => {
    let googleId = req.user.googleUserId;
    let steamId = req.user.steamUserId;
    let name = req.body.name;
    let imageLink = req.body.imageLink;
    let steamProfileUrl = req.body.steamProfileUrl;
    let email = req.body.email;
    let id = req.body.id;

    let updUser = {
        steamUserId: steamId,
        googleUserId: googleId,
        id: id,
        name: name,
        imageLink: imageLink,
        steamProfileUrl: steamProfileUrl,
        email: email
    };

    if(googleId || steamId){ //section for users logged with steam
        manageUserData.updateUser(updUser)
            .then(userData => res.status(200).json(userData)) //return the modified user
            .catch(err => res.status(404).json({}));

    }else{ //this should be impossible, but you never know!
        res.status(403).json({});
    }
});

router.delete('/user', (req, res) => {
    let googleId = req.user.googleUserId;
    let steamId = req.user.steamUserId;

    if(!googleId && steamId){ //section for users logged with steam
        manageUserData.deleteUser(steamId)
            .then(userData => res.status(200).json(userData))
            .catch(err => res.status(404).json({}));

    }else if(googleId && !steamId){ //section for users logged with google
        manageUserData.deleteUser(googleId)
            .then(userData => res.status(200).json(userData))
            .catch(err => res.status(404).json({}));

    }else{ //this should be impossible, but you never know!
        res.status(403).json({});
    }
});

module.exports = router;