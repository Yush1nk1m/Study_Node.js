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
{% extends "layout.html" %}

{% block content %}
<div class="timeline">
    {% if user %}
    <div>
        <form id="twit-form" action="/post" method="post" enctype="multipart/form-data">
            <div class="input-group">
                <textarea id="twit" name="content" maxlength="140"></textarea>
            </div>
            <div class="img-preview">
                <img id="img-preview" src="" style="display: none;" width="250" alt="미리 보기">
                <input id="img-url" type="hidden" name="url">
            </div>
            <div>
                <label id="img-label" for="img">사진 업로드</label>
                <input id="img" type="file" accept="image/*">
                <button id="twit-btn" type="submit" class="btn">짹짹</button>
            </div>
        </form>
    </div>
    {% endif %}
    <div class="twits">
        <form id="hashtag-form" action="/hashtag">
            <input type="text" name="hashtag" placeholder="태그 검색">
            <button class="btn">검색</button>
        </form>
        {% for twit in twits %}
        <div class="twit">
            <input type="hidden" value="{{twit.User.id}}" class="twit-user-id">
            <input type="hidden" value="{{twit.id}}" class="twit-id">
            <div class="twit-author">{{twit.User.nick}}</div>
            {% if not followingIdList.includes(twit.User.id) and twit.User.id !== user.id %}
            <button class="twit-follow">팔로우하기</button>
            {% endif %}
            <div class="twit-content">{{twit.content}}</div>
            {% if twit.img %}
            <div class="twit-img"><img src="{{twit.img}}" alt="썸네일"></div>
            {% endif %}
        </div>
        {% endfor %}
    </div>
</div>
{% endblock %}

{% block script %}
<script>
    if (document.getElementById("img")) {
        document.getElementById("img").addEventListener("change", function (e) {
            const formData = new FormData();
            console.log(this, this.files);
            formData.append("img", this.files[0]);
            axios.post("/post/img", formData)
                .then((res) => {
                    document.getElementById("img-url").value = res.data.url;
                    document.getElementById("img-preview").src = res.data.url;
                    document.getElementById("img-preview").style.display = "inline";
                })
                .catch((err) => {
                    console.error(err);
                });
        });
    }

    document.querySelectorAll(".twit-follow").forEach(function (tag) {
        tag.addEventListener("click", function () {
            const myId = document.querySelector("#my-id");
            if (myId) {
                const userId = tag.parentNode.querySelector(".twit-user-id").value;
                if (userId !== myId.value) {
                    if (confirm("팔로잉하시겠습니까?")) {
                        axios.post(`/user/${userid}/follow`)
                            .then(() => {
                                location.reload();
                            })
                            .catch((err) => {
                                console.error(err);
                            });
                    }
                }
            }
        });
    });
</script>
{% endblock %}
```

`main.html`에서는 `user` 변수가 존재할 때 게시글 업로드 폼을 보여준다. for 문도 추가되었으며, 렌더링 시 `twits` 배열 안의 요소들을 읽어 게시글로 만든다.

`if not followingIdList.includes(twit.User.id) and twit.User.id !== user.id`는 나의 팔로잉 아이디 목록에 게시글 작성자의 아이디가 없거나 내 게시글이 아니면 팔로우 버튼을 보여주기 위한 조건이다.

**views/profile.html**
```
{% extends "layout.html" %}

{% block content %}
<div class="timeline">
    <div class="followings half">
        <h2>팔로잉 목록</h2>
        {% if user.Followings %}
            {% for following in user.Followings %}
            <div>{{following.nick}}</div>
            {% endfor %}
        {% endif %}
    </div>
    <div class="followers half">
        <h2>팔로워 목록</h2>
        {% if user.Followers %}
            {% for follower in user.Followers %}
            <div>{{follower.nick}}</div>
            {% endfor %}
        {% endif %}
    </div>
</div>
{% endblock %}
```

`profile.html`은 사용자의 팔로워와 사용자가 팔로잉 중인 목록을 보여준다.

**views/join.html**
```
{% extends "layout.html" %}

{% block content %}
<div class="timeline">
    <form id="join-form" action="/auth/join" method="post">
        <div class="input-group">
            <label for="join-email">이메일</label>
            <input id="join-email" type="email" name="email">
        </div>
        <div class="input-group">
            <label for="join-nick">닉네임</label>
            <input id="join-nick" type="text" name="nick">
        </div>
        <div class="input-group">
            <label for="join-password">비밀번호</label>
            <input id="join-password" type="password" name="password">
        </div>
        <button id="join-btn" type="submit" class="btn">회원 가입</button>
    </form>
</div>
{% endblock %}

{% block script %}
<script>
    window.onload = () => {
        if (new URL(location.href).searchParams.get("error")) {
            alert("이미 존재하는 이메일입니다.");
        }
    };
</script>
{% endblock %}
```

`join.html`은 회원 가입 폼을 보여준다.

**views/error.html**
```
{% extends "layout.html" %}

{% block content %}
<h1>{{message}}</h1>
<h2>{{error.status}}</h2>
<pre>{{error.stack}}</pre>
{% endblock %}
```

`error.html`은 서버에 에러가 발생했을 때 에러 내역을 보여준다. 배포 시에는 에러 내용을 보여주지 않는 것이 보안상 좋다.

마지막으로 디자인을 위한 CSS 파일을 다음과 같이 작성한다.

**public/main.css**
```
* { box-sizing: border-box; }

html, body { margin: 0; padding: 0; height: 100%; }
.btn {
    display:inline-block;
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

input[type="text"], input[type="email"], input[type="password"], textarea {
    border-radius: 4px;
    height: 37px;
    padding: 10px;
    border: 1px solid silver;
}

.container { width: 100%; height: 100%; }
@media screen and (min-width: 800px) {
    .container { width: 800px; margin: 0 auto;}
}

.input-group { margin-bottom: 15px; }
.input-group label { width: 25%; display: inline-block; }
.input-group input { width: 70%; }

.half { float: left; width: 50%; margin: 10px 0; }

#join { float: right; }

.profile-wrap {
    width: 100%;
    display: inline-block;
    vertical-align: top;
    margin: 10px 0;
}
@media screen and (min-width: 800px) {
    profile-wrap { width: 290px; margin-bottom: 0; }
}
.profile {
    text-align: left;
    padding: 10px;
    margin-right: 10px;
    border-radius: 4px;
    border: 1px solid silver;
    background: lightcoral;
}

.user-name { font-weight: bold; font-size: 18px; }

.count { font-weight: bold; color: crimson; font-size: 18px; }

.timeline {
    margin-top: 10px;
    width: 100%;
    display: inline-block;
    border-radius: 4px;
    vertical-align: top;
}
@media screen and (min-width: 800px) { .timeline { width: 500px; } }

#twit-form {
    border-bottom: 1px solid silver;
    padding: 10px;
    background: lightcoral;
    overflow: hidden;
}

#img-preview { max-width: 100%; }
#img-label {
    float: left;
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid crimson;
    padding: 0 10px;
    color: white;
    font-size: 12px;
    height: 37px;
    line-height: 37px;
}
#img { display: none; }

#twit { width: 100%; min-height: 72px; }
#twit-btn {
    float: right;
    color: white;
    background: crimson;
    border: none;
}
.twit {
    border: 1px solid silver;
    border-radius: 4px;
    padding: 10px;
    position: relative;
    margin-bottom: 10px;
}
.twit-author { display: inline-block; font-weight: bold; margin-right: 10px; }
.twit-follow {
    padding: 1px 5px;
    background: #fff;
    border: 1px solid silver;
    border-radius: 5px;
    color: crimson;
    font-size: 12px;
    cursor: pointer;
}
.twit-img { text-align: cetner; }
.twit-img img { max-width: 75%; }

.error-message { color: red; font-weight: bold; }

#search-form { text-align: right; }
#join-form { padding: 10px; text-align: center; }
#hashtag-form { text-align: right; }

footer { text-align: center; }
```
- - -


## 9.2 데이터베이스 세팅하기

MySQL과 시퀄라이즈로 데이터베이스를 설정한다.

이제까지 작성한 코드로 미루어 보아 기본적으로 사용자 테이블과 게시글 테이블이 필요하다.

우선 `models` 디렉터리 안에 다음과 같이 `user.js`, `post.js`, `hashtag.js`를 생성한다.

**models/user.js**
```
const Sequelize = require("sequelize");

class User extends Sequelize.Model {
    static initiate(sequelize) {
        User.init({
            email: {
                type: Sequelize.STRING(40),
                allowNull: true,
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

            provider: {
                type: Sequelize.ENUM("local", "kakao"),
                allowNull: false,
                defaultValue: "local",
            },

            snsId: {
                type: Sequelize.STRING(30),
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: "User",
            tableName: "users",
            paranoid: true,
            charset: "utf8",
            coolate: "utf8_general_ci",
        });
    }

    static associate(db) {}
};

module.exports = User;
```

`user.js`는 사용자 정보를 저장하는 모델이다. `email`, `nick`, `password`를 저장하고, SNS 로그인 시에는 `provider`와 `snsId`를 저장한다. `provider` 컬럼은 `ENUM` 자료형으로 지정되어 있는데, 이는 넣을 수 있는 값을 제한할 수 있는 열거형이다. 종류로는 이메일/비밀번호로 로그인(`local`)과 카카오 로그인(`kakao`) 두 가지가 있다. 기본적으로 `local`로 가정하였다.

테이블 옵션으로는 `timestamps`와 `paranoid`가 설정되었으므로 `createdAt`, `updatedAt`, `deletedAt` 컬럼도 생성된다.

**models/post.js**
```
const Sequelize = require("sequelize");

class Post extends Sequelize.Model {
    static initiate(sequelize) {
        Post.init({
            content: {
                type: Sequelize.STRING(140),
                allowNull: false,
            },

            img: {
                type: Sequelize.STRING(200),
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: "Post",
            tableName: "posts",
            paranoid: false,
            charset: "utf8mb4",
            collate: "utf8mb4_general_ci",
        });
    }

    static associate(db) {}
}

module.exports = Post;
```

게시글 모델은 게시글 내용(`content`)과 이미지 경로(`img`)를 저장한다. 게시글 등록자의 아이디를 담은 컬럼은 나중에 관계 설정 시 시퀄라이즈가 알아서 생성한다.

**models/hashtag.js**
```
const Sequelize = require("sequelize");

class Hashtag extends Sequelize.Model {
    static initiate(sequelize) {
        Hashtag.init({
            title: {
                type: Sequelize.STRING(15),
                allowNull: false,
                unique: true,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: "Hashtag",
            tableName: "hashtags",
            paranoid: false,
            charset: "utf8mb4",
            coolate: "utf8mb4_general_ci",
        });
    }

    static associate(db) {}
};

module.exports = Hashtag;
```

해시태그 모델은 태그 이름(`title`)을 저장한다. 나중에 태그로 게시글을 검색하기 위해서 모델을 따로 정의하였다.

이제 생성한 모델들을 시퀄라이즈에 등록한다. `models/index.js`에는 시퀄라이즈가 자동으로 생성한 코드들이 들어 있다. 내용을 모두 지운 뒤 다음과 같이 변경한다.

**models/index.js**
```
const Sequelize = require("sequelize");
const User = require("./user");
const Post = require("./post");
const Hashtag = require("./hashtag");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Hashtag = Hashtag;

User.initiate(sequelize);
Post.initiage(sequelize);
Hashtag.initiate(sequelize);

User.associate(db);
Post.associate(db);
Hashtag.associate(db);

module.exports = db;
```

각각의 모델들을 수동으로 시퀄라이즈 객체에 연결하였다. 그러나 모델이 늘어남에 따라 코드가 점점 복잡해질 수 있기 때문에 다음과 같이 자동으로 연결하는 코드를 작성할 수도 있다.

**models/index.js**
```
const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const User = require("./user");
const Post = require("./post");
const Hashtag = require("./hashtag");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;

const basename = path.basename(__filename);

fs
  .readdirSync(__dirname)   // 현재 디렉터리의 모든 파일을 조회
  .filter((file) => {       // 숨김 파일, index.js, js 확장자가 아닌 파일 필터링
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === ".js");
  })
  .forEach((file) => {      // 해당 파일의 모델을 불러와서 init
    const model = require(path.join(__dirname, file));
    console.log(file, model.name);
    db[model.name] = model;
    model.initiate(sequelize);
  });

Object.keys(db).forEach((modelName) => {  // associate 호출
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
```