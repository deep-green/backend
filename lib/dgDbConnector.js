/** @module dg_dbConnector */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const db_path = 'mongodb://sw:mF4R7mHWmlWC4tMH@sw-shard-00-00-c7cxn.mongodb.net:27017,' +
'sw-shard-00-01-c7cxn.mongodb.net:27017,s' +
'w-shard-00-02-c7cxn.mongodb.net:27017/test' +
'?ssl=true&replicaSet=sw-shard-0&authSource=admin&retryWrites=true';

//handle database connection
mongoose.connect(db_path, {useNewUrlParser: true});

let db = mongoose.connection; 
 
db.on('error', console.error.bind(console, 'database error: ')) 
 
db.once('open', () => { 
  console.log('database connection established on ' + db_path); 
});

/**
 * @namespace
 * @property {Object}                   _id         - The primary key for a user (Mongoose.Types.ObjectId)
 * @property {String}                   username    - The name of the user
 * @property {String}                   password    - The password for the user account
 * @property {Number}                   elo         - The current ELO-rating of this user
 * @property {String}                   token       - The current JWT (JSON Web Token) of this user
 */
let userDataSchema = new mongoose.Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  username: String,
  password: String,
  elo: Number,
  token: String
},
  { collection: 'user' }
);

/** 
 * calulate the ELO-rating after a game and set the new value
 * 
 * @function
 * @property {Number}                     enemyElo    - The ELO-rating of the enemy player
 * @property {Number}                     result      - The result of the game. If player wins then "1", if enemy wins then "0", if remi then "0,5"
 * 
 * @returns {number} the new calculated elo which is also written in the database
 */
userDataSchema.methods.calcElo = function (enemyElo, result) {
  if (enemyElo === Number) {
    let exp = (enemyElo - this.elo) / 400;
    let median = 1 / (1 + Math.pow(10, exp));

    this.elo = this.elo + (10 * (result - median));
  }

  return this.elo;
};

/**
 * @namespace
 * @property {Object}                   _id         - The primary key for a game (Mongoose.Types.ObjectId)
 * @property {String}                   fen[]       - An array of FEN-strings representing the whole game
 * @property {String}                   whiteID     - The name of the white player
 * @property {String}                   blackID     - The name of the black player
 * @property {String}                   winner      - The winner of the game (may be empty while game is not over)
 */
let gameDataSchema = new mongoose.Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  fen: [String],
  whiteID: String,
  blackID: String,
  winner: String
},
  { collection: 'games' }
);

/**
 * @namespace
 * @property {Object}                   _id         - The primary key for an active game (Mongoose.Types.ObjectId)
 * @property {String}                   whiteID     - The name of the white player
 * @property {String}                   blackID     - The name of the black player
 * @property {String}                   viewers[]   - An array of user names who are watching this game
 */
let activeGameDataSchema = new mongoose.Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  whiteID: String,
  blackID: String,
  viewers: [String],
  socketRoom: String
},
  { collection: 'activeGames' }
);

//exports of all models
module.exports.UserData = mongoose.model('UserData', userDataSchema);
module.exports.GameData = mongoose.model('GameData', gameDataSchema);
module.exports.ActiveGameData = mongoose.model('ActiveGameData', activeGameDataSchema);