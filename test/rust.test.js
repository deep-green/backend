
beforeAll(() => {
    moveGenerator = require('../native');
})

test('the rust function hello_node() returns "hello node"', () => {  
    expect(moveGenerator.hello_node()).toEqual("hello node");
});
