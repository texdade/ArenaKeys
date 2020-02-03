const listFetcher = require('../user_modules/list_management');
const listCRUD = require('../db/list_data/list');

function getLists(userId){
    return new Promise((resolve, reject) => {
        listCRUD.getLists(userId).then(listsData => {
            if(listsData != undefined){
                userLists = [];
                for(let i=0; i<listsData.length; i++){
                    let items = listCRUD.getGames(listsData[i]["id"]).then(games => {
                        let list = {
                            "id": listsData[i]["id"],
                            "name": listsData[i]["name"],
                            "notifyMe": listsData[i]["notifyMe"],
                            "user": listsData[i]["user"],
                            "items": games
                        }
                    }).catch(err => reject(err));
                    userLists.push(list);
                }
                resolve(userLists);
            } else {
                reject("404");
            }
        }).catch(err => reject(err));
    });
}

//here just a single list is requested => filter it by id
function getList(userId, listId){
    return new Promise((resolve, reject) => {
        listCRUD.getLists(userId).then(listsData => {
            if(listsData != undefined){
                for(let i=0; i<listsData.length; i++){
                    if(listsData[i]["id"]==listId){
                        let items = listCRUD.getGames(listsData[i]["id"]).then(games => {
                            let list = {
                                "id": listsData[i]["id"],
                                "name": listsData[i]["name"],
                                "notifyMe": listsData[i]["notifyMe"],
                                "user": listsData[i]["user"],
                                "items": games
                            }
                            resolve(list);
                        }).catch(err => reject(err));
                    }
                }
            } else {
                reject("404");
            }
        }).catch(err => reject(err));
    });
}

module.exports = {getLists, getList};