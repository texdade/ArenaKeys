/*
*   Router in order to get lists'  data
*/
const express = require('express');
const router = express.Router();

const listLogic = require('../logic/list_logic');
const userLogic = require('../logic/user_logic');

//create a new list and (eventually) populates it with games
router.post('/userlist', (req, res) => {
    let googleId = req.user.googleUserId;
    let steamId = req.user.steamUserId;
    let listName = req.body.name;
    let notifyMe = (req.body.notifyMe && (req.body.notifyMe === true || parseInt(req.body.notifyMe) === 1) || req.body.notifyMe === 'true')? 1:0;
    let games = req.body.items;
    console.log("POST");
    console.log("googleId" + googleId);
    console.log("steamId" + steamId);
    console.log("listName" + listName);
    console.log("notifyMe" + notifyMe);
    console.log("games" + games);
    if(!listName){
        res.status(400).json({}); //bad request!
    }

    if(!notifyMe){
        notifyMe=false;
    }

    if(!games || (Array.isArray(games) && games.length === 0) || !Array.isArray(games))
        games = [];

    let promiseUserData;

    if(!googleId && steamId){ //section for users logged with steam
        promiseUserData = userLogic.getUser(steamId);
    }else if(googleId && !steamId){ //section for users logged with google
        promiseUserData = userLogic.getUser(googleId);
    }else{
        res.status(403).json({});
    }

    promiseUserData.
    then(userData => { //get the user id from the steam id
        listLogic.createList({userId: userData["id"], name: listName, notifyMe: notifyMe, items: games}).then(newList => {
            res.status(201).json(newList);
        });
    })
        .catch(err => res.status(400).json({}));

});

//get all lists associated with an user
router.get('/userlist', (req, res) => {
    let googleId = req.user.googleUserId;
    let steamId = req.user.steamUserId;

    let offers = true; //default value is true
    let details = true; //default value is true

    if(req.query.offers && ( (req.query.offers === "false") || (parseInt(req.query.offers) === 0) ) )
        offers = false;

    if(req.query.details && ( (req.query.details === "false") || (parseInt(req.query.details) === 0) ) )
        details = false;

    let promiseUserData;

    if(!googleId && steamId){ //section for users logged with steam
        promiseUserData = userLogic.getUser(steamId);

    }else if(googleId && !steamId){ //section for users logged with google
        promiseUserData = userLogic.getUser(googleId);

    }else{
        res.status(403).json({});
    }

    promiseUserData
        .then(userData => { //get the user id from the steam id
            listLogic.getLists(userData["id"], details, offers).then(lists => { //and return all the lists associated with him
                res.status(200).json(lists);
            }).catch(err => res.status(500).send(err));
        })
        .catch(err => res.status(404).json({}));

});

//get a list (given an id) associated with an user
router.get('/userlist/:id', (req, res) => {
    let googleId = req.user.googleUserId;
    let steamId = req.user.steamUserId;
    let listId = req.params.id;

    if(!listId || Number.isNaN(parseInt(listId))){
        res.status(400).json({}); //bad request!
    }

    let offers = true; //default value is true
    let details = true; //default value is true

    if(req.query.offers && ( (req.query.offers === "false") || (parseInt(req.query.offers) === 0) ) )
        offers = false;

    if(req.query.details && ( (req.query.details === "false") || (parseInt(req.query.details) === 0) ) )
        details = false;

    let promiseUserData;

    if(!googleId && steamId){ //section for users logged with steam
        promiseUserData = userLogic.getUser(steamId);

    }else if(googleId && !steamId){ //section for users logged with google
        promiseUserData = userLogic.getUser(googleId);

    }else{
        res.status(403).json({});
    }

    promiseUserData
        .then(userData => { //get the user id from the steam id
            listLogic.getList(listId, userData['id'], details, offers).then(list => { //and return the list
                if(userData['id'] === list['userId'])
                    res.status(200).json(list);
                else
                    res.status(404).json({});
            }).catch(err => {
                if(err && parseInt(err) >=400 && parseInt(err) < 500)
                    res.status(parseInt(err)).json({});
                else
                    res.status(500).json({});
            });
        })
        .catch(err => res.status(404).json({}));
});

//update an already existing list (adding/deleting games &/or changing attributes)
router.put('/userlist/:id', (req, res) => {
    let googleId = req.user.googleUserId;
    let steamId = req.user.steamUserId;

    let listName = req.body.name;
    let notifyMe = (req.body.notifyMe && (req.body.notifyMe === true || parseInt(req.body.notifyMe) === 1) || req.body.notifyMe === 'true')? 1:0;
    let games = req.body.items;

    let listId = req.params.id;

    if(!listName){
        res.status(400).json({}); //bad request!
    }

    if(!notifyMe){
        notifyMe=false;
    }

    if(!games || (Array.isArray(games) && games.length === 0) || !Array.isArray(games))
        games = [];

    let promiseUserData;

    if(!googleId && steamId){ //section for users logged with steam
        promiseUserData = userLogic.getUser(steamId);

    }else if(googleId && !steamId){ //section for users logged with google
        promiseUserData = userLogic.getUser(googleId);

    }else{
        res.status(403).json({});
    }

    promiseUserData.
    then(userData => { //get the user id from the steam id
        listLogic.updateList({id:listId, userId: userData["id"], name: listName, notifyMe: notifyMe, items: games}).then(updList => {
            res.status(200).json(updList);
        }).catch(err => {
            if(parseInt(err) >=400 && parseInt(err) <500)
                res.status(parseInt(err)).json({});
            else
                res.status(500).send(err)
        });
    })
        .catch(err => res.status(400).json({}));

});

//delete a list (given an id) associated with an user
router.delete('/userlist/:id', (req, res) => {
    let googleId = req.user.googleUserId;
    let steamId = req.user.steamUserId;
    let listId = req.params.id;

    if(!listId || Number.isNaN(parseInt(listId))){
        res.status(400).json({}); //bad request!
    }

    let promiseUserData;

    if(!googleId && steamId){ //section for users logged with steam
        promiseUserData = userLogic.getUser(steamId);

    }else if(googleId && !steamId){ //section for users logged with google
        promiseUserData = userLogic.getUser(googleId);

    }else{
        res.status(403).json({});
    }

    promiseUserData
        .then(userData => { //get the user id from the steam id
            listLogic.deleteList(listId, userData['id']).then(list => { //and return the deleted list
                res.status(200).json(list);
            }).catch(err => {
                if(parseInt(err) >=400 && parseInt(err) <500)
                    res.status(parseInt(err)).json({});
                else
                    res.status(500).send(err)
            });
        })
        .catch(err => res.status(404).json({}));
});

module.exports = router;