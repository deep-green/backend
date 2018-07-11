const dg_interface = require('../lib/dg_interface');

describe('socket.io general communication', () => {

    test('dummy', () => {
        expect(true).toBeTruthy;
    });

    test('move generator', () => {
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
});