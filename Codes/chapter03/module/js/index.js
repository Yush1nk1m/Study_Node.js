const { odd, even } = require('./var');
const checkNumber = require('./func');

function checkStringOddOrEven(str) {
    if (str.length % 2 != 0) {
        return odd;
    }
    return even;
}

console.log(`checkNumber(10): ${checkNumber(10)}`);
console.log(`checkStringOddOrEven("Hello"): ${checkStringOddOrEven("Hello")}`);