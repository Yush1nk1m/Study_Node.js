# Node.js 교과서 9장 요약
## *익스프레스로 SNS 서비스 만들기*

이 장에서는 로그인, 이미지 업로드, 게시글 작성, 해시태그 검색, 팔로잉 등의 기능이 있는 SNS 서비스인 NodeBird 앱을 구현한다.
- - -

## 9.1 프로젝트 구조 갖추기

먼저 `nodebird`라는 프로젝트 디렉터리를 생성한다. 그리고 다음과 같이 `package.json`을 생성한다.

**package.json**
```
{
  "name": "nodebird",
  "version": "0.0.1",
  "description": "익스프레스로 만드는 SNS 서비스",
  "main": "app.js",
  "scripts": {
    "start": "nodemon app"
  },
  "author": "Yushin Kim",
  "license": "MIT"
}
```

이제 시퀄라이즈를 설치한다. 이 프로젝트에서는 `NoSQL` 대신 `SQL(MySQL)`을 데이터베이스로 사용할 것이다. 사용자와 게시물 간, 게시물과 해시태그 간의 관계가 중요하기 때문이다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter09\nodebird> npm i sequelize mysql2 sequelize-cli

added 128 packages, and audited 129 packages in 12s

12 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

PS D:\공부\Javascript\Study_Node.js\Codes\chapter09\nodebird> npx sequelize init

Sequelize CLI [Node: 18.17.1, CLI: 6.6.1, ORM: 6.33.0]

Created "config\config.json"
Successfully created models folder at "D:\공부\Javascript\Study_Node.js\Codes\chapter09\nodebird\models".
Successfully created migrations folder at "D:\공부\Javascript\Study_Node.js\Codes\chapter09\nodebird\migrations".
Successfully created seeders folder at "D:\공부\Javascript\Study_Node.js\Codes\chapter09\nodebird\seeders".
```

필요한 패키지들을 설치하고 `npx sequelize init` 명령어로 `config`, `migration`, `models`, `seeders` 디렉터리를 생성한다. `npx` 명령어를 사용하는 이유는 전역 설치(`npm i -g`)를 피하기 위함이다.

이제 템플릿 파일을 넣을 `views` 디렉터리, 라우터를 넣을 `routes` 디렉터리, 정적 파일을 넣을 `public` 디렉터리를 생성한다. 또한 9.3절에서 설명될 `passport` 패키지를 위한 `passport` 디렉터리도 생성한다.

마지막으로 익스프레스 서버 코드가 담길 `app.js`와 설정값들을 담을 `.env` 파일을 `nodebird` 디렉터리에 생성한다.

이 구조가 보편적으로 적용되기 좋은 구조이다. 프로젝트의 복잡도가 높아질수록 디렉터리는 더 많아질 수 있고, 상황에 따라 이 구조 자체도 유동적으로 바뀔 수 있다.

먼저 필요한 npm 패키지들을 설치하고 `app.js`를 작성할 것이다. 템플릿 엔진은 넌적스를 사용한다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter09\nodebird> npm i express cookie-parser express-session morgan multer dotenv nunjucks

added 94 packages, and audited 195 packages in 8s

21 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

PS D:\공부\Javascript\Study_Node.js\Codes\chapter09\nodebird> npm i -D nodemon

added 28 packages, and audited 223 packages in 4s

24 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

`app.js`와 `.env`는 다음과 같이 작성한다.

**app.js**
```
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");

dotenv.config();
const pageRouter = require("./routes/page");

const app = express();
app.set("port", process.env.PORT || 8001);
app.set("view engine", "html");
nunjucks.configure("views", {
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

app.use("/", pageRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
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

라우터로는 현재는 `pageRouter`만 정의되어 있지만 추후에 추가될 예정이다. 라우터 이후에는 404 응답 미들웨어와 에러 처리 미들웨어가 있다.

**.env**
```
COOKIE_SECRET=cookiesecret
```

시퀄라이즈 설정을 담아둔 `config.json`에는 하드 코딩된 비밀번호가 유일하게 남아 있다. JSON 파일이라 `process.env`를 사용할 수 없다. 시퀄라이즈의 비밀번호를 숨기는 방법은 15.1.2절에서 소개된다.

다음으로는 기본적인 라우터와 템플릿 엔진을 생성한다. 다음과 같이 `routes/page.js`와 `views/layout.html`, `views/main.html`, `views/profile.html`, `viwes/join.html`, `views/error.html`를 작성한다. 또한 약간의 디자인 요소를 위해 `public/main.css`도 생성한다.

**routes/page.js**
```
const express = require("express");
const { renderProfile, renderJoin, renderMain } = require("../controllers/page");

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = null;
    res.locals.followerCount = 0;
    res.locals.followingCount = 0;
    res.locals.followingIdList = [];
    next();
});

router.get("/profile", renderProfile);

router.get("/join", renderJoin);

router.get("/", renderMain);

module.exports = router;
```

`GET /profile`, `GET /join`, `GET /` 세 개의 페이지로 구성되어 있다. `router.use`로 라우터용 미들웨어를 만들어 템플릿 엔진에서 사용할 `user`, `followingCount`, `followerCount`, `followingIdList` 변수를 `res.locals`에 정의해 두었다. 지금은 값이 비어 있지만 추후에 추가될 예정이다. 이 변수들을 모든 템플릿 엔진에서 공통으로 사용할 것이기 때문에 `res.locals`에 저장해 둔다.

이전 예제들과 다르게 컨트롤러라는 것을 사용한다. 라우터의 미들웨어를 다른 곳에서 불러오고 있다. `renderProfile`, `renderJoin`, `renderMain`과 같이 라우터 마지막에 위치해 크라이언트에 응답을 보내는 미들웨어를 컨트롤러라고 한다. 아직 컨트롤러가 작성되지 않았으므로 다음과 같이 `controllers/page.js`를 생성한다.

**controllers/page.js**
```
exports.renderProfile = (req, res) => {
    res.render("profile", { title: "내 정보 - NodeBird" });
};

exports.renderJoin = (req, res) => {
    res.render("join", { title: "회원 가입 - NodeBird" });
};

exports.renderMain = (req, res) => {
    const twits = [];
    res.render("main", {
        title: "NodeBird",
        twits,
    });
};
```

컨트롤러는 단순히 `res.send`, `res.json`, `res.redirect`, `res.render` 등이 존재하는 미들웨어이다. 컨트롤러를 분리하면 코드를 편하게 관리할 수 있고 테스트하기 편하다. 11장에서 테스트에 관한 예제를 진행한다.

`renderProfile`은 내 정보 페이지, `renderJoin`은 회원 가입 페이지, `renderMain`은 메인 페이지를 렌더링한다. `renderMain`은 추가적으로 렌더링 중 넌적스에 `twits`로 게시글 목록을 전달한다. 지금은 `twits`가 빈 배열이지만 나중에는 값이 추가될 예정이다.

그 다음으로는 클라이언트 코드를 작성한다.

**views.layout.html**
```
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{title}}</title>
    <meta name="viewport" content="width=device-width, user-scalable=no">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="stylesheet" href="/main.css">
</head>
<body>
    <div class="container">
        <div class="profile-wrap">
            <div class="profile">
                {% if user and user.id %}
                <div class="user-name">{{"안녕하세요! " + user.nick + "님"}}</div>
                <div class="half">
                    <div>팔로잉</div>
                    <div class="count following-count">{{followingCount}}</div>
                </div>
                <div class="half">
                    <div>팔로워</div>
                    <div class="count follower-count">{{followerCount}}</div>
                </div>
                <input id="my-id" type="hidden" value="{{user.id}}">
                <a id="my-profile" href="/profile" class="btn">내 프로필</a>
                <a id="logout" href="/auth/logout" class="btn">로그아웃</a>
                {% else %}
                <form id="login-form" action="/auth/login" method="post">
                    <div class="input-group">
                        <label for="email">이메일</label>
                        <input id="email" type="email" name="email" required autofocus>
                    </div>
                    <div class="input-group">
                        <label for="password">비밀번호</label>
                        <input id="password" type="password" name="password" required>
                    </div>
                    <a id="join" href="/join" class="btn">회원 가입</a>
                    <button id="login" type="submit" class="btn">로그인</button>
                    <a id="kakao" href="/auth/kakao" class="btn">카카오톡</a>
                </form>
                {% endif %}
            </div>
            <footer>
                Made by&nbsp;
                <a href="https://github.com/Yush1nk1m" target="_blank">Yushin Kim</a>
            </footer>
        </div>
        {% block content %}
        {% endblock %}
    </div>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script>
        window.onload = () => {
            if (new URL(location.href).searchParams.get("error")) {
                alert(new URL(location.href).searchParams.get("error"));
            }
        };
    </script>
    {% block script %}
    {% endblock %}
</body>
</html>
```

`layout.html`에서는 if 문을 중점적으로 확인하면 된다. 렌더링할 때 `user`가 존재하면 사용자 정보와 팔로잉, 팔로워 수를 보여준다. 그렇지 않으면 로그인 메뉴를 보여준다.

**views/main.html**
```

```