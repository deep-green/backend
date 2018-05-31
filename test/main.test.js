const io_client = require('socket.io-client');
const http = require('http');
const io_backend = require('socket.io');

const server_port = 4999;

let socket;
let httpServer;
let httpServerAddr;
let ioServer;

/**
 * Setup socket.io & HTTP servers
 */
beforeAll((done) => {
    httpServer = http.createServer().listen(server_port);
    httpServerAddr = httpServer.listen().address();
    ioServer = io_backend(httpServer);
    done();
});

/**
 *  Close socket.io & HTTP servers
 */
afterAll((done) => {
    ioServer.close();
    httpServer.close();
    done();
});

/**
 * new connection for each test
 */
beforeEach((done) => {
    // square brackets are used for IPv6
    socket = io_client.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
        'reconnection delay': 0,
        'reopen delay': 0,
        'force new connection': true,
        transports: ['websocket'],
    });
    socket.on('connect', () => {
        done();
    });
});

/**
 * close connection after each test
 */
afterEach((done) => {
    // Cleanup
    if (socket.connected) {
        socket.disconnect();
    }
    done();
});

/** 
 * all defined commands for deep-green interface 
 */ 
describe('socket.io communication', () => {
  
    test('should communicate', (done) => {
        // once connected, emit Hello World
        ioServer.emit('echo', 'Hello World');

        socket.once('echo', (message) => {
            // Check that the message matches
            expect(message).toBe('Hello World');
            done();
        });

        ioServer.on('connection', (new_socket) => {
            expect(new_socket).toBeDefined();
        });
    });

});





