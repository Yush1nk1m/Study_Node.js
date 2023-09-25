const fs = require("fs").promises;

fs.readdir("../folder")
    .then((dir) => {
        console.log("디렉터리 내용 확인:", dir);
        return fs.unlink("../folder/newfile.js");
    })
    .then(() => {
        console.log("파일 삭제 성공");
        return fs.rmdir("../folder");
    })
    .then(() => {
        console.log("디렉터리 삭제 성공");
    })
    .catch((err) => {
        console.error(err);
    });