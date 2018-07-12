/** @module dg_interface.test */

const dg_interface = require('../lib/dg_interface');

describe('emitting functions for socket.io outgoing events', () => {

    test('emit_reject() should return empty object', ()=> {
        let expectedData = {};

        let data = dg_interface.emit_reject();

        expect(data).toEqual(expectedData);
    });

    test('emit_receive() should return correct moves', () => {
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
    
    test('emit_end() should return correct object', ()=> {
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
    
    test('emit_register() should return correct object', ()=> {
        let expectedData = {};

        let data = dg_interface.emit_register();

        expect(data).toEqual(expectedData);
    });
    
    test('emit_guestLogin() should return correct object', ()=> {
        let expectedData = {};

        let data = dg_interface.emit_guestLogin();

        expect(data).toEqual(expectedData);
    });
    
    test('emit_invitation() should return correct object', ()=> {
        let expectedData = {};

        let data = dg_interface.emit_invitation();

        expect(data).toEqual(expectedData);
    });
    
    test('emit_accept() should return correct object', ()=> {
        let expectedData = {};

        let data = dg_interface.emit_accept();

        expect(data).toEqual(expectedData);
    });
    
    test('emit_get() should return empty object (no DB connection)', (done)=> {
        let expectedData = {};

        let data = dg_interface.emit_getGames();

        expect(data).not.toEqual(expectedData);
        done();
    });
    
});
