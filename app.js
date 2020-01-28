/*  GameArena KeyComparator App
*/

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//middlewares
app.use(express.static('views'));// folder in which to put the static files (html, css, js client)
app.use(bodyParser.json({limit: '50mb'})); // read json

//middlewares (just for the widget)
app.use(bodyParser.urlencoded({ extended: true , limit: '50mb'})); // read form enctype data
app.set('view engine', 'ejs'); // set the engine render ejs for dynamic building of html pages with ejs tags

//set up routers for v1 app
const authRouter = require('./routes/authRouter'); // google auth & steam auth + standard auth

//set up routers for latest version app
app.use('/', authRouter);

module.exports = app;