const gProtect = require('./google_auth').protect;
const sProtect = require('./steam_auth').protect;

const gAuth = require('./google_auth').auth;
const sAuth = require('./steam_auth').auth;

exports.auth = (app) => {
    gAuth(app);
    sAuth(app);
};

exports.protect = () => {
    return gProtect() || sProtect();
    // ho provato anche in modi più sofisticati, ma il try catch dell'errore viene già fatto nella bearer auth
    // e poi c'è un flusso di operazioni e chiamate di passport che ti redirigono alla pagina unauthorized
};