const fs = require("fs");
const file = fs.createWriteStream("../big.txt");

for (let i = 0; i < 10000000; i++) {
    file.write("이 파일은 굉장히 큰 사이즈의 파일입니다.\n");
}
file.end();