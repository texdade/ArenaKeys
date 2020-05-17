/*
*
*
*/
const userProcess = require('../website_processes/user_process');
const gameProcess = require('../website_processes/price_checker');
const listProcess = require('../website_processes/userlist_process');
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
    console.log("Rerquesting result for "+ steamID || gameName);    
    let priceChecker;
    if(steamID)
        priceChecker = gameProcess.getGameOffer(steamID);
    else
        priceChecker = gameProcess.getGameOffers(gameName);
    
    Promise.all([getUser, priceChecker])
        .then( results => {
	    console.log(results);
            listProcess.tryGetUserList(gToken, sToken, false, false)//-1 on implies requiring all user lists
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
            listProcess.tryGetUserList(gToken, sToken, true, true) //-1 on implies requiring all user lists
                .then( lists => {
                    res.render('myLists', {listsResult : lists, user: userInfo, err: null});
                })
                .catch(err => {
                    res.redirect('/index?session_expired=true');
                });
        })
        .catch(err =>  res.redirect('/index?session_expired=true'));
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
