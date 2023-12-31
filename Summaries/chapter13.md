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

온라인 경매와 같은 서비스에서는 모든 사람에게 같은 시간이 표시되고 적용되어야 한다. 하지만 클라이언트의 시간을 사용하는 것은 변조 가능성이 있기 때문에 서버 시간을 받아오는 것이 좋다.

폴링이나 웹 소켓을 통해 서버 시간을 받아올 수도 있지만 이번 예제에서는 서버센트 이벤트를 사용해 서버 시간을 받아올 것이다. 주기적으로 서버 시간을 조회하는 데에는 양방향 통신이 필요하지 않기 때문이다.

경매를 진행하는 동안 다른 사람이 참여하거나 입찰했을 때 이를 알리기 위해 웹 소켓을 사용할 것이다. 서버센트 이벤트와 웹 소켓은 같이 사용할 수 있다.

먼저 패키지를 설치한다.

**console**
```
Study_Node.js/Codes/chapter13/node-auction$ npm i sse socket.io
```

서버와 `sse`, `socket.io` 모듈을 연결한다.

**app.js**
```
...

const passportConfig = require("./passport");
const sse = require("./sse");
const webSocket = require("./socket");

...

const server = app.listen(app.get("port"), () => {
    console.log(app.get("port"), "번 포트에서 대기 중");
});

webSocket(server, app);
sse(server);
```

**sse.js**
```
const SSE = require("sse");

module.exports = (server) => {
    const sse = new SSE(server);
    sse.on("connection", (client) => {      // 서버센트 이벤트 연결
        setInterval(() => {
            client.send(Date.now().toString());
        }, 1000);
    });
};
```

`sse` 모듈을 불러와 `new SSE([익스프레스 서버])`로 서버 객체를 생성하면 된다. 생성한 객체에는 `connection` 이벤트에 대한 리스너를 등록하여 클라이언트와 연결할 때 어떤 동작을 수행할지 정의할 수 있으며, 매개변수로 `client` 객체를 사용할 수 있다. 클라이언트에 메시지를 보낼 때 이 객체를 사용한다. 라우터에서 SSE를 사용하고 싶으면 `app.set` 메소드로 `client` 객체를 등록하고, `req.app.get` 메소드로 가져오면 된다.

이 예제에서는 `client.send` 메소드로 1초마다 접속한 클라이언트들에게 서버 시간 타임스탬프를 보내도록 하였다. 단, 이 메소드로는 문자열만 보낼 수 있으므로 숫자인 타임스탬프를 `toString` 메소드를 사용해 문자열로 변경했다.

**socket.js**
```
const SocketIO = require("socket.io");

module.exports = (server, app) => {
    const io = SocketIO(server, { path: "/socket.io" });
    app.set("io", io);
    io.on("connection", (socket) => {       // 웹 소켓 연결 시
        const req = socket.request;
        const { headers: { referer } } = req;
        const roomId = new URL(referer).pathname.split("/").at(-1);
        socket.join(roomId);
        socket.on("disconnect", () => {
            socket.leave(roomId);
        });
    });
};
```

Socket.IO와도 연결한다. 이번에는 사용자 정의 네임스페이스를 사용하지 않고 기본 네임스페이스(/)로 연결했다. 경매 화면에서 실시간으로 입찰 정보를 올리기 위해 웹 소켓을 사용한다. 클라이언트 연결 시 주소로부터 경매방 아이디를 받아와 `socket.join`으로 해당 방에 입장한다. 연결이 끊기면 `socket.leave`로 해당 방에서 나간다.

서버센트 이벤트는 IE나 엣지 브라우저에서 사용할 수 없다는 단점이 있다. EventSource라는 객체를 지원하지 않기 때문이다. 그러나 사용자가 직접 이를 구현할 수 있다. IE나 엣지 브라우저를 위해 클라이언트 코드에 `EventSource` 폴리필(polyfill)을 포함하였다.

**views/main.html**
```
...

</div>
<script src="https://unpkg.com/event-source-polyfill/src/eventsource.min.js"></script>
<script>
    const es = new EventSource("/sse");
    es.onmessage = function (e) {
        document.querySelectorAll(".time").forEach((td) => {
            const end = new Date(td.dataset.start);     // 경매 시작 시간
            const server = new Date(parseInt(e.data, 10));
            end.setDate(end.getDate() + 1);             // 경매 종료 시간
            if (server >= end) {                        // 경매가 종료되었으면
                td.textContent = "00:00:00";
            } else {
                const t = end - server;                 // 경매 종료까지 남은 시간
                const seconds = ("0" + Math.floor((t / 1000) % 60)).slice(-2);
                const minutes = ("0" + Math.floor((t / 1000 / 60) % 60)).slice(-2);
                const hours = ("0" + Math.floor((t / (1000 * 60 * 60)) % 24)).slice(-2);
                td.textContent = hours + ":" + minutes + ":" + seconds;
            }
        });
    };
</script>
```

첫 번째 스크립트가 `EventSource` 폴리필이다. 이것을 포함하면 IE와 엣지 브라우저에서도 서버센트 이벤트를 사용할 수 있다. 두 번째 스크립트는 `EventSource`를 사용해 서버센트 이벤트를 받는 코드이다. `new EventSource("/sse")`로 서버와 연결하고, `es.onmessage` 또는 `es.addEventListener("message")` 이벤트 리스너로 서버로부터 데이터를 받을 수 있다. 서버로부터 받은 데이터는 `e.data`에 들어 있다. 나머지 부분은 서버 시간과 경매 종료 시간을 계산해 카운트다운하는 코드이다.

이제 경매 진행 페이지를 작성한다. 이 페이지는 서버센트 이벤트 및 웹 소켓 모두에 연결한다.

**views/auction.html**
```
{% extends "layout.html" %}

{% block good %}
<h2> {{good.name}}</h2>
<div>등록자: {{good.Owner.nick}}</div>
<div>시작자: {{good.price}}원</div>
<strong id="time" data-start="{{good.createdAt}}"></strong>
<img id="good-img" src="/img/{{good.img}}">
{% endblock %}

{% block content %}
<div class="timeline">
    <div id="bid">
        {% for bid in auction %}
        <div>
            <span>{{bid.User.nick}}님: </span>
            <strong>{{bid.bid}}원에 입찰하셨습니다.</strong>
            {% if bid.msg %}
            <span>{{bid.msg}}</span>
            {% endif %}
        </div>
        {% endfor %}
    </div>
    <form id="bid-form">
        <input type="submit" name="bid" placeholder="입찰가" required min="{{good.price}}">
        <input type="msg" name="msg" placeholder="메시지(선택)" maxlength="100">
        <button class="btn" type="submit">입찰</button>
    </form>
</div>
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script src="https://unpkg.com/event-source-polyfill/src/eventsource.min.js"></script>
<script src="/socket.io/socket.io.js"></script>
<script>
    document.querySelector("#bid-form").addEventListener("submit", (e) => {
        e.preventDefault();
        axios.post("/good/{{good.id}}/bid", {       // 입찰 진행
            bid: e.target.bid.value,
            msg: e.target.msg.value,
        }).catch((err) => {
            console.error(err);
            alert(err.response.data);
        }).finally(() => {
            e.target.bid.value = '';
            e.target.msg.value = '';
        });
    });
    
    const es = new EventSource("/sse");
    const time = document.querySelector("#time");
    es.onmessage = (e) => {
        const end = new Date(time.dataset.start);       // 경매 시작 시간
        end.setDate(end.getDate() + 1);
        const server = new Date(parseInt(e.data, 10));

        if (server >= end) {
            time.textContent = "00:00:00";
        } else {
            const t = end - start;
            const seconds = ("0" + Math.floor((t / 1000) % 60)).slice(-2);
            const minutes = ("0" + Math.floor((t / 1000 / 60) % 60)).slice(-2);
            const hours = ("0" + Math.floor((t / (1000 * 60 * 60)) % 24)).slice(-2);
            time.textContent = hours + ":" + minutes + ":" + seconds;
        }
    };

    const socket = io.connect("http://localhost:8010", {
        path: "/socket.io",
    });
    socket.on("bid", (data) => {        // 누군가 입찰했을 때
        const div = document.createElement("div");
        let span = document.createElement("span");
        span.textContent = data.nick + "님: ";
        const strong = document.createElement("strong");
        strong.textContent = data.bid + "원에 입찰하셨습니다.";
        div.appendChild(span);
        div.appendChild(strong);
        if (data.msg) {
            span = document.createElement("span");
            span.textContent = `(${data.msg})`;
            div.appendChild(span);
        }
        document.querySelector("#bid").appendChild(div);
    });
</script>
<script>
    window.onload = () => {
        if (new URL(location.href).searchParams.get("auctionError")) {
            alert(new URL(location.href).searchParams.get("auctionError"));
        }
    };
</script>
{% endblock %}
```

이제 라우터와 컨트롤러에 **GET /good/:id**와 **/good/:id/bid**를 추가한다.

**routes/index.js**
```
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { isLoggedIn, inNotLoggedIn, isNotLoggedIn } = require("../middlewares");
const {
    renderMain, renderJoin, renderGood, createGood, renderAuction, bid,
} = require("../controllers");

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

router.get("/good/:id", isLoggedIn, renderAuction);

router.post("/good/:id/bid", isLoggedIn, bid);

module.exports = router;
```

**controllers/index.js**
```
const { Op } = require("sequelize");
const { Good, Auction, User } = require("../models");

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

exports.renderAuction = async (req, res, next) => {
    try {
        const [good, auction] = await Promise.all([
            Good.findOne({
                where: { id: req.params.id },
                include: {
                    model: User,
                    as: "Owner",
                },
            }),

            Auction.findAll({
                where: { GoodId: req.params.id },
                include: { model: User },
                order: [["bid", "ASC"]],
            }),
        ]);

        res.render("auction", {
            title: `${good.name} - NodeAuction`,
            good,
            auction,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.bid = async (req, res, next) => {
    try {
        const { bid, msg } = req.body;
        const good = await Good.findOne({
            where: { id: req.params.id },
            include: { model: Auction },
            order: [[{ model: Auction }, "bid", "DESC"]],
        });
        if (!good) {
            return res.status(404).send("해당 상품은 존재하지 않습니다.");
        }
        if (good.price >= bid) {
            return res.status(403).send("시작 가격보다 높게 입찰해야 합니다.");
        }
        if (new Date(good.createdAt).valueOf() + (24 * 60 * 60 * 1000) < new Date()) {
            return res.status(403).send("경매가 이미 종료되었습니다.");
        }
        if (good.Auctions[9]?.bid >= bid) {
            return res.status(403).send("이전 입찰가보다 높아야 합니다.");
        }
        const result = await Auction.create({
            bid,
            msg,
            UserId: req.user.id,
            GoodId: req.params.id,
        });
        // 실시간으로 입찰 내역 전송
        req.app.get("io").to(req.params.id).emit("bid", {
            bid: result.bid,
            msg: result.msg,
            nick: req.user.nick,
        });
        return res.send("ok");
    } catch (error) {
        console.error(error);
        return next(error);
    }
}
```

**GET /good/:id** 라우터와 연결된 `renderAuction` 컨트롤러는 해당 상품과 기존 입찰 정보들을 불러온 뒤 렌더링한다. 상품(`Good`) 모델에 사용자(`User`) 모델을 `include` 할 때 `as` 속성을 사용한 것에 주의한다. `Good`, `User` 모델은 현재 일대다 관계가 두 번 연결(`Owner`, `Sold`)되어 있으므로 이런 경우에는 어떤 관계를 `include`할지 `as` 속성으로 밝혀야 한다.

**POST /good/:id/bid**와 연결된 `bid` 컨트롤러는 클라이언트로부터 받은 입찰 정보를 저장한다. 시작 가격보다 낮게 입찰했거나, 경매 종료 시간이 지났거나, 이전 입찰가보다 낮은 입찰가가 들어왔다면 반려한다. 정상적인 입찰가가 들어왔다면 저장한 후 해당 경매방의 모든 사람에게 입찰자, 입찰 가격, 입찰 메시지 등을 웹 소켓으로 전달한다. `Good.findOne` 메소드의 `order` 속성으로 `Auction` 모델의 `bid` 컬럼을 내림차순으로 정렬하고 있다.

- - -

## 13.3 스케줄링 구현하기

카운트다운이 끝나면 경매를 진행할 수는 없지만 경매 종료 시 낙찰하를 정하는 시스템을 구현해야 한다. 이럴 때 `node-schedule` 모듈을 사용한다.

**console**
```
Study_Node.js/Codes/chapter13/node-auction/views$ npm i node-schedule
```

**controllers/index.js**
```
const { Op } = require("sequelize");
const { Good, Auction, User, sequelize } = require("../models");
const schedule = require("node-schedule");

...

exports.createGood = async (req, res, next) => {
    try {
        const { name, price } = req.body;
        const good = await Good.create({
            OwnerId: req.user.id,
            name,
            img: req.file.filename,
            price,
        });
        const end = new Date();
        end.setDate(end.getDate() + 1);

        const job = schedule.scheduleJob(end, async () => {
            const success = await Auction.findOne({
                where: { GoodId: good.id },
                order: [["bid", "DESC"]],
            });
            await good.setSold(success.UserId);
            await User.update({
                money: sequelize.literal(`money - ${success.bid}`),
            }, {
                where: { id: success.UserId },
            });
        });
        job.on("error", (err) => {
            console.error("스케줄링 에러 발생", err);
        });
        job.on("success", () => {
            console.log("스케줄링 성공");
        });

        res.redirect("/");
    } catch (error) {
        console.error(error);
        next(error);
    }
};

...
```

`schedule` 객체의 `scheduleJob` 메소드로 일정을 예약할 수 있다. 첫 번째 인수로는 실행될 시각을 전달하고, 두 번째 인수로는 해당 시각이 되었을 때 수행할 콜백 함수를 전달한다. 경매 모델에서 가장 높은 가격으로 입찰한 사람을 찾아 상품 모델의 낙찰자 아이디에 전달해주도록 정의했다. 이때 낙찰자의 보유 자산을 낙찰 금액만큼 뺀다.

`scheduleJob` 메소드는 `job` 객체를 반환한다. `job` 객체는 이벤트 이미터라서 `on` 메소드를 통해 이벤트를 수신할 수 있다. 많이 쓰이는 이벤트로는 에러가 발생할 때 발생하는 `error` 이벤트와 스케줄링이 성공한 후 발생하는 `success` 이벤트가 있다. 이외에도 스케줄링이 취소될 때 발생하는 `canceled` 이벤트, 스케줄링이 실행되는 시점에 발생하는 `run` 이벤트 등이 있다.

`node-schedule` 패키지의 단점은 스케줄링이 노드 기반으로 작동하므로 노드가 종료되면 예약도 같이 종료된다는 점이다. 노드를 계속 켜두면 되지만, 서버가 어떤 에러로 종료될지 예측하기는 알기 어렵다. 따라서 이를 보완하기 위한 방법이 필요하다.

서버가 시작될 때 경매 시작 후 24시간이 지났지만 낙찰자가 없는 경매를 찾아서 낙찰자를 지정하는 코드를 추가한다. 또한, 24시간이 지나지 않아 경매가 진행 중이던 건들에 대해 다시 스케줄링을 등록한다.

**checkAuction.js**
```
const { scheduleJob } = require("node-schedule");
const { Op } = require("Sequelize");
const { Good, Auction, User, sequelize } = require("./models");

module.exports = async () => {
    console.log("checkAuction");
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);     // 어제 시간
        const targets = await Good.findAll({            // 24시간이 지난 낙찰자 없는 경매들
            where: {
                SoldId: null,
                createdAt: { [Op.lte]: yesterday },
            },
        });
        targets.forEach(async (good) => {
            const success = await Auction.findOne({
                where: { GoodId: good.id },
                order: [["bid", "DESC"]],
            });
            await good.setSold(success.UserId);
            await User.update({
                money: sequelize.literal(`money - ${success.bid}`),
            }, {
                where: { id: success.UserId },
            });
        });
        
        const ongoing = await Good.findAll({            // 24시간이 지나지 않은 낙찰자 없는 경매들
            where: {
                SoldId: null,
                createdAt: { [Op.gte]: yesterday },
            },
        });
        ongoing.forEach((good) => {
            const end = new Date(good.createdAt);
            end.setDate(end.getDate() + 1);             // 생성일 24시간 뒤가 낙찰 시간
            const job = scheduleJob(end, async () => {
                const success = await Auction.findOne({
                    where: { GoodId: good.id },
                    order: [["bid", "DESC"]],
                });
                await good.setSold(success.UserId);
                await User.update({
                    money: sequelize.literal(`money - ${success.bid}`),
                }, {
                    where: { id: success.UserId },
                });
            });
            job.on("error", (error) => {
                console.error("스케줄링 에러 발생", error);
            });
            job.on("success", () => {
                console.log("스케줄링 성공");
            });
        });
    } catch (error) {
        console.error(error);
    }
};
```

먼저 낙찰자가 없으면서 생성된 지 24시간이 지난 경매를 찾아 낙찰자를 정하는 코드가 있다. 주의할 점은 `success`의 값이 `undefined`인 경우 에러가 발생한다는 것이다. 아무도 낙찰하지 않으면 `undefined`로 설정되므로 이에 대한 처리는 추후 직접 코드를 작성하여 구현해 본다.

낙찰자가 없으면서 생성된 지 24시간이 지나지 않은 경매들은 다시 스케줄링을 등록한다. 경매 생성일에 24시간을 더한 시간이 종료 시간이 된다. 이 경우에도 역시 `success`가 `undefined`인 경우에 대처해야 한다.

이제 `checkAuction`을 서버에 연결한다.

**app.js**
```
...

const webSocket = require("./socket");
const checkAuction = require("./checkAuction");

const app = express();
passportConfig();
checkAuction();

...
```

이제 서버가 시작될 때마다 낙찰자를 지정하는 작업을 수행한다. `checkAuction` 코드는 **app.js**에 직접 작성해도 되지만 코드가 길어지므로 분리한 것이다. 서버가 중간이 꺼진 경우에도 다시 실행 시 **checkAuction.js**에 의해 다시 스케줄링이 된다.

- - -

## 13.4 프로젝트 마무리하기

마지막으로 낙찰자가 낙찰 내역을 볼 수 있도록 한다. 낙찰 내역을 표시하는 라우터와 컨트롤러를 추가한다.

**routes/index.js**
```
...

const { isLoggedIn, inNotLoggedIn, isNotLoggedIn } = require("../middlewares");
const {
    renderMain, renderJoin, renderGood, createGood, renderAuction, bid, renderList,
} = require("../controllers");

...

router.get("/list", isLoggedIn, renderList);

module.exports = router;
```

**controllers/index.js**
```
exports.renderList = async (req, res, next) => {
    try {
        const goods = await Good.findAll({
            where: { SoldId: req.user.id },
            include: { model: Auction },
            order: [[{ model: Auction }, "bid", "DESC"]],
        });
        res.render("list", { title: "낙찰 목록 - NodeAuction", goods });
    } catch (error) {
        console.error(error);
        next(error);
    }
};
```

낙찰된 상품과 그 상품의 입찰 내역을 조회한 후 렌더링한다. 입찰 내역은 내림차순으로 정렬해 낙찰자의 내역이 맨 위에 오도록 하였다.

**views/list.html**
```
{% extends "layout.html" %}

{% block content %}
<div class="timeline">
    <h2>경매 낙찰 목록</h2>
    <table id="good-list">
        <tr>
            <th>상품명</th>
            <th>사진</th>
            <th>낙찰가</th>
        </tr>
        {% for good in goods %}
        <tr>
            <td>{{good.name}}</td>
            <td>
                <img src="/img/{{good.img}}">
            </td>
            <td>{{good.Auctions[0].bid}}</td>
        </tr>
        {% endfor %}
    </table>
</div>
{% endblock %}
```

**views/layout.html**
```
...

<a href="/good" id="register" class="btn">상품 등록</a>
<a href="/list" id="list" class="btn">낙찰 내역</a>

...
```

낙찰 목록으로 이동할 수 있는 버튼을 추가하였다.

### 13.4.1 스스로 해보기

- 상품 등록자는 참여할 수 없게 만들기(라우터에서 검사)
- 경매 시간을 자유롭게 조정할 수 있도록 만들기(상품 등록 시 생성할 수 있게 화면과 DB 수정)
- 노드 서버가 꺼졌다 다시 켜졌을 때 스케줄러 다시 생성하기(`checkAuction`에서 DB 조회 후 스케줄러 설정)
- 아무도 입찰하지 않아 낙찰자가 없을 때를 대비한 처리 로직 구현하기(`checkAuction`과 스케줄러 수정)

### 13.4.2 핵심 정리

- 서버에서 클라이언트로 보내는 일방향 통신은 웹 소켓 대신 서버센트 이벤트를 사용해도 된다.
- 기존 입찰 내역은 데이터베이스에서 불러오고, 방 참여 후에 추가되는 내역은 웹 소켓에서 불러온다. 이 둘을 매끄럽게 연결하는 방법을 기억해 둔다.
- 코드가 길어질 것 같으면 **app.js**로부터 **socket.js**와 **checkAuction.js**를 분리한 것과 같이 분리한다.
- 사용자의 입력값은 프론트엔드와 백엔드 모두에서 체크하는 게 좋다.
- 스케줄링을 통해 주기적으로 일어나는 작업을 처리할 수 있지만, 노드 서버가 계속 켜져 있어야만 하므로 노드 서버가 꺼졌을 때 대처할 방법을 마련해야 한다.

### 13.4.3 함께 보면 좋은 자료

생략