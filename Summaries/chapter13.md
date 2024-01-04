# Node.js 교과서 13장 요약
## *실시간 경매 시스템 만들기*

이번 장에서는 실시간 경매 시스템을 구현한다. 서버, 클라이언트, 데이터베이스 간 주고 받는 요청과 응답, 세션, 데이터 흐름 등에 주목한다.

- - -

## 13.1 프로젝트 구조 갖추기

프로젝트 이름은 **NodeAuction**이다. 먼저 **node-auction** 디렉터리를 만든 후 그 안에 **package.json**을 생성한다.

**package.json**
```
{
  "name": "node-auction",
  "version": "0.0.1",
  "description": "노드 경매 시스템",
  "main": "app.js",
  "scripts": {
    "start": "nodemon app"
  },
  "author": "Yushin Kim",
  "license": "ISC",
  "dependencies": {
    "cookie-parser": "^1.4.5",
    "dotenv": "^16.0.1",
    "express": "^4.18.1",
    "express-session": "^1.17.1",
    "morgan": "^1.10.0",
    "multer": "^1.4.2",
    "nunjucks": "^3.2.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.16"
  }
}
```

**console**
```
Study_Node.js/Codes/chapter13/node-auction$ npm i
```

데이터베이스로는 MySQL을 사용할 것이다. 시퀄라이즈를 설치하고 기본 디렉터리를 생성한다.

**console**
```
Study_Node.js/Codes/chapter13/node-auction$ npm i sequelize sequelize-cli mysql2
```

데이터베이스 모델은 사용자, 제품, 경매 세 가지로 구성될 것이다. 다음과 같이 세 모델을 정의한다.

**models/user.js**
```
const Sequelize = require("sequelize");

class User extends Sequelize.Model {
    static initiate(sequelize) {
        User.init({
            email: {
                type: Sequelize.STRING(40),
                allowNull: false,
                unique: true,
            },

            nick: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },

            password: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },

            money: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            modelName: "User",
            tableName: "users",
            charset: "utf8",
            collate: "utf8_general_ci",
        });
    }

    static assoicate(db) {
        db.User.hasMany(db.Auction);
    }
};

module.exports = User;
```

사용자 모델은 이메일(`email`), 닉네임(`nick`), 비밀번호(`password`), 보유 자금(`money`)으로 구성된다.

하나의 사용자가 여러 번 입찰할 수 있으므로 사용자 모델과 경매 모델은 일대다 관계에 있다.

**models/good.js**
```
const Sequelize = require("sequelize");

class Good extends Sequelize.Model {
    static initiate(sequelize) {
        Good.init({
            name: {
                type: Sequelize.STRING(40),
                allowNull: false,
            },

            img: {
                type: Sequelize.STRING(200),
                allowNull: true,
            },

            price: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            modelName: "Good",
            tableName: "goods",
            charset: "utf8",
            collate: "utf8_general_ci",
        });
    }

    static associate(db) {
        db.Good.belongsTo(db.User, { as: "Owner" });
        db.Good.belongsTo(db.User, { as: "Sold" });
        db.Good.hasMany(db.Auction);
    }
};

module.exports = Good;
```

상품 모델은 상품명(`name`), 상품 사진(`img`), 시작 가격(`price`)으로 구성된다.

사용자 모델과 상품 모델 간에는 일대다 관계가 두 번 적용된다. 하나의 사용자가 여러 개의 상품을 등록할 수 있다는 점에서 `Owner`와 `Good` 간 일대다 관계가 성립하고, 하나의 사용자가 여러 개의 상품을 낙찰받을 수 있다는 점에서 `Sold`와 `Good` 간 일대다 관계가 성립한다.

두 관계를 구분하기 위해 `as` 속성을 사용하였다. 각각 `OwnerId`, `SoldId` 컬럼으로 추가된다. 나중에 낙찰자를 `good.setSold([사용자 아이디])`로 지정할 수 있다.

하나의 상품은 여러 명이 입찰할 수 있으므로 상품 모델과 경매 모델은 일대다 관계이다.

**models/auction.js**
```
const Sequelize = require("sequelize");

class Auction extends Sequelize.Model {
    static initiate(sequelize) {
        Auction.init({
            bid: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defalutValue: 0,
            },

            msg: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
        }, {
            sequelize,
            timestamp: true,
            paranoid: true,
            modelName: "Auction",
            tableName: "auctions",
            charset: "utf8",
            collate: "utf8_general_ci",
        });
    }

    static associate(db) {
        db.Auction.belongsTo(db.User);
        db.Auction.belongsTo(db.Good);
    }
};

module.exports = Auction;
```

경매 모델은 입찰가(`bid`)와 입찰 시 메시지(`msg`)로 구성된다.

경매 모델은 사용자 모델 및 상품 모델과 다대일 관계에 있다. 따라서 경매 모델에는 `UserId`, `GoodId` 컬럼이 생성된다.

모델 생성 후 모델을 데이터베이스 및 서버와 연결한다. nodeauction 데이터베이스를 생성해야 하므로 config.json을 데이터베이스에 맞게 수정한다.

**config/config.json**
```
{
    "development": {
        "username": "root",
        "password": "kimyush1n@@",
        "database": "nodeauction",
        "host": "127.0.0.1",
        "dialect": "mysql"
    }
}
```

**console**
```
Study_Node.js/Codes/chapter13/node-auction$ npx sequelize db:create

Sequelize CLI [Node: 20.9.0, CLI: 6.6.2, ORM: 6.35.2]

Loaded configuration file "config/config.json".
Using environment "development".
Database nodeauction created.
```

다음으로 **models/index.js**를 수정한다.

**models/index.js**
```
const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const db = {};
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;

const basename = path.basename(__filename);

fs
    .readdirSync(__dirname)     // 현재 디렉터리의 모든 파일 조회
    .filter((file) =>           // 숨김 파일, index.js, js 확장자가 아닌 파일 필터링
        (file.indexOf(".") !== 0) && (file !== basename) && (file.slice(-3) === ".js")
    )
    .forEach((file) => {        // 해당 파일의 모델을 불러와 initiate
        const model = require(path.join(__dirname, file));
        console.log(file, model.name);
        db[model.name] = model;
        model.initiate(sequelize);
    });

Object.keys(db).forEach((modelName) => {    // associate 호출
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;
```

다음으로 로그인을 위한 `passport` 설정을 진행한다. 단순한 구현을 위해 `passport-local`만 사용한다.

**console**
```
Study_Node.js/Codes/chapter13/node-auction$ npm i passport passport-local bcrypt
```

**passport/localStrategy.js**
```
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const User = require("../models/user");

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
    }, async (email, password, done) => {
        try {
            const exUser = await User.findOne({ where: { email }});
            if (exUser) {
                const result = await bcrypt.compare(password, exUser.password);
                if (result) {
                    done(null, exUser);
                } else {
                    done(null, false, { message: "비밀번호가 일치하지 않습니다." });
                }
            } else {
                done(null, false, { message: "등록되지 않은 회원입니다." });
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};
```

**passport/index.js**
```
const passport = require("passport");

const local = require("./localStrategy");
const User = require("../models/user");

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findOne({ where: { id } })
            .then((user) => done(null, user))
            .catch((error) => done(error));
    });

    local();
};
```

로그인을 위한 컨트롤러, 라우터, 미들웨어도 추가한다.

**controllers/auth.js**
```
const bcrypt = require("bcrypt");
const passport = require("passport");

const User = require("../models/user");

exports.join = async (req, res, next) => {
    const { email, nick, password, money } = req.body;

    try {
        const exUser = await User.findOne({ where: { email } });
        if (exUser) {
            return res.redirect("/join?error=이미 가입된 이메일입니다.");
        }

        const hash = await bcrypt.hash(password, 12);
        await User.create({
            email,
            nick,
            password: hash,
            money,
        });

        return res.redirect("/");
    } catch (error) {
        console.error(error);
        return next(error);
    }
};

exports.login = (req, res, next) => {
    passport.authenticate("local", (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }

        if (!user) {
            return res.redirect(`/?error=${info.message}`);
        }

        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }

            return res.redirect("/");
        });
    })(req, res, next);     // 미들웨어 내의 미들웨어는 (req, res, next)를 붙인다.
};

exports.logout = (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
};
```

**routes/auth.js**
```
const express = require("express");

const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const { join, login, logout } = require("../controllers/auth");

const router = express.Router();

// POST /auth/join
router.post("/join", isNotLoggedIn, join);

// POST /auth/login
router.post("/login", isNotLoggedIn, login);

// GET /auth/logout
router.get("/logout", isLoggedIn, logout);

module.exports = router;
```

**middlewares/index.js**
```
exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send("로그인이 필요합니다.");
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        const message = encodeURIComponent("로그인한 상태입니다.");
        res.redirect(`/?error=${message}`);
    }
};
```

마지막으로 **.env**와 서버 코드를 작성한다. 여기서 시퀄라이즈와 패스포트를 모두 서버에 연결할 것이다.

**.env**
```
COOKIE_SECRET=auction
```

**app.js**
```
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
dotenv.config();

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const { sequelize } = require("./models");
const passportConfig = require("./passport");

const app = express();
passportConfig();
app.set("port", process.env.PORT || 8010);
app.set("view engine", "html");
nunjucks.configure("views", {
    express: app,
    watch: true,
});
sequelize.sync({ force: false })
    .then(() => {
        console.log("데이터베이스 연결 성공")
    })
    .catch((error) => {
        console.error(error);
    });

const sessionMiddleware = session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/auth", authRouter);

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

이번 장에서 구현할 경매 시스템은 회원 가입, 로그인, 경매 상품 등록, 방 참여, 경매 진행 기능으로 이루어져 있다. 먼저 각각의 기능에 대한 페이지와 라우터를 만든다.

**views/error.html**
```
{% extends "layout.html" %}

{% block content %}
<h1>{{message}}</h1>
<h2>{{error.status}}</h2>
<pre>{{error.stack}}</pre>
{% endblock %}
```

화면의 레이아웃 페이지를 작성한다.

**views/layout.html**
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
                <div class="user-name">안녕하세요 {{user.nick}}님</div>
                <div class="user-money">보유 자산: {{user.money}}원</div>
                <input type="hidden" id="my-id" value="user.id">
                <a href="/auth/logout" id="logout" class="btn">로그아웃</a>
                <a href="/good" id="register" class="btn">상품 등록</a>
                
                {% else %}
                <form action="/auth/login" id="login-form" method="post">
                    <div class="input-group">
                        <label for="email">이메일</label>
                        <input type="email" id="email" name="email" required authfocus>
                    </div>
                    <div class="input-group">
                        <label for="password">비밀번호</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <a href="/join" id="join" class="btn">회원 가입</a>
                    <button id="login" class="btn" type="submit">로그인</button>
                </form>
                {% endif %}
            </div>
            <footer>
                Made by&nbsp;<a href="https://github.com/Yush1nk1m" target="_blank">Yushin Kim</a>
            </footer>
            {% block good %}
            {% endblock %}
        </div>
        {% block content %}
        {% endblock %}
    </div>
    <script>
        window.onload = () => {
            if (new URL(location.href).searchParams.get("error")) {
                alert(new URL(location.href).searchParams.get("error"));
            }
        };
    </script>
</body>
</html>
```

메인 페이지를 작성한다.

**views/main.html**
```
{% extends "layout.html" %}

{% block content %}
<div class = "timeline">
    <h2>경매 진행 목록</h2>
    <table id="good-list">
        <tr>
            <th>상품명</th>
            <th>이미지</th>
            <th>시작 가격</th>
            <th>종료 시간</th>
            <th>입장</th>
        </tr>
        {% for good in goods %}
        <tr>
            <td>{{good.name}}</td>
            <td>
                <img src="/img/{{good.img}}">
            </td>
            <td>{{good.price}}</td>
            <td class="time" data-start="{{good.createdAt}}">00:00:00</td>
            <td>
                <a href="/good/{{good.id}}" class="enter btn">입장</a>
            </td>
        </tr>
        {% endfor %}
    </table>
</div>
{% endblock %}
```

회원 가입 페이지를 작성한다.

**views/join.html**
```
{% extends "layout.html" %}

{% block content %}
<div class="timeline">
    <form action="/auth/join" id="join-form" method="post">
        <div class="input-group">
            <label for="join-email">이메일</label>
            <input type="email" id="join-email" name="email">
        </div>
        <div class="input-group">
            <label for="join-nick">닉네임</label>
            <input type="text" id="join-nick" name="nick">
        </div>
        <div class="input-group">
            <label for="join-password">비밀번호</label>
            <input type="password" id="join-password" name="password">
        </div>
        <div class="input-group">
            <label for="join-money">보유 자산</label>
            <input type="number" id="join-money" name="money">
        </div>
        <button id="join-btn" class="btn" type="submit">회원 가입</button>
    </form>
</div>
<script>
    window.onload = () => {
        if (new URL(location.href).searchParams.get("error")) {
            alert(new URL(location.href).searchParams.get("error"));
        }
    };
</script>
{% endblock %}
```

상품 업로드 페이지를 작성한다.

**views/good.html**
```
{% extends "layout.html" %}

{% block content %}
<div class="timeline">
    <form action="/good" id="good-form" method="post" enctype="multipart/form-data">
        <div class="input-group">
            <label for="good-name">상품명</label>
            <input type="text" id="good-name" name="name" required autofocus>
        </div>
        <div class="input-group">
            <label for="good-photo">상품 사진</label>
            <input type="file" id="good-photo" name="img" required>
        </div>
        <div class="input-group">
            <label for="good-price">시작 가격</label>
            <input type="number" id="good-price" name="price" required>
        </div>
        <button id="join-btn" class="btn" type="submit">상품 등록</button>
    </form>
</div>
{% endblock %}
```

**public/main.css**
```
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; height: 100%; }
.btn {
  display: inline-block;
  padding: 0 5px;
  text-decoration: none;
  cursor: pointer;
  border-radius: 4px;
  background: white;
  border: 1px solid silver;
  color: crimson;
  height: 37px;
  line-height: 37px;
  vertical-align: top;
  font-size: 12px;
}
input, textarea {
  border-radius: 4px;
  height: 37px;
  padding: 10px;
  border: 1px solid silver;
}
.container { width: 100%; height: 100%; }
@media screen and (min-width: 800px) {
  .container { width: 800px; margin: 0 auto; }
}
.input-group { margin-bottom: 15px; }
.input-group label { width: 25%; display: inline-block; }
.input-group input { width: 70%; }
#join { float: right; }
.profile-wrap {
  width: 100%;
  display: inline-block;
  vertical-align: top;
  margin: 10px 0;
}
@media screen and (min-width: 800px) {
  .profile-wrap { width: 290px; margin-bottom: 0; }
}
.profile {
  text-align: left;
  padding: 10px;
  margin-right: 10px;
  border-radius: 4px;
  border: 1px solid silver;
  background: yellow;
}
.user-name, .user-money {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
}
.timeline {
  margin-top: 10px;
  width: 100%;
  display: inline-block;
  border-radius: 4px;
  vertical-align: top;
}
@media screen and (min-width: 800px) { .timeline { width: 500px; } }
#good-list, #good-list th, #good-list td {
  border: 1px solid black;
  border-collapse: collapse;
}
#good-list img { max-height: 100px; vertical-align: top; }
#good-img { width: 280px; display: block; }
.error-message { color: red; font-weight: bold; }
#join-form, #good-form { padding: 10px; text-align: center; }
footer { text-align: center; }
```

마지막으로 경매를 위한 라우터와 컨트롤러를 작성한다.

**routes/index.js**
```
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { isLoggedIn, inNotLoggedIn, isNotLoggedIn } = require("../middlewares");
const { renderMain, renderJoin, renderGood, createGood } = require("../controllers");

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

router.get("/", renderMain);

router.get("/join", isNotLoggedIn, renderJoin);

router.get("/good", isLoggedIn, renderGood);

try {
    fs.readdirSync("uploads");
} catch (error) {
    console.error("uploads 디렉터리가 존재하지 않아 생성합니다.");
    fs.mkdirSync("uploads");
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, "uploads/");
        },

        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
        },
    }),

    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/good", isLoggedIn, upload.single("img"), createGood);

module.exports = router;
```

**controllers/index.js**
```
const { Op } = require("sequelize");
const { Good } = require("../models");

exports.renderMain = async (req, res, next) => {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);     // 어제 시간
        const goods = await Good.findAll({
            where: { SoldId: null, createdAt: { [Op.gte]: yesterday } },
        });

        res.render("main", {
            title: "NodeAuction",
            goods,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.renderJoin = (req, res) => {
    res.render("join", {
        title: "회원 가입 - NodeAuction",
    });
};

exports.renderGood = (req, res) => {
    res.render("good", {
        title: "상품 등록 - NodeAuction",
    });
};

exports.createGood = async (req, res, next) => {
    try {
        const { name, price } = req.body;
        await Good.create({
            OwnerId: req.user.id,
            name,
            img: req.file.filename,
            price,
        });
        res.redirect("/");
    } catch (error) {
        console.error(error);
        next(error);
    }
};
```

`router.use`에서 `res.locals.user = req.user`로 모든 넌적스 템플릿에서 사용자 정보를 변수로 사용할 수 있도록 하였다. 이렇게 하면 `res.render` 메소드에 매번 `user: req.user`와 같이 변수를 전달할 필요가 없기 때문에 코드의 중복을 줄일 수 있다.

라우터는 **GET /**, **GET /join**, **GET /good**, **POST /good**으로 이루어져 있다. 각각 메인 화면 렌더링, 회원 가입 화면 렌더링, 상품 등록 화면 렌더링, 업로드한 상품의 처리에 대한 라우터이다.

이제 서버의 기초적인 골격이 완성되었고, 서버를 실행하면 상품 등록까지 할 수 있다.

- - -

## 13.2 서버센트 이벤트 사용하기