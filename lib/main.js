const moveGenerator = require('../native');

//has to be removed by reading from config-file
const serverPort = 4999;

const server_options = {
    path: '/deep-green',
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000   
};

//create server, bind to socket.io and start listening
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, server_options);

server.listen(process.env.PORT || serverPort);

/**
 * TEST FUNCTION
 * @param {object} - testpar
 * @returns {number} - count
 */
function test(testpar) {
    return 1;
}