test('the rust function generateMoves() returns "hello node"', () => {
    var moveGenerator = require('../native');
    expect(moveGenerator.getMoves()).toEqual("hello node");
});
