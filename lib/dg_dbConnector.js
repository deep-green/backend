/** @module dg_dbConnector */

module.exports = {
    UserData,
    GameData,
    ActiveGameData
};

const db_path = 'mongodb://localhost/deepgreen'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(db_path);

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'database error: '))

db.once('open', ()=>{
  console.log('database connection established on ' + db_path);
});

let userDataSchema = new mongoose.Schema({
  _id:{type: Schema.Types.ObjectId, required: true},
  username: String,
  password: String,
  elo: Number,
  token: String
},
{collection: 'user'}
);

/** 
 * calulate the ELO-rating after a game and set the new value
 * 
 * @function
 * @property {Number}                     enemyElo    - The ELO-rating of the enemy player 
*/
userDataSchema.methods.calcElo = function(enemyElo) {
  if(enemyElo === Number) {
    let exp = (enemyElo - this.elo)/400;
    let factor = 1 / (1 + Math.pow(10, exp));
  
    this.elo = this.elo * factor;
  }
};

/**
 * creates a new user in the database
 * 
 * @function
 * @property {String}                     username    - The username of the new user
 * @property {String}                     password    - The password of the new user
 * @property {JWT-Token}                  token       - The JWT-Token of the new user
 */
userDataSchema.methods.createUser = function(username, password, token) {
  userData.create({ username: username, password: password, elo: '1000', token: token }, function (err) {
    if (err) {
      return "User konnte nicht angelegt werden: " + (err);
    }
    // created!
  });
}

/**
 * creates a guest account, which will be deleted once the user logs out
 * 
 * @function
 * @property {String}                     username    - The username of the new user
 * @property {JWT-Token}                  token       - The JWT-Token of the new user
 */
userDataSchema.methods.createGuest = function(token) {
  // Der Gast soll den Namen "guestXXXX" haben, XXXX = eine vierstellige Zahl
  let username = "guest" + Math.floor(Math.random() * Math.floor(9999));
  userData.create({ username: 'username', password: 'guest', elo: '1000', token: 'token'  }, function (err) {
    if (err) {
      return "Gast konnte nicht angelegt werden: " + (err);
    }
    // created!
  });
}

/**
 * @namespace
 * @property {Object}                   _id         - The primary key for a user (Mongoose.Types.ObjectId)
 * @property {String}                   username    - The name of the user
 * @property {String}                   password    - The password for the user account
 * @property {Number}                   elo         - The current ELO-rating of this user
 * @property {String}                   token       - The current JWT (JSON Web Token) of this user
 */

let UserData = mongoose.model('UserData', userDataSchema);

let gameDataSchema = new mongoose.Schema({ 
  _id: {type: Schema.Types.ObjectId, required: true},
  fen: [String],
  whiteID: String,
  blackID: String,
  winner: String
},
{collection: 'games'}
);

/**
 * @namespace
 * @property {Object}                   _id         - The primary key for a game (Mongoose.Types.ObjectId)
 * @property {String}                   fen[]       - An array of FEN-strings representing the whole game
 * @property {String}                   whiteID     - The name of the white player
 * @property {String}                   blackID     - The name of the black player
 * @property {String}                   winner      - The winner of the game (may be empty while game is not over)
 */
let GameData = mongoose.model('GameData', gameDataSchema);

let activeGameDataSchema = new mongoose.Schema({ 
  _id: {type: Schema.Types.ObjectId, required: true},
  whiteID: String,
  blackID: String,
  viewers: [String]
},
{collection: 'activeGames'}
);

/**
 * 
 * @param {*} whiteID
 * @param {*} blackID
 * @param {*} token
 */
activeGameDataSchema.methods.createActiveGame = function(whiteID, blackID, token) {
  ActiveGameData.create({whiteID = whiteID, blackID = blackID, token = token}, function (err) {
    if (err) {
      return "ActiveGame konnte nicht angelegt werden: " + (err);
    }
    // created!
  });
}

// Hier werden die Einladungen gehalten, bis sie angenommen werden
let openInvites = [];

// Example two dimensional Array:
// openInvite[0][0] = FEN vom ersten Invite im Array
// openInvite[2][1] = ID_enemy vom dritten Invite im Array
activeGameDataSchema.methods.createInvitation = function(FEN, ID_enemy) {
  
  // Neuen Invite im Array speichern
  let newArray = [FEN, ID_enemy];
  openInvites.push(newArray);

  // Invite an ID_enemy schicken
  // Wie zu realisieren?
  // Brauchen wir einen Listener auf der Client Seite?

  return "Einladung wurde verschickt ...";
}

activeGameDataSchema.methods.acceptInvitation = function(FEN, ID_enemy) {

}

/**
 * @namespace
 * @property {Object}                   _id         - The primary key for an active game (Mongoose.Types.ObjectId)
 * @property {String}                   whiteID     - The name of the white player
 * @property {String}                   blackID     - The name of the black player
 * @property {String}                   viewers[]   - An array of user names who are watching this game
 */
let ActiveGameData = mongoose.model('ActiveGameData', activeGameDataSchema);