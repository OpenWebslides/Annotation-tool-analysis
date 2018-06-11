const sum = require('./temp');

test('dummy test, this test should always succeed: adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
});