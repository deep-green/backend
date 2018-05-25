test('the rust function hello() returns "hello node"', () => {
    var rustModule = require('../native');
    expect(rustModule.hello()).toEqual("hello node");
});
