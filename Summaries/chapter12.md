# Node.js 교과서 12장 요약
## *웹 소켓으로 실시간 데이터 전송하기*

이 장에서는 웹 소켓을 사용해 실시간으로 데이터를 주고 받는 방법을 알아본다. 웹 소켓의 개념을 익히고 웹 소켓을 활용해 GIF 채팅방을 만들어볼 것이다.

- - -

## 12.1 웹 소켓 이해하기

웹 소켓은 HTML5에 새로 추가된 스펙으로 실시간 양방향 데이터 전송을 위한 기술이다. WS라는 프로토콜을 사용하므로 서버와 브라우저가 WS를 지원하면 사용할 수 있다. 노드에서는 `ws` 또는 `Socket.ID` 같은 패키지를 통해 웹 소켓을 사용할 수 있다.

처음 웹 소켓 연결이 이루어지고 나면 연결된 상태가 유지되어 업데이트할 내용이 생기면 서버에서 즉시 클라이언트에게 알리게 된다. 또한 HTTP 프로토콜과 포트를 공유할 수 있어 다른 포트에 연결할 필요도 없다.

또한, 서버 센트 이벤트(Server Sent Events, SSE)라는 기술도 등장했다. 이는 `Event Source`라는 객체를 사용하는데, 처음 한 번 연결하면 이후 서버가 지속적으로 클라이언트에게 데이터를 보낸다. 단, 이는 서버에서 클라이언트로의 단방향 데이터 통신이기 때문에 한계가 있다.

그러나 항상 양방향 데이터 통신이 필요한 것은 아니므로 상황에 맞추어 적절한 방식을 사용하면 된다.

`Socket.IO`는 웹 소켓을 편리하게 사용할 수 있도록 도와주는 라이브러리이다. 웹 소켓을 지원하지 않는 브라우저에서는 자동적으로 폴링 방식을 사용해 실시간 데이터 전송을 가능하게 한다. 클라이언트 측에서 웹 소켓 연결이 끊기면 자동으로 재연결을 시도하고, 채팅방 기능을 쉽게 구현할 수 있도록 다양한 메소드가 준비되어 있다.

- - -

## 12.2 ws 모듈로 웹 소켓 사용하기

먼저 gif-chat이라는 새로운 프로젝트를 생성한다.

**package.json**
```
{
  "name": "gif-chat",
  "version": "0.0.1",
  "description": "gif chatting project",
  "main": "app.js",
  "scripts": {
    "start": "nodemon app"
  },
  "author": "Yushin Kim",
  "license": "ISC",
  "dependencies": {
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.0.1",
    "express": "^4.18.1",
    "express-session": "^1.17.3",
    "morgan": "^1.10.0",
    "nunjucks": "^3.2.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.16"
  }
}
```

**console**
```
Study_Node.js/Codes/chapter12/gif-chat$ npm i

added 110 packages, and audited 111 packages in 9s

15 packages are looking for funding
  run `npm fund` for details

3 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

**.env**와 **app.js**, **routes/index.js**도 작성한다.

**.env**
```
COOKIE_SECRET=gifchat
```

**app.js**
```
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");

dotenv.config();
const indexRouter = require("./routes");

const app = express();
app.set("port", process.env.PORT || 8005);
app.set("view engine", "html");
nunjucks.configure("view", {
    express: app,
    watch: true,
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));

app.use("/", indexRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 존재하지 않습니다.`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});

app.listen(app.get("port"), () => {
    console.log(app.get("port"), "번 포트에서 대기 중");
});
```

**routes/index.js**
```
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index");
});

module.exports = router;
```

이제 `ws` 모듈을 설치하고 노드에 웹 소켓을 구현한다.

**console**
```
Study_Node.js/Codes/chapter12/gif-chat/routes$ npm i ws@8

added 1 package, and audited 112 packages in 2s

15 packages are looking for funding
  run `npm fund` for details

3 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

먼저 웹 소켓을 익스프레스에 연결한다.

**app.js**
```
...

dotenv.config();
const webSocket = require("./socket");
const indexRouter = require("./routes");

const app = express();

...

const server = app.listen(app.get("port"), () => {
    console.log(app.get("port"), "번 포트에서 대기 중");
});

webSocket(server);
```

이제 웹 소켓 로직을 **socket.js**에 작성한다.

**socket.js**
```
const WebSocket = require("ws");

module.exports = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws, req) => {     // 웹 소켓 연결 시
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        console.log(`새로운 클라이언트 접속 (ip: ${ip})`);

        ws.on("message", (message) => {     // 클라이언트로부터 메시지 수신 시
            console.log(message.toString());
        });

        ws.on("error", (error) => {         // 오류 발생 시
            console.error(error);
        });

        ws.on("close", () => {              // 연결 종료 시
            console.log(`클라이언트 접속 해제 (ip: ${ip})`);
            clearInterval(ws.interval);
        });

        ws.interval = setInterval(() => {   // 3초마다 클라이언트로 메시지 전송
            if (ws.readyState === ws.OPEN) {
                ws.send("서버에서 클라이언트로 메시지를 보냅니다.");
            }
        }, 3000);
    });
}
```

`ws` 모듈을 불러온 후 익스프레스 서버를 웹 소켓 서버와 연결했다. 이렇게 익스프레스(HTTP)와 웹 소켓(WS)은 같은 포트를 공유할 수 있으므로 별도의 작업이 필요하지 않다.

연결 후에는 웹 소켓 서버(`wss`)에 이벤트 리스너를 등록한다. 이처럼 웹 소켓은 이벤트 기반으로 작동한다. 실시간으로 데이터를 전달받으므로 항상 대기하고 있어야 한다. `connection` 이벤트는 클라이언트가 서버와 웹 소켓 연결을 맺을 때 발생한다. `req.headers["x-forwarded-for"] || req.socket.remoteAddress`는 클라이언트의 IP를 알아내는 유명한 방법이다. 익스프레스에서는 IP를 확인할 때 `proxy-addr` 패키지를 사용하므로 이 패키지를 사용해도 된다. 로컬 호스트로 접속한 경우 크롬에서는 IP가 ::1로 나타난다.

익스프레스 서버와 연결한 후 웹 소켓 객체(`ws`)에 이벤트 리스너 세 개, `message`, `error`, `close`를 연결했다. `message`는 클라이언트로부터 메시지가 도달했을 때 발생하고, `error`는 웹 소켓 연결 중 문제가 생겼을 때 발생하며, `close`는 클라이언트와 연결이 끊어졌을 때 발생한다.

`setInterval`은 3초마다 연결된 모든 클라이언트에 메시지를 보내고 있다. 먼저 `readyState`가 OPEN 상태인지 확인한다. 웹 소켓에는 네 가지 상태가 있는데, `CONNECTING(연결 중)`, `OPEN(열림)`, `CLOSING(닫는 중)`, `CLOSED(닫힘)`이다. OPEN 상태일 때만 오류 없이 메시지를 전송할 수 있다. 이를 확인 후 `ws.send` 메소드로 하나의 클라이언트에 메시지를 보낸다. `close` 이벤트에서 `setInterval`을 `clearInterval`로 정리하는 것도 잊지 말아야 한다. 이 부분이 없다면 메모리 누수가 발생하기 때문이다.

웹 소켓은 양방향 통신이기 때문에 단순히 서버에서 설정한다고 해서 작동하는 것이 아니고, 클라이언트에서도 웹 소켓을 사용해야 한다.

다음과 같이 **views/index.html**을 작성한다.

**views/index.html**
```
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>GIF 채팅방</title>
</head>
<body>
    <div>F12를 눌러 console 탭과 network 탭을 확인하세요.</div>
    <script>
        const webSocket = new WebSocket("ws://localhost:8005");
        
        webSocket.onopen = function () {
            consoel.log("서버와 웹 소켓 연결에 성공하였습니다.");
        };

        webSocket.onmessage = function (event) {
            console.log(event.data);
            webSocket.send("클라이언트에서 서버로 답장을 보냅니다.");
        };
    </script>
</body>
</html>
```

**views/error.html**
```
<h1>{{message}}</h1>
<h2>{{error.status}}</h2>
<pre>{{error.stack}}</pre>
```

`WebSocket` 생성자에 연결할 서버의 주소를 전달하고 `webSocket` 객체를 생성한다. 서버 주소의 프로토콜이 `ws`인 것에 주의한다. 클라이언트에서도 웹 소켓은 이벤트 기반으로 동작하기 때문에 이벤트 리스너를 등록한다. 서버와 연결이 맺어지는 경우엔 `onopen`, 서버로부터 메시지가 전달되는 경우엔 `onmessage` 이벤트 리스너가 호출된다. 서버에서 메시지가 전달되면 서버로 답장을 전송하도록 로직이 짜여져 있다.

서버를 실행하고 웹 브라우저에서 서버에 접속하는 순간 서버는 3초마다 클라이언트에 메시지를 보내고, 클라이언트도 서버로부터 온 메시지에 답장을 보낼 것이다.

- - -

## 12.3 Socket.IO 사용하기

IE9처럼 웹 소켓을 사용하지 않는 브라우저에서도 실시간 통신을 사용해야 한다면 `Socket.IO`가 도움이 될 수 있다. 또한 구현하려는 서비스가 복잡해진다면 `ws`보다는 `Socket.IO`를 사용하는 것이 좋다. 편의 기능이 많이 추가되어 있기 때문이다.

먼저 `Socket.IO`를 설치한다.

**console**
```
Study_Node.js/Codes/chapter12/gif-chat$ npm i socket.io@4

added 21 packages, and audited 133 packages in 4s

15 packages are looking for funding
  run `npm fund` for details

3 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

그리고 **socket.js**를 수정하여 `ws` 대신 `Socket.IO`를 연결한다.

**socket.js**
```
const SocketIO = require("socket.io");

module.exports = (server) => {
    const io = SocketIO(server, { path: "/socket.io" });

    io.on("connection", (socket) => {           // 웹 소켓 연결 시
        const req = socket.request;
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

        console.log(`새로운 클라이언트가 접속했습니다. (${ip}, ${socket.id}, ${req.ip})`);

        socket.on("disconnect", () => {         // 연결 종료 시
            console.log(`클라이언트가 접속을 해제했습니다. (${ip}, ${socket.id})`);
            clearInterval(socket.interval);
        });

        socket.on("error", (error) => {         // 오류 발생 시
            console.error(error);
        });

        socket.on("reply", (data) => {          // 클라이언트로부터 메시지 수신 시
            console.log(data);
        });

        socket.interval = setInterval(() => {   // 3초마다 클라이언트로 메시지 전송
            socket.emit("news", "Hello Socket.IO");
        }, 3000);
    })
};
```

먼저 `socket.io` 패키지를 불러와서 익스프레스 서버와 연결하고, `SocketIO` 객체의 두 번째 인수로 옵션 객체를 전달하여 서버에 관한 설정을 한다. 예제에서는 클라이언트가 접속할 경로인 `path`만 설정하였다. 클라이언트에서도 이 경로와 일치하는 `path`를 설정해야 한다.

연결 후에는 이벤트 리스너를 등록한다. `connection`은 클라이언트 접속 시 발생하고 콜백으로 소켓 객체(`socket`)를 전달한다. `io`와 `socket` 객체가 `Socket.IO`의 핵심이다. `socket.request` 속성으로 요청 객체에 접근할 수 있고, `socket.request.res`로는 응답 객체에 접근할 수 있다. 또한, `socket.id`로 소켓 고유의 아이디를 가져올 수 있다. 이 아이디를 이용하면 소켓의 주인을 특정할 수 있다.

`socket`에도 이벤트 리스너를 등록했다. `disconnect`는 클라이언트와의 연결이 끊어졌을 때 발생하고, `error`는 통신 과정 중 오류가 발생했을 때 발생하며, `reply`는 사용자 정의 이벤트이다. 클라이언트에서 `reply`라는 이벤트명으로 데이터를 보낼 때 서버에서 받을 수 있다. 이렇게 이벤트명을 따로 정의할 수 있는 것이 `ws`와의 차이점이다.

`emit` 메소드로 3초마다 클라이언트 한 명에게 메시지를 보내는 코드가 있는데, 첫 번째 인수는 이벤트 이름, 두 번째 인수는 데이터이다. 즉, `news`라는 이벤트 이름으로 **Hello Socket.IO**라는 데이터를 클라이언트에게 보내는 것이다. 클라이언트가 이 메시지를 전달받기 위해서는 `news`에 대한 이벤트 리스너를 등록해야 한다.

그러므로 클라이언트 코드도 바꾸어 준다.

**views/index.html**
```
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>GIF 채팅방</title>
</head>
<body>
    <div>F12를 눌러 console 탭과 network 탭을 확인하세요.</div>
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io.connect("http://localhost:8005", {
            path: "/socket.io",
        });

        socket.on("news", (data) => {
            console.log(data);
            socket.emit("reply", "Hello Node.JS");
        });
    </script>
</body>
</html>
```

`/socket.io/socket.io.js`는 `Socket.IO`에서 클라이언트로 제공하는 스크립트이며, 실제 파일이 아니다. 익스프레스 서버에 `GET /socket.io/socket.io.js`라는 라우터가 생겼다고 생각하면 된다. 이 스크립트를 통해 서버와 유사한 API로 웹 소켓 통신이 가능하다. 스크립트에서 제공해 주는 `io` 객체에 서버 주소를 적어 연결한다. `http` 프로토콜을 사용한다는 점에서 `ws` 모듈과 다르고, 옵션으로 `path`를 설정할 때 이전에 설정한 서버의 `path` 속성과 일치하게 명시해야 한다.

서버에서 보내는 `news` 이벤트를 받기 위한 리스너를 등록하고, 그 내부에서 `emit` 메소드로 `reply` 이벤트 리스너에 답장이 가도록 설정하였다.

`Socket.IO`는 먼저 폴링 방식으로 서버와 연결한다. 그래서 HTTP 프로토콜을 사용하는 것이다. 폴링 연결 후 웹 소켓을 사용할 수 있는지 검사하고 웹 소켓으로 업그레이드한다. 그러므로 웹 소켓을 지원하지 않는 브라우저는 폴링 방식으로, 웹 소켓을 지원하는 브라우저는 웹 소켓 방식으로 사용 가능한 것이다.

처음부터 웹 소켓만 사용하고 싶다면 클라이언트 측에서 `io.connect`에 `transports: ["websocket"]` 옵션을 추가하면 된다.

- - -

## 12.4 실시간 GIF 채팅방 만들기

이 장에서는 GIF 채팅방을 구현한다. 데이터베이스는 MongoDB와 ODM인 mongoose를 사용할 것이다.

먼저 필요한 모듈을 설치한다.

**console**
```
Study_Node.js/Codes/chapter12/gif-chat$ npm i mongoose multer color-hash@2

added 39 packages, and audited 172 packages in 5s

17 packages are looking for funding
  run `npm fund` for details

3 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

사용자는 익명으로 정의할 것이므로 채팅방과 채팅 내역에 대한 스키마만 생성할 것이다.

**schemas/room.js**
```
const mongoose = require("mongoose");
const { Schema } = mongoose;

const roomSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    
    max: {
        type: Number,
        required: true,
        default: 10,
        min: 2,
    },

    owner: {
        type: String,
        required: true,
    },

    password: {
        type: String,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Room", roomSchema);
```

채팅방 스키마에는 방 제목(`title`), 최대 수용 인원(`max`), 방장(`owner`), 비밀번호(`password`), 생성 시간(`createdAt`)을 정의하였다.

**schemas/chat.js**
```
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const chatSchema = new Schema({
    room: {
        type: ObjectId,
        required: true,
        ref: "Room",
    },

    user: {
        type: String,
        required: true,
    },

    chat: {
        type: String,
    },

    gif: {
        type: String,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Chat", chatSchema);
```

채팅 스키마에는 채팅방 아이디(`room`), 채팅을 한 사람(`user`), 텍스트 내용(`chat`), GIF 이미지 주소(`gif`), 채팅 시간(`createdAt`)을 저장한다.

다음으로 정의한 스키마들을 MongoDB에 연결한다.

**schemas/index.js**
```
const mongoose = require("mongoose");
const { MONGO_ID, MONGO_PASSWORD, NODE_ENV } = process.env;
const MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@localhost:27017/admin`;

const connect = () => {
    if (NODE_ENV !== "production") {
        mongoose.set("debug", true);
    }

    mongoose.connect(MONGO_URL, {
        dbName: "gifchat",
        useNewUrlParser: true,
    }).then(() => {
        console.log("MongoDB connected.");
    }).catch((err) => {
        console.error("MongoDB connection error:", err);
    });
};

mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});

mongoose.connection.on("disconnected", () => {
    console.error("MongoDB disconnected. Try to connect again.");
    connect();
});

module.exports = connect;
```

**.env**
```
COOKIE_SECRET=gifchat
MONGO_ID=root
MONGO_PASSWORD=nodejsbook
```

다음으로 서버와 mongoose를 연결한다.

**app.js**
```
...

dotenv.config();
const webSocket = require("./socket");
const indexRouter = require("./routes");
const connect = require("./schemas");

const app = express();
app.set("port", process.env.PORT || 8005);
app.set("view engine", "html");
nunjucks.configure("view", {
    express: app,
    watch: true,
});
connect();

...
```

이제 채팅 앱 메인 화면과 채팅방 생성 화면을 만들 것이다. 채팅뿐만 아니라 채팅방도 실시간으로 생성되고 삭제되도록 구현된다.

화면의 레이아웃을 담당하는 **layout.html**을 작성하고, **views/error.html**을 수정한다.

**views/layout.html**
```
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{title}}</title>
    <link rel="stylesheet" href="/main.css">
</head>
<body>
    {% block content %}
    {% endblock %}
    {% block script %}
    {% endblock %}
</body>
</html>
```

**views/error.html**
```
{% extends "layout.html" %}

{% block content %}
    <h1>{{message}}</h1>
    <h2>{{error.status}}</h2>
    <pre>{{error.stack}}</pre>
{% endblock %}
```

간단한 css도 추가한다.

**views/main.css**
```
* { box-sizing: border-box; }
.mine { text-align: right; }
.system { text-align: center; }
.mine img, .other img {
    max-width: 300px;
    display: inline-block;
    border: 1px solid silver;
    border-radius: 5px;
    padding: 2px 5px;
}
.mine div:first-child, .other div:first-child { font-size: 12px; }
.mine div:last-child, .other div:last-child {
    display: inline-block;
    border: 1px solid silver;
    border-radius: 5px;
    padding: 2px 5px;
    max-width: 300px;
}
#exit-btn { position: absolute; top: 20px; right: 20px; }
#chat-list { height: 500px; overflow: auto; padding: 5px; }
#chat-form { text-align: right; }
label[for="gif"], #chat, #chat-form [type="submit"] {
    display: inline-block;
    height: 30px;
    vertical-align: top;
}
label[for="gif"] { cursor: pointer; padding: 5px; }
#gif { display: none; }
table, table th, table td {
    text-align: center;
    border: 1px solid silver;
    border-collapse: collapse;
}
```

다음으로 메인 화면을 담당하는 **main.html**을 작성한다.

**views/main.html**
```
{% extends "layout.html" %}

{% block content %}
<h1>GIF 채팅방</h1>
<fieldset>
    <legend>채팅방 목록</legend>
    <table>
        <thead>
            <tr>
                <th>방 제목</th>
                <th>종류</th>
                <th>허용 인원</th>
                <th>방장</th>
            </tr>
        </thead>
        <tbody>
        {% for room in rooms %}
            <tr data-id="{{room._id}}">
                <td>{{room.title}}</td>
                <td>{{"비밀방" if room.password else "공개방"}}</td>
                <td>{{room.max}}</td>
                <td style="color: {{room.owner}}">{{room.owner}}</td>
                <td>
                    <button
                     data-password=`{{"true" if room.password else "false"}}`
                     data-id="{{room._id}}"
                     class="join-btn"
                    >입장</button>
                </td>
            </tr>
        {% endfor %}
        </tbody>
    </table>
    <div class="error-message">{{error}}</div>
    <a href="/room">채팅방 생성</a>
</fieldset>
<script src="/socket.io/socket.io.js"></script>
<script>
    const socket = io.connect("http:localhost:8005/room", {
        path: "/socket.io",
    });

    socket.on("newRoom", (data) => {
        const tr = document.createElement("tr");
        
        let td = document.createElement("td");
        td.textContent = data.title;
        tr.appendChild(td);

        td = document.createElement("td");
        td.textContent = data.password ? "비밀방" : "공개방";
        tr.appendChild(td);

        td = document.createElement("td");
        td.textContent = data.max;
        tr.appendChild(td);

        td = document.createElement("td");
        td.style.color = data.owner;
        td.textContent = data.owner;
        tr.appendChild(td);

        td = document.createElement("td");
        const button = document.createElement("button");
        button.textContent = "입장";
        button.dataset.password = data.password ? "true" : "false";
        button.dataset.id = data._id;
        button.addEventListener("click", addBtnEvent);
        td.appendChild(button);
        tr.appendChild(td);

        tr.dataset.id = data._id;
        document.querySelector("table tbody").appendChild(tr);
    });

    socket.on("removeRoom", (data) => {
        document.querySelectorAll("tbody tr").forEach((tr) => {
            if (tr.dataset.id === data) {
                tr.parentNode.removeChild(tr);
            }
        });
    });

    function addBtnEvent(e) {
        if (e.target.dataset.password === "true") {
            const password = prompt("비밀번호를 입력하세요.");
            location.href = "/room/" + e.target.dataset.id + "?password=" + password;
        } else {
            location.href = "/room/" + e.target.dataset.id;
        }
    };

    document.querySelectorAll(".join-btn").forEach((btn) => {
        btn.addEventListener("click", addBtnEvent);
    });
</script>
{% endblock %}

{% block content %}
<script>
    window.onload = () => {
        if (new URL(location.href).searchParams.get("error")) {
            alert(new URL(location.href).searchParams.get("error"));
        }
    };
</script>
{% endblock %}
```

`io.connect`에서 주소 뒤에 **/room**이 추가되었다. 이를 네임스페이스라고 하며, 서버에서 해당 네임스페이스를 통해 보낸 데이터만 받을 수 있다. 네임스페이스를 여러 개 구분하면 주고 받을 데이터를 구분할 수도 있다.

`socket`에는 미리 `newRoom`과 `removeRoom` 이벤트를 등록했다. 서버에서 웹 소켓으로 해당 이벤트를 발생시키면 이벤트 리스너의 콜백 함수가 실행된다.

다음으로는 채팅방 생성 화면을 담당하는 **room.html**을 작성한다.

**views/room.html**
```
{% extends 'layout.html' %}

{% block content %}
  <fieldset>
    <legend>채팅방 생성</legend>
    <form action="/room" method="post">
      <div>
        <input type="text" name="title" placeholder="방 제목">
      </div>
      <div>
        <input type="number" name="max" placeholder="수용 인원(최소 2명)" min="2" value="10">
      </div>
      <div>
        <input type="password" name="password" placeholder="비밀번호(없으면 공개방)">
      </div>
      <div>
        <button type="submit">생성</button>
      </div>
    </form>
  </fieldset>
{% endblock %}
```

채팅방 화면을 담당하는 **chat.html**을 작성한다.

**views/chat.html**
```
{% extends 'layout.html' %}

{% block content %}
  <h1>{{title}}</h1>
  <a href="/" id="exit-btn">방 나가기</a>
  <fieldset>
    <legend>채팅 내용</legend>
    <div id="chat-list">
      {% for chat in chats %}
        {% if chat.user === user %}
          <div class="mine" style="color: {{chat.user}}">
            <div>{{chat.user}}</div>
            {% if chat.gif %}
              <img src="/gif/{{chat.gif}}">
            {% else %}
              <div>{{chat.chat}}</div>
            {% endif %}
          </div>
        {% elif chat.user === 'system' %}
          <div class="system">
            <div>{{chat.chat}}</div>
          </div>
        {% else %}
          <div class="other" style="color: {{chat.user}}">
            <div>{{chat.user}}</div>
            {% if chat.gif %}
              <img src="/gif/{{chat.gif}}">
            {% else %}
              <div>{{chat.chat}}</div>
            {% endif %}
          </div>
        {% endif %}
      {% endfor %}
    </div>
  </fieldset>
  <form action="/chat" id="chat-form" method="post" enctype="multipart/form-data">
    <label for="gif">GIF 올리기</label>
    <input type="file" id="gif" name="gif" accept="image/gif">
    <input type="text" id="chat" name="chat">
    <button type="submit">전송</button>
  </form>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io.connect('http://localhost:8005/chat', {
      path: '/socket.io',
    });
    socket.emit('join', new URL(location).pathname.split('/').at(-1));
    socket.on('join', function (data) {
      const div = document.createElement('div');
      div.classList.add('system');
      const chat = document.createElement('div');
      chat.textContent = data.chat;
      div.appendChild(chat);
      document.querySelector('#chat-list').appendChild(div);
    });
    socket.on('exit', function (data) {
      const div = document.createElement('div');
      div.classList.add('system');
      const chat = document.createElement('div');
      chat.textContent = data.chat;
      div.appendChild(chat);
      document.querySelector('#chat-list').appendChild(div);
    });
  </script>
{% endblock %}
```

채팅 메시지는 내 메시지(`mine`), 시스템 메시지(`system`), 남의 메시지(`other`)로 구분된다. 종류에 따라 디자인이 달라진다.

`socket.io` 부분을 확인해 보면 `io.connect` 메소드의 주소에서 네임스페이스가 **/chat**인 것을 확인할 수 있다.

`socket`에 연결된 `join`, `exit` 이벤트는 각각 사용자의 입장과 퇴장에 대한 데이터가 웹 소켓으로 전송될 때 호출된다.

이번에는 **app.js**에 `color-hash` 패키지를 적용하여 접속한 사용자마다 고유한 색상을 부여할 것이다. 현재 사용할 수 있는 사용자의 고유한 정보는 세션 아이디(`req.sessionID`)와 소켓 아이디(`socket.id`)이다. 그러나 페이지 이동 시마다 소켓이 재연결되기 때문에 소켓 아이디는 자주 바뀌게 된다. 따라서 세션 아이디를 고유 키로 사용한다.

**app.js**
```
...

const dotenv = require("dotenv");
const ColorHash = require("color-hash").default;

dotenv.config();
const webSocket = require("./socket");
const indexRouter = require("./routes");
const connect = require("./schemas");

const app = express();
app.set("port", process.env.PORT || 8005);
app.set("view engine", "html");
nunjucks.configure("view", {
    express: app,
    watch: true,
});
connect();

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "views")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));

app.use((req, res, next) => {
    if (!req.session.color) {
        const colorHash = new ColorHash();
        req.session.color = colorHash.hex(req.sessionID);
        console.log(req.session.color, req.sessionID);
    }

    next();
});

...

webSocket(server, app);
```

다음으로 서버의 **socket.js**에 웹 소켓 이벤트를 연결한다.

**socket.js**
```
const SocketIO = require("socket.io");

module.exports = (server, app) => {
    const io = SocketIO(server, { path: "/socket.io" });
    app.set("io", io);
    const room = io.of("/room");
    const chat = io.of("/chat");

    room.on("connection", (socket) => {
        console.log("room 네임스페이스 접속");

        socket.on("disconnect", () => {
            console.log("room 네임스페이스 접속 해제");
        });
    });

    chat.on("connection", (socket) => {
        console.log("chat 네임스페이스 접속");

        socket.on("join", (data) => {
            socket.join(data);
        });

        socket.on("disconnect", () => {
            console.log("chat 네임스페이스 접속 해제");
        });
    });
};
```

먼저 `app.set("io", io)`로 라우터에서 `io` 객체를 사용할 수 있게 저장한다. `req.app.get("io")`로 접근 가능하다.

`of` 메소드는 `Socket.IO`에 네임스페이스를 부여하는 메소드이다. 같은 네임스페이스끼리만 데이터 교환이 가능하다.

`socket.join`의 `join` 메소드는 `Socket.IO`가 기본적으로 제공하는 이벤트가 아닌 사용자 정의 이벤트임을 유의한다.

`Socket.IO`에는 네임스페이스보다 더 세부적인 개념으로 `방(room)`이라는 것이 있다. 같은 네임스페이스 안에서도 같은 방에 있는 소켓끼리만 데이터를 교환할 수 있는 것이다. `socket.join`은 방의 아이디를 인수로 전달받는다. 사용자가 브라우저에서 접속 시 `socket.emit("join", [방 아이디])`를 호출하면 `socket.js`의 `join` 이벤트에서 `data` 매개변수로 방 아이디를 전달받아 방에 접속할 것이다.

방에서 나갈 때는 보통 `socket.leave([방 아이디])` 이벤트를 호출해야 하지만 이 예제에서는 연결이 끊기면 자동으로 방에서 나가지므로 따로 호출하지 않았다.

이제 라우터와 컨트롤러를 작성한다.

**routes/index.js**
```
const express = require("express");
const { renderMain, renderRoom, createRoom, enterRoom, removeRoom } = require("../controllers");
const router = express.Router();

router.get("/", renderMain);

router.get("/room", renderRoom);

router.post("/room", createRoom);

router.get("/room/:id", enterRoom);

router.delete("/room/:id", removeRoom);

module.exports = router;
```

순서대로 메인 화면 렌더링(`GET /`), 방 생성 화면 렌더링(`GET /room`), 방 생성 라우터(`POST /room`), 방 접속 라우터(`GET /room/:id`), 방 삭제 라우터(`DELETE /room/:id`)이다.

**controllers/index.js**
```

```