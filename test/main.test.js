const io_client = require('socket.io-client');
const http = require('http');
const io_backend = require('socket.io');
const dg_interface = require('../lib/dg_interface')

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
 * new connection for each test
 */
beforeEach(() => {
    // square brackets are used for IPv6
    socket = io_client.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
        'reconnection delay': 0,
        'reopen delay': 0,
        'force new connection': true,
        transports: ['websocket'],
    });
});

/** 
 * all defined commands for deep-green interface 
 */ 
describe('socket.io general communication', () => {

    /**
     * new connection for each test
     */
    beforeEach((done) => {
        socket.on('connect', () => {
            done();
        });
    });

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



describe('[backend -> client] interface communication', () => {

    /**
     * new connection for each test
     */
    beforeEach((done) => {
        socket.on('connect', () => {
            done();
        });
    });

    test('client gets valid "invitation" from backend', (done) => {
        let check_data = {
            "FEN": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "ID_enemy": "maxmustermann"
        };
        
        ioServer.emit('invitation', dg_interface.emit_invitation('',''));
    
        socket.once('invitation', (data) => {
            expect(data).toEqual(check_data);
            done();
        });

    });

    test('client gets valid "reject" from backend', (done) => {
        let check_data = { };
        
        ioServer.emit('reject', dg_interface.emit_reject());
    
        socket.once('reject', (data) => {
            expect(data).toEqual(check_data);
            done();
        });

    });

    test('client gets valid "receive" from backend', (done) => {
        let check_data = {
            "FEN": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "ID_game": 2,
            "color": false,
            "turns": [
              "e2e4",
              "c2c4"
            ]
          };
        
        ioServer.emit('receive', dg_interface.emit_receive());
    
        socket.once('receive', (data) => {
            expect(data).toEqual(check_data);
            done();
        });

    });

    test('client gets valid "end" from backend', (done) => {
        let check_data = {
            "reason": "connection lost",
            "ID_game": 2,
            "ID_player": "heinrichmustermann"
          };
        
        ioServer.emit('end', dg_interface.emit_end());
    
        socket.once('end', (data) => {
            expect(data).toEqual(check_data);
            done();
        });

    });

});



describe('[client -> backend] interface communication', () => {

    test('backend gets valid "makeMove"', (done) => {
        let check_data = {
            "FEN": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "ID_game": 2,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"  
        };
        
        socket.on('connect', () => {
            socket.emit('makeMove', check_data);
            done();
        })
    
        ioServer.on('makeMove', (data) => {
            expect(dg_interface.check_makeMove(data)).toBeTruthy;
        });

    });

    test('backend gets valid "rewind"', (done) => {
        let check_data = {
            "ID_game": 2,
            "turnCount": 4,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        };
        
        socket.on('connect', () => {
            socket.emit('rewind', check_data);
            done();
        })
    
        ioServer.on('rewind', (data) => {
            expect(dg_interface.check_rewind(data)).toBeTruthy;
        });

    });
});
