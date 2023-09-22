const { odd, even } = require("./var");

function checkOddOrEven(num) {
    if (num % 2 != 0) {
        return odd;
    }
    return even;
}

module.exports = checkOddOrEven;