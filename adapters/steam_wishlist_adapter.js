/*
*   Module which maps a steam wishlist into a gamekeys-arena wishlist
* */

const steamFetchModule = require('../resellers_modules/steam');

/*  Given the steam user ID retrieve his/her wishlist formatted following the standard of our
* */
function getWishList(steamUserId){
    return new Promise((resolve, reject) => {
        steamFetchModule.getUserSteamWishlist(steamUserId)
            .then(gameList => {
                let wishlistItems = [];
                let wishlistIDs = Object.keys(gameList); //get all steamIDs from wishlist in order to navigate it
                wishlistIDs.forEach(id => {
                    if((gameList[id]['type']).toLowerCase() === 'game' && !gameList[id]['is_free_game']){ //if it is a game and is not free (we can't sell free things)
                        if(!gameList[id]['subs'].length<1){ //if the game currently has a price, which is contained in an array in "subs"
                            let game={
                                steamID: id,
                                name: gameList[id]['name'],
                                image: gameList[id]['capsule'],
                                description: undefined,
                                notifyMe: 0,
                                offers: []
                            };
                            wishlistItems.push(game);
                        }
                    }
                });

                resolve({
                    id: -1,//invalid internal id
                    userId: -1, //invalid internal user
                    name: "Steam WishList of steam user " + steamUserId,
                    notifyMe:0,
                    items: wishlistItems
                });
            })
            .catch(err => reject(err));
    });
}

module.exports = {getWishList};