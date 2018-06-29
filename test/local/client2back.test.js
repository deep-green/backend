const io_client = require('socket.io-client');
const http = require('http');
const io_backend = require('socket.io');
const dg_interface = require('../../lib/dg_interface')

const server_port = 4999;

let socket;
let httpServer;
let httpServerAddr;
let ioServer;
let serverConnection;

beforeAll((done) => {
    httpServer = http.createServer().listen(server_port);
    httpServerAddr = httpServer.address();
    ioServer = io_backend(httpServer);
});


afterAll((done) => {
    ioServer.close();
    httpServer.close();

    if (socket.connected) {
        socket.disconnect();
    };
});

describe('[client -> backend] interface communication', () => {

    test('backend gets valid "makeMove"', (done) => {
        let check_data = {
            "FEN": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "ID_game": 2,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"  
        };
           
        // square brackets are used for IPv6
        socket = io_client.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': true,
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            socket.emit('makeMove', check_data);
        });
        
        ioServer.on('connection', (socket) => {
            console.log('socket connected');
            socket.on('makeMove', (data) => {
                expect(dg_interface.check_makeMove(data)).toBe('bla');
                done();
            }); 
            done();
        }); 

    });
/*
    test('backend gets valid "rewind"', (done) => {
        let check_data = {
            "ID_game": 2,
            "turnCount": 4,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        };
        
        socket.on('connect', () => {
            socket.emit('rewind', check_data);
            done();
        });
    
        ioServer.on('rewind', (data) => {
            expect(dg_interface.check_rewind(data)).toBeTruthy;
        });

    });

    test('backend gets valid "image"', (done) => {
        let check_data = {
            "image": "fileserver/images/image.png",
            "color": false,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        };
        
        socket.on('connect', () => {
            socket.emit('image', check_data);
            done();
        });
    
        ioServer.on('image', (data) => {
            expect(dg_interface.check_image(data)).toBeTruthy;
        });

    });

    test('backend gets valid "saveGame"', (done) => {
        let check_data = {
            "ID_game": 2,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"  
        };
        
        socket.on('connect', () => {
            socket.emit('saveGame', check_data);
            done();
        });
    
        ioServer.on('saveGame', (data) => {
            expect(dg_interface.check_saveGame(data)).toBeTruthy;
        });

    });

    test('backend gets valid "newGame"', (done) => {
        let check_data = {
            "ID_enemy": "maxmustermann",
            "color": false,
            "FEN": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        };
        
        socket.on('connect', () => {
            socket.emit('newGame', check_data);
            done();
        });
    
        ioServer.on('newGame', (data) => {
            expect(dg_interface.check_newGame(data)).toBeTruthy;
        });

    });

    test('backend gets valid "accept"', (done) => {
        let check_data = {
            "ID_game": 2,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"  
        };
        
        socket.on('connect', () => {
            socket.emit('accept', check_data);
            done();
        });
    
        ioServer.on('accept', (data) => {
            expect(dg_interface.check_accept(data)).toBeTruthy;
        });

    });

    test('backend gets valid "saveTurn"', (done) => {
        let check_data = {
            "ID_game": 2,
            "turn": 4,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"   
        };
        
        socket.on('connect', () => {
            socket.emit('saveTurn', check_data);
            done();
        });
    
        ioServer.on('saveTurn', (data) => {
            expect(11).toBe(12);
        });

    });
    
    test('backend gets valid "end"', (done) => {
        let check_data = {
            "reason": "draw",
            "ID_game": 2,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"  
        };
        
        socket.on('connect', () => {
            socket.emit('end', check_data);
            done();
        });
    
        ioServer.on('end', (data) => {
            expect(dg_interface.check_newGame(data)).toBeFalsy;
        });

    });
    */
});

