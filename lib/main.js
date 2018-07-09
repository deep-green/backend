
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
const dg_interface = require('./dg_interface');
const dg_image = require('./dg_imageRecognition');
let activeConnections;
let pendingInvitations = [];
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
    console.log('--- active connections ---');
    for(connection in activeConnections) {
        console.log('Socket-ID = ' + connection + ' -- User-Token: ' + activeConnections[connection]);
    }
    console.log('--------------------------');

    //##### EVENT HANDLING #####

    // disconnect -> remove client from list
    client.on('disconnect', ()=> {
        activeConnections.splice(client.id, 1);
    });

    // client wants to make move
    client.on('makeMove', (id, data) => {
        if(dg_interface.check_makeMove(data) === true) {
            setUserTokenIfNull(id, data.token);

            db_connector.ActiveGameData.findById(data.ID_game, 'whiteID blackID socketRoom', (err, game)=> {
                if(err) {
                    client.emit('reject', dg_interface.emit_reject());
                    return;
                }
                
                
                client.emit('receive', dg_interface.emit_receive());
                
            });    
            

        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    // client wants to rewind
    client.on('rewind', (data) => {
        if(dg_interface.check_rewind(data) === true) {
            client.emit('receive', dg_interface.emit_receive());
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    // client rejects something
    client.on('reject', (data) => {
        dg_interface.check_reject(data);
    });

    // client wants to share image
    client.on('image', (data) => {
        if(dg_interface.check_image(data) === true) {
            setUserTokenIfNull(client.id, data.token);
            dg_image.getFEN(data.image, (__dirname + '/../../computervision/py_modules/chess_camera_04.py'))
                .then( (fenData) => {
                    client.emit('receive', dg_interface.emit_receive(fenData));
                }).catch (
                    client.emit('reject',dg_interface.emit_reject())
                );
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    // client wants to save game
    client.on('saveGame', (data) => {
        if(dg_interface.check_saveGame(data) === true) {
            client.emit('receive', dg_interface.emit_receive());
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to create new game
    client.on('newGame', (data) => {
        if(dg_interface.check_newGame(data) === true) {
            setUserTokenIfNull(client.id, data.token);
            client.emit('receive', dg_interface.emit_receive());
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    //client accepts invitation
    client.on('accept', (data) => {
        if(dg_interface.check_accept(data) === true) {
            ActiveGameData.create();
            client.emit('receive', dg_interface.emit_receive());
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    //client accepts invitation
    client.on('saveTurn', (data) => {
        if(dg_interface.check_saveTurn(data) === true) {
            client.emit('receive', dg_interface.emit_receive());
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to end game
    client.on('end', (data) => {
        if(dg_interface.check_end(data) === true) {
            client.emit('receive', dg_interface.emit_receive());
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to get all watchable games
    client.on('getGames', (data) => {
        if(dg_interface.check_getGames(data) === true) {
            dg_interface.emit_getGames().then( (gameData) => {
                client.emit('games', gameData);
            });
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    //client subscribes to game
    client.on('viewGame', (data) => {
        if(dg_interface.check_viewGame(data) === true) {
            setUserTokenIfNull(client.id, data.token);

            db_connector.ActiveGameData.findById(data.ID_game, 'viewers socketRoom', (err, game)=> {
                // an error occured while getting the game
                if(err) {
                    client.emit('reject', dg_interface.emit_reject());
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
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to login as a guest
    client.on('guestLogin', (data) => {
        if(dg_interface.check_guestLogin(data) === true) {
            client.emit('receive', dg_interface.emit_guestLogin());
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

});