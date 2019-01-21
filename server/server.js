"use strict";

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {serveClient: true});
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const config = require('./config');

//підключення до БД
mongoose.connect('mongodb://localhost:27017/my-tronlink', { useNewUrlParser: true });
mongoose.Promise = require('bluebird');
// mongoose.set('debug', true);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//підключаємо cookieParser
// app.use(cookieParser());


require('./router')(app, io);



server.listen(config.port, 'localhost',  () => {
    console.log('Server started on port: ', config.port)
});
