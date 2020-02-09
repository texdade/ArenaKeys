const listHandler = require('../adapters/db_adapters/list_adapter');
const steamListAdapter = require('../adapters/steam_wishlist_adapter');
const gamePrices = require('./videogame_logic');
const utilities = require('../db/utilities');

/*  Get all list data given the user, refreshing its game offers
* */
function getLists(userId, details, offers){
    return new Promise((resolve, reject) => {
        listHandler.getListsByUser(userId).then(listsData => {
            if(listsData !== undefined){
                let userListsP = [];

                for(let listData of listsData)
                    userListsP.push(getList(listData['id'], userId, details, offers));

                Promise.all(userListsP).then(userLists => resolve(userLists)).catch(err => reject(err));

            } else {
                reject(404);
            }
        }).catch(err => reject(err));
    });
}

//here just a single list is requested => filter it by id
function getList(listId, userId, details, offers){
    return new Promise((resolve, reject) => {
        listHandler.getList(listId, userId).then(listData => {
            if(utilities.isList(listData)){

                listHandler.getGames(listData)
                    .then(listGames => {
                        listData['items'] = listGames;
                        getItemsOffers(extractSteamIds(listData), details, offers)//update offers for the list
                            .then(itemsOffers => {
                                listData['items'] = addPriceNotify(itemsOffers, listGames);//add price notify values

                                resolve(listData);
                            })
                            .catch(err => reject(err));
                    })
                    .catch(err => reject(err));

            } else {
                reject(404);
            }
        }).catch(err => reject(err));
    });
}

/*  Given the steam user ID retrieve his/her wishlist formatted following the standard of our
* */
function getSteamWishList(steamUserId, details, offers){
    return new Promise((resolve, reject) => {
        steamListAdapter.getWishList(steamUserId).then(wishlist => {
            getItemsOffers(extractSteamIds(wishlist), details, offers).then(gamePrices => {
                wishlist['items'] = gamePrices;
                resolve(wishlist);
            }).catch(err => reject(err));

        }).catch(err => reject(err));

    });
}

/*  Create a list by eventually inserting also all the games (if list imported)
*   Return the list, with offers already computed
* */
function createList(list){
    return new Promise((resolve, reject) => {
        console.log(list);
        if(utilities.isListNoId(list)){
            listHandler.createList(list).then(createdList => {
                let listId = createdList['id'];

                if(listId !== undefined){
                    let insertedGamesP = [];

                    let listItems = list['items'];
                    //insert game in the list
                    for(let listItem of listItems)
                        insertedGamesP.push(listHandler.addGame(list, listItem));

                    Promise.all(insertedGamesP).then(() => {
                        getItemsOffers(extractSteamIds(list), true, true)
                            .then(itemsOffers => {
                                list['items'] = addPriceNotify(itemsOffers, listItems);//add price notify values
                                resolve(list);
                            })
                            .catch(err => reject(err));

                    }).catch(err => reject(err));

                } else {
                    reject(400);
                }

            }).catch(err => reject(err));

        }else{
            reject(400);//not valid input format
        }
    });
}

//get gamesOffers given an array of steamIds
function getItemsOffers(steamIds, details, offers){
    return new Promise((resolve, reject) => {
        let pricesP = [];

        for(let steamId of steamIds)
            pricesP.push(gamePrices.getGame(steamId, details, offers));//refresh all data if needed

        Promise.all(pricesP)
            .then(gamesPrices => resolve(gamesPrices))
            .catch(err => reject(err));

    });
}

/*  Given a list object, extract all steamIds of its games
* */
function extractSteamIds(list){
    if(utilities.isList(list)){
        let itemsIds = [];
        for(let listItem of list['items'])
            itemsIds.push(listItem['steamID']);

        return itemsIds;

    }else
        return [];
}

/*  Add priceNotify value to each item in listItems (by fetching it from a correspondent list listItemsPriceNotify)
* */
function addPriceNotify(listItems, listItemsPriceNotify){
    if( listItems && listItemsPriceNotify &&
        Array.isArray(listItems) && Array.isArray(listItemsPriceNotify) &&
        listItems.length !== listItemsPriceNotify.length
    )
        return null;

    for(let i=0; i<listItems.length; i++){
        if(listItems[i]['steamID'] !== listItemsPriceNotify[i]['steamID'])
            return null;
        else {
            listItems[i]['notifyPrice'] = listItemsPriceNotify[i]['notifyPrice'];
            listItems[i]['notified'] = listItemsPriceNotify[i]['notified'];
        }
    }
    return listItems;
}

//delete a single list (also userId is passed for security reason)
function deleteList(listId, userId){
    return new Promise((resolve, reject) => {
        getList(listId, userId).then(listData => {
            if(utilities.isList(listData)){
                if(listData['userId'] === userId)
                    listHandler.deleteList(listData).then(listData => resolve(listData)).catch(err => reject(err));
                else
                    reject(404);
            } else {
                reject(404);
            }
        }).catch(err => reject(err));
    });
}

//update a single list
function updateList(list){
    return new Promise((resolve, reject) => {
        if(utilities.isList(list)){
            getList(list['id'], list['userId']).then(listData => {//security check
                if (listData['userId'] === list['userId']){
                    listData['name'] = list['name'];
                    listData['notifyMe'] = list['notifyMe'];

                    let updPromises = [];

                    let genericInfoUpd = listHandler.updateList(listData);//update generic info
                    updPromises.push(genericInfoUpd);

                    let gamesToDelete = gamesToDeleteInUpdate(listData['items'],list['items']);//delete every game which does not appear in the new list
                    for(let gameDel of gamesToDelete)
                        updPromises.push(listHandler.deleteGame(listData, gameDel));

                    let gamesToAdd = gamesToAddInUpdate(listData['items'],list['items']);//add every game which does not appear in the old list, but in the new one
                    for(let gameAdd of gamesToAdd)
                        updPromises.push(listHandler.addGame(listData, gameAdd));

                    let gamesToUpd = gamesToUpdPriceNotifier(listData['items'],list['items']);//modify every game which does appear in the old list, but has new priceNotify and/or notified value
                    for(let gameUpd of gamesToUpd)
                        updPromises.push(listHandler.updGame(listData, gameUpd));

                    Promise.all(updPromises)
                        .then(() => {
                            //recover all newly updated and refresh info about the list
                            getList(listData['id'],listData['userId']).then(updatedList => resolve(updatedList)).catch(err => reject(err));
                        })
                        .catch(err => reject(err));

                }else
                    reject(404);
            }).catch(err => reject(err));
        }else{
            reject(400);
        }

    });
}


//given two list of items, return the one which appears in the first one, but not in the second one
function gamesToDeleteInUpdate(oldItems, newItems){
    newItems = newItems.filter(function (el) {
        return el != null;
    });

    let result = [];
    for(let oldIt of oldItems){
        let found = false;
        for(let newIt of newItems){
            if(oldIt['steamID'] === newIt['steamID']){
                found = true;
                break;
            }
        }
        if(!found)
            result.push(oldIt);
    }
    return result;
}

//given two list of items, return the one which appears in the second one, but not in the first one
function gamesToAddInUpdate(oldItems, newItems){
    newItems = newItems.filter(function (el) {
        return el != null;
    });

    let result = [];
    for(let newIt of newItems){
        let found = false;
        for(let oldIt of oldItems){
            if(oldIt['steamID'] === newIt['steamID']){
                found = true;
                break;
            }
        }
        if(!found)
            result.push(newIt);
    }
    return result;
}


//given two list of items, return the one which appears in the second one and in the first one with different value of priceNotify and/or notified
function gamesToUpdPriceNotifier(oldItems, newItems){
    newItems = newItems.filter(function (el) {
        return el != null;
    });

    let result = [];
    for(let newIt of newItems){
        for(let oldIt of oldItems){
            if( oldIt['steamID'] === newIt['steamID'] && (differentNotifyPrice(oldIt, newIt) || oldIt['notified'] !== newIt['notified'])){
                result.push(newIt);
                break;
            }
        }
    }
    return result;
}

//compare two notifyPrice value in it1 & in it2: return true if one of them is different from the other
function differentNotifyPrice(it1, it2){
    return  (isNaN(parseFloat(it1['notifyPrice'])) && !isNaN(parseFloat(it2['notifyPrice'])))
            ||
            (isNaN(parseFloat(it1['notifyPrice'])) && !isNaN(parseFloat(it2['notifyPrice'])))
            ||
            (parseFloat(it1['notifyPrice']) !== parseFloat(it2['notifyPrice']));
}


module.exports = {getLists, getList, createList, deleteList, updateList, getSteamWishList};