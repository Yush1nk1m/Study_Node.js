# Node.js 교과서 10장 요약
## *웹 API 서버 만들기*

이 장에서는 NodeBird 앱의 REST API 서버를 만든다고 가정한다. 노드는 자바스크립트 문법을 활용하므로 웹 API 서버에서 데이터를 전달할 때 사용하는 JSON을 활용하기에 좋다.

API 서버는 프론트엔드와 분리되어 운영되므로 모바일 서버로도 사용할 수 있다. 노드를 모바일 서버로 사용하려면 이번 장과 같이 서버를 `REST API` 구조로 구성하면 된다. 특히 `JWT` 토큰은 모바일 앱과 노드 서버 간에 사용자 인증을 구현할 때 자주 사용된다.

사용자 인증, 사용량 제한 등의 기능을 구현해 웹 API 서버를 만들어 본다. 이번 장 수행을 위해 먼저 NodeBird 앱에 게시글을 다양하게 올려둔다.
- - -

## 10.1 API 서버 이해하기

먼저 API와 웹 API 서버의 개념을 알아본다. `API(Application Programming Interface)`는 다른 애플리케이션에서 현재 프로그램의 기능을 사용할 수 있게 허용하는 접점을 의미한다.

웹 API는 다른 웹 서비스의 기능을 사용하거나 자원을 가져올 수 있는 창구이다. 다른 사람에게 제공하고 싶은 만큼만 API를 열어놓을 수 있고, 열어놓은 상태에서도 인증된 사람만 일정 횟수 내에서 이용할 수 있게끔 제한을 둘 수도 있다.

서버에 API를 올려 URL을 통해 접근할 수 있게 만든 것을 웹 API 서버라고 한다. 이 장에서 구현할 서버도 NodeBird의 정보를 제공하는 웹 API 서버이다. 단, 정보를 인증된 사용자에게만 제공할 것이다.

`크롤링(crawling)`이라는 개념을 먼저 알아두면 좋다. 웹 사이트가 자체적으로 제공하는 API가 없거나 API 이용에 제한이 있을 때 사용하기 좋은 방법으로, 표먼적으로 보이는 웹 사이트의 정보를 일정 주기로 수집해 자체적으로 가공하는 기술이다. 하지만, 웹 사이트에서 직접 제공하는 API가 아니므로 원하는 정보를 얻지 못할 가능성이 있다. 또한 법적인 문제가 발생할 여지도 있다. 따라서 `[도메인]/robots.txt`에 접속하여 크롤링이 허용된 페이지를 먼저 확인하는 것이 좋다.

서비스 제공자 입장에서도 주기적으로 크롤링을 당하면 서버의 트래픽이 증가해 무리가 가므로 공개 가능한 정보들은 미리 API로 만들어 두는 것이 좋다.
- - -


## 10.2 프로젝트 구조 갖추기

이번 프로젝트는 NodeBird 서비스와 데이터베이스를 공유한다.

다른 서비스에 NodeBird 서비스의 게시글, 해시태그, 사용자 정보를 JSON 형식으로 제공할 것이다. 단, 인증을 받은 사용자에게만 일정한 할당량 안에서 API를 호출할 수 있도록 허용할 것이다.

우선 `nodebird-api` 디렉터리를 만들고 다음과 같이 `package.json` 파일을 생성한다.

**package.json**
```
{
  "name": "nodebird-api",
  "version": "0.0.1",
  "description": "NodeBird API 서버",
  "main": "app.js",
  "scripts": {
    "start": "nodemon app",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Yushin Kim",
  "license": "ISC",
  "dependencies": {
    "bcrypt": "^5.0.0",
    "cookie-parser": "^1.4.5",
    "dotenv": "^16.0.0",
    "express": "^4.17.1",
    "express-session": "^1.17.1",
    "morgan": "^1.10.0",
    "mysql2": "^2.1.0",
    "nunjucks": "^3.2.1",
    "passport": "^0.5.2",
    "passport-kakao": "^1.0.1",
    "passport-local": "^1.0.0",
    "sequelize": "^6.0.0",
    "uuid": "^8.3.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.3"
  }
}
```

그리고 `npm i` 명령어로 패키지들을 설치한다. 새로 추가된 `uuid`라는 패키지는 고유한 랜덤 문자열을 만들어내는 데 사용된다.

다음으로는 NodeBird에서 `config`, `models`, `passport`, `middlewares` 디렉터리와 그 안의 파일들을 모두 복사하여 `nodebird-api` 디렉터리로 가져온다. `controllers`, `routes` 디렉터리도 가져오되 `auth.js`만 남기고 나머지는 삭제한다. 마지막으로 `.env`를 복사한다.

다음은 에러를 표시할 파일이다. `views` 디렉터리를 생성하고 그 안에 `error.html` 파일을 다음과 같이 작성한다.

**views/error.html**
```
<h1>{{message}}</h1>
<h2>{{error.status}}</h2>
<pre>{{error.stack}}</pre>
```

**app.js**
```

```