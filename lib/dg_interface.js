/** @module dg_interface */

const moveGenerator = require('../native');
const db_connector = require('./dgDbConnector');

// Holds open invitations
const openInvites = [];

/**
 * Build reject object for the communication interface.
 * Used to reject received command
 * 
 * @returns {object} empty object
 */
function emit_reject() {
    return {};
}

/**
 * Build receive object for the communication interface.
 * Used for sharing or confirming a move or a picture  
 * 
 * @param {string} fen - current game status in FEN notation
 * @param {number} id_game - ID of the game to which the information belongs
 * @param {boolean} color - tells the recipient which color he/she has (false = white, true = black)
 * 
 * @returns {object} object which contains the parameters in combined form
 */
function emit_receive(fen, id_game, color) {

    if (id_game <= 0) {
        return undefined;
    }

    let data = {
        FEN: fen,
        ID_game: id_game,
        color: color,
        turns: []
    };

    if((data.FEN === undefined) || (data.FEN === "") || (data.FEN.length == 4)) {
        data.FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    }

    data.turns = moveGenerator.getMoves(data.FEN).split(", ");

    return data;
}

/**
 * Registration of a new user.
 * Puts a new user document into the database.
 * The user should be able to login.
 * 
 * @param {string} username - The username of the new user
 * @param {string} password - The password of the new user
 * @param {token} token - JWT-Token
 * 
 * @returns {object} object which contains the parameters in combined form
 */
function emit_register(username, password, token) {
    let data = dg_dbConnector.userData.createUser(username, password, token);
    return data;
}

/**
 * Login as guest to deep green. Creats an "GuestXXX" account, where XXXX is a random number. Once the guest logouts, it will be deleted.
 * 
 * @param {token} token - JWT-Token
 * 
 * @returns {object} the created guest document (entity) from the database
 */
function emit_guestLogin(token) {
    // Create a GuestXXXX account. XXXX = 4 random digits
    let username = "guest" + Math.floor(Math.random() * Math.floor(9999));
    userData.create({ username: 'username', password: 'guest', elo: '1000', token: token }, function (err) {
        if (err) {
            return "Cannot create guest account: \n" + (err);
        }
        // created!
    });

    // return the created object by finding it trough the username
    return userData.find({ username: username });
}

/**
 * Build invitation object for the communication interface.
 * Used to invite a player to a game.
 * 
 * @param {string} FEN - initial board positions in FEN-notation
 * @param {string} ID_enemy - ID of the inviting player
 * 
 * @returns {object} object which contains the parameters in combined form
 */
function emit_invitation(FEN, ID_enemy) {

    if(FEN) {
        
    }
    return {
        FEN: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        ID_enemy: "maxmustermann"
    };
}

function emit_accept() {
    // delete open invite from array
    openInvites.forEach(function (index) {
        if (index[1] === ID_enemy) {
            openInvites.splice(index, 1);
        }
    });
}

/**
 * Build receive object for the communication interface.
 * Used for sharing or confirming a move or a picture  
 * 
 * @param {string} reason - current game status in FEN notation
 * @param {number} ID_game - ID of the game to which the information belongs
 * @param {boolean} ID_Player - tells the recipient which color he/she has (false = white, true = black)
 * 
 * @returns {object} object which contains the parameters in combined form
 */
function emit_end(reason, ID_game, ID_Player) {
    return {
        reason: "connection lost",
        ID_game: 2,
        ID_player: "heinrichmustermann"
    };
}

/**
 * Build receive object for the communication interface.
 * Used for sharing all active games with user
 * 
 * @returns {object} object which contains all active games
 */
function emit_getGames() {
    return new Promise((resolve, reject) => {

        db_connector.ActiveGameData.find().select().then( 
            (data) => {
                resolve(data);
            }
        ).catch(
            (reason) => {
                console.error('getGames: ' + reason);
                reject(reason);
            }
        );
    });
}

/**
 * Parse "makeMove" message
 * 
 * @param {string} data - the message string
 *
 * @returns {boolean} true: message has correct format
 */
function check_makeMove(data) {
    let retVal = true;

    if (typeof (data) !== 'object') {
        retVal = false;
    } else {
        if (!data.hasOwnProperty('FEN')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('ID_game')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = false;
        }
    }

    return retVal;
}

/**
 * Parse "rewind" message
 * 
 * @param {string} data - the message string
 * @returns {boolean} true: message has correct format
 */
function check_rewind(data) {
    let retVal = true;

    if (typeof (data) !== 'object') {
        retVal = false;
    } else {
        if (!data.hasOwnProperty('turnCount')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('ID_game')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = false;
        }
    }

    return retVal;
}

/**
 * Parse "reject" message
 * 
 * @param {string} data - the message string
 * @returns {boolean} true: message has correct format
 */
function check_reject(data) {
    let retVal = true;

    if (typeof (data) !== 'object') {
        retVal = false;
    } else {
        if (!data.hasOwnProperty('token')) {
            retVal = false;
        }
    }

    return retVal;
}

/**
 * Parse "image" message
 * 
 * @param {string} data - the message string
 * @returns {boolean} true: message has correct format
 */
function check_image(data) {
    let retVal = true;

    if (typeof (data) !== 'object') {
        retVal = false;
    } else {
        if (!data.hasOwnProperty('image')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('color')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = false;
        }
    }

    return retVal;
}

/**
 * Parse "saveGame" message
 * 
 * @param {string} data - the message string
 * @returns {boolean} true: message has correct format
 */
function check_saveGame(data) {
    let retVal = true;

    if (typeof (data) !== 'object') {
        retVal = false;
    } else {
        if (!data.hasOwnProperty('ID_game')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = false;
        }
    }

    return retVal;
}

/**
 * Parse "newGame" message
 * 
 * @param {string} data - the message string
 * @returns {boolean} true: message has correct format
 */
function check_newGame(data) {
    let retVal = true;

    if (typeof (data) !== 'object') {
        retVal = false;
    } else {
        if (!data.hasOwnProperty('ID_enemy')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('color')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('FEN')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = false;
        }
    }

    return retVal;
}

/**
 * Parse "accept" message
 * 
 * @param {string} data - the message string
 * @returns {boolean} true: message has correct format
 */
function check_accept(data) {
    let retVal = true;

    if (typeof (data) !== 'object') {
        retVal = false;
    } else {
        if (!data.hasOwnProperty('ID_game')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = false;
        }
    }

    return retVal;
}

/**
 * Parse "saveTurn" message
 * 
 * @param {string} data - the message string
 * @returns {boolean} true: message has correct format
 */
function check_saveTurn(data) {
    let retVal = true;

    if (typeof (data) !== 'object') {
        retVal = false;
    } else {
        if (!data.hasOwnProperty('ID_game')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('turn')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = false;
        }
    }

    return retVal;
}

/**
 * Parse "end" message
 * 
 * @param {string} data - the message string
 * @returns {boolean} true: message has correct format
 */
function check_end(data) {
    let retVal = true;

    if (typeof (data) !== 'object') {
        retVal = false;
    } else {
        if (!data.hasOwnProperty('reason')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('ID_game')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = false;
        }
    }

    return retVal;
}

/**
 * Parse "getGames" message
 * 
 * @param {string} data - the message string
 * @returns {boolean} true: message has correct format
 */
function check_getGames(data) {
    let retVal = true;

    if (typeof (data) !== 'object') {
        retVal = false;
    } else {
        if (!data.hasOwnProperty('token')) {
            retVal = false;
        }
    }

    return retVal;
}

/**
 * Parse "viewGame" message
 * 
 * @param {string} data - the message string
 * @returns {boolean} true: message has correct format
 */
function check_viewGame(data) {
    let retVal = true;

    if (typeof (data) !== 'object') {
        retVal = false;
    } else {
        if (!data.hasOwnProperty('ID_game')) {
            retVal = false;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = false;
        }
    }

    return retVal;    
}

/**
 * Parse "guestLogin" message
 * 
 * @param {string} data - the message string
 * @returns {boolean} true: message has correct format
 */
function check_guestLogin(data) {
    let retVal = true;

    if (typeof (data) !== 'object') {
        retVal = false;
    } else
        if (!data.hasOwnProperty('token')) {
            retVal = false;
        }

    return retVal;
}

module.exports = {
    emit_reject,
    emit_receive,
    emit_end,
    emit_register,
    emit_guestLogin,
    emit_invitation,
    emit_accept,
    emit_getGames,
    check_makeMove,
    check_rewind,
    check_reject,
    check_image,
    check_saveGame,
    check_newGame,
    check_accept,
    check_saveTurn,
    check_end,
    check_getGames,
    check_viewGame,
    check_guestLogin
};