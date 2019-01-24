"use strict";

const UsersModel = require('./models/usersModel');
const _ = require('lodash');
const config = require('./config');
const jwt = require('jsonwebtoken');
let middleware = require('./middlewares/middleware');
const TronWeb = require('tronweb');
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

function checkSignature(messageToSign, signature, clientPublicAddress){
    const HttpProvider = TronWeb.providers.HttpProvider;
    const fullNode = new HttpProvider('https://api.trongrid.io'); // Full node http endpoint
    const solidityNode = new HttpProvider('https://api.trongrid.io'); // Solidity node http endpoint
    const eventServer = new HttpProvider('https://api.trongrid.io'); // Contract events http endpoint

    const privateKey = config.privateKeyTron;

    const tronWeb = new TronWeb(
        fullNode,
        solidityNode,
        eventServer,
        privateKey
    );

    let result = false;
    tronWeb.trx.verifyMessage(tronWeb.toHex(messageToSign), signature, clientPublicAddress, (err,res) => {
        if (err) {
            console.log(err);
             throw err;
        }
        result = res;
    });
    return result;
}

require('./sockets')(webSocketServer);

module.exports = (app) => {

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

        let signature = req.body.signature;
        let clientPublicAddress = req.body.address;
        let messageToSign = req.body.messageToSign;
        /*console.log(signature);
        console.log(clientPublicAddress);
        console.log(messageToSign);*/

        let result = checkSignature(messageToSign, signature, clientPublicAddress);
        console.log('result of check signature: --- ' , result);

        if (result === true) {
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
        } else {
            console.error("Error, wrong checking signature");
            res.status(401).send({error: "wrong checking signature"});
        }
    });
};