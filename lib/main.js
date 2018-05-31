const moveGenerator = require('../native');

//has to be removed by reading from config-file
const serverPort = 4999;

const server_options = {
    path: '/deep-green',
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000   
};

//create server, bind to socket.io and start listening
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, server_options);
let connections = [];


server.listen(process.env.PORT || serverPort);

io.sockets.on('connection', (socket) => {
    // save connected sockets
    connections.push(socket);

    // disconnect
    socket.on('disconnect', (data)=> {
        connections.splice(connections.indexOf(socket), 1);
    });

    socket.on('makeMove', (data) => {
        //### ONLY FOR TESTING!!! ###
        let move = {
            "FEN": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "ID_game": 2,
            "color": true,
            "turns": [
              "e2e4",
              "c2c4"
            ]
          }

        if(data == undefined) {
            data = move;
        }
        //############################

        io.sockets.emit('receive', data);
    });

});