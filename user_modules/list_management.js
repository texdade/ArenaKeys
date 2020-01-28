const db_list = require('../db/list_data/list');
const db_user = require('../db/user_data/user');
const steam_wishlist = require('../resellers_modules/steam');

//create a new wishlist starting from the steam one
function importSteamWishlist(email, wishlist_name){
    //get user steam_id
    db_user.getUser(email).then(user => {
        let user_steam_id = user["user_steam_id"];
        //fetch and format wishlist
        steam_wishlist.getUserSteamWishlist(user_steam_id).then(data => {
            if(wishlist_name == null)
                wishlist_name = "Steam wishlist";
            
            //create an empty list
            db_list.createList(email, wishlist_name).then(id => {
                for(let i = 0; i<data.length; i++){
                    //and add every game from the steam wishlist in it
                    db_list.addGame(id, data[i]["steamID"]);
                }
            });
        }).catch(error => console.log(error));
    }).catch(error => console.log(error));
}

module.exports = {importSteamWishlist}