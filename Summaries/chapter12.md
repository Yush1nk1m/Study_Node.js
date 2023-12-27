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

```

**routes/index.js**
```

```