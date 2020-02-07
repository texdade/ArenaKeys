/*  Background operations to check prices and notify people about hot-deals which might interest them, basing this choice on a price bound value explicitly picked by the user
* */

const userLogic = require('../logic/user_logic');
const listLogic = require('../logic/list_logic');

const emailSender = require('../email/email_sender');

/*  Select all couple of (games & emails) for which the price has gone below the price requested by them and notify them with an email
* */
function checkPricesForNotifierRound(interval){
    return new Promise((resolve, reject) => {
        userLogic.getAllUsers().then(users => { //recover all users
            let promises = [];
            let i = 0;
            for(let user of users){
                promises.push(new Promise(resolve1 => { //recover all lists for each user
                    setTimeout(()=>{
                        if(process.env.LOG)
                            console.log("EMAIL_NOTIFIER: fetching lists for user " + user['name'] + " id = " + user['id']);
                        listLogic.getLists(user['id']).then(lists => {
                            resolve1({user: user, lists: lists});
                        }).catch(err => reject(err));

                    }, interval * i);
                }));
                i++;
            }

            Promise.all(promises).then((usersAndLists)=> {
                for(let userAndLists of usersAndLists){//array of {user - lists}
                    if(userAndLists['user']['email']){
                        for(let list of userAndLists['lists']){////array of lists for a selected user
                            for(let item of list['items']){//array of item for a selected list

                                let hotDeals = [];//offers which might interest the user
                                for(let offer of item['offers']){//array of offers for a selected item
                                    if(!item['notified'] && parseFloat(offer['price']) <= item['notifyPrice'])
                                        hotDeals.push(offer);
                                }

                                if(hotDeals.length > 0) {
                                    notifyUser(userAndLists['user'], item, hotDeals);
                                    item['notified'] = 1;//in order to not repeat notification
                                    listLogic.updateList(list).catch(err => {if(process.env.LOG){console.log(err);}});
                                }
                            }
                        }
                    }
                }
                resolve();
            }).catch((err)=>{if(process.env.LOG){console.log(err);}reject(err)});

        }).catch(err => reject(err));
    });
}

/*  Silent process for email notification
* */
function checkPricesForNotifier(){
    checkPricesForNotifierRound(process.env.INTERVAL_MAIL || 32000)//refresh dump trying to insert a new game every 16s (false to not have logs)
        .then(() => {{console.log("Restart refresh process for email notifier");checkPricesForNotifier();}})//just call it again
        .catch((err) => {console.log("Restart refresh process for email notifier (after an error has been occurred)\n" + err);checkPricesForNotifier();});//just call it again (even in case of error)
}

//send actual email to the user to notify him
function notifyUser(user, item, hotDeals){

    if(process.env.LOG)
        console.log("EMAIL_NOTIFIER: Sending notification to " + user['email'] + " for game " + item['name']);

    const subject = "Hot deals for " + item['name'] + " on GameKeys-Arena";
    let text =    "<b>Hey</b>,<br/> we want your attention! It's time to play!<br />" +
        "One of the game in your list seems to be at a very interesting price...<br />" +
        "Whaaat? You don't believe me? Why don't you check out by your self?<br /><br />" +
        "<p>" +
        "<h4>" + item['name'] + "</h4>" +
        "<img src='"+item['image']+"' />" +
        "</p>";
    text += "<p> <h5>Offers</h5><ul>";
    for(let deal of hotDeals){
        text += "<li> on <b>" + deal['reseller'] + "</b> at " + deal['link'] + " for a fantastic price of " + deal['price'] + "€ <br /></li>";
    }
    text += "</ul></p>";

    emailSender(user['email'], subject, text);
}


module.exports = {checkPricesForNotifier};