/*
*   Router in order to get lists'  data
*/
const express = require('express');
const router = express.Router();

const manageListData = require('../adapters/list_adapter');
const manageUserData = require('../adapters/user_adapter');

//get all lists associated with an user
router.get('/userlist', (req, res) => {
    let googleId = req.user.googleUserId;
    let steamId = req.user.steamUserId;

    if(googleId == undefined){ //section for users logged with steam
        manageUserData.getUser(steamId)
            .then(userData => { //get the user id from the steam id
                manageListData.getLists(userData["id"]).then(lists => { //and return all the lists associated with him
                    res.status(200).json(lists);
                }).catch(err => reject(err));
            })
            .catch(err => res.status(404).json({}));
    }else if(steamId == undefined){ //section for users logged with google
        manageUserData.getUser(googleId)
            .then(userData => {
                manageListData.getLists(userData["id"]).then(lists => {
                    res.status(200).json(lists);
                }).catch(err => reject(err));
            })
            .catch(err => res.status(404).json({}));
    }else{
        res.status(403).json({});
    }
});

//get a list (given an id) associated with an user
router.get('/userlist/:id', (req, res) => {
    let googleId = req.user.googleUserId;
    let steamId = req.user.steamUserId;
    let listId = req.params.id;

    if(listId==undefined){
        res.status(400).json({}); //bad request!
    }

    if(googleId == undefined){ //section for users logged with steam
        manageUserData.getUser(steamId)
            .then(userData => { //get the user id from the steam id
                manageListData.getList(userData["id"], listId).then(list => { //and return all the lists associated with him
                    res.status(200).json(list);
                }).catch(err => reject(err));
            })
            .catch(err => res.status(404).json({}));
    }else if(steamId == undefined){ //section for users logged with google
        manageUserData.getUser(googleId)
            .then(userData => {
                manageListData.getList(userData["id"], listId).then(list => {
                    res.status(200).json(list);
                }).catch(err => reject(err));
            })
            .catch(err => res.status(404).json({}));
    }else{
        res.status(403).json({});
    }
});

module.exports = router;