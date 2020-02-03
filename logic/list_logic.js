const listHandler = require('../adapters/db_adapters/list_adapter');
const gamePrices = require('./videogame_logic');
const utilities = require('../db/utilities');

/*  Get all list data given the user, refreshing its game offers
* */
function getLists(userId){
    return new Promise((resolve, reject) => {
        listHandler.getListsByUser(userId).then(listsData => {
            if(listsData !== undefined){
                let userListsP = [];

                for(let listData of listsData)
                    userListsP.push(getList(userId, listData['id']));

                Promise.all(userListsP).then(userLists => resolve(userLists)).catch(err => reject(err));

            } else {
                reject(404);
            }
        }).catch(err => reject(err));
    });
}

//here just a single list is requested => filter it by id
function getList(userId, listId){
    return new Promise((resolve, reject) => {
        listHandler.getList(listId, userId).then(listData => {
            if(utilities.isList(listData)){

                listHandler.getGamesIds(listData)
                    .then(steamIds => {

                        getItemsOffers(steamIds)//update offers for the list
                            .then(itemsOffers => {
                                listData['items'] = itemsOffers;
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

/*  Create a list by eventually inserting also all the games (if list imported)
*   Return the list, with offers already computed
* */
function createList(list){
    return new Promise((resolve, reject) => {
        if(utilities.isListNoId(list)){
            listHandler.createList(list).then(createdList => {
                let listId = createdList['id'];

                if(listId !== undefined){
                    let insertedGamesP = [];
                    //insert game in the list
                    for(let listItem of list['items'])
                        insertedGamesP.push(listHandler.addGame(list, listItem['steamID']));

                    Promise.all(insertedGamesP).then(steamIds => {
                        console.log(steamIds);
                        getItemsOffers(steamIds)
                            .then(itemsOffers => {
                                list['items'] = itemsOffers;
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
function getItemsOffers(steamIds){
    return new Promise((resolve, reject) => {
        let pricesP = [];

        for(let steamId of steamIds)
            pricesP.push(gamePrices.getGamePrices(steamId));//refresh all data if needed

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

//delete a single list (also userId is passed for security reason)
function deleteList(userId, listId){
    return new Promise((resolve, reject) => {
        listHandler.getList(listId, userId).then(listData => {
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
            listHandler.getList(list['id'], list['userId']).then(listData => {//security check
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

                    Promise.all(updPromises)
                        .then(() => {
                            //recover all newly updated and refresh info about the list
                            getList(listData['userId'], listData['id']).then(updatedList => resolve(updatedList)).catch(err => reject(err));
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


module.exports = {getLists, getList, createList, deleteList, updateList};