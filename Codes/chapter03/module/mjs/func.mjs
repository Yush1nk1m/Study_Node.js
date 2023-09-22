import { odd, even } from "./var.mjs";

function checkOddOrEven(num) {
    if (num % 2 != 0) {
        return odd;
    }
    return even;
}

export default checkOddOrEven;