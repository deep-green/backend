
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
let activeConnections = {};
let gameCounter = 1; //used to create a room id

server.listen(process.env.PORT || serverPort);

//helper function - setting of user token if it still is null
function setUserTokenIfNull(socketId, jwtToken) {
    if(activeConnections[socketId] == null) {
        activeConnections[socketId] = jwtToken;
    }
}

//helper function - get key in object by value
function getKeyByValue(object, value) {
    return Object.keys(object).find( (key) => {
        return object[key] === value;
    });
}

//socket ki clients
const socketKi1 = require('socket.io-client')('http://ec2-54-93-171-91.eu-central-1.compute.amazonaws.com:8008');
const socketKi2 = require('socket.io-client')('http://ec2-54-93-171-91.eu-central-1.compute.amazonaws.com:5000');

socketKi1.on('makeMove', (data) => {
    if(dg_interface.check_makeMove(data) === true) {
        setUserTokenIfNull(socketKi1.id, data.token);

        db_connector.ActiveGameData.findById(data.ID_game, 'socketRoom', (err, game)=> {
            if(err || !game.hasOwnProperty('socketRoom')) {
                socketKi1.emit('reject', dg_interface.emit_reject());
                return;
            }
            
            //send 'receive' to other player and all viewers watching the game
            socketKi1.to(game.socketRoom).emit('receive', dg_interface.emit_receive(data.FEN, data.ID_game, data.color));
            
        });

    } else {
        socketKi1.emit('reject', dg_interface.emit_reject());
    }
});

socketKi2.on('makeMove', (data) => {
    if(dg_interface.check_makeMove(data) === true) {
        setUserTokenIfNull(socketKi2.id, data.token);

        db_connector.ActiveGameData.findById(data.ID_game, 'socketRoom', (err, game)=> {
            if(err || !game.hasOwnProperty('socketRoom')) {
                socketKi2.emit('reject', dg_interface.emit_reject());
                return;
            }
            
            //send 'receive' to other player and all viewers watching the game
            socketKi2.to(game.socketRoom).emit('receive', dg_interface.emit_receive(data.FEN, data.ID_game, data.color));
            
        });

    } else {
        socketKi2.emit('reject', dg_interface.emit_reject());
    }
});

// socket server events 
io.on('connection', (client) => {

    //add new connection to activeConnections
    activeConnections[client.id] = null;
    
    //##### EVENT HANDLING #####

    // disconnect -> remove client from list
    client.on('disconnect', ()=> {
        delete activeConnections[client.id];
    });

    // client wants to make move
    client.on('makeMove', (data) => {
        if(dg_interface.check_makeMove(data) === true) {
            setUserTokenIfNull(client.id, data.token);

            db_connector.ActiveGameData.findById(data.ID_game, 'socketRoom', (err, game)=> {
                if(err || !game.hasOwnProperty('socketRoom')) {
                    client.emit('reject', dg_interface.emit_reject());
                    return;
                }
                
                let sendData = dg_interface.emit_receive(data.FEN, data.ID_game, data.color); 

                //send 'receive' to other player and all viewers watching the game
                client.to(game.socketRoom).emit('receive', sendData);
                
                if (data.ID_enemy === 'ki_1') {
                    socketKi1.emit('receive', sendData);
                } else if (data.ID_enemy === 'ki_2') {
                    socketKi2.emit('receive', sendData);
                }

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

            let newGameData = {};
            newGameData.socketRoom = 'game_' + gameCounter;
            gameCounter++;

            //if client wants to play against an AI
            if ((data.color === false) || (data.ID_enemy === 'ki_2')) {
                newGameData.whiteID = data.token;
                newGameData.blackID = data.ID_enemy;
            } else {
                newGameData.whiteID = data.ID_enemy;
                newGameData.blackID = data.token;
            }

            let newGame = new db_connector.ActiveGameData(newGameData);

            //register sockets in game room
            client.join(newGame.socketRoom);
            
            
            if((data.ID_enemy !== 'ki_1') && (data.ID_enemy !== 'ki_2')) {
                let enemySocket = io.sockets.connected[getKeyByValue(activeConnections, data.ID_enemy)]

                if(enemySocket) {
                    enemySocket.join(newGame.socketRoom);
                    client.emit('receive', dg_interface.emit_receive());

                    newGame.save((err, newGame) => {
                        if(err) {
                            console.error(err);
                            return;
                        } else {
                            console.log('new active game with id: ' + newGame._id);
                        }
                    });
                } else {
                    client.emit('reject', dg_interface.emit_reject());
                }
            } else {
                newGame.save((err, newGame) => {
                    if(err) {
                        console.error(err);
                        return;
                    } else {
                        console.log('new active game with id: ' + newGame._id);
                    }
                });
            }

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

    //log current connections to console
    console.log('--- active connections ---');
    for(connection in activeConnections) {
        console.log('Socket-ID = ' + connection + ' -- User-Token: ' + activeConnections[connection]);
    }
    console.log('--------------------------');

});
