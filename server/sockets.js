"use strict";
// подключенные клиенты
var clients = {};

module.exports = (webSocketServer) => {

    webSocketServer.on('connection', (ws, req) => {

        let userAddress = req.url.substring(1);
        clients[userAddress] = ws;
        /*for (var key in clients) {
            clients[key].send(message);
        }*/
        console.log("NEW connection with --- " + userAddress);

        /*ws.on('message', function(message) {
        });*/

        ws.send('The connection ESTABLISHED with --- ' + userAddress);
        ws.send('ok');

        ws.on('close', () => {
            console.log('The connection TERMINATED with --- ' + userAddress);
            delete clients[userAddress];
        });

    });
};