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
                        axios.post(`/user/${userId}/follow`)
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

이 코드는 `npx sequelize init` 명령어를 수행했을 때 자동으로 생성되는 `models/index.js`의 내용과 비슷하다. 모델이 많아져도 시퀄라이즈가 자동으로 파악하고 연결할 수 있다.

그러나 `models` 디렉터리에 미완성인 모델이 존재하면 그 모델도 연결이 되기 때문에 주의해야 한다. 또한, `models` 디렉터리에 모델이 아닌 다른 파일이 존재하면 `initiate`, `associate` 메소드가 존재하지 않아 오류를 발생시킬 수 있다.

이번에는 모델 간의 관계를 `associate` 메소드 내에 정의한다.

**models/user.js**
```
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
}
```

`User` 모델과 `Post` 모델은 **1(`User`):N(`Post`)** 관계에 있으므로 `hasMany`로 연결되어 있다. 이를 통해 `user.getPosts`, `user.addPosts` 같은 관계 메소드들이 생성된다.

같은 모델끼리도 N:M 관계를 가질 수 있다. 팔로잉 기능이 대표적으로 N:M 관계를 통해 구현된다. 사용자 한 명이 팔로워를 여러 명 가질 수 있고, 사용자 한 명이 여러 명을 팔로잉할 수도 있다.

같은 테이블 간의 N:M 관계에서는 모델 이름과 컬럼 이름을 따로 지정해야 한다. 아니면 UserUser 같은 모델이 생성될 수 있다. 따라서 `through` 옵션을 사용하여 생성할 모델 이름을 `Follow`로 설정했다.

`Follow` 모델에서 사용자 아이디를 저장하는 컬럼 이름이 둘 다 `UserId`일 시 팔로워와 팔로잉이 구분이 안 되므로 `foreignKey` 옵션에 각각 `followerId`, `followingId`를 지정해 주었다.

같은 테이블 간의 N:M 관계에선 `as` 옵션도 지정해 주어야 한다. 둘 다 `User` 모델이라 구분되지 않기 때문이다. `foreignKey`가 `followerId`라면 해당 키를 사용하는 모델은 `Followings`이고, `followingId`라면 해당 키를 사용하는 모델은 `Followers`여야 한다. 이처럼 외래 키와 모델 이름이 반대의 관계를 갖는다는 것에 주의해야 한다.

`as`에 특정한 이름을 지정했으므로 `user.getFollowers`, `user.getFollowings` 같은 관계 메소드를 사용할 수 있다. `include` 시에도 `as`에 같은 값을 전달하면 관계 쿼리가 작동한다.

**models/post.js**
```
static associate(db) {
    db.Post.belongsTo(db.User);

    db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" });
}
```

`User` 모델과 `Post` 모델은 1:N 관계이므로 `belongsTo`로 연결되어 있다. 시퀄라이즈는 자동으로 `Post` 모델에 게시글을 작성한 사용자를 식별하기 위해 `User` 모델의 `id`를 가리키는 `UserId` 컬럼을 추가한다. `post.getUser`, `post.addUser` 같은 관계 메소드가 생성된다.

`Post` 모델과 `Hashtag` 모델은 N:M 관계이기 때문에 둘을 매개하는 `PostHashtag`라는 중간 모델이 생성되고, 각각 `postId`, `HashtagId`라는 `foreignKey`도 추가된다. `as`는 따로 지정하지 않았으므로 `post.getHashtags`, `post.addHashtags`, `hashtags.getPosts` 같은 기본적인 이름 형식의 관계 메소드들이 생성된다.

**models/hashtag.js**
```
static associate(db) {
    db.Hashtag.belongsToMany(db.Post, { through: "PostHashtag" });
}
```

`Hashtag` 모델은 `Post` 모델과 N:M 관계이므로 `belongsToMany`로 관계를 설정하였다.

이로써 `NodeBird` 서비스의 모델은 총 다섯 개로 구성되었다. 직접 생성한 `User`, `Post`, `Hashtags`와 시퀄라이즈가 모델 간 관계로 생성한 `PostHashtag`, `Follow`가 있다.

자동으로 생성된 모델도 다음과 같이 다른 모델처럼 접근할 수 있다.

```
db.sequelize.models.PostHashtag
db.sequelize.models.Follow
```

위 모델들을 통해 쿼리 호출이나 관계 메소드 사용도 가능하다.

앞서 7장에서는 MySQL 프롬프트를 통해 SQL 문으로 데이터베이스를 생성했다. 하지만 시퀄라이즈는 `config.json`을 읽어 데이터베이스를 생성해 주는 기능이 있다. 따라서 `config.json`을 다음과 같이 수정한다. 자동으로 생성된 `config.json`에 `operatorAliases` 속성이 있다면 삭제한다.

**config/config.json**
```
...
"development": {
    "username": "yushin",
    "password": "[비밀번호]",
    "database": "nodebird",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
...
```

콘솔에서 `npx sequelize db:create` 명령어를 입력하면 데이터베이스가 생성된다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter09\nodebird> npx sequelize db:create

Sequelize CLI [Node: 18.17.1, CLI: 6.6.1, ORM: 6.33.0]

Loaded configuration file "config\config.json".
Using environment "development".
Database nodebird created.
```

데이터베이스가 생성되었으므로 마지막으로 모델을 서버와 연결한다.

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
const { sequelize } = require("./models");

const app = express();
app.set("port", process.env.PORT || 8001);
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

서버 세팅이 완료되었다. 이제 서버를 실행한다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter09\nodebird> npm start

> nodebird@0.0.1 start
> nodemon app

[nodemon] 3.0.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node app.js`
hashtag.js Hashtag
post.js Post
user.js User
8001 번 포트에서 대기 중
Executing (default): SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'hashtags' AND TABLE_SCHEMA = 'nodebird'
Executing (default): CREATE TABLE IF NOT EXISTS `hashtags` (`id` INTEGER NOT NULL auto_increment , `title` VARCHAR(15) NOT NULL UNIQUE, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
Executing (default): SHOW INDEX FROM `hashtags` FROM `nodebird`
Executing (default): SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'users' AND TABLE_SCHEMA = 'nodebird'
Executing (default): CREATE TABLE IF NOT EXISTS `users` (`id` INTEGER NOT NULL auto_increment , `email` VARCHAR(40) UNIQUE, `nick` VARCHAR(15) NOT NULL, `password` VARCHAR(100), `provider` ENUM('local', 'kakao') NOT NULL DEFAULT 'local', `snsId` VARCHAR(30), `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `deletedAt` DATETIME, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;
Executing (default): SHOW INDEX FROM `users` FROM `nodebird`
Executing (default): SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'posts' AND TABLE_SCHEMA = 'nodebird'
Executing (default): CREATE TABLE IF NOT EXISTS `posts` (`id` INTEGER NOT NULL auto_increment , `content` VARCHAR(140) NOT NULL, `img` VARCHAR(200), `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `UserId` INTEGER, PRIMARY KEY (`id`), FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
Executing (default): SHOW INDEX FROM `posts` FROM `nodebird`
Executing (default): SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'PostHashtag' AND TABLE_SCHEMA = 'nodebird'
Executing (default): CREATE TABLE IF NOT EXISTS `PostHashtag` (`createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `HashtagId` INTEGER , `PostId` INTEGER , PRIMARY KEY (`HashtagId`, `PostId`), FOREIGN KEY (`HashtagId`) REFERENCES `hashtags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (`PostId`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
Executing (default): SHOW INDEX FROM `PostHashtag` FROM `nodebird`
Executing (default): SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'Follow' AND TABLE_SCHEMA = 'nodebird'
Executing (default): CREATE TABLE IF NOT EXISTS `Follow` (`createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `followingId` INTEGER , `followerId` INTEGER , PRIMARY KEY (`followingId`, `followerId`), FOREIGN KEY (`followingId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (`followerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8;
Executing (default): SHOW INDEX FROM `Follow` FROM `nodebird`
데이터베이스 연결 성공
```

데이터베이스 세팅이 완료되었으므로 사용자 정보를 저장할 수 있다.
- - -


## 9.3 Passport 모듈로 로그인 구현하기

소셜 미디어 서비스이므로 로그인 기능이 필요하다. 회원 가입과 로그인을 직접 구현하기엔 세션과 쿠키 처리 등 복잡한 작업이 많으므로 검증된 `Passport` 모듈을 사용하여 진행한다.

서비스를 로그인할 때 아이디와 비밀번호 대신 구글, 페이스북, 카카오톡 같은 기존의 소셜 미디어 서비스 계정으로 로그인하는 기능도 `Passport`가 지원한다.

먼저 `Passport` 관련 패키지들을 설치한다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter09\nodebird> npm i passport passport-local passport-kakao bcrypt

added 49 packages, and audited 272 packages in 10s

28 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
```

설치 후엔 `Passport` 모듈을 미리 `app.js`와 연결한다.

**app.js**
```
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const passport = require("passport");

dotenv.config();
const pageRouter = require("./routes/page");
const { sequelize } = require("./models");
const passportConfig = require("./passport");

const app = express();
passportConfig();   // passport 설정
app.set("port", process.env.PORT || 8001);
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

`require("./passport")`로 `passport/index.js`를 불러온다.

`passport.initialize` 미들웨어는 요청(`req` 객체)에 `passport` 설정을 심고, `passport.session` 미들웨어는 `req.session` 객체에 `passport` 정보를 저장한다. `req.session` 객체는 `express-session`에서 생성하는 것이므로 `passport` 미들웨어는 `express-session` 미들웨어보다 뒤에 연결해야 한다.

`passport` 디렉터리 내부에 `index.js` 파일을 생성하고 다음과 같이 작성한다.

**passport/index.js**
```
const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const User = require("../models/user");

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findOne({ where: { id } })
            .then(user => done(null, user))
            .catch(err => done(err));
    });

    local();
    kakao();
}
```

모듈 내부에는 `passport.serializeUser`와 `passport.deserializeUser`가 사용되고 있는데, 이 부분이 `Passport`의 핵심이다.

`serializeUser`는 로그인 시 실행되며, `req.session`(세션) 객체에 어떤 데이터를 저장할지 정하는 메소드이다. 인수로 `user`를 받고 난 후 실행되는 `done` 함수의 두 번째 인수로 `user.id`를 넘기고 있다. 일단은 이렇게 함으로써 사용자 정보가 저장된다고 생각한다.

`done` 함수의 첫 번째 인수는 에러 발생 시 사용하는 것이고, 두 번째 인수는 저장하고자 하는 데이터이다. 로그인 시 사용자 데이터를 세션에 저장하는데(4.3절), 세션에 사용자 정보를 모두 저장하는 것에는 문제가 있으므로 사용자의 아이디만 저장하라고 명령한 것이다.

`deserializeUser`는 매 요청마다 실행된다. `passport.session` 미들웨어가 이 메소드를 호출한다. `serializeUser`의 `done`에서 두 번째 인수로 전달했던 데이터(저장하고자 하는 데이터)가 `deserializeUser`의 매개변수가 된다. 이 예제에서는 사용자의 아이디이다. `serializeUser`에서 저장하였던 사용자 아이디를 받아 데이터베이스에서 사용자를 조회하고, 찾은 정보를 `req.user`에 저장(`done(null, user)`)한다. 따라서 앞으로는 `req.user`를 통해 로그인한 사용자의 정보를 가져올 수 있다.

즉, `serializeUser`는 사용자 정보 객체에서 아이디만 추출하여 세션에 저장하고, `deserializeUser`는 세션에 저장한 아이디로 사용자 정보 객체를 불러오는 것이다. 이들은 모두 세션에 필요한 정보만 저장해 두기 위한 과정이다.

**로그인 과정**은 다음과 같다.

1. `/auth/login` 라우터를 통해 로그인 요청이 들어옴
2. 라우터에서 `passport.authenticate` 메소드 호출
3. 로그인 전략(`LocalStrategy`) 수행
4. 로그인 성공 시 사용자 정보 객체와 함께 `req.login` 호출
5. `req.login` 메소드가 `passport.serializeUser` 호출
6. `req.session`에 사용자 아이디만 저장하여 세션 생성
7. `express-session`에 설정한 대로 브라우저에 `connect.sid` 세션 쿠키 전송
8. 로그인 완료

**로그인 이후의 과정**은 다음과 같다.

1. 요청이 들어옴(어떠한 요청이든 상관없음)
2. 라우터에 요청이 도달하기 전 `passport.session` 미들웨어가 `passport.deserializeUser` 메소드 호출
3. `connect.sid` 세션 쿠키를 읽고 세션 객체를 찾아 `req.session`으로 만듦
4. `req.session`에 저장된 아이디로 데이터베이스에서 사용자 조회
5. 조회된 사용자 정보를 `req.user`에 저장
6. 라우터에서 `req.user` 객체 사용 가능

`passport/index.js`의 `localStrategy`와 `kakaoStrategy`는 각각 로컬 로그인과 카카오 로그인 전략에 대한 파일이다. 전략이란 로그인 과정을 어떻게 처리할지 설명하는 파일이다.


### 9.3.1 로컬 로그인 구현하기

로컬 로그인이란 다른 소셜 미디어 서비스를 통해 로그인하지 않고 자체적으로 회원 가입 후 로그인하는 것을 의미한다.

`Passport`에서 이를 구현하기 위해선 `passport-local` 모듈이 필요하다. 설치 이후엔 로컬 로그인 전략만 세우면 된다. 로그인에만 해당하는 전략이므로 회원 가입에 대한 전략은 따로 만들어야 한다.

먼저 회원 가입, 로그인, 로그아웃 라우터를 생성한다. 이러한 라우터에는 다음과 같은 접근 조건이 있다.

- 로그인한 사용자는 회원 가입, 로그인 라우터에 접근하면 안 된다.
- 로그인하지 않은 사용자는 로그아웃 라우터에 접근하면 안 된다.

따라서 라우터에 접근 권한을 제어하는 미들웨어를 설정해야 한다. 미들웨어를 만들면서 `Passport`가 `req` 객체에 추가해 주는 `req.isAuthenticated` 메소드를 사용해 본다.

`middlewares` 디렉터리를 생성하고 다음과 같이 `index.js`를 작성한다.

**middlewares/index.js**
```
exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send("로그인 필요");
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        const message = encodeURIComponent("로그인한 상태입니다.");
        res.redirect(`/?error=${message}`);
    }
}
```

`Passport`는 `req` 객체에 `isAuthenticated` 메소드를 추가한다. 로그인 중이면 `req.isAuthenticated()`가 `true`를 반환하고, 그렇지 않으면 `false`를 반환한다. 따라서 로그인 여부를 이 메소드만으로 파악할 수 있다.

라우터 중 로그아웃 라우터나 이미지 업로드 라우터 등은 로그인한 사람만 접근할 수 있게 해야 하고, 회원 가입 라우터나 로그인 라우터는 로그인하지 않은 사람만 접근할 수 있게 해야 한다. 이럴 때 라우터에 로그인 여부를 검사하는 미들웨어를 넣어 걸러낼 수 있다.

생성한 미들웨어들이 `page` 라우터에 어떻게 사용되는지 확인해 본다.

**routes/page.js**
```
const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const { renderProfile, renderJoin, renderMain } = require("../controllers/page");

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.followerCount = 0;
    res.locals.followingCount = 0;
    res.locals.followingIdList = [];
    next();
});

router.get("/profile", isLoggedIn, renderProfile);

router.get("/join", isNotLoggedIn, renderJoin);

router.get("/", renderMain);

module.exports = router;
```

프로필은 로그인해야 확인할 수 있으므로 `isLoggedIn` 미들웨어를 연결한다. `req.isAuthenticated()`가 `true`를 반환하여야만(로그인한 상태여야만) `next`가 호출되어 `res.render`가 있는 미들웨어로 전환될 수 있다. `false`일 시엔 로그인 창이 있는 메인 페이지로 리다이렉트된다.

회원 가입 페이지는 로그인하지 않은 사용자에게만 보여야 한다. 따라서 `isNotLoggedIn` 미들웨어로 `req.isAuthenticated()`가 `false`일 때만 `next`를 호출하도록 하였다.

로그인 여부뿐만 아니라 팔로잉 여부, 관리자 여부 등으로도 미들웨어를 만들 수 있다. `res.locals.user` 속성에 `req.user`를 넣은 점도 확인한다. 이제 넌적스에서 `user` 객체를 통해 사용자 정보에 접근할 수 있게 되었다.

이제 다음과 같이 회원 가입, 로그인, 로그아웃 라우터와 컨트롤러를 작성한다.

**routes/auth.js**
```
const express = require("express");
const passport = require("passport");

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

**controllers/auth.js**
```
const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");

// 1
exports.join = async (req, res, next) => {
    const { email, nick, password } = req.body;

    try {
        const exUser = await User.findOne({ where: { email } });
        if (exUser) {
            return res.redirect("/join?error=exist");
        }

        const hash = await bcrypt.hash(password, 12);
        await User.create({
            email,
            nick,
            password: hash,
        });

        return res.redirect("/");
    } catch (error) {
        console.error(error);
        return next(error);
    }
};
// 1

// 2
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
    })(req, res, next);     // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙인다
};
// 2

// 3
exports.logout = (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
};
// 3
```

나중에 `app.js`와 연결할 때 `/auth` 접두사를 붙일 것이므로 라우터의 주소는 각각 `/auth/join`, `/auth/login`, `/auth/logout`이 된다.

1. 회원 가입 컨트롤러이다. 기존에 같은 이메일로 가입한 사용자가 있다면 회원 가입 페이지로 리다이렉트하여 돌려보낸다. 이때 주소 뒤에 에러를 쿼리스트링으로 표시한다. 같은 이메일로 가입한 사용자가 없다면 비밀번호를 암호화하여 사용자 정보를 생성한다.<br>
`bcrypt` 모듈의 `hash` 메소드를 사용하여 비밀번호를 암호화하였고, 프로미스를 지원하는 함수이므로 `await`을 사용하였다.
2. 로그인 컨트롤러이다. 로그인 요청이 들어오면 `passport.authenticate("local")` 미들웨어가 로컬 로그인 전략을 수행한다. 미들웨어인데 라우터 미들웨어 안에 들어 있는 것이 특징이며, 사용자 정의 기능을 미들웨어에 추가하고 싶을 때 이런 방식으로 정의한다. 이럴 때는 내부에 정의한 미들웨어에 (req, res, next)를 인수로 제공하여 즉시 호출한다.<br>
전략이 성공하거나 실패하면 `authenticate` 메소드의 콜백 함수가 실행된다. 이때 첫 번째 매개변수인 `authError`의 값이 존재한다면 실패한 것이다. 두 번째 매개변수는 사용자 정보로, 값이 존재한다면 성공한 것이므로 이 값으로 `req.login` 메소드를 호출한다. `Passport`는 `req` 객체에 `login`과 `logout` 메소드를 추가한다. `req.login`은 `passport.serializeUser`를 호출하고, 이때 인수로 제공하는 `user`가 `serializeUser`로 전달된다. 또한, 이때 `connect.sid` 세션 쿠키가 브라우저에 전송된다.
3. 로그아웃 컨트롤러이다. `req.logout` 메소드는 `req.user` 객체와 `req.session` 객체를 제거한다. 인수로 전달받은 콜백 함수는 세션 정보를 지운 뒤 호출된다. 콜백 함수에서는 단순히 메인 페이지로 리다이렉션하였다.

이렇게 로그인 전략을 구현하였다. 이제 `passport-local` 모듈에서 `Strategy` 생성자를 불러와 그 안에 전략을 구현하면 된다.

**passport/localStrategy.js**
```
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const User = require("../models/user");

module.exports = () => {
// 1
    passport.use(new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: false,
// 1
// 2
    }, async (email, password, done) => {
        try {
            const exUser = await User.findOne({ where: { email } });
            if (exUser) {
                const result = await bcrypt.compare(password, exUser.password);
                if (result) {
                    done(null, exUser);
                } else {
                    done(null, false, { message: "비밀번호가 일치하지 않습니다." });
                }
            } else {
                done(null, false, { message: "가입되지 않은 회원입니다." });
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};
// 2
```

1. `LocalStrategy` 생성자의 첫 번째 인수로 주어진 객체는 전략에 관한 설정이다. `usernameField`와 `passwordField`에는 일치하는 로그인 라우터의 `req.body` 속성명을 명시하면 된다. `req.body.email`에 이메일, `req.body.password`에 비밀번호가 담겨 들어오므로 `email`과 `password`를 각각 명시하였다.
2. 실제 전략을 수행하는 `async` 함수이다. `LocalStrategy` 생성자의 두 번째 인수로 주어진다. 첫 번째 인수에 전달해 준 `email`과 `password`는 각각 함수의 첫 번째, 두 번째 매개변수가 된다. 세 번째 매개변수인 `done` 함수는 `passport.authenticate`의 콜백 함수이다.<br>
전략은 우선 사용자 데이터베이스에서 일치하는 이메일이 있는지 찾은 후, 존재한다면 `bcrypt`의 `compare` 함수로 비밀번호를 비교한다. 비밀번호까지 일치한다면 `done` 함수의 두 번째 인수로 사용자 정보를 전달한다.<br>
`done` 함수의 첫 번째 인수는 서버에서 에러가 발생했을 때만 사용되고, 두 번째 인수는 로그인에 성공했을 때만 사용되고, 세 번째 인수는 비밀번호가 일치하지 않거나 회원이 존재하지 않는 등의 사용자 정의 에러가 발생했을 때 사용된다.<br>
앞서 `passport.authenticate`의 두 번째 인수인 콜백 함수가 `(authError, user, info)`의 세 개의 매개변수를 가졌는데, `done` 함수의 인수가 순서대로 매핑된다고 생각하면 된다.

`done`이 호출되면 `passport.authenticate`의 콜백 함수에서 나머지 로직이 실행된다. 로그인에 성공했다면 메인 페이지로 리다이렉트되면서 로그인 폼 대신 회원 정보가 렌더링 될 것이다. 아직 `auth` 라우터를 연결하는 동작까지는 구현되지 않았다.


### 9.3.2 카카오 로그인 구현하기

카카오 로그인이란 로그인 인증 과정을 카카오에 맡기는 것을 뜻한다. 사용자는 번거롭게 새로운 사이트에 회원 가입하지 않아도 되고, 서비스 제공자는 로그인 과정을 검증된 소셜 미디어 서비스에 맡길 수 있어 편리하다.

소셜 미디어 서비스 로그인은 회원 가입 절차가 따로 존재하지 않는다. 그러나 내부적으로 처음 로그인할 때는 회원 가입 처리를 해야 하고, 두 번째 로그인부터는 로그인 처리를 해야 한다. 따라서 로컬 로그인 전략보다는 다소 복잡하다.

다음과 같이 `passport-kakao` 모듈로부터 `Strategy` 생성자를 불러와 전략을 구현한다.

**passport/kakaoStrategy.js**
```
const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

const User = require("../models/user");

module.exports = () => {
// 1
    passport.use(new KakaoStrategy({
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
// 1
// 2
    }, async (accessToken, refreshToken, profile, done) => {
        console.log("kakao profile", profile);
        
        try {
            const exUser = await User.findOne({
                where: { snsId: profile.id, provider: "kakao" },
            });
            if (exUser) {
                done(null, exUser);
// 2
// 3
            } else {
                const newUser = await User.create({
                    email: profile._json?.kakao_account?.email,
                    nick: profile.displayName,
                    snsId: profile.id,
                    provider: "kakao",
                });
                
                done(null, newUser);
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};
// 3
```

1. 카카오 로그인에 대한 설정을 하는 부분이다. `clientID`는 카카오에서 발급해주는 아이디이다. 노출되지 않아야 하므로 `process.env.KAKAO_ID`로 설정했으며, 나중에 아이디를 발급받아 `.env` 파일에 명시할 것이다. `callbackURL`은 카카오로부터 인증 결과를 받을 라우터 주소이다.
2. 기존에 카카오를 통해 회원 가입한 사용자가 있는지 조회하고, 있을 시 사용자 정보와 함께 `done` 함수를 호출하고 전략을 종료한다.
3. 기존에 회원 가입하지 않았다면 가입을 진행한다. 카카오에서는 인증 후 `callbackURL`에 적힌 주소로 `accessToken`, `refreshToken`, `profile`을 전송한다. `profile`에는 사용자 정보들이 포함되어 있다. 카카오에서 보내주는 것이므로 데이터는 `console.log` 메소드로 확인해 보는 것이 좋다. `profile` 객체에서 원하는 정보를 꺼내와 회원 가입을 진행하면 된다. `email`은 `undefined`일 수도 있어 옵셔널 체이닝 문법을 사용하였다. 우선 사용자를 생성한 뒤 `done` 함수를 호출한다.

다음으로는 카카오 로그인 라우터를 작성한다. `routes/auth.js`의 로그아웃 라우터 아래에 추가하면 된다. 회원 가입을 따로 코딩할 필요가 없고 카카오 로그인 전략이 대부분의 로직을 처리하므로 라우터가 상대적으로 간단하다. 컨트롤러도 따로 분리하지 않는다.

**routes/auth.js**
```
const express = require("express");
const passport = require("passport");

const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const { join, login, logout } = require("../controllers/auth");

const router = express.Router();

// POST /auth/join
router.post("/join", isNotLoggedIn, join);

// POST /auth/login
router.post("/login", isNotLoggedIn, login);

// GET /auth/logout
router.get("/logout", isLoggedIn, logout);

// GET /auth/kakao
router.get("/kakao", passport.authenticate("kakao"));

// GET /auth/kakao/callback
router.get("/kakao/callback", passport.authenticate("kakao", {
    failureRedirect: "/?error=카카오 로그인 실패",
}), (req, res) => {
    res.redirect("/");  // 성공 시에는 /로 이동
});

module.exports = router;
```

`GET /auth/kakao`로 접근하면 카카오 로그인 과정이 시작된다. `layout.html`의 **카카오톡** 버튼에 `/auth/kakao` 링크가 연결되어 있다. `GET /auth/kakao`에서 로그인 전략(`KakaoStrategy`)을 수행하는데, 처음에는 카카오 로그인 페이지로 리다이렉트한다. 그 페이지에서 로그인 후 결과를 `GET /auth/kakao/callback`으로 전달받는다. 해당 라우터에서는 카카오 로그인 전략(`KakaoStrategy`)을 다시 수행한다.

로컬 로그인과 다른 점은 `passport.authenticate` 메소드에 콜백 함수를 제공하지 않는다는 것이다. 카카오 로그인은 로그인 성공 시 내부적으로 `req.login`을 호출하기 때문에 직접 호출할 필요가 없다. 콜백 함수 대신 로그인에 실패했을 때 어디로 리다이렉트할지를 `failureRedirect` 속성에 명시하고, 성공 시에도 어디로 리다이렉트할지를 다음 미들웨어에 명시한다.

추가한 `auth.js` 라우터를 `app.js`에 연결한다.

**app.js**
```
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const passport = require("passport");

dotenv.config();
const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const { sequelize } = require("./models");
const passportConfig = require("./passport");

const app = express();
passportConfig();   // passport 설정
app.set("port", process.env.PORT || 8001);
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

app.use("/", pageRouter);
app.use("/auth", authRouter);

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

다음으로는 `kakaoStrategy.js`에서 사용하는 `clientID`를 발급받는다. 카카오 로그인을 위해서는 카카오 개발자 계정과 카카오 로그인용 애플리케이션 등록이 필요하다. 이를 위해 다음과 같은 절차를 따른다.

1. **https://developers.kakao.com** 에 접속해 회원 가입 또는 로그인을 한다.
2. **내 애플리케이션** 메뉴에 가서 **애플리케이션 추가하기** 버튼을 클릭한다.
3. **앱 이름**과 **회사 이름**을 등록한다.
4. 생성한 앱의 **REST API 키**를 복사해 `.env` 파일에 추가한다. `KAKAO_ID=9804670777cb2b155d1f1a9dee11e90f`
5. **앱 설정** > **플랫폼**에서 **Web 플랫폼 등록** 메뉴를 선택한다. 사이트 도메인에 `http://localhost:8001`을 기입한다.
6. **제품 설정** > **카카오 로그인** 메뉴에서 **활성화 설정** 상태 스위치를 **ON** 상태로 만든다. 그 후 같은 페이지의 **Redirect URI 등록** 버튼을 클릭해 `http://localhost:8001/auth/kakao/callback`을 입력한 후 저장한다. 이 주소는 `kakaoStrategy.js`의 `callbackURL`과 일치해야 한다.
7. **제품 설정** > **카카오 로그인** > **동의 항목** 메누로 가서 로그인 동의 항목을 작성한다. 원하는 정보가 있다면 **설정**을 누르고 **동의 단계**와 **동의 목적**을 작성한다. 닉네임과 이메일을 수집할 수 있게 설정한다.

이제 서비스에서 **카카오톡** 버튼을 눌러 `GET /auth/kakao` 라우터로 요청을 보내면 카카오 인증이 시작된다.

카카오 로그인 외에도 구글(`passport-google-oauth2`), 페이스북(`passport-facebook`), 네이버(`passport-naver`), 트위터(`passport-twitter`) 로그인도 비슷한 방식으로 가능하다.
- - -


## 9.4 multer 패키지로 이미지 업로드 구현하기

6.2.7절에서 배운 `multer` 모듈을 사용하여 멀티파트 형식의 이미지 업로드를 구현한다.

패키지를 먼저 설치한다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter09\nodebird> npm i multer

up to date, audited 272 packages in 1s

28 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
```

이미지를 어떻게 저장할 것인지는 서비스 특성에 따라 달라진다. 나의 소셜 미디어 서비스에서는 `input` 태그를 통해 이미지를 선택할 때 바로 업로드를 진행하고, 업로드된 사진 주소를 다시 클라이언트에 알린다. 게시글을 저장할 때는 데이터베이스에 직접 이미지 데이터를 넣는 대신 이미지의 경로만 저장하고, 실제 이미지 파일은 서버 디스크(`uploads` 디렉터리)에 저장된다.

다음과 같이 `post` 라우터와 컨트롤러를 작성한다.

**routes/post.js**
```
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("path");

const { afterUploadImage, uploadPost } = require("../controllers/post");
const { isLoggedIn } = require("../middlewares");

const router = express.Router();

try {
    fs.readdirSync("uploads");
} catch (error) {
    console.error("uploads 디렉터리가 없어 새롭게 생성합니다.");
    fs.mkdirSync("uploads");
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, "uploads/");
        },

        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),

    limits: { fileSize: 5 * 1024 * 1024 },
});

// POST /post/img
router.post("/img", isLoggedIn, upload.single("img"), afterUploadImage);

// POST /post
const upload2 = multer();
router.post("/", isLoggedIn, upload2.none(), uploadPost);

module.exports = router;
```

**controllers/post.js**
```
const { Post, Hashtag } = require("../models");

exports.afterUploadImage = (req, res) => {
    console.log(req.file);

    res.json({ url: `/img/${req.file.filename}` });
};

exports.uploadPost = async (req, res, next) => {
    try {
        const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            UserId: req.user.id,
        });

        const hashtags = req.body.content.match(/#[^\s#]+/g);
        if (hashtags) {
            const result = await Promise.all(
                hashtags.map((tag) => {
                    return Hashtag.findOrCreate({
                        where: { title: tag.slice(1).toLowerCase() },
                    })
                }),
            );

            await post.addHashtags(result.map(r => r[0]));
        }

        res.redirect("/");

    } catch (error) {
        console.error(error);
        next(error);
    }
};
```

`multer` 사용 부분은 6.2.7절의 코드와 거의 유사하다. `POST /post/img` 라우터와 `POST /post` 라우터 두 개를 만들었다. `app.use("/post")`를 할 것이므로 앞에 `/post` 경로가 추가되었다.

`POST /post/img` 라우터에서는 이미지 하나를 업로드받은 뒤 이미지의 저장 경로를 응답한다. `static` 미들웨어가 `/img` 경로의 정적 파일을 제공하므로 클라이언트에서는 업로드한 이미지에 접근할 수 있다.

`POST /post` 라우터는 게시글 업로드는 처리하는 라우터이다. 이전의 라우터에서 이미지를 업로드했다면 이미지 주소도 `req.body.url`로 전송된다. 데이터 형식이 `multipart`이지만 이미지 데이터가 들어 있지 않으므로 `none` 메소드를 사용했다. 이미지는 직접 전달되지 않고 주소를 통해 전달된다.

게시글을 데이터베이스에 저장한 후에는 내용에서 해시태그를 정규표현식(`/#[^\s#]+/g`)으로 추출한다. 추출한 해시태그는 다시 `#` 문자를 제거하고 소문자로 바꾼 뒤 데이터베이스에 저장한다. 저장할 때는 `findOrCreate` 메소드를 사용하였는데, 이 시퀄라이즈 메소드는 데이터베이스에 존재하면 가져오고, 존재하지 않으면 생성하고 가져온다. 가져온 데이터의 형태가 `[모델, 생성 여부]`이므로 `result.map(r => r[0])`으로 모델만 추출하였다. 마지막으로 해시태그 모델들을 `post.addHashtags` 메소드로 게시글과 연결하였다.

이렇게 게시글 작성 기능이 추가되었으므로 이제부터 메인 페이지 로딩 시 메인 페이지와 게시글을 함께 로딩하도록 설정한다.

**controllers/page.js**
```
const { User, Post } = require("../models");

exports.renderProfile = (req, res) => {
    res.render("profile", { title: "내 정보 - NodeBird" });
};

exports.renderJoin = (req, res) => {
    res.render("join", { title: "회원 가입 - NodeBird" });
};

exports.renderMain = async (req, res, next) => {
    try {
        const posts = await Post.findAll({
            include: {
                model: User,
                attributes: ["id", "nick"],
            },

            order: [["createdAt", "DESC"]],
        });

        res.render("main", {
            title: "NodeBird",
            twits: posts,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};
```

데이터베이스에서 게시글을 조회한 뒤 결과를 `twits`에 담아 렌더링한다. 조회 시 작성자의 아이디와 닉네임을 JOIN으로 제공하고, 게시글의 순서는 최신순으로 정렬하였다. 지금까지 이미지 업로드 기능을 구현하였다.
- - -


## 9.5 프로젝트 마무리하기

마지막으로는 팔로잉 기능과 해시태그 검색 기능을 추가한다. 다른 사용자를 팔로우하는 기능을 구현하기 위해 `routes/user.js`와 `controllers/user.js`를 다음과 같이 작성한다.

**routes/user.js**
```
const express = require("express");

const { isLoggedIn } = require("../middlewares");
const { follow } = require("../controllers/user");

const router = express.Router();

// POST /user/:id/follow
router.post("/:id/follow", isLoggedIn, follow);

module.exports = router;
```

**controllers/user.js**
```
const User = require("../models/user");

exports.follow = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (user) {     // req.user.id가 followerId, req.params.id가 followingId
            await user.addFollowing(parseInt(req.params.id, 10));
            res.send("success");
        } else {
            res.status(404).send("no user");
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};
```

`POST /user/:id/follow`의 라우터이다. `:id` 부분은 `req.params.id`가 된다. 먼저 팔로우할 사용자를 데이터베이스에서 조회한 뒤, 시퀄라이즈에서 추가한 `addFollowing` 메소드로 현재 로그인한 사용자(follower)와의 관계를 추가한다.

팔로잉 관계가 발생하였으므로 `req.user`에도 팔로워와 팔로잉 목록을 저장한다. 앞으로 사용자 정보를 불러올 땐 팔로워, 팔로잉 목록도 함께 불러올 것이다. `req.user`를 바꾸려면 `deserializeUser`를 조작해야 한다.

**passport/index.js**
```
const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const User = require("../models/user");

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findOne({
            where: { id },
            include: [{
                model: User,
                attributes: ["id", "nick"],
                as: "Followers",
            }, {
                model: User,
                attributes: ["id", "nick"],
                as: "Followings",
            }]
        })
            .then(user => done(null, user))
            .catch(err => done(err));
    });

    local();
    kakao();
}
```

세션에 저장된 아이디로 사용자 정보를 조회할 때 팔로잉, 팔로워 목록도 함께 조회한다. `include`에서 계속 `attributes`를 지정하는 이유는 실수로 비밀번호를 조회하는 것을 방지하기 위함이다.

팔로잉/팔로워 숫자와 팔로우 버튼을 표시하기 위해 `routes/page.js`를 다음과 같이 수정한다.

**routes/page.js**
```
const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const { renderProfile, renderJoin, renderMain, renderHashtag } = require("../controllers/page");

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.followerCount = req.user?.Followers?.length || 0;
    res.locals.followingCount = req.user?.Followings?.length || 0;
    res.locals.followingIdList = req.user?.Followings?.map(f => f.id) || [];
    next();
});

router.get("/profile", isLoggedIn, renderProfile);

router.get("/join", isNotLoggedIn, renderJoin);

router.get("/", renderMain);

router.get("/hashtag", renderHashtag);

module.exports = router;
```

로그인한 경우엔 `req.user`가 존재하므로 옵셔널 체이닝을 이용하여 팔로잉/팔로워 수와 팔로잉 아이디 리스트를 저장한다. 팔로잉 아이디 리스트는 팔로우 버튼을 선택적으로 표시하기 위해 전달한다.

`GET /hashtag`는 해시태그로 조회하는 라우터이다. 쿼리스트링으로 해시태그 이름을 받고, 해시태그 값이 없으면 메인 페이지로 돌려 보낸다. 데이터베이스에 해시태그 값이 있다면 시퀄라이즈에서 제공하는 `getPosts` 메소드로 모든 게시글을 가져온다. 가져올 때는 `include`가 작성자 정보를 JOIN하게 된다. 조회한 후 메인 페이지를 렌더링하면서 전체 게시글 대신 조회된 게시글만 `twits`에 넣어 렌더링한다.

**controllers/page.js**
```
...
exports.renderHashtag = async (req, res, next) => {
    const query = req.query.hashtag;
    if (!query) {
        return res.redirect("/");
    }

    try {
        const hashtag = await Hashtag.findOne({ where: { title: query } });
        let posts = [];
        if (hashtag) {
            posts = await hashtag.getPosts({ include: [{ model: User }] });
        }

        return res.render("main", {
            title: `${query} | NodeBird`,
            twits: posts,
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
};
```

마지막으로 `routes/page.js`와 `routes/user.js`를 `app.js`에 연결한다. 업로드한 이미지를 제공할 라우터(`/img`)도 `express.static` 미들웨어로 `uploads` 디렉터리와 연결한다. `express.static`은 여러 번 사용할 수 있다. 이제 `uploads` 디렉터리 내 사진들이 `/img` 주소로 제공된다.

**app.js**
```
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const passport = require("passport");

dotenv.config();
const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const { sequelize } = require("./models");
const passportConfig = require("./passport");

const app = express();
passportConfig();   // passport 설정
app.set("port", process.env.PORT || 8001);
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
app.use("/img", express.static(path.join(__dirname, "uploads")));
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

app.use("/", pageRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);

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

이제 서버를 실행하면 구현한 모든 기능을 사용할 수 있다.


### 9.5.1 스스로 해보기

이 프로젝트를 조금 더 완성도 높게 만들기 위해 해야 하는 작업들을 나열한다.

- 팔로잉 끊기(시퀄라이즈의 `destroy` 메소드와 라우터 활용)
- 프로필 정보 변경하기(시퀄라이즈의 `update` 메소드와 라우터 활용)
- 게시글 좋아요 누르기 및 좋아요 취소하기(사용자 - 게시글 모델 간 N:M 관계 정립 후 라우터 활용)
- 게시글 삭제하기(등록자와 현재 로그인한 사용자가 같을 때, 시퀄라이즈의 `destroy` 메소드와 라우터 활용)
- 사용자 이름을 누르면 그 사용자의 게시글만 보여주기
- 매번 데이터베이스를 조회하지 않도록 `deserializeUser` 캐싱하기(객체 선언 후 객체에 사용자 정보 저장, 객체 안에 캐싱된 값이 있으면 조회)


### 9.5.2 핵심 정리

- 서버는 요청에 응답하는 것이 핵심 임무이므로 요청을 수락하든 거절하든 상관없이 반드시 단 한 번 응답해야 한다.
- 개발 시 서버를 매번 수동으로 재시작하지 않으려면 `nodemon`을 사용하는 것이 좋다.
- `dotenv` 패키지와 `.env` 파일로 유출되면 안 되는 비밀 키를 관리한다.
- 라우터는 `routes` 디렉터리에, 데이터베이스는 `model` 디렉터리에, `html` 파일은 `views` 디렉터리에 각각 구분해서 저장하면 프로젝트 규모가 커져도 관리하기 쉽다.
- 라우터에서 응답을 보내는 미들웨어를 컨트롤러라고 한다. 컨트롤러도 `controllers` 디렉터리로 따로 분리하면 코드를 관리하기 편하다.
- 데이터베이스를 구성하기 전에 데이터 간 1:1, 1:N, N:M 관계를 잘 파악한다.
- `middlewares/index.js`처럼 라우터 내에 미들웨어를 사용할 수 있다는 것을 기억한다.
- `Passport`의 인증 과정을 기억해 둔다. 특히 `serializeUser`와 `deserializeUser`가 언제 호출되는지 파악하고 있어야 한다.
- 프론트엔드 `form` 태그의 인코딩 방식이 `multipart`일 때는 `multer` 같은 `multipart` 처리용 패키지를 사용하는 것이 좋다.
- - -


## 9.6 함께 보면 좋은 자료

생략
- - -
