
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
let activeConnections;
let gameCounter = 1; //used to create a room id

server.listen(process.env.PORT || serverPort);

//helper function - setting of user token if it still is null
function setUserTokenIfNull(socketId, jwtToken) {
    if(activeConnections[socketId] == null) {
        activeConnections[socketId] = jwtToken;
    }
}

io.on('connection', (client) => {

    //log current connections to console
    console.log('--- active connections ---')
    for(connection in activeConnections) {
        console.log('Socket-ID = ' + connection + ' -- User-Token: ' + activeConnections[connection]);
    }
    console.log('--------------------------')

    //##### EVENT HANDLING #####

    // disconnect -> remove client from list
    client.on('disconnect', ()=> {
        activeConnections.splice(client.id, 1);
    });

    // client wants to make move
    client.on('makeMove', (data) => {
        if(dg_interface.check_makeMove(data) == true) {
            setUserTokenIfNull(client.id, data.token);
            client.to(client.id).emit('receive', dg_interface.emit_receive());
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
            setUserTokenIfNull(client.id, data.token);
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
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    //client accepts invitation
    client.on('saveTurn', (data) => {
        if(dg_interface.check_saveTurn(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_receive());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to end game
    client.on('end', (data) => {
        if(dg_interface.check_end(data) == true) {
            io.sockets.emit('receive', dg_interface.emit_receive());
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to get all watchable games
    client.on('getGames', (data) => {
        if(dg_interface.check_getGames(data) == true) {
            dg_interface.emit_getGames().then( (gameData) => {
                io.sockets.emit('games', gameData);
            });
        } else {
            io.sockets.emit('reject', dg_interface.emit_reject());
        }
    });

    //client subscribes to game
    client.on('viewGame', (data) => {
        if(dg_interface.check_viewGame(data) == true) {
            setUserTokenIfNull(client.id, data.token);

            db_connector.ActiveGameData.findById(data.ID_game, 'viewers socketRoom', (err, game)=> {
                // an error occured while getting the game
                if(err) {
                    io.sockets.emit('reject', dg_interface.emit_reject());
                    return;
                }

                //join room (multicast group)
                if(game.socketRoom) {
                    client.join(game.socketRoom);
                }

                //add user to list in activeGame
                if(activeConnections[socketId].token != null) {
                    game.viewers.push(activeConnections[socketId].token);
                    db_connector.ActiveGameData.findByIdAndUpdate(data.ID_game, { viewers: game.viewers}).exec();
                }

            });
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

});