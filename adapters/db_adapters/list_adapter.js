/*  Adapter for the userlist data layer
* */
const listDAO = require('../../db/list');

function createList(list){
    return new Promise((resolve, reject) => {
        listDAO.createList(list['userId'], list['name'], list['notifyMe'])
            .then(newListId => {
                list['id'] = newListId;
                resolve(list);
            })
            .catch(err => reject(err));
    });
}

//given a user, get all associated wishlists
function getListsByUser(userId){
    return new Promise((resolve, reject) => {
        listDAO.getListsByUser(userId)
            .then(lists => {
                if(!lists)
                    reject(400);

                let fetchedLists = [];
                for(let l of lists)
                    fetchedLists.push({
                        id: l['id'],
                        name: l['name'],
                        notifyMe: l['notify_me'],
                        userId: userId,
                        items: []
                    });
                resolve(fetchedLists);
            })
            .catch(err => reject(err));
    });
}

//given a user, get all associated wishlists
function getList(listId, userId){
    return new Promise((resolve, reject) => {
        listDAO.getList(listId, userId)
            .then(list => {
                if(!list)
                    reject(404  );


                resolve({
                    id: list['id'],
                    name: list['name'],
                    notifyMe: list['notify_me'],
                    userId: userId,
                    items: []
                });
            })

            .catch(err => reject(err));
    });
}

//can only change name and notifier of a wishlist
function updateList(list){
    return new Promise((resolve, reject) => {
        listDAO.updateList(list['id'], list['userId'], list['name'], list['notifyMe'])
            .then(updRows => {
                if(updRows === 1)
                    resolve(list);
                else
                    reject("Invalid pairs of id & userId");
            })
            .catch(err => reject(err));
    });
}

//delete a list entity from the db
function deleteList(list){
    return new Promise((resolve, reject) => {
        listDAO.deleteList(list['id'], list['userId'])
            .then(dltRows => {
                if(dltRows === 1)
                    resolve(list);
                else
                    reject("Invalid pairs of id & userId");
            })
            .catch(err => reject(err));
    });
}

//adding game to a list
function addGame(list, listItem){
    return new Promise((resolve, reject) => {
        listDAO.addGame(list['id'], listItem["steamID"], listItem['notifyPrice'])
            .then(newListItemRow => {
                resolve(newListItemRow['steam_id']);
            })
            .catch(err => reject(err));
    });
}

//update game price notify list
function updPriceNotifier(list, listItem){
    return new Promise((resolve, reject) => {
        listDAO.updGame(list['id'], listItem["steamID"], listItem['notifyPrice'])
            .then(affectedRows => {
                resolve(affectedRows > 0);
            })
            .catch(err => reject(err));
    });
}

//get all games ids for a list
function getGames(list){
    return new Promise((resolve, reject) => {
        listDAO.getGames(list)
            .then(gameListRows => {
                let games = [];
                    for(let row of gameListRows)
                        games.push({steamID: row['steam_id'], notifyPrice: row['notify_price']});
                resolve(games);
            })
            .catch(err => reject(err));
    });
}

//remove a game from a list
function deleteGame(list, listItem){
    return new Promise((resolve, reject) => {
        listDAO.deleteGame(list["id"], listItem["steamID"])
            .then(dltRows => {
                if(dltRows === 1)
                    resolve(listItem);
                else
                    reject("Invalid pairs of list id and game id");
            })
            .catch(err => reject(err));
    });
}

module.exports = {createList, getList, getListsByUser, updateList, deleteList, addGame, updPriceNotifier, getGames, deleteGame};

