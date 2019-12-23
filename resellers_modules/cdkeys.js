const fetch = require("node-fetch");

const url = "https://adm.cdkeys.com/feeds/cdkeys_affiliate_feed_eur.txt";

const getPricesCDKeys = async url => {
    try {
        const response = await fetch(url);
        const dump = await response.text();
        return dump;
    } catch (error) {
        console.log(error); //needs error handling
    }
};
