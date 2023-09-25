const fs = require("fs").promises;

console.log("시작");

fs.readFile("../readme2.txt")
    .then((data) => {
        console.log("1번", data.toString());
    })
    .catch((err) => {
        throw err;
    });

fs.readFile("../readme2.txt")
    .then((data) => {
        console.log("2번", data.toString());
    })
    .catch((err) => {
        throw err;
    });

fs.readFile("../readme2.txt")
    .then((data) => {
        console.log("3번", data.toString());
    })
    .catch((err) => {
        throw err;
    });

console.log("끝");