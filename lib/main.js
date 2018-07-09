
//has to be removed by reading from config-file
const serverPort = 4999;

const server_options = {
    path: '/',
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000   
};

//mongoose
const db_connector = require('./dgDbConnector'); 

//create server, bind to socket.io and start listening
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, server_options);
const dg_interface = require('../lib/dg_interface');
let connections = [];

server.listen(process.env.PORT || serverPort);

io.sockets.on('connection', (client) => {
    // save connected sockets
    connections.push(client);
    
    console.log("--- current connections ---");
    for(item in connections) {
        console.log(item);
    }
    console.log("---------------------------");

    // disconnect
    client.on('disconnect', (data)=> {
        connections.splice(connections.indexOf(client), 1);
    });

    // client wants to make move
    client.on('makeMove', (data) => {
        if(dg_interface.check_makeMove(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_receive());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    // client wants to rewind
    client.on('rewind', (data) => {
        if(dg_interface.check_rewind(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_receive());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    // client rejects something
    client.on('reject', (data) => {
        dg_interface.check_reject(data);
    });

    // client wants to share image
    client.on('image', (data) => {
        if(dg_interface.check_image(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_receive());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    // client wants to save game
    client.on('saveGame', (data) => {
        if(dg_interface.check_saveGame(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_receive());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to create new game
    client.on('newGame', (data) => {
        if(dg_interface.check_newGame(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_receive());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    //client accepts invitation
    client.on('accept', (data) => {
        if(dg_interface.check_accept(data) == true) {
            ActiveGameData.create();
            io.sockets.emit('receive', dg_interface.emit_receive());
        }
    });

    //client accepts invitation
    client.on('saveTurn', (data) => {
        //ok?
    });

    //client wants to end game
    client.on('end', (data) => {
        //ok?
    });

    //client wants to register a new user
    client.on('register', (data) => {
        if(dg_interface.check_register(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_register());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to login as a guest
    client.on('guestLogin', (data) => {
        if(dg_interface.check_guestLogin(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_guestLogin());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to challenge another player
    client.on('invitation', (data) => {
        if(dg_interface.check_invitation(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_invitation());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to get all watchable games
    client.on('getGames', () => {
        //io.sockets.emit('games', '{}');
        db_connector.ActiveGameData.find().then(
            //fulfilled
            (data)=> {
                io.sockets.emit('games',data);
            }
        ).catch(
            (reason) => {
                io.sockets.emit('games','{}')
                console.error('getGames: ' + reason);
            }
        );
    });
});