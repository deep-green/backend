const util = require('util');

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
const mongoose = require('mongoose');

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

//socket client for AI 1 (tensorflow)
const socketAi1 = require('socket.io-client')('http://ec2-54-93-171-91.eu-central-1.compute.amazonaws.com:8008');

socketAi1.on('connect', ()=> {
    console.log('connected to AI 1 ...');
});

socketAi1.on('makeMove', (data) => {
    console.log('AI 1 -> makeMove: ' + util.inspect(data, {showHidden: false, depth: null}));

    db_connector.ActiveGameData.findById(data.ID_game, 'socketRoom', (err, game)=> {
        if(err || (game.socketRoom === undefined)) {
            socketAi1.emit('reject', dg_interface.emit_reject());
        } else {
            //send 'receive' to other player and all viewers watching the game
            console.log('AI 1 -> send "receive" to all users/players in ' + game.socketRoom);
            io.of('/').in(game.socketRoom).emit('receive', dg_interface.emit_receive(data.FEN, data.ID_game, false));
        }
    });
});

//socket client for AI 2 (minimax)
const socketAi2 = require('socket.io-client')('http://localhost:5000');

socketAi2.on('connect', ()=> {
    console.log('connected to AI 2...');
});

socketAi2.on('makeMove', (data) => {
    console.log('AI 2 -> makeMove: ' + util.inspect(data, {showHidden: false, depth: null}));

    db_connector.ActiveGameData.findById(data.ID_game, 'socketRoom', (err, game)=> {
        if(err || (game.socketRoom === undefined)) {
            socketAi2.emit('reject', dg_interface.emit_reject());
        } else {
            //send 'receive' to other player and all viewers watching the game
            console.log('AI 2 -> send "receive" to all users/players in ' + game.socketRoom);
            io.of('/').in(game.socketRoom).emit('receive', dg_interface.emit_receive(data.FEN, data.ID_game, false));
        }
    });
});

// socket server events 
io.on('connection', (client) => {

    //add new connection to activeConnections
    activeConnections[client.id] = null;
    
    //##### EVENT HANDLING #####

    // disconnect -> remove client from list
    client.on('disconnect', ()=> {
        console.log(activeConnections[client.id] + ' disconnected');

        db_connector.ActiveGameData.find(activeConnections[client.id],'socketRoom', (resultSet)=> {

            //if there are still active games with the disconnecting user as a player
            if(resultSet) {
                for(item of resultSet) {
                    db_connector.ActiveGameData.findByIdAndRemove(item._id, (err, game)=> {
                        // an error occured while getting the game
                        if(err) {
                            console.log('error while finding game to delete');
                        } else if((game._id !== undefined) && (game.socketRoom !== undefined)) {
                            console.log('deleted game ' + game._id + ' after disconnect without "end"');
                            client.to(game.socketRoom).emit('end', {reason:'con_lost', ID_game: game._id, token: activeConnections[client.id]});
                        }
                    });
                }
            }
        });

        delete activeConnections[client.id];
    });

    // client wants to make move
    client.on('makeMove', (data) => {
        if(dg_interface.check_makeMove(data) === true) {
            console.log('received "makeMove" for game ' + data.ID_game);
            setUserTokenIfNull(client.id, data.token);

            db_connector.ActiveGameData.findById(data.ID_game, 'socketRoom whiteID blackID', (err, game)=> {
                console.log('find game by id: ' + game);

                if(err || (game.socketRoom === undefined)) {
                    console.log('reject after makeMove due to error finding game in db');
                    client.emit('reject', dg_interface.emit_reject());
                } else {
                    let sendData = dg_interface.emit_receive(data.FEN, data.ID_game, false); 

                    //send 'receive' to other player and all viewers watching the game
                    client.to(game.socketRoom).emit('receive', sendData);
                    client.emit('receive', sendData);

                    if(game.whiteID === 'ki_1' || game.blackID === 'ki_1') {
                        socketAi1.emit('receive', sendData);
                    } else if (game.whiteID === 'ki_2' || game.blackID === 'ki_2') {
                        console.log('emit "receive" to AI 2');
                        socketAi2.emit('receive', sendData);
                    }
                }
            });
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    // client wants to rewind
    client.on('rewind', (data) => {
        if(dg_interface.check_rewind(data) === true) {
            console.log('received "rewind" from ' + data.token);
            client.emit('receive', dg_interface.emit_receive(data.FEN, data.ID_game, data.color));
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    // client rejects something
    client.on('reject', (data) => {
        console.log('received "reject" from ' + data.token);
        dg_interface.check_reject(data);
    });

    // client wants to share image
    client.on('image', (data) => {
        if(dg_interface.check_image(data) === true) {
            console.log('received "image" from ' + data.token);
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
            console.log('received "saveGame" from ' + data.token);
            client.emit('receive', dg_interface.emit_receive());
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to create new game
    client.on('newGame', (data) => {
        if(dg_interface.check_newGame(data) === true) {

            console.log('got "newGame" by ' + data.token);
            setUserTokenIfNull(client.id, data.token);

            let newGameData = {};
            newGameData.socketRoom = 'game_' + gameCounter;
            newGameData._id = new mongoose.Types.ObjectId();
            console.log('created new document id: ' + newGameData._id);
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

                    newGame.save((err, game) => {
                        if(err) {
                            console.error(err);
                        } else {
                            console.log('new active game with id: ' + game._id);
                            client.emit('receive', dg_interface.emit_receive(data.FEN, game._id, data.color));
                        }
                    });
                } else {
                    client.emit('reject', dg_interface.emit_reject());
                }
            } else {
                newGame.save((err, game) => {
                    if(err) {
                        console.error(err);
                    } else {
                        console.log('new active game with id: ' + game._id);
                        client.emit('receive', dg_interface.emit_receive(data.FEN, game._id, data.color));
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
            console.log('received "accept" from ' + data.token);
            ActiveGameData.create();
            client.emit('receive', dg_interface.emit_receive(data.FEN, data.ID_game, data.color));
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    //client accepts invitation
    client.on('saveTurn', (data) => {
        if(dg_interface.check_saveTurn(data) === true) {
            console.log('received "saveTurn" from ' + data.token);
            client.emit('receive', dg_interface.emit_receive(data.FEN, data.ID_game, data.color));
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to end game
    client.on('end', (data) => {
        if(dg_interface.check_end(data) === true) {
            console.log('received "end" from ' + data.token);
            db_connector.ActiveGameData.findByIdAndRemove(data.ID_game, (err, game)=> {
                if(err) {
                    client.emit('reject', dg_interface.emit_reject());
                } else if(game) {
                    console.log('deleted game ' + game._id + ' after "end"');
                    client.to(game.socketRoom).emit('end', data);
                } else {
                    client.emit('reject', dg_interface.emit_reject());
                }
            });
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to get all watchable games
    client.on('getGames', (data) => {
        if(dg_interface.check_getGames(data) === true) {
            console.log('received "getGames" from ' + data.token);
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
            console.log('received "viewGame" from ' + data.token);
            setUserTokenIfNull(client.id, data.token);

            db_connector.ActiveGameData.findById(data.ID_game, 'viewers socketRoom', (err, game)=> {
                // an error occured while getting the game
                if(err) {
                    client.emit('reject', dg_interface.emit_reject());
                } else {
                    //join room (multicast group)
                    if(game.socketRoom) {
                        client.join(game.socketRoom);
                    }

                    //add user to list in activeGame
                    if(activeConnections[socketId].token != null) {
                        game.viewers.push(activeConnections[socketId].token);
                        db_connector.ActiveGameData.findByIdAndUpdate(data.ID_game, { viewers: game.viewers}).exec();
                    }
                }
            });
        } else {
            client.emit('reject', dg_interface.emit_reject());
        }
    });

    //client wants to login as a guest
    client.on('guestLogin', (data) => {
        console.log('received "guestLogin" from ' + data.token);
        if(dg_interface.check_guestLogin(data) === true) {
            console.log('received "guestLogin" from ' + data.token);
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
