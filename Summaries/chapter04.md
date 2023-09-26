# Node.js 교과서 4장 요약
## *http 모듈로 서버 만들기*
- - -

## 4.1 요청과 응답 이해하기

![Alt text](image.png)

서버는 클라이언트가 있기에 동작한다. 클라이언트는 서버로 **요청(request)** 을 보내고, 서버는 요청의 내용을 읽고 처리한 뒤 클라이언트에게 **응답(response)** 을 보낸다.

따라서 서버엔 요청을 받는 부분과 응답을 보내는 부분이 있어야 한다. 요청과 응답은 이벤트 방식으로 여겨질 수 있다. 클라이언트로부터 요청이 왔을 때 어떤 작업을 수행할지 이벤트 리스너를 미리 등록해 두어야 한다.

**createServer.js**
```
const http = require("http");

http.createServer((req, res) => {
    // 여기에 어떻게 응답할지 기술한다.
});
```

위 코드는 이벤트 리스너를 가진 노드 서버를 만들기 위한 템플릿 코드이다.

`http` 모듈을 사용하여 웹 브라우저의 요청을 처리할 수 있는 http 서버를 생성했다. `createServer` 메소드를 사용하여 인수로 요청에 대한 콜백 함수를 전달할 수 있으며, 요청이 들어올 때마다 매번 콜백 함수가 실행된다. 따라서 이 콜백 함수에 요청에 대한 응답을 기술하면 된다.

다음 예제로 응답을 보내는 부분과 서버 연결 부분을 추가한다.

**server1.js**
```
const http = require("http");

http.createServer((req, res) => {
    res.writeHead(200, { "Content-type": "text/html; charset=utf-8" });
    res.write("<h1>Hello Node!</h1>");
    res.end("<p>Hello Server!</p>");
})
    .listen(8080, () => {   // 서버 연결
        console.log("8080번 포트에서 서버 대기 중입니다.");
    });
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter04> node server1
8080번 포트에서 서버 대기 중입니다.
```

![Alt text](image-1.png)

브라우저를 실행하고 **http://localhost:8080/** 에 접속하면 위와 같은 화면이 나타난다. `Ctrl`+`C`를 입력하여 서버를 종료할 수 있다.

`createServer` 메소드 안에는 요청에 대한 응답을 정의하고, 메소드 뒤에는 `listen` 메소드를 붙여 그 안에 클라이언트에게 공개할 포트 번호와 포트 연결 후 실행될 콜백 함수를 전달한다. 프로그램을 실행하면 서버는 8080번 포트에서 요청을 기다린다.

`res` 객체에는 `res.writeHead`, `res.write`, `res.end` 메소드가 있다.

`res.writeHead`는 응답에 대한 정보를 기록하는 메소드이다. 첫 번째 인수로는 성공적인 요청임을 의미하는 `200`을, 두 번째 인수로는 응답에 대한 정보를 보낸다. 코드에서는 두 번째 인수에서 콘텐츠의 형식이 HTML임을 알리고 있다. 또한, 한글 표시를 위해 charset을 utf-8로 지정했다. 이러한 정보가 기록되는 부분을 `헤더(header)`라고 한다.

`res.write`의 첫 번째 인수는 클라이언트로 보낼 데이터이다. 예제에서는 HTML 모양의 문자열을 보냈지만 버퍼를 보낼 수도 있다. 또한, 여러 번 호출해서 데이터를 여러 개 보내도 된다. 데이터가 기록되는 부분을 `본문(body)`이라고 한다.

`res.end`는 응답을 종료한다. 만약 인수가 있다면 그 데이터까지 클라이언트로 보낸다. 브라우저는 응답 내용을 받아서 렌더링한다.

`listen` 메소드에 콜백 함수를 넣는 대신 다음 예제와 같이 서버에 `listening` 이벤트 리스너를 등록해도 된다. 추가로 `error` 이벤트 리스너도 등록하였다.

**server1-1.js**
```
const http = require("http");

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.write("<h1>Hello Node!</h1>");
    res.end("<p>Hello Server!</p>");
});

server.listen(8080);

server.on("listening", () => {
    console.log("8080번 포트에서 서버 대기 중입니다.");
});

server.on("error", (error) => {
    console.error(error);
});
```

다음과 같이 한 번에 여러 개의 서버를 실행할 수도 있다. `createServer`를 원하는 만큼 호출하면 된다.

**server1-2.js**
```
const http = require("http");

http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.write("<h1>Hello Node!</h1>");
    res.end("<p>Hello Server!</p>");
})
    .listen(8080, () => {
        console.log("8080번 포트에서 서버 대기 중입니다.");
    });

http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.write("<h1>Hello Node!</h1>");
    res.end("<p>Hello Server!</p>");
})
    .listen(8081, () => {
        console.log("8081번 포트에서 서버 대기 중입니다.");
    });    
```

이때 포트 번호는 반드시 달라야 한다. 포트 번호가 같을 시엔 `EADDRINUSE` 에러가 발생한다. 단, 실무에서 이런 식으로 서버를 여러 개 띄우는 일은 드물다.

`res.write`와 `res.end`에 일일이 HTML 코드를 적는 것은 비효율적이므로 미리 HTML 파일을 만들어 두고, `fs` 모듈을 사용하여 전송하는 것이 바람직하다. 다음 예제를 통해 HTML 파일을 전송하는 방법을 알아본다.

**server2.html**
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Node.js 웹 서버</title>
</head>
<body>
    <h1>Node.js 웹 서버</h1>
    <p>테스트 코드입니다.</p>
</body>
</html>
```

**server2.js**
```
const http = require("http");
const fs = require("fs").promises;

http.createServer(async (req, res) => {
    try {
        const data = await fs.readFile("./html/server2.html");
        res.end(data);
    } catch (err) {
        console.error(err);
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(err.message);
    }
})
    .listen(8081, () => {
        console.log("8081번 포트에서 서버 대기 중입니다.");
    });
```

![Alt text](image-2.png)

요청이 들어올 시 먼저 `fs` 모듈로 HTML 파일을 읽는다. `data` 변수에 저장된 버퍼를 그대로 클라이언트에 보내면 된다. 이전 예제들에서는 문자열을 보냈지만 버퍼를 직접 보낼 수도 있다. 에러 메시지를 출력할 때는 일반 문자열이므로 `text/plain`을 사용했다.

**HTTP 상태 코드**: 200이나 500과 같은 숫자는 HTTP 상태 코드라고 부른다. `res.writeHead`의 첫 번째 인수로 상태 코드를 넣었는데, 브라우저는 서버에서 보내주는 상태 코드를 보고 요청이 성공했는지 실패했는지를 판단한다.

- **2XX**: 성공을 알리는 상태 코드이다. 200(성공), 201(작성됨)이 많이 사용된다.
- **3XX**: 리다이렉션을 알리는 상태 코드이다. 어떤 주소를 입력했는데 다른 주소의 페이지로 넘어갈 때 이 코드가 사용된다. 대표적으로 301(영구 이동), 302(임시 이동)가 있다. 304(수정되지 않음)는 요청의 응답으로 캐시를 사용했다는 뜻이다.
- **4XX**: 요청 오류를 나타낸다. 요청 자체에 오류가 있을 때 표시된다. 대표적으로 400(잘못된 요청), 401(권한 없음), 403(금지됨), 404(찾을 수 없음)가 있다.
- **5XX**: 서버 오류를 나타낸다. 요청은 제대로 받았지만 서버에 오류가 생겼을 때 발생한다. 이 오류를 `res.writeHead`를 이용하여 클라이언트에 직접 보내는 경우는 거의 없고, 예기치 못한 에러가 발생하면 서버가 알아서 5XX대 코드를 보낸다. 500(내부 서버 오류), 502(불량 게이트웨이), 503(서비스를 사용할 수 없음)이 자주 사용된다.

>요청 처리 중에 에러가 발생했다고 해서 응답을 보내지 않으면 안 된다. 응답을 무조건 클라이언트로 보내서 요청이 마무리되었음을 알려야 한다. 아니면 클라이언트는 일정 시간 기다리다가 Timeout(시간 초과) 처리한다.

지금까지는 모든 요청에 대해 한 가지 응답밖에 할 수 없는 경우를 살펴보았다. 다음 절에서는 요청별로 다른 응답을 하는 방법을 알아본다.
- - -

## 4.2 REST와 라우팅 사용하기

서버에 요청을 보낼 때는 주소를 통해 요청의 내용을 표현한다. 예를 들어 `/index.html`은 서버의 index.html이라는 파일을 보내달라는 의미이고, `/about.html`이면 서버의 about.html이라는 파일을 보내달라는 의미이다.

그러나 항상 html 파일만 요청할 필요는 없다. css나 js 또는 이미지 파일 등을 요청할 수도 있고, 어떤 동작을 행하라고 요청할 수도 있다. 요청의 내용이 주소를 통해 표현되므로 서버가 이해하기 쉬운 주소를 사용하는 것이 좋다. 여기서 `REST`라는 개념이 등장한다. 주소는 의미를 명확히 전달하기 위해 명사로 구성된다. `/user`라면 사용자 정보에 관련된 자원을, `/post`라면 게시글과 관련된 자원을 요청하는 것이라고 추측할 수 있다.

`REST(Representational State Transfer)`: 서버의 자원을 정의하고 자원에 대한 주소를 지정하는 방법을 가리킨다. 자원이란 꼭 파일만을 의미하지 않고, 서버가 행할 수 있는 모든 것들을 통틀어 의미한다.

**요청 메소드**
- `GET`: 서버 자원을 가져오고자 할 때 사용한다. **요청의 본문(body)에 데이터를 넣지 않는다.** 데이터를 서버로 보내야 한다면 쿼리스트링을 사용한다.
- `POST`: 서버에 자원을 새로 등록하고자 할 때 사용한다. **요청의 본문에 새로 등록할 데이터를 넣어 보낸다.**
- `PUT`: 서버의 자원을 요청에 들어 있는 자원으로 치환하고자 할 때 사용한다. **요청의 본문에 치환할 데이터를 넣어 보낸다.**
- `PATCH`: 서버 자원의 일부만 수정하고자 할 때 사용한다. **요청의 본문에 일부 수정할 데이터를 넣어 보낸다.**
- `DELETE`: 서버의 자원을 삭제하고자 할 때 사용한다. **요청의 본문에 데이터를 넣지 않는다.**
- `OPTIONS`: 요청을 하기 전에 통신 옵션을 설명하기 위해 사용한다.

만약 위의 메소드로 표현하기 애매한 동작이 있다면 `POST`를 사용하면 된다. 이렇게 주소와 메소드만 보고 요청의 내용을 알아볼 수 있는 것이 장점이며, `GET` 메소드 같은 경우엔 브라우저에서 캐싱할 수도 있어 좋은 성능을 누릴 수도 있다.

HTTP 통신을 사용하면 서버와 클라이언트가 분리되어, 클라이언트가 누구든 상관없이 같은 방식으로 서버와 소통할 수 있다. 따라서 서버를 확장할 때 클라이언트에 종속적이지 않아 좋다.

이제 `REST`를 사용한 주소 체계로 **RESTful**한 서버를 만들어 본다. 코드를 작성하기 전에 다음과 같이 대략적인 주소를 먼저 설계하는 것이 좋다. 주소 구조를 미리 정리해둔 후 코딩을 시작하면 구조적으로 더욱 깔끔한 프로그램을 작성할 수 있다.

| HTTP 메소드 | 주소 | 역할 |
| :-- | :-- | :-- |
| GET | / | **restFront.html** 파일 제공 |
| GET | /about | **about.html** 파일 제공 |
| GET | /users | 사용자 목록 제공 |
| GET | 기타 | 기타 정적 파일 제공 |
| POST | /user | 사용자 등록 |
| PUT | /user/사용자id | 해당 id의 사용자 수정 |
| DELETE | /user/사용자id | 해당 id의 사용자 제거 |

다음으로는 필요한 파일들을 작성한다.

**restFront.css**
```
a {
    color: blue;
    text-decoration: none;
}
```

**restFront.html**
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RESTful SERVER</title>
    <link rel="stylesheet" href="../css/restFront.css" />
</head>
<body>
    <nav>
        <a href="/">home</a>
        <a href="/about">About</a>
    </nav>
    
    <div>
        <form id="form">
            <input type="text" id="username">
            <button type="submit">등록</button>
        </form>
    </div>

    <div id="list">
    </div>

    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script src="../js/restFront.js"></script>
</body>
</html>
```

**restFront.js**
```
async function getUser() {      // 로딩 시 사용자 정보를 가져오는 함수
    try {
        const res = await axios.get("/users");
        const users = res.data;
        const list = document.getElementById("list");
        list.innerHTML = '';

        // 사용자마다 반복적으로 화면 표시 및 이벤트 연결
        Object.keys(users).map((key) => {
            const userDiv = document.createElement("div");
            
            const span = document.createElement("span");
            span.textContent = users[key];

            const edit = document.createElement("button");
            edit.textContent = "수정";
            edit.addEventListener("click", async () => {        // 수정 버튼 클릭
                const name = prompt("바꿀 이름을 입력하세요.");

                if (!name) {
                    return alert("이름을 반드시 입력해야 합니다.");
                }

                try {
                    await axios.put("/user/" + key, { name });
                    getUser();      // 사용자 목록 갱신
                } catch (err) {
                    console.error(err);
                }
            });

            const remove = document.createElement("button");
            remove.textContent = "삭제";
            remove.addEventListener("click", async () => {      // 삭제 버튼 클릭
                try {
                    await axios.delete("/user/" + key);
                    getUser();      // 사용자 목록 갱신
                } catch (err) {
                    console.error(err);
                }
            });

            userDiv.appendChild(span);
            userDiv.appendChild(edit);
            userDiv.appendChild(remove);
            list.appendChild(userDiv);

            console.log(res.data);
        });
    } catch (err) {
        console.error(err);
    }
}

window.onload = getUser;    // 화면 로딩 시 getUser 호출

// 폼 제출(submit) 시 실행
document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = e.target.username.value;
    
    if (!name) {
        return alert("이름을 입력하세요.");
    }

    try {
        await axios.post("/user", { name });
        getUser();      // 사용자 목록 갱신
    } catch (err) {
        console.error(err);
    }

    e.target.username.value = '';
});
```

**about.html**
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RESTful SERVER</title>
    <link rel="stylesheet" href="../css/restFront.css" />
</head>
<body>
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
    </nav>

    <div>
        <h2>소개 페이지입니다.</h2>
        <p>사용자 이름을 등록하세요!</p>
    </div>
</body>
</html>
```

**restServer.js**
```
// 서버는 다른 파일들의 경로를 쉽게 지정하기 위해 별도의 디렉터리에 포함되지 않도록 만든다.

const http = require("http");
const fs = require("fs").promises;
const path = require("path");

const users = {};       // 데이터 저장용

http.createServer(async (req, res) => {
    try {
        console.log(req.method, req.url);

        if (req.method === "GET") {     // GET 요청

            if (req.url === "/") {      // restFront.html 파일 제공
                const data = await fs.readFile(path.join(__dirname, "/html/restFront.html"));
                res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                return res.end(data);
            }
            else if (req.url === "/about") {
                const data = await fs.readFile(path.join(__dirname, "/html/about.html"));
                res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                return res.end(data);
            }
            else if (req.url === "/users") {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                return res.end(JSON.stringify(users));
            }

            // 주소가 /도 /about도 /users도 아닌 경우
            try {
                const data = await fs.readFile(path.join(__dirname, req.url));
                return res.end(data);
            } catch (err) {
                // 주소에 해당하는 라우트를 찾지 못했다는 404 Not Found error 발생
            }
        }
        else if (req.method === "POST") {

            if (req.url === "/user") {
                let body = '';
                
                // 요청의 body를 stream 형식으로 받는다.
                req.on("data", (data) => {
                    body += data;
                });

                // 요청의 body를 다 받은 후 실행된다.
                return req.on("end", () => {
                    console.log("POST 본문(body):", body);
                    const { name } = JSON.parse(body);
                    const id = Date.now();
                    users[id] = name;

                    res.writeHead(201, { "Content-Type": "text/plain; charset=utf-8" });
                    res.end("등록 성공");
                });
            }
        }
        else if (req.method === "PUT") {

            if (req.url.startsWith("/user/")) {
                const key = req.url.split("/")[2];
                let body = '';
                
                req.on("data", (data) => {
                    body += data;
                });

                return req.on("end", () => {
                    console.log("PUT 본문(body):", body);
                    users[key] = JSON.parse(body).name;
                    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                    return res.end(JSON.stringify(users));
                });
            }
        }
        else if (req.method === "DELETE") {

            if (req.url.startsWith("/user/")) {
                const key = req.url.split("/")[2];
                delete users[key];
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                return res.end(JSON.stringify(users));
            }
        }

        res.writeHead(404);
        return res.end("NOT FOUND");
    } catch (err) {
        console.error(err);
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(err.message);
    }
})
    .listen(8082, () => {
        console.log("8082번 포트에서 서버 대기 중입니다.");
    });
```

