
beforeAll(() => {
    moveGenerator = require('../native');
})

test('the rust function getMoves() returns "hello node"', () => {  
    expect(moveGenerator.getMoves()).toEqual("hello node");
});
