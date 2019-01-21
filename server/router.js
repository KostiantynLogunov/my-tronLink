"use strict";

const UsersModel = require('./models/usersModel');
const _ = require('lodash');
const config = require('./config');
const bcrypt = require('bcryptjs');
const express = require('express');
// const passport = require('passport');
const jwt = require('jsonwebtoken');
let middleware = require('./middlewares/middleware');

const WebSocket = require('ws');

// WebSocket-сервер на порту 8081
const webSocketServer = new WebSocket.Server({
    port: config.serverSocketPort
});

function createToken (body) {
    return jwt.sign(
        body,
        config.jwt.secretOrKey,
        {expiresIn: config.expiresIn}
    );
}

require('./sockets')(webSocketServer);

module.exports = (app, io) => {

    const allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', '*');
        res.header('Access-Control-Allow-Headers', '*');
        next();
    };
    app.use(allowCrossDomain);

    app.post('/api/change-name', middleware.checkToken, async (req, res) => {
        let newname = req.body.newname;
        let userAddress = req.body.address;
        try {
            let user = await UsersModel.findOne({address: {$regex: _.escapeRegExp(userAddress), $options: "i"}}).exec();

            if(user != void(0)) {
                user.username = newname;
                user.save();
                return res.status(201)
                    .json({
                        user: user,
                        token: createToken({id: user._id, address: user.address})
                    });
            } else {
                return res.status(404)
                    .json({
                        message: 'user not found'
                    });
            }
        } catch (e) {
            console.error("Error, signin,", e);
            res.status(500).send({error: "something was wrong ...."});
        }
    });

    app.post('/api/signin', async (req, res) => {
        try {
            let user = await UsersModel.findOne({address: {$regex: _.escapeRegExp(req.body.address), $options: "i"}}).lean().exec();
            if(user != void(0))
            {
                return res.status(200)
                    .json({
                        user: user,
                        token: createToken({id: user._id, address: user.address})
                    });
            }

            user = await UsersModel.create({
                username: req.body.username,
                address: req.body.address
            });

            const token = createToken({id: user._id, address: user.address});

            res.cookie('token', token, {
                httpOnly: true
            });

            res.status(201).json({
                user: user,
                token: token,
            });

        } catch (e) {
            console.error("Error, signin,", e);
            res.status(500).send({error: "something was wrong ...."});
        }
    });
};