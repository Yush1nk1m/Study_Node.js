import { odd, even } from "./var.mjs";
import checkNumber from "./func.mjs";

function checkStringOddOrEven(str) {
    if (str.length % 2 != 0) {
        return odd;
    }
    return even;
}

console.log(`checkNumber(10): ${checkNumber(10)}`);
console.log(`checkStringOddOrEven("Hello"): ${checkStringOddOrEven("Hello")}`);