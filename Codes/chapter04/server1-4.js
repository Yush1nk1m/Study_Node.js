const http2 = require("http2");
const fs = require("fs");

http2.createSecureServer({
    cert: fs.readFileSync("도메인 인증서 경로"),    // 도메인 인증서 경로를 채운다.
    key: fs.readFileSync("도메인 비밀 키 경로"),    // 도메인 비밀 키 경로를 채운다.
    ca: [
        fs.readFileSync("상위 인증서 경로"),        // 상위 인증서 경로를 채운다.
        fs.readFileSync("상위 인증서 경로"),        // 상위 인증서 경로를 채운다.
    ],
}, (req, res) => {
    res.writeHead(200, { "Content-type": "text/html; charset=utf-8" });
    res.write("<h1>Hello Node!</h1>");
    res.end("<p>Hello Server!</p>");
})
    .listen(443, () => {   // 서버 연결
        console.log("443번 포트에서 서버 대기 중입니다.");
    });