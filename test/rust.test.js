test('the rust function getMoves() returns "hello node"', () => {
    var moveGenerator = require('../native');
    expect(moveGenerator.getMoves()).toEqual("hello node");
});
