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
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const morgan = require("morgan");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");

dotenv.config();

const authRouter = require("./routes/auth");
const indexRouter = require("./routes");
const { sequelize } = require("./models");
const passportConfig = require("./passport");

const app = express();
passportConfig();
app.set("port", process.env.PORT || 8002);
app.set("view engine", "html");
nunjucks.configure("views", {
    express: app,
    watch: true,
});
sequelize.sync({ force: false })
    .then(() => {
        console.log("데이터베이스 연결 성공");
    })
    .catch((err) => {
        console.error(err);
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
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/", indexRouter);

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

다음으로는 도메인 등록 기능이 생겼으므로 도메인 모델을 추가한다.

**models/domain.js**
```
const Sequelize = require("sequelize");

class Domain extends Sequelize.Model {
    static initiate(sequelize) {
        Domain.init({
            host: {
                type: Sequelize.STRING(80),
                allowNull: false,
            },

            type: {
                type: Sequelize.ENUM("free", "premium"),
                allowNull: false,
            },

            clientSecret: {
                type: Sequelize.UUID,
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            modelName: "Domain",
            tableName: "domains",
        });
    }

    static associate(db) {
        db.Domain.belongsTo(db.User);
    }
};

module.exports = Domain;
```

도메인에는 인터넷 주소(`host`), 도메인 종류(`type`), 클라이언트 비밀 키(`clientSecret`)가 들어간다.

클라이언트 비밀 키는 다른 개발자들이 NodeBird의 API를 사용할 때 필요한 비밀 키이다. 그러므로 이 키가 유출되지 않도록 주의해야 한다. 이것의 데이터 타입은 `UUID`인데, 이는 충돌 가능성이 매우 적은 랜덤 문자열이다.

도메인 모델은 사용자 모델과 일대다 관계를 갖는다. 사용자 한 명이 여러 개의 도메인을 소유할 수 있기 때문이다.

**models/user.js**
```
...
static associate(db) {
    db.User.hasMany(db.Post);

    db.User.belongsToMany(db.User, {
        foreignKey: "followingId",
        as: "Followers",
        through: "Follow",
    });

    db.User.belongsToMany(db.User, {
        foreignKey: "followerId",
        as: "Followings",
        through: "Follow",
    });

    db.User.hasMany(db.Domain);
}
...
```

다음은 로그인 화면이다.

**views/login.html**
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>API 서버 로그인</title>
    <style>
        .input-group label { width: 200px; display: inline-block; }
    </style>
</head>
<body>
    {% if user and user.id %}
    <span class="user-name">안녕하세요! {{user.name}}님</span>
    <a href="/auth/logout">
        <button>로그아웃</button>
    </a>
    <fieldset>
        <legend>도메인 등록</legend>
        <form action="/domain" method="post">
            <div>
                <label for="type-free">무료</label>
                <input type="radio" id="type-free" name="type" value="free">
                <label for="type-premium">프리미엄</label>
                <input type="radio" id="type-premium" name="type" value="premium">
            </div>
            <div>
                <label for="host">도메인</label>
                <input type="text" id="host" name="host" placeholder="ex) yushin.com">
            </div>
            <button>저장</button>
        </form>
    </fieldset>
    <table>
        <tr>
            <th>도메인 주소</th>
            <th>타입</th>
            <th>클라이언트 비밀 키</th>
        </tr>
        {% for domain in domains %}
        <tr>
            <td>{{domain.host}}</td>
            <td>{{domain.type}}</td>
            <td>{{domain.clientSecret}}</td>
        </tr>
        {% endfor %}
    </table>
    {% else %}
    <form action="/auth/login" id="login-form" method="post">
        <h2>NodeBird 계정으로 로그인하세요.</h2>
        <div class="input-group">
            <label for="email">이메일</label>
            <input id="email" type="email" name="email" required autofocus>
        </div>
        <div class="input-group">
            <label for="password">비밀번호</label>
            <input id="password" type="password" name="password" required>
        </div>
        <div>회원 가입은 localhost:8001에서 하세요.</div>
        <button id="login" type="submit">로그인</button>
    </form>
    <script>
        window.onload = () => {
            if (new URL(location.href).searchParams.get("error")) {
                alert(new URL(location.href).searchParams.get("error"));
            }
        };
    </script>
    {% endif %}
</body>
</html>
```

**routes/index.js**
```
const express = require("express");
const { renderLogin, createDomain } = require("../controllers");
const { isLoggedIn } = require("../middlewares");

const router = express.Router();

router.get("/", renderLogin);

router.post("/domain", isLoggedIn, createDomain);

module.exports = router;
```

**controllers/index.js**
```
const { v4: uuidv4 } = require("uuid");
const { User, Domain } = require("../models");

exports.renderLogin = async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: req.user?.id || null },
            include: { model: Domain },
        });

        res.render("login", {
            user,
            domains: user?.Domains,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

exports.createDomain = async (req, res, next) => {
    try {
        await Domain.create({
            UserId: req.user.id,
            host: req.body.host,
            type: req.body.type,
            clientSecret: uuidv4(),
        });

        res.redirect("/");
    } catch (err) {
        console.error(err);
        next(err);
    }
};
```

`GET /` 라우터와 도메인 등록 라우터(`POST /domain`)의 코드이다.

`GET /` 라우터는 접속 시 로그인 화면을 보여주며, `POST /domain` 라우터는 폼으로부터 전송된 데이터를 도메인 모델에 저장한다. 시퀄라이즈의 `where`에는 `undefined`가 주어질 수 없으므로 `req.user?.id || null`을 사용하였다.

`POST /domain` 라우터에서는 `clientSecret` 값을 `uuid` 패키지로 생성한다. `uuidv4`는 36자리 문자열 형식이다. `const { v4: uuidv4 }`와 같이 패키지의 변수나 함수를 불러올 때 그 이름을 바꿀 수 있다.

도메인을 등록하는 이유는 등록한 도메인에서만 API를 사용할 수 있게 하기 위함이다. 웹 브라우저에서 요청을 보낼 때 응답을 하는 곳과 도메인이 다르면 `CORS(Cross-Origin Resource Sharing)` 에러가 발생할 수 있다. 이를 해결하려면 API 서버에서 미리 허용할 도메인을 등록해야 한다. `CORS` 에러는 브라우저에서 발생하는 에러이기 때문에 서버에서 서버로 요청을 보내는 경우에는 발생하지 않는다.

무료와 프리미엄으로 `type`을 구분한 것은 나중에 사용량을 제한하기 위함이다.

이제 `localhost:4000` 도메인을 등록하고, 앞으로는 이 도메인을 이번 장에서 구현할 API 서버의 사용자 서버 도메인이라고 생각한다.
- - -


## 10.3 JWT 토큰으로 인증하기

다른 클라이언트가 NodeBird의 데이터를 가져갈 수 있게 하려면 별도의 인증 과정이 필요하다. 이 절에서는 JWT 토큰을 사용해 인증하는 방법을 익힌다.

`JWT(JSON Web Token)`는 JSON 형식의 데이터를 저장하는 토큰으로, 다음과 같은 세 부분으로 구성된다.

- `헤더(HEADER)`: 토큰 종류와 해시 알고리즘 정보가 포함되어 있다.
- `페이로드(PAYLOAD)`: 토큰의 내용이 인코딩된 부분이다.
- `시그니처(SIGNATURE)`: 일련의 문자열로, 토큰의 변조 여부를 확인할 수 있는 데이터이다.

시그니처는 JWT 비밀 키로 만들어진다. 비밀 키가 노출되면 JWT 토큰을 위조할 수 있으므로 비밀 키는 철저히 보호되어야 한다. 그러나 시그니처 자체는 숨기지 않아도 된다.

JWT는 그 내용을 확인할 수 있기 때문에 민감한 정보를 넣으면 안 된다.

https://jwt.io 에 접속하면 JWT 토큰의 내용을 확인할 수 있다.

이제부터 JWT 토큰 인증 과정을 구현한다. 먼저 JWT 모듈을 설치한다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter10\nodebird-api> npm i jsonwebtoken

added 13 packages, and audited 218 packages in 5s

20 packages are looking for funding
  run `npm fund` for details

6 moderate severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
```

이제 JWT를 사용하여 본격적으로 API를 만든다. 다른 사용자가 API를 사용하기 위해 JWT 토큰을 발급받고 인증을 받아야 하는 과정은 대부분의 라우터에 공통되므로 미들웨어로 만들어 두는 것이 좋다.

**.env**
```
COOKIE_SECRET=cookiesecret
KAKAO_ID=9804670777cb2b155d1f1a9dee11e90f
JWT_SECRET=jwtSecret
```

**middlewares/index.js**
```
const jwt = require("jsonwebtoken");

...

exports.verifyToken = (req, res, next) => {
    try {
        res.locals.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        return next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {   // 유효 기간 초과
            return res.status(419).json({
                code: 419,
                message: "토큰이 만료되었습니다.",
            });
        }

        return res.status(401).json({
            code: 401,
            message: "유효하지 않은 토큰입니다.",
        });
    }
};
```

요청 헤더에 저장된 토큰(`req.headers.authorization`)을 사용한다. 마치 쿠키와 같이 사용자가 헤더에 토큰을 넣어 보낸다. 그러면 `jwt.verify` 메소드로 토큰을 검증할 수 있다. 메소드의 첫 번째 인수로는 토큰을, 두 번째 인수로는 토큰의 비밀 키를 전달한다.

토큰의 비밀 키가 일치하지 않거나, 유효 기간이 지난 경우엔 에러가 발생하여 catch 문으로 이동한다. 위 코드에서는 유효 기간 만료 시 419 상태 코드를 응답하고 있는데, 코드는 400번대 숫자 중 아무 것이나 사용해도 괜찮다.

인증에 성공하면 토큰의 내용이 반환되어 `res.locals.decoded`에 저장된다. 토큰의 내용은 사용자 아이디, 닉네임, 발급자, 유효 기간 등이 될 것이다. `res.locals`에 저장함으로써 다음 미들웨어에서 토큰의 내용을 사용할 수 있다.

**routes/v1.js**
```
const express = require("express");

const { verifyToken } = require("../middlewares");
const { createToken, tokenTest } = require("../controllers/v1");

const router = express.Router();

// POST /v1/token
router.post("/token", createToken);

// POST /v1/test
router.get("/test", verifyToken, tokenTest);

module.exports = router;
```

**controllers/v1.js**
```
const jwt = require("jsonwebtoken");
const { Domain, User } = require("../models");

exports.createToken = async (req, res) => {
    const { clientSecret } = req.body;

    try {
        const domain = await Domain.findOne({
            where: { clientSecret },
            include: {
                model: User,
                attribute: ["nick", "id"],
            },
        });

        if (!domain) {
            return res.status(401).json({
                code: 401,
                message: "등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요.",
            });
        }

        const token = jwt.sign({
            id: domain.User.id,
            nick: domain.User.nick,
        }, process.env.JWT_SECRET, {
            expiresIn: "1m",    // 1분
            issuer: "nodebird",
        });

        return res.json({
            code: 200,
            message: "토큰이 발급되었습니다.",
            token,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            code: 500,
            message: "서버 에러",
        });
    }
};

exports.tokenTest = (req, res) => {
    res.json(res.locals.decoded);
}
```

토큰을 발급하는 라우터(`POST /v1/token`)와 사용자가 토큰을 테스트해볼 수 있는 라우터(`GET /v1/test`)를 만들었다.

라우터의 이름 `v1`은 버전 1이라는 의미이다. 한 번 버전이 정해진 후에는 라우터를 함부로 수정하면 안 된다. 타인이 기존 API를 사용하고 있기 때문에 작은 변화가 많은 사용자들에게 영향을 줄 수 있다. 기존에 있던 라우터를 수정하면 API를 사용하는 프로그램들이 오작동할 수 있는 것이다. 따라서 큰 수정이 있을 시엔 새로운 버전의 라우터를 만들어 공지하고, 기존의 라우터도 시간을 갖고 없애는 것이 좋다.

버전을 반드시 라우터 이름으로 표시할 필요는 없다. 헤더, 쿼리스트링, 본문 등에 표시할 수도 있다.

`POST /v1/token` 라우터에서는 전달받은 클라이언트 비밀 키로 도메인이 등록된 것인지를 먼저 확인한다. 등록되지 않은 도메인이라면 에러 메시지로 응답하고, 등록된 도메인이라면 `jwt.sign` 메소드로 토큰을 발급하여 응답한다.

```
const token = jwt.sign({
    id: domain.User.id,
    nick: domain.User.nick,
}, process.env.JWT_SECRET, {
    expiresIn: "1m",    // 유효 기간
    issuer: "nodebird", // 발급자
});
```

첫 번째 인수는 토큰의 내용으로, 사용자 아이디와 닉네임을 넣었다. 두 번째 인수는 토큰의 비밀 키이다. 이 비밀 키가 유출되면 다른 사람이 토큰을 임의로 만들어낼 수 있으므로 주의해야 한다. 세 번째 인수는 토큰의 설정이다. 유효 기간은 1분이고, 발급자도 명시하였다. `1m` 대신 밀리초 단위로 `60 * 1000`처럼 명시하여도 된다.

`GET /v1/test` 라우터는 사용자가 발급받은 토큰을 테스트할 수 있는 라우터이다. 토큰을 검증하는 미들웨어를 거친 후 검증이 성공했다면 내용을 응답으로 보낸다.

이제 라우터를 서버에 연결한다.

**app.js**
```
...

dotenv.config();

const v1 = require("./routes/v1");
const authRouter = require("./routes/auth");

...

app.use(passport.session());

app.use("/v1", v1);

...
```

**JWT 토큰을 사용한 로그인**
> 최근에는 JWT 토큰을 사용한 로그인 방법이 많이 사용되고 있다. 로그인 완료 시 세션에 데이터를 저장하고 세션 쿠키를 발급하는 대신 JWT 토큰을 본문으로 발급하면 된다. 브라우저는 본문으로 발급받은 토큰을 로컬 스토리지 등에 저장했다가 요청을 보낼 때 `authorization` 헤더에 토큰을 넣어 보낸다.

> passport에서는 `authenticate` 메소드의 두 번째 인수로 `session: false`를 전달하여 세션을 비활성화하고, `serializeUser`, `deserializeUser`를 사용하지 않는다. 그 후 모든 라우터에 `verifyToken` 미들웨어를 넣어 클라이언트에서 보낸 토큰을 검사한 후, 토큰이 유효하면 라우터로 넘어가고 그렇지 않으면 에러를 응답하면 된다.
- - -


## 10.4 다른 서비스에서 호출하기

이제 API를 사용하는 서비스를 만든다. 이 서비스는 다른 서버에 요청을 보내는 클라이언트 역할을 한다. API 제공자가 아닌 API 사용자의 입장에서 진행하는 것이다. 새로운 서비스의 이름은 `NodeCat`으로 명명한다.

새로운 프로젝트 디렉터리를 생성하고 프로젝트를 생성한다.

**package.json**
```
{
  "name": "nodecat",
  "version": "0.0.1",
  "description": "NodeBird 2차 서비스",
  "main": "app.js",
  "scripts": {
    "start": "nodemon app"
  },
  "author": "Yushin Kim",
  "license": "ISC",
  "dependencies": {
    "axios": "^0.27.2",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.0.1",
    "express": "^4.18.1",
    "express-session": "^1.17.3",
    "morgan": "^1.10.0",
    "nunjucks": "^3.2.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.16"
  }
}
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter10\nodecat> npm i

added 116 packages, and audited 117 packages in 9s

16 packages are looking for funding
  run `npm fund` for details

3 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

이 서버의 주목적은 nodebird-api의 API를 통해 데이터를 가져오는 것이다. 가져온 데이터는 JSON 형태이므로 퍼그나 넌적스 같은 템플릿 엔진으로 데이터를 렌더링할 수도 있다. 서버 파일과 에러를 표시할 파일을 생성한다.

**app.js**
```
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");

dotenv.config();
const indexRouter = require("./routes");

const app = express();
app.set("port", process.env.PORT || 4000);
app.set("view engine", "html");
nunjucks.configure("views", {
    express: app,
    watch: true,
});

app.use(morgan("dev"));
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

사용하지 않는 미들웨어는 제외하고 최대한 간단하게 `app.js`를 구성했다.

**views/error.html**
```
<h1>{{message}}</h1>
<h2>{{error.status}}</h2>
<pre>{{error.stack}}</pre>
```

API를 사용하려면 먼저 사용자 인증을 받아야 하므로 사용자 인증이 원활하게 진행되는지 테스트하는 라우터를 만들어본다. 방금 전 발급받은 `clientSecret`을 `.env`에 넣는다.

**.env**
```
COOKIE_SECRET=nodecat
CLIENT_SECRET=01aeccad-a69e-4b97-991e-d26b0e34b7cb
```

**routes/index.js**
```
const express = require("express");
const { test } = require("../controllers");

const router = express.Router();

// POST /test
router.get("/test", test);

module.exports = router;
```

**controllers/index.js**
```
const axios = require("axios");

exports.test = async (req, res, next) => {  // 토큰 테스트 라우터
    try {
        if (!req.session.jwt) {     // 세션에 토큰이 없으면 토큰 발급 시도
            const tokenResult = await axios.post("http://localhost:8002/v1/token", {
                clientSecret: process.env.CLIENT_SECRET,
            });

            if (tokenResult.data?.code === 200) {           // 토큰 발급 성공
                req.session.jwt = tokenResult.data.token;   // 세션에 토큰 저장
            } else {                                        // 토큰 발급 실패
                return res.json(tokenResult.data);          // 발급 실패 사유 응답
            }
        }

        // 발급받은 토큰 테스트
        const result = await axios.get("http://localhost:8002/v1/test", {
            headers: { authorization: req.session.jwt },
        });

        return res.json(result.data);
    } catch (error) {
        console.error(error);

        if (error.response?.status === 419) {   // 토큰 만료 시
            return res.json(error.response.data);
        }

        return next(error);
    }
};
```

`GET /test` 라우터는 NodeCat 서비스가 토큰 인증 과정을 테스트해보는 라우터이다.

요청이 왔을 때 세션에 발급받은 토큰이 저장되어 있지 않다면 `POST http://localhost:8002/v1/token` 라우터로부터 토큰을 발급받는다. 이때 HTTP 요청의 본문에 클라이언트 비밀 키를 실어 보낸다.

발급에 성공했다면 응답 데이터의 `code` 속성이 200일 것이다. 발급받은 토큰으로 다시 `GET http://localhost:8002/v1/test`에 접근해 토큰이 유효한지 테스트해본다. 이때는 JWT 토큰을 요청의 본문 대신 `authorization` 헤더에 넣었다. 보통 인증용 토큰은 이 헤더에 넣어 전송한다.

실제로 `GET /test` 라우터 사용을 위해 두 서버를 실행하고 `http://localhost:4000/test`로 접속한다.

위 코드에서는 토큰이 만료되었을 때 갱신해주는 코드가 존재하지 않아 1분 뒤면 토큰이 만료된 채로 존재할 것이다.
- - -


## 10.5 SNS API 서버 만들기

다시 API 제공자(`nodebird-api`)의 입장에서 나머지 라우터를 완성한다.

**nodebird-api/routes/v1.js**
```
const express = require("express");

const { verifyToken } = require("../middlewares");
const { createToken, tokenTest, getMyPosts, getPostsByHashtag } = require("../controllers/v1");

const router = express.Router();

// POST /v1/token
router.post("/token", createToken);

// POST /v1/test
router.get("/test", verifyToken, tokenTest);

// GET /v1/posts/my
router.get("/posts/my", verifyToken, getMyPosts);

// GET /v1/posts/hashtag/:title
router.get("/posts/hashtag/:title", verifyToken, getPostsByHashtag);

module.exports = router;
```

**nodebird-api/controllers/v1.js**
```
const jwt = require("jsonwebtoken");
const { Domain, User, Post, Hashtag } = require("../models");

exports.createToken = async (req, res) => {
    const { clientSecret } = req.body;

    try {
        const domain = await Domain.findOne({
            where: { clientSecret },
            include: {
                model: User,
                attribute: ["nick", "id"],
            },
        });

        if (!domain) {
            return res.status(401).json({
                code: 401,
                message: "등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요.",
            });
        }

        const token = jwt.sign({
            id: domain.User.id,
            nick: domain.User.nick,
        }, process.env.JWT_SECRET, {
            expiresIn: "1m",    // 1분
            issuer: "nodebird",
        });

        return res.json({
            code: 200,
            message: "토큰이 발급되었습니다.",
            token,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            code: 500,
            message: "서버 에러",
        });
    }
};

exports.tokenTest = (req, res) => {
    res.json(res.locals.decoded);
};

exports.getMyPosts = (req, res) => {
    Post.findAll({ where: { userId: res.locals.decoded.id } })
        .then((posts) => {
            console.log(posts);
            
            res.json({
                code: 200,
                payload: posts,
            });
        })
        .catch((error) => {
            console.error(error);

            return res.status(500).json({
                code: 500,
                message: "서버 에러",
            });
        });
};

exports.getPostsByHashtag = async (req, res) => {
    try {
        const hashtag = await Hashtag.findOne({ where: { title: req.params.title } });

        if (!hashtag) {
            return res.status(404).json({
                code: 404,
                message: "검색 결과가 없습니다.",
            });
        }

        const posts = await hashtag.getPosts();

        return res.json({
            code: 200,
            payload: posts,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            code: 500,
            message: "서버 에러",
        });
    }
};
```

내가 올린 모든 포스트를 가져오는 `GET /posts/my` 라우터와 특정 해시태그의 모든 게시글을 가져오는 `GET /posts/hashtag/:title` 라우터를 추가했다.

다음으로는 API 사용자(`nodecat`)의 입장에서 다시 위의 API를 사용하는 코드를 작성한다.

**nodecat/routes/index.js**
```
const express = require("express");
const { test, searchByHashtag, getMyPosts } = require("../controllers");

const router = express.Router();

// POST /test
router.get("/test", test);

// GET /myposts
router.get("/myposts", getMyPosts);

// GET /search/:hashtag
router.get("/search/:hashtag", searchByHashtag);

module.exports = router;
```

**nodecat/.env**
```
COOKIE_SECRET=nodecat
CLIENT_SECRET=01aeccad-a69e-4b97-991e-d26b0e34b7cb
API_URL=http://localhost:8002/v1
ORIGIN=http://localhost:4000
```

**nodecat/controllers/index.js**
```
const axios = require("axios");

const URL = process.env.API_URL;
axios.defaults.headers.origin = process.env.ORIGIN;     // origin 헤더 추가

const request = async (req, api) => {
    try {
        if (!req.session.jwt) {     // 세션에 토큰이 없으면
            const tokenResult = await axios.post(`${URL}/token`, {
                clientSecret: process.env.CLIENT_SECRET,
            });

            req.session.jwt = tokenResult.data.token;    // 세션에 토큰 저장
        }

        return await axios.get(`${URL}${api}`, {
            headers: { authorization: req.session.jwt },
        });     // API 요청
    } catch (error) {
        if (error.response?.status === 419) {   // 토큰이 만료된 경우
            delete req.session.jwt;     // 토큰을 삭제함으로써 다시 발급받게 함

            return request(req, api);   // 재귀 호출하여 다시 토큰을 발급
        }   // 419 이외의 다른 에러인 경우

        throw error;
    }
};

exports.getMyPosts = async (req, res, next) => {
    try {
        const result = await request(req, "/posts/my");

        res.json(result.data);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.searchByHashtag = async (req, res, next) => {
    try {
        const result = await request(
            req, `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`,
        );

        res.json(result.data);
    } catch (error) {
        if (error.code) {
            console.error(error);
            next(error);
        }
    }
};

exports.test = async (req, res, next) => {  // 토큰 테스트 라우터
    try {
        if (!req.session.jwt) {     // 세션에 토큰이 없으면 토큰 발급 시도
            const tokenResult = await axios.post("http://localhost:8002/v1/token", {
                clientSecret: process.env.CLIENT_SECRET,
            });

            if (tokenResult.data?.code === 200) {           // 토큰 발급 성공
                req.session.jwt = tokenResult.data.token;   // 세션에 토큰 저장
            } else {                                        // 토큰 발급 실패
                return res.json(tokenResult.data);          // 발급 실패 사유 응답
            }
        }

        // 발급받은 토큰 테스트
        const result = await axios.get("http://localhost:8002/v1/test", {
            headers: { authorization: req.session.jwt },
        });

        return res.json(result.data);
    } catch (error) {
        console.error(error);

        if (error.response?.status === 419) {   // 토큰 만료 시
            return res.json(error.response.data);
        }

        return next(error);
    }
};
```

`request` 함수는 NodeBird API에 요청을 보내는 함수이다. 먼저 요청의 헤더 `origin` 값을 `localhost:4000`으로 설정한다. 어디서 요청을 보내오는지 API 제공자가 파악할 수 있게 하기 위해 사용한다.<br>
세션에 토큰이 없으면 `clientSecret`을 사용해 토큰을 발급받는 요청을 보내고, 발급받은 이후에 토큰을 이용하여 API 요청을 보낸다. 여기서 토큰을 세션에 저장하는 것은 재사용하기 위함이다.

`GET /myposts` 라우터는 API를 사용해 자신이 작성한 포스트를 JSON 형식으로 가져온다.

`GET /search/:hashtag` 라우터는 API를 사용해 특정 해시태그를 사용한 포스트를 검색한다.

이제 두 서버를 가동하고 `localhost:4000/myposts`, `localhost:4000/search/[해시태그]`에 접속하면 API 서버로부터의 응답을 JSON 형태로 확인할 수 있다.
- - -


## 10.6 사용량 제한 구현하기

인증된 사용자만 API를 사용할 수 있게 제한을 두긴 했지만 이것으로는 부족하다. 인증을 받았더라도 한 번에 요청을 너무 많이 보내면 서버에 부담을 줄 수 있다. 따라서 일정 기간 내에 API를 사용할 수 있는 횟수에 제한을 두어 서버의 트래픽을 줄이는 것이 좋다.

이러한 기능은 npm 패키지로 이미 구현되어 있다. 이 절에서는 `express-rate-limit` 패키지를 살펴본다. 다음과 같이 `nodebird-api` 프로젝트에 패키지를 설치한다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter10\nodebird-api> npm i express-rate-limit

added 1 package, and audited 219 packages in 4s

20 packages are looking for funding
  run `npm fund` for details

6 moderate severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
```

`verifyToken` 미들웨어 아래에 `apiLimiter` 미들웨어와 `deprecated` 미들웨어를 추가한다.

**middlewares/index.js**
```
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

...

exports.apiLimiter = rateLimit({
    windowMs: 60 * 1000,    // 1분
    max: 1,
    
    handler(req, res) {
        res.status(this.statusCode).json({
            code: this.statusCode,      // 기본값 429
            message: "1분에 한 번만 요청할 수 있습니다.",
        });
    },
});

exports.deprecated = (req, res) => {
    res.status(410).json({
        code: 410,
        message: "새로운 버전이 나왔습니다. 새로운 버전을 사용하세요.",
    });
};
```

이제 `apiLimiter` 미들웨어를 라우터에 넣으면 라우터에 사용량 제한이 걸린다. 이 미들웨어의 옵션으로는 `windowMs`(기준 시간), `max`(허용 횟수), `handler`(제한 초과 시의 콜백 함수) 등이 있다.

`deprecated` 미들웨어는 사용하면 안 되는 라우터에 붙여줄 것이다. 

다음과 같이 클라이언트로 보내는 응답 코드를 정리해두면 좋다. 이는 클라이언트가 프로그래밍 시 많은 도움이 된다.

**API 응답 목록**
| 응답 코드 | 메시지 |
| :--: | :-- |
| 200 | JSON 데이터입니다. |
| 401 | 유효하지 않은 토큰입니다. |
| 410 | 새로운 버전이 나왔습니다. 새로운 버전을 사용하세요. |
| 419 | 토큰이 만료되었습니다. |
| 429 | 1분에 한 번만 요청할 수 있습니다. |
| 500~ | 기타 서버 에러 |

사용량 제한이 추가되었으므로 기존 API 버전과 호환되지 않는다. 그러므로 새로운 `v2` 라우터를 만든다.

**routes/v2.js**
```
const express = require("express");

const { verifyToken, apiLimiter } = require("../middlewares");
const { createToken, tokenTest, getMyPosts, getPostsByHashtag } = require("../controllers/v2");

const router = express.Router();

// POST /v2/token
router.post("/token", apiLimiter, createToken);

// POST /v2/test
router.get("/test", apiLimiter, verifyToken, tokenTest);

// GET /v2/posts/my
router.get("/posts/my", apiLimiter, verifyToken, getMyPosts);

// GET /v2/posts/hashtag/:title
router.get("/posts/hashtag/:title", apiLimiter, verifyToken, getPostsByHashtag);

module.exports = router;
```

**controllers/v2.js**
```
const jwt = require("jsonwebtoken");
const { Domain, User, Post, Hashtag } = require("../models");

exports.createToken = async (req, res) => {
    const { clientSecret } = req.body;

    try {
        const domain = await Domain.findOne({
            where: { clientSecret },
            include: {
                model: User,
                attribute: ["nick", "id"],
            },
        });

        if (!domain) {
            return res.status(401).json({
                code: 401,
                message: "등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요.",
            });
        }

        const token = jwt.sign({
            id: domain.User.id,
            nick: domain.User.nick,
        }, process.env.JWT_SECRET, {
            expiresIn: "30m",    // 1분
            issuer: "nodebird",
        });

        return res.json({
            code: 200,
            message: "토큰이 발급되었습니다.",
            token,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            code: 500,
            message: "서버 에러",
        });
    }
};

exports.tokenTest = (req, res) => {
    res.json(res.locals.decoded);
};

exports.getMyPosts = (req, res) => {
    Post.findAll({ where: { userId: res.locals.decoded.id } })
        .then((posts) => {
            console.log(posts);
            
            res.json({
                code: 200,
                payload: posts,
            });
        })
        .catch((error) => {
            console.error(error);

            return res.status(500).json({
                code: 500,
                message: "서버 에러",
            });
        });
};

exports.getPostsByHashtag = async (req, res) => {
    try {
        const hashtag = await Hashtag.findOne({ where: { title: req.params.title } });

        if (!hashtag) {
            return res.status(404).json({
                code: 404,
                message: "검색 결과가 없습니다.",
            });
        }

        const posts = await hashtag.getPosts();

        return res.json({
            code: 200,
            payload: posts,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            code: 500,
            message: "서버 에러",
        });
    }
};
```

토큰 유효 기간을 30분으로 늘리고, 라우터에 사용량 제한 미들웨어를 추가했다. 다음으로는 기존의 `v1` 라우터에 `deprecated` 미들웨어를 추가한다.

**routes/v1.js**
```
const express = require("express");

const { verifyToken, deprecated } = require("../middlewares");
const { createToken, tokenTest, getMyPosts, getPostsByHashtag } = require("../controllers/v1");

const router = express.Router();

router.use(deprecated);

// POST /v1/token
router.post("/token", createToken);

// POST /v1/test
router.get("/test", verifyToken, tokenTest);

// GET /v1/posts/my
router.get("/posts/my", verifyToken, getMyPosts);

// GET /v1/posts/hashtag/:title
router.get("/posts/hashtag/:title", verifyToken, getPostsByHashtag);

module.exports = router;
```

새로 만든 라우터를 서버와 연결한다.

**app.js**
```
...

dotenv.config();

const v1 = require("./routes/v1");
const v2 = require("./routes/v2");

...

app.use(passport.session());

app.use("/v1", v1);
app.use("/v2", v2);

...
```

다시 API 사용자(`nodecat`)의 입장으로 돌아와서 새로 생긴 버전을 호출한다. 버전만 `v1`에서 `v2`로 바꾸면 된다.

**nodecat/.env**
```
COOKIE_SECRET=nodecat
CLIENT_SECRET=01aeccad-a69e-4b97-991e-d26b0e34b7cb
API_URL=http://localhost:8002/v2
ORIGIN=http://localhost:4000
```

이제 두 서버를 가동하고 `localhost:4000/myposts` 또는 `localhost:4000/search/[해시태그]` 주소에 여러 번 접속하면 사용량 제한을 확인할 수 있다.

현재는 서버가 재시작되면 사용량이 초기화되므로 실제 서비스에서는 사용량을 저장할 데이터베이스를 따로 마련하는 것이 좋다. 보통 레디스가 많이 사용된다. `express-rate-limit`은 데이터베이스 연결을 지원하지 않으므로 새로운 패키지를 찾아보거나 직접 구현해야 한다.
- - -


## 10.7 CORS 이해하기

이제까지의 구현은 서버에서 서버로 API를 호출하였다. 이번에는 API 사용자 서버의 프론트 영역에서 API를 호출하는 경우를 살펴본다. 즉, NodeCat의 프론트 영역에서 nodebird-api 서버의 API를 호출하는 경우에 관한 것이다.

**nodecat/routes/index.js**
```
const express = require("express");
const { test, searchByHashtag, getMyPosts, renderMain } = require("../controllers");

const router = express.Router();

...

// GET /
router.get("/", renderMain);

module.exports = router;
```

**nodecat/controllers/index.js**
```
...

exports.renderMain = (req, res) => {
    res.render("main", { key: process.env.CLIENT_SECRET });
};
```

프론트 화면도 추가한다.

**nodecat/views/main.html**
```
<!DOCTYPE html>
<html>
<head>
    <title>프론트 API 요청</title>
</head>
<body>
    <div id="result"></div>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script>
        axios.post("http://localhost:8002/v2/token", {
            clientSecret: "{{key}}",
        })
            .then((res) => {
                document.querySelector("#result").textContent = JSON.stringify(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    </script>
</body>
</html>
```