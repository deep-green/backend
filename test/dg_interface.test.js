/** @module dg_interface.test */

const dg_interface = require('../lib/dg_interface');

describe('emitting functions for socket.io outgoing events', () => {

    describe('emit_reject()', () => {
        test('should return empty object', ()=> {
            let expectedData = {};

            let data = dg_interface.emit_reject();

            expect(data).toEqual(expectedData);
        });
    });

    describe('emit_receive()', () => {
        test('should return correct moves', () => {
            let expectedData = {
                FEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                ID_game: 1,
                color: true,
                turns: [
                    'a3a2',
                    'a4a2',
                    'b3b2',
                    'b4b2',
                    'c3c2',
                    'c4c2',
                    'd3d2',
                    'd4d2',
                    'e3e2',
                    'e4e2',
                    'f3f2',
                    'f4f2',
                    'g3g2',
                    'g4g2',
                    'h3h2',
                    'h4h2',
                    'a3b1',
                    'c3b1',
                    'f3g1',
                    'h3g1'
                ]
            };

            let data = dg_interface.emit_receive("", 1, true);
            
            expect(data).toEqual(expectedData);
        });

        test('gets 0 as game ID and should return undefined', () => {
            expect(dg_interface.emit_receive("", 0, true)).toBeFalsy();
        });
    });

    describe('emit_end()', () => {
        test('should return correct object', ()=> {
            let testReason = "connection lost";
            let testID_game = 2;
            let testID_Player = "heinrichmustermann";
            
            let expectedData = {
                reason: testReason,
                ID_game: testID_game,
                ID_Player: testID_Player
            };

            let data = dg_interface.emit_end(testReason, testID_game, testID_Player);

            expect(data).toEqual(expectedData);
        });
    });
    
    describe('emit_register()', () => {
        test('should return correct object', ()=> {
            let expectedData = {};

            let data = dg_interface.emit_register();

            expect(data).toEqual(expectedData);
        });
    });
    
    describe('emit_guestLogin()', () => {
        test('should return correct object', ()=> {
            let expectedData = {};

            let data = dg_interface.emit_guestLogin();

            expect(data).toEqual(expectedData);
        });
    });
    
    describe('emit_invitation()', () => {
        test('should return correct object', ()=> {
            let expectedData = {};

            let data = dg_interface.emit_invitation();

            expect(data).toEqual(expectedData);
        });
    });
    
    describe('emit_accept()', () => {
        test('should return correct object', ()=> {
            let expectedData = {};

            let data = dg_interface.emit_accept();

            expect(data).toEqual(expectedData);
        });
    });

    describe('emit_get()', () => {
        test('should return empty object (no DB connection)', (done)=> {
            let expectedData = {};

            let data = dg_interface.emit_getGames();

            expect(data).not.toEqual(expectedData);
            done();
        });
    });
    
});

describe('checking functions for socket.io incoming event data', () => { 

    describe('check_makeMove()', () => {
        test('should return false (no object)', ()=> {
            let data = 0;
            
            expect(dg_interface.check_makeMove(data)).toBeFalsy();
        });

        test('should return true', ()=> {
            let data = {
                FEN: 0,
                ID_game: 0,
                token: 0 
            };
            
            expect(dg_interface.check_makeMove(data)).toBeTruthy();
        });

        test('should return false', ()=> {
            let data = {
                FEN: 0,
                ID_game: 0
            };
            
            expect(dg_interface.check_makeMove(data)).toBeFalsy();
        });
    });

    describe('check_rewind()', () => {
        test('should return false (no object)', ()=> {
            let data = 0;
            
            expect(dg_interface.check_rewind(data)).toBeFalsy();
        });

        test('should return true', ()=> {
            let data = {
                turnCount: 0,
                ID_game: 0,
                token: 0 
            };
            
            expect(dg_interface.check_rewind(data)).toBeTruthy();
        });

        test('should return false', ()=> {
            let data = {
                turnCount: 0,
                ID_game: 0
            };
            
            expect(dg_interface.check_rewind(data)).toBeFalsy();
        });
    });

    describe('check_reject()', () => { 
        test('should return false (no object)', ()=> {
            let data = 0;
            
            expect(dg_interface.check_reject(data)).toBeFalsy();
        });

        test('should return true', ()=> {
            let data = {
                token: 0 
            };
            
            expect(dg_interface.check_reject(data)).toBeTruthy();
        });

        test('should return false', ()=> {
            let data = {};
            
            expect(dg_interface.check_reject(data)).toBeFalsy();
        });
    });

    describe('check_image()', () => { 
        test('should return false (no object)', ()=> {
            let data = 0;
            
            expect(dg_interface.check_image(data)).toBeFalsy();
        });

        test('should return true', ()=> {
            let data = {
                image: 0,
                color: 0,
                token: 0 
            };
            
            expect(dg_interface.check_image(data)).toBeTruthy();
        });

        test('should return false', ()=> {
            let data = {
                color: 0,
                token: 0 
            };
            
            expect(dg_interface.check_image(data)).toBeFalsy();
        });
    });

    describe('check_saveGame()', () => {
        test('should return false (no object)', ()=> {
            let data = 0;
            
            expect(dg_interface.check_saveGame(data)).toBeFalsy();
        });

        test('should return true', ()=> {
            let data = {
                ID_game: 0,
                token: 0 
            };
            
            expect(dg_interface.check_saveGame(data)).toBeTruthy();
        });

        test('should return false', ()=> {
            let data = {
                token: 0 
            };
            
            expect(dg_interface.check_saveGame(data)).toBeFalsy();
        });
    });

    describe('check_newGame()', () => {
        test('should return false (no object)', ()=> {
            let data = 0;
            
            expect(dg_interface.check_newGame(data)).toBeFalsy();
        });

        test('should return true', ()=> {
            let data = {
                ID_enemy: 0,
                color: 0,
                FEN: 0,
                token: 0 
            };
            
            expect(dg_interface.check_newGame(data)).toBeTruthy();
        });

        test('should return false', ()=> {
            let data = {
                color: 0,
                FEN: 0,
                token: 0 
            };
            
            expect(dg_interface.check_newGame(data)).toBeFalsy();
        });
    });

    describe('check_accept()', () => {
        test('should return false (no object)', ()=> {
            let data = 0;
            
            expect(dg_interface.check_accept(data)).toBeFalsy();
        });

        test('should return true', ()=> {
            let data = {
                ID_game: 0,
                token: 0 
            };
            
            expect(dg_interface.check_accept(data)).toBeTruthy();
        });

        test('should return false', ()=> {
            let data = {
                token: 0 
            };
            
            expect(dg_interface.check_accept(data)).toBeFalsy();
        });
    });

    describe('check_saveTurn()', () => {
        test('should return false (no object)', ()=> {
            let data = 0;
            
            expect(dg_interface.check_saveTurn(data)).toBeFalsy();
        });

        test('should return true', ()=> {
            let data = {
                ID_game: 0,
                turn: 0,
                token: 0 
            };
            
            expect(dg_interface.check_saveTurn(data)).toBeTruthy();
        });

        test('should return false', ()=> {
            let data = {
                turn: 0,
                token: 0 
            };
            
            expect(dg_interface.check_saveTurn(data)).toBeFalsy();
        });
    });

    describe('check_end()', () => {
        test('should return false (no object)', ()=> {
            let data = 0;
            
            expect(dg_interface.check_end(data)).toBeFalsy();
        });

        test('should return true', ()=> {
            let data = {
                reason: 0,
                ID_game: 0,
                token: 0 
            };
            
            expect(dg_interface.check_end(data)).toBeTruthy();
        });

        test('should return false', ()=> {
            let data = {
                ID_game: 0,
                token: 0 
            };
            
            expect(dg_interface.check_end(data)).toBeFalsy();
        });
    });

    describe('check_getGames()', () => {
        test('should return false (no object)', ()=> {
            let data = 0;
            
            expect(dg_interface.check_getGames(data)).toBeFalsy();
        });

        test('should return true', ()=> {
            let data = {
                token: 0 
            };
            
            expect(dg_interface.check_getGames(data)).toBeTruthy();
        });

        test('should return false', ()=> {
            let data = {};
            
            expect(dg_interface.check_getGames(data)).toBeFalsy();
        });
    });

    describe('check_viewGame()', () => {
        test('should return false (no object)', ()=> {
            let data = 0;
            
            expect(dg_interface.check_viewGame(data)).toBeFalsy();
        });

        test('should return true', ()=> {
            let data = {
                ID_game: 0,
                token: 0 
            };
            
            expect(dg_interface.check_viewGame(data)).toBeTruthy();
        });

        test('should return false', ()=> {
            let data = {
                token: 0
            };
            
            expect(dg_interface.check_viewGame(data)).toBeFalsy();
        });
    });

    describe('check_guestLogin()', () => {
        test('should return false (no object)', ()=> {
            let data = 0;
            
            expect(dg_interface.check_guestLogin(data)).toBeFalsy();
        });

        test('should return true', ()=> {
            let data = {
                token: 0 
            };
            
            expect(dg_interface.check_guestLogin(data)).toBeTruthy();
        });

        test('should return false', ()=> {
            let data = {};
            
            expect(dg_interface.check_guestLogin(data)).toBeFalsy();
        });
    });

});