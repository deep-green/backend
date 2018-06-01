const moveGenerator = require('../native');

//has to be removed by reading from config-file
const serverPort = 4999;

const server_options = {
    path: '/',
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000   
};

//create server, bind to socket.io and start listening
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, server_options);
const dg_interface = require('../lib/dg_interface')
let connections = [];

server.listen(process.env.PORT || serverPort);

io.sockets.on('connection', (socket) => {
    // save connected sockets
    connections.push(socket);

    // disconnect
    socket.on('disconnect', (data)=> {
        connections.splice(connections.indexOf(socket), 1);
    });

    // client wants to make move
    socket.on('makeMove', (data) => {
        if(dg_interface.check_makeMove(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_receive());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    // client wants to rewind
    socket.on('rewind', (data) => {
        if(dg_interface.check_rewind(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_receive());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    // client rejects something
    socket.on('reject', (data) => {
        dg_interface.check_reject(data);
    });

    // client wants to share image
    socket.on('image', (data) => {
        if(dg_interface.check_image(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_receive());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    // client wants to save game
    socket.on('saveGame', (data) => {
        if(dg_interface.check_saveGame(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_receive());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to create new game
    socket.on('newGame', (data) => {

        if(dg_interface.check_newGame(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_receive());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    //client accepts invitation
    socket.on('accept', (data) => {

        if(dg_interface.check_accept(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_receive());
        }
    });

    //client accepts invitation
    socket.on('saveTurn', (data) => {
        //ok?
    });

    //client wants to end game
    socket.on('end', (data) => {
        //ok?
    });
});