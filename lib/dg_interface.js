/** @module dg_interface */

module.exports = {
    emit_reject,
    emit_receive,
    emit_end,
    emit_register,
    emit_guestLogin,
    emit_invitation,
    emit_accept,

    newActiveGame,

    check_makeMove,
    check_rewind,
    check_reject,
    check_image,
    check_saveGame,
    check_newGame,
    check_accept,
    check_saveTurn,
    check_end,
    check_register,
    check_invitation,
    check_guestLogin
};

const dg_dbConnector = require('../lib/dg_dbConnector');

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
 * @param {string} - current game status in FEN notation
 * @param {number} - ID of the game to which the information belongs
 * @param {boolean} - tells the recipient which color he/she has (false = white, true = black)
 * @param {array} - contains all possible turns as strings (e.g. "e2e4")
 * 
 * @returns {object} object which contains the parameters in combined form
 */
function emit_receive(FEN, ID_game, color, turns) {
    let data = {
        FEN: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        ID_game: 2,
        color: false,
        turns: [
            "e2e4",
            "c2c4"
        ]
    };

    return data;
}

/**
 * Registration of a new user.
 * Puts a new user document into the database.
 * The user should be able to login.
 * 
 * @param {string} username - The username of the new user
 * @param {string} password - The password of the new user
 * @param 
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
 * @param {token} - JWT-Token
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
 * 
 * @param {*} whiteID - The user playing with white color
 * @param {*} blackID - The user playing the black color
 * @param {*} token - The JWT-Token
 * 
 * @returns {object} the created ActiveGame document (entity) from the database
 */
function newActiveGame(whiteID, blackID, token) {
    ActiveGameData.create({ whiteID, blackID, token }, function (err) {
        if (err) {
            return "Cannot create active game: \n" + (err);
        }
        // created!
    });

    return ActiveGameData.find({ token: token })
}

/**
 * Build invitation object for the communication interface.
 * Used to invite a player to a game.
 * 
 * @param {string} - initial board positions in FEN-notation
 * @param {string} - ID of the inviting player
 * 
 * @returns {object} object which contains the parameters in combined form
 */
function emit_invitation(FEN, ID_enemy) {
    /*
    let data = {
        FEN: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        ID_enemy: "maxmustermann"
    };

    return data;
    */

    // Example two dimensional Array:
    // openInvite[X][Y]
    // X = invite in array
    // Y = attribute of invite (FEN, ID_enemy,...)

    // Save new invite in array until it's handled
    let newArray = [FEN, ID_enemy];
    openInvites.push(newArray);

    return
}

function emit_accept() {
    // delete open invite from array
    openInvites.forEach(function (index) {
        if (index[1] == ID_enemy) {
            openInvites.splice(index, 1);
        }
    });
}

/**
 * Build receive object for the communication interface.
 * Used for sharing or confirming a move or a picture  
 * 
 * @param {string} - current game status in FEN notation
 * @param {number} - ID of the game to which the information belongs
 * @param {boolean} - tells the recipient which color he/she has (false = white, true = black)
 * @param {array} - contains all possible turns as strings (e.g. "e2e4")
 * 
 * @returns {object} object which contains the parameters in combined form
 */
function emit_end(reason, ID_game, ID_Player) {
    let data = {
        reason: "connection lost",
        ID_game: 2,
        ID_player: "heinrichmustermann"
    };

    return data;
}

/**
 * Parse "makeMove" message
 * 
 * @param {string} - the message string
 * @returns {boolean} true: message has correct format
 */
function check_makeMove(data) {
    let retVal = 1;

    if (typeof (data) !== 'object') {
        retVal = 0;
    } else {
        if (!data.hasOwnProperty('FEN')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('ID_game')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = 0;
        }
    }

    return retVal;
}

/**
 * Parse "rewind" message
 * 
 * @param {string} - the message string
 * @returns {boolean} true: message has correct format
 */
function check_rewind(data) {
    let retVal = 1;

    if (typeof (data) !== 'object') {
        retVal = 0;
    } else {
        if (!data.hasOwnProperty('turnCount')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('ID_game')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = 0;
        }
    }

    return retVal;
}

/**
 * Parse "reject" message
 * 
 * @param {string} - the message string
 * @returns {boolean} true: message has correct format
 */
function check_reject(data) {
    let retVal = 1;

    if (typeof (data) !== 'object') {
        retVal = 0;
    } else {
        if (!data.hasOwnProperty('token')) {
            retVal = 0;
        }
    }

    return retVal;
}

/**
 * Parse "image" message
 * 
 * @param {string} - the message string
 * @returns {boolean} true: message has correct format
 */
function check_image(data) {
    let retVal = 1;

    if (typeof (data) !== 'object') {
        retVal = 0;
    } else {
        if (!data.hasOwnProperty('image')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('color')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = 0;
        }
    }

    return retVal;
}

/**
 * Parse "saveGame" message
 * 
 * @param {string} - the message string
 * @returns {boolean} true: message has correct format
 */
function check_saveGame(data) {
    let retVal = 1;

    if (typeof (data) !== 'object') {
        retVal = 0;
    } else {
        if (!data.hasOwnProperty('ID_game')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = 0;
        }
    }

    return retVal;
}

/**
 * Parse "newGame" message
 * 
 * @param {string} - the message string
 * @returns {boolean} true: message has correct format
 */
function check_newGame(data) {
    let retVal = 1;

    if (typeof (data) !== 'object') {
        retVal = 0;
    } else {
        if (!data.hasOwnProperty('ID_enemy')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('color')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('FEN')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = 0;
        }
    }

    return retVal;
}

/**
 * Parse "accept" message
 * 
 * @param {string} - the message string
 * @returns {boolean} true: message has correct format
 */
function check_accept(data) {
    let retVal = 1;

    if (typeof (data) !== 'object') {
        retVal = 0;
    } else {
        if (!data.hasOwnProperty('ID_game')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = 0;
        }
    }

    return retVal;
}

/**
 * Parse "saveTurn" message
 * 
 * @param {string} - the message string
 * @returns {boolean} true: message has correct format
 */
function check_saveTurn(data) {
    let retVal = 1;

    if (typeof (data) !== 'object') {
        retVal = 0;
    } else {
        if (!data.hasOwnProperty('ID_game')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('turn')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = 0;
        }
    }

    return retVal;
}

/**
 * Parse "end" message
 * 
 * @param {string} - the message string
 * @returns {boolean} true: message has correct format
 */
function check_end(data) {
    let retVal = 1;

    if (typeof (data) !== 'object') {
        retVal = 0;
    } else {
        if (!data.hasOwnProperty('reason')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('ID_game')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = 0;
        }
    }

    return retVal;
}

/**
 * Parse "register" message
 * 
 * @param {string} - the message string
 * @returns {boolean} true: message has correct format
 */
function check_register(data) {
    let retVal = 1;

    if (typeof (data) !== 'object') {
        retVal = 0;
    } else {
        if (!data.hasOwnProperty('username')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('password')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('elo')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('token')) {
            retVal = 0;
        }
    }

    return retVal;
}

/**
 * Parse "guestLogin" message
 * 
 * @param {string} - the message string
 * @returns {boolean} true: message has correct format
 */
function check_guestLogin(data) {
    let retVal = 1;

    if (typeof (data) !== 'object') {
        retVal = 0;
    } else
        if (!data.hasOwnProperty('token')) {
            retVal = 0;
        }

    return retVal;
}

/**
 * Parse "invitation" message
 * 
 * @param {string} - the message string
 * 
 * @returns {boolean} true: message has correct format
 */
function check_invitation(data) {
    let retVal = 1;

    if (typeof (data) !== 'object') {
        retVal = 0;
    } else {
        if (!data.hasOwnProperty('FEN')) {
            retVal = 0;
        }

        if (!data.hasOwnProperty('ID_enemy')) {
            retVal = 0;
        }
    }

    return retVal;
}