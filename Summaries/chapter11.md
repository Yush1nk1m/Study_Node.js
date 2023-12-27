# Node.js 교과서 11장 요약
## *노드 서비스 테스트하기*

- - -

## 11.1 테스트 준비하기

테스트를 위해 `jest` 패키지를 사용한다. `jest`는 페이스북에서 만든 오픈 소스로, 테스팅에 필요한 툴들을 대부분 갖추고 있다.

9장의 NodeBird 프로젝트를 그대로 사용하고 추가적으로 패키지를 설치한다. 테스팅 툴은 개발 시에만 사용하므로 `-D` 옵션을 사용한다.

**console**
```
Study_Node.js/Codes/chapter11/nodebird$ npm i -D jest

added 248 packages, and audited 520 packages in 17s

52 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
```

`package.json`에는 `test`라는 명령어를 등록해두어 명령어를 실행할 때 `jest`가 실행되게 한다.

**package.json**
```
{
  "name": "nodebird",
  "version": "0.0.1",
  "description": "익스프레스로 만드는 SNS 서비스",
  "main": "app.js",
  "scripts": {
    "start": "nodemon app",
    "test": "jest"
  },

...
```

**middlewares** 디렉터리 안에 **index.test.js**를 생성한다. 테스트용 파일은 파일명과 확장자 사이 `test` 또는 `spec`을 넣으면 된다.

`npm test`로 테스트 코드를 실행할 수 있다. 이는 파일명에 `test` 또는 `spec`이 들어간 파일들을 모두 찾아 실행한다.

**console**
```
Study_Node.js/Codes/chapter11/nodebird$ npm test

> nodebird@0.0.1 test
> jest

 FAIL  middlewares/index.test.js
  ● Test suite failed to run

    Your test suite must contain at least one test.

      at onResult (node_modules/@jest/core/build/TestScheduler.js:133:18)
      at node_modules/@jest/core/build/TestScheduler.js:254:19
      at node_modules/emittery/index.js:363:13
          at Array.map (<anonymous>)
      at Emittery.emit (node_modules/emittery/index.js:361:23)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        0.249 s
Ran all test suites.
```

지금부터 첫 번째 테스트 코드를 작성한다.

**middlewares/index.test.js**
```
test("1 + 1은 2입니다.", () => {
    expect(1 + 1).toEqual(2);
});
```

`test` 함수의 첫 번째 인수로는 테스트에 대한 설명을 전달하고, 두 번째 인수인 함수에는 테스트 내용을 전달한다. `expect` 함수의 인수로는 실제 코드를, `toEqual` 함수의 인수로는 예상되는 결괏값을 전달하면 된다.

**console**
```
Study_Node.js/Codes/chapter11/nodebird$ npm test

> nodebird@0.0.1 test
> jest

 PASS  middlewares/index.test.js
  ✓ 1 + 1은 2입니다. (1 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.241 s
Ran all test suites.
```

이처럼 `expect`에 전달한 값과 `toEqual`에 전달한 값이 일치하면 테스트를 통과하게 된다.

테스트가 실패하면 어떤 부분에서 실패했는지 시각적으로 보여주기 때문에 명확히 파악할 수 있다.

- - -

## 11.2 유닛 테스트

이제 실제 NodeBird 서비스의 코드를 테스트할 것이다. 먼저, **middlewares/index.js**에 있는 `isLoggedIn`과 `isNotLoggedIn` 함수를 테스트해본다.

**middlewares/index.test.js**
```
const { isLoggedIn, isNotLoggedIn } = require("./");

describe("isLoggedIn", () => {
    test("로그인되어 있으면 isLoggedIn이 next를 호출해야 한다.", () => {

    });

    test("로그인되어 있지 않으면 isLoggedIn이 오류를 응답해야 한다.", () => {

    });
});

describe("isNotLoggedIn", () => {
    test("로그인되어 있으면 isNotLoggedIn이 오류를 응답해야 한다.", () => {

    });

    test("로그인되어 있지 않으면 isNotLoggedIn이 next를 호출해야 한다.", () => {

    });
})
```

`isLoggedIn`, `isNotLoggedIn` 함수를 불러와 네 개의 테스트에 대한 스켈레톤 코드를 작성했다. `describe` 함수는 테스트를 그룹화해주는 역할을 수행한다. 첫 번째 인수는 그룹에 대한 설명, 두 번째 인수는 그룹에 대한 내용이다.

테스트 내용을 작성하기 전 다시 한번 **middlewares/index.js**의 내용을 확인해 보자.

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

실제 코드에서는 익스프레스가 `res`, `res` 객체와 `next` 함수를 인수로 전달했기에 사용할 수 있었으나 테스트 환경에서는 완벽하게 같게는 사용이 불가능하다.

이럴 때는 과감하게 가짜 객체와 가짜 함수를 만들어 전달하면 되는데, 이를 `모킹(mocking)`이라고 한다.

먼저 `isLoggedIn`에 대한 테스트를 작성한다.

**middlewares/index.test.js**
```
...
describe("isLoggedIn", () => {
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    const next = jest.fn();
    
    test("로그인되어 있으면 isLoggedIn이 next를 호출해야 한다.", () => {
        const req = {
            isAuthenticated: jest.fn(() => true),
        };

        isLoggedIn(req, res, next);

        expect(next).toBeCalledTimes(1);
    });

    test("로그인되어 있지 않으면 isLoggedIn이 오류를 응답해야 한다.", () => {
        const req = {
            isAuthenticated: jest.fn(() => false),
        };

        isLoggedIn(req, res, next);

        expect(res.status).toBeCalledWith(403);
        expect(res.send).toBeCalledWith("로그인 필요");
    });
});
...
```

`req`, `res`, `next`를 모킹했다. 함수를 모킹할 때는 `jest.fn` 메소드를 사용한다. 함수의 반환값을 지정하고 싶다면 `jest.fn(() => [return value])`와 같이 사용하면 된다. 

`isAuthenticate`는 로그인 여부를 알려주는 함수이므로 테스트 내용에 따라 true 또는 false를 반환하고, `res.status`는 `res.status(403).send("hello")`와 같이 메소드 체이닝이 가능해야 하므로 `res`를 반환하고 있다.

실제로는 `req`, `res` 객체에 더 많은 속성과 메소드가 포함되어 있겠지만, 테스트 환경에서는 필요한 속성과 메소드만 정의하면 된다.

`toBeCalldTimes([numbers])`는 정확히 몇 번 호출되었는지를 확인하는 메소드이고, `toBeCalledWith([argument])`는 특정 인수와 함께 호출되었는지 확인하는 메소드이다.

**console**
```
Study_Node.js/Codes/chapter11/nodebird$ npm test

> nodebird@0.0.1 test
> jest

 PASS  middlewares/index.test.js
  isLoggedIn
    ✓ 로그인되어 있으면 isLoggedIn이 next를 호출해야 한다. (2 ms)
    ✓ 로그인되어 있지 않으면 isLoggedIn이 오류를 응답해야 한다. (1 ms)
  isNotLoggedIn
    ✓ 로그인되어 있으면 isNotLoggedIn이 오류를 응답해야 한다. (1 ms)
    ✓ 로그인되어 있지 않으면 isNotLoggedIn이 next를 호출해야 한다.

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        0.263 s, estimated 1 s
Ran all test suites.
```

테스트를 돌려보면 모두 통과하는 것을 확인할 수 있다. 심지어 내용을 작성하지 않은 테스트까지 통과하는 것을 확인할 수 있다. 그러므로 테스트를 통과한다고 해서 오류가 발생하지 않는다고 단정할 수 없는 것이다.

`isNotLoggedIn`에 대한 테스트도 작성한다.

**middlewares/index.test.js**
```
describe("isNotLoggedIn", () => {
    const res = {
        redirect: jest.fn(),
    };
    const next = jest.fn();

    test("로그인되어 있으면 isNotLoggedIn이 오류를 응답해야 한다.", () => {
        const req = {
            isAuthenticated: jest.fn(() => true),
        };

        isNotLoggedIn(req, res, next);

        const message = encodeURIComponent("로그인한 상태입니다.");
        expect(res.redirect).toBeCalledWith(`/?error=${message}`);
    });

    test("로그인되어 있지 않으면 isNotLoggedIn이 next를 호출해야 한다.", () => {
        const req = {
            isAuthenticated: jest.fn(() => false),
        };

        isNotLoggedIn(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });
});
```

`toHaveBeenCalledTimes`와 `toBeCalledTimes`는 같은 동작을 하는 함수들이 이름만 다르게 정의되어 있는 alias이다.

이 테스트 역시 통과할 것이다. 이처럼 작은 단위의 함수나 모듈이 의도된 대로 정확히 작동하는지 테스트하는 것을 `유닛 테스트(단위 테스트, unit test)`라고 한다. 함수의 동작을 수정하면 기존에 작성해둔 테스트는 실패하게 될 것이다. 따라서 함수의 수정에 따른 고장을 테스트를 통해 파악할 수 있다.

다음으로는 `user` 컨트롤러를 테스트해볼 것이다. **controllers/user.js**의 내용을 다시 한번 확인해 보자.

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

여기서 follow 함수를 테스트한다. 다음과 같이 테스트 코드를 작성한다.

**controllers/user.test.js**
```
jest.mock("../models/user");
const User = require("../models/user");
const { follow } = require("./user");

describe("follow", () => {
    const req = {
        user: { id: 1 },
        params: { id: 2 },
    };
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    const next = jest.fn();
    
    test("사용자를 찾아 팔로잉을 추가하고 success를 응답해야 한다.", async () => {
        User.findOne.mockReturnValue({
            addFollowing(id) {
                return Promise.resolve(true);
            }
        });

        await follow(req, res, next);
        
        expect(res.send).toBeCalledWith("success");
    });

    test("사용자를 찾지 못하면 res.status(404).send(\"no user\")를 호출해야 한다.", async () => {
        User.findOne.mockReturnValue(null);
        
        await follow(req, res, next);

        expect(res.status).toBeCalledWith(404);
        expect(res.send).toBeCalledWith("no user");
    });

    test("데이터베이스에서 오류가 발생하면 next(error)를 호출한다.", async () => {
        const message = "데이터베이스 오류";

        User.findOne.mockReturnValue(Promise.reject(message));

        await follow(req, res, next);

        expect(next).toBeCalledWith(message);
    });
});
```

`follow` 컨트롤러 안에는 `User`라는 모델이 들어 있다. 이 모델은 실제 데이터베이스와 연결되어 있으므로 테스트 환경에서는 사용할 수 없다. 따라서 `jest.mock` 메소드를 사용해 `User` 모델을 모킹하였다.

`jest.mock`의 인수로는 모킹할 모듈의 경로를 전달하면 된다. 이러면 해당 모듈(`User`)의 메소드는 모두 가짜 메소드가 된다. 예를 들어 `User.findOne`과 같은 메소드는 가짜 메소드가 되고, 가짜 메소드에는 일괄적으로 `mockReturnValue` 등의 메소드가 생성된다. `mockReturnValue` 메소드로는 가짜 메소드의 가짜 반환값을 지정할 수 있다.

첫 번째 테스트에서 `mockReturnValue`를 사용해 `User.findOne`이 `{ addFollowing() }` 객체를 반환하게 하였다. 이는 데이터베이스로부터 사용자를 찾은 후 해당 사용자 객체에 `addFollowing` 메소드를 호출하는 컨트롤러의 동작을 반영한 설계이다. 이처럼 테스트 작성 시에는 함수의 전체적인 동작을 생각해야 한다.

이제 테스트를 진행하면 테스트를 통과한다.

**console**
```
Study_Node.js/Codes/chapter11/nodebird$ npm test

> nodebird@0.0.1 test
> jest

 PASS  controllers/user.test.js
  ● Console

    console.error
      데이터베이스 오류

      11 |         }
      12 |     } catch (error) {
    > 13 |         console.error(error);
         |                 ^
      14 |         next(error);
      15 |     }
      16 | };

      at error (controllers/user.js:13:17)
      at Object.<anonymous> (controllers/user.test.js:42:9)

 PASS  middlewares/index.test.js

Test Suites: 2 passed, 2 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        0.506 s, estimated 1 s
Ran all test suites.
```

하지만 유닛 테스트만으로는 실제 데이터베이스에 팔로잉이 등록되는 것인지 알기 어렵다. 따라서 실제 데이터베이스에선 문제가 발생할 수 있다. 이럴 때는 유닛 테스트가 아닌 통합 테스트나 시스템 테스트를 진행할 수 있다.

- - -

## 11.3 테스트 커버리지

jest의 `커버리지(coverage)` 기능을 사용하여 전체 코드 중 테스트되고 있는 코드의 비율과 테스트되지 않고 있는 코드의 위치를 알 수 있다.

커버리지 기능 사용을 위해 **package.json**을 다음과 같이 수정한다.

**package.json**
```
{
  "name": "nodebird",
  "version": "0.0.1",
  "description": "익스프레스로 만드는 SNS 서비스",
  "main": "app.js",
  "scripts": {
    "start": "nodemon app",
    "test": "jest",
    "coverage": "jest --coverage"
  },

...
```

**console**
```
Study_Node.js/Codes/chapter11/nodebird$ npm run coverage

> nodebird@0.0.1 coverage
> jest --coverage

 PASS  middlewares/index.test.js
 PASS  controllers/user.test.js
  ● Console

    console.error
      데이터베이스 오류

      11 |         }
      12 |     } catch (error) {
    > 13 |         console.error(error);
         |                 ^
      14 |         next(error);
      15 |     }
      16 | };

      at error (controllers/user.js:13:17)
      at Object.<anonymous> (controllers/user.test.js:42:9)

-------------|---------|----------|---------|---------|-------------------
File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------|---------|----------|---------|---------|-------------------
All files    |      84 |      100 |      60 |      84 |                   
 controllers |     100 |      100 |     100 |     100 |                   
  user.js    |     100 |      100 |     100 |     100 |                   
 middlewares |     100 |      100 |     100 |     100 |                   
  index.js   |     100 |      100 |     100 |     100 |                   
 models      |   33.33 |      100 |       0 |   33.33 |                   
  user.js    |   33.33 |      100 |       0 |   33.33 | 5-53              
-------------|---------|----------|---------|---------|-------------------

Test Suites: 2 passed, 2 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        0.796 s
Ran all test suites.
```

마지막으로 출력되는 표의 각각의 열들의 의미는 다음과 같다.

- `File`: 파일과 디렉터리 이름
- `% Stmts`: 구문 비율
- `% Branch`: if문 등의 분기점 비율
- `% Funcs`: 함수 비율
- `% Lines`: 코드 줄 수 비율
- `Uncovered Line #s`: 커버되지 않은 줄 위치

명시적으로 테스트하고 require한 코드만 커버리지 분석이 되기 때문에 테스트 커버리지가 100%라고 하더라도 모든 코드가 테스트되는 것은 아닐 수 있다.

**models/user.js**의 5번째 줄 ~ 53번째 줄이 테스트되지 않았다고 확인되고 있으므로 이를 테스트하는 코드를 다음과 같이 작성한다.

**models/user.test.js**
```
const Sequelize = require("sequelize");
const User = require("./user");
const config = require("../config/config")["test"];
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

describe("User model", () => {
    test("static initiate 메소드를 호출한다.", () => {
        expect(User.initiate(sequelize)).toBe(undefined);
    });

    test("static associate 메소드를 호출한다.", () => {
        const db = {
            User: {
                hasMany: jest.fn(),
                belongsToMany: jest.fn(),
            },

            Post: {},
        }
        User.associate(db);

        expect(db.User.hasMany).toHaveBeenCalledWith(db.Post);
        expect(db.User.belongsToMany).toHaveBeenCalledTimes(2);
    });
});
```

db 객체를 모킹하고 `initiate` 메소드와 `associate` 메소드가 제대로 호출되는지 테스트하였다. 이 과정에서 **models** 디렉터리에 모델이 아닌 테스트 파일을 생성했으므로 **models/index.js**가 모델을 시퀄라이즈와 자동으로 연결할 때 test 파일들을 걸러낼 수 있도록 수정되어야 한다.

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
    return (file.indexOf('.') !== 0) && !file.includes("test") && (file !== basename) && (file.slice(-3) === ".js");
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

실제 테스트 시에는 테스트 커버리지를 올리는 데 집중하기보단 필요한 부분 위주로 정확히 테스트하는 것이 중요하다.

- - -

## 11.4 통합 테스트

`통합 테스트(integration test)`란 라우터와 같은 큰 단위의 구성 요소들이 모두 유기적으로 잘 작동하는지 테스트하는 것이다.

통합 테스트를 위해 `supertest`를 설치한다.

**console**
```
Study_Node.js/Codes/chapter11/nodebird$ npm i -D supertest

added 15 packages, and audited 535 packages in 3s

54 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
```

`supertest` 사용을 위해서는 `app` 객체를 모듈로 분리해야 한다. **app.js** 파일에서 `app` 객체를 모듈화한 후 **server.js**에서 불러와 listen한다. **server.js**는 오직 `app`의 포트 리스닝만 담당한다. 이렇게 하면 **app.js**에는 순수 서버 코드만 남게 된다.

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

module.exports = app;
```

**server.js**
```
const app = require("./app");

app.listen(app.get("port"), () => {
    console.log(app.get("port"), "번 포트에서 대기 중");
});
```

`npm start` 명령어도 바뀐 파일 정보에 맞게 변경한다.

**package.json**
```
{
  "name": "nodebird",
  "version": "0.0.1",
  "description": "익스프레스로 만드는 SNS 서비스",
  "main": "server.js",
  "scripts": {
    "start": "nodemon server",
    "test": "jest",
    "coverage": "jest --coverage"
  },

...
```

다음으로는 테스트용 데이터베이스를 설정한다. 통합 테스트에서는 데이터베이스 코드를 모킹하지 않으므로 실제 테스트용 데이터가 데이터베이스에 저장될 수 있어야 한다. 그러므로 테스트용 데이터베이스를 따로 만드는 것이 좋다.

**config/config.json**에서 `test` 속성을 수정한다. 테스트 환경에서는 `test` 속성의 정보를 사용해 데이터베이스에 연결하게 된다.

**config/config.json**
```
{
  "development": {
    "username": "root",
    "password": "kimyush1n@@",
    "database": "nodebird",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": "kimyush1n@@",
    "database": "nodebird_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

콘솔에서 테스트용 데이터베이스를 생성하는 명령어를 입력한다.

**console**
```
Study_Node.js/Codes/chapter11/nodebird$ npx sequelize db:create --env test

Sequelize CLI [Node: 20.9.0, CLI: 6.6.1, ORM: 6.33.0]

Loaded configuration file "config/config.json".
Using environment "test".
Database nodebird_test created.
```

이제 로그인 라우터에 대한 테스트 코드를 작성해볼 것이다.

**routes/auth.test.js**
```
const request = require("supertest");
const { sequelize } = require("../models");
const app = require("../app");

beforeAll(async () => {
    await sequelize.sync();
});

describe("POST /login", () => {
    test("로그인을 수행한다.", (done) => {
        request(app) 
            .post("/auth/login")
            .send({
                email: "kys010306@sogang.ac.kr",
                password: "kimyush1n",
            })
            .expect("Location", "/")
            .expect(302, done);
    });
});
```

`beforeAll`은 모든 테스트를 실행하기 전 수행되는 코드들이 위치할 함수이다. `sequelize.sync()`를 이 위치에 넣어 데이터베이스에 테이블을 생성해두고 있다. 비슷한 함수로 `afterAll`(테스트 이후 수행될 코드들), `beforeEach`(각각의 테스트 이전 수행될 코드들), `afterEach`(각각의 테스트 이후 수행될 코드들)가 있다.

`request` 함수는 `supertest` 패키지에 속한 함수로, `app` 객체를 인수로 전달한 후 `get`, `post`, `patch`, `delete` 등의 메소드로 원하는 라우터에 요청을 보낼 수 있다. 그 후 예상되는 응답 결과를 `expect` 메소드의 인수로 전달하면 된다. `request` 함수는 비동기 함수이므로 마지막에 `test` 함수의 콜백 함수의 매개변수인 `done`을 `expect` 메소드의 두 번째 인수로 전달하여 테스트가 마무리되었음을 알려야 한다.

다음으로는 회원가입에 대한 테스트를 로그인 전에 수행할 수 있도록 테스트를 추가한다.

**routes/auth.test.js**
```
describe("POST /join", () => {
    test("로그인하지 않았으면 회원 가입한다.", (done) => {
        request(app)
            .post("/auth/join")
            .send({
                email: "kys010306@sogang.ac.kr",
                "nick": "yushin",
                password: "kimyush1n",
            })
            .expect("Location", "/")
            .expect(302, done);
    });
});

describe("POST /join", () => {
    const agent = request.agent(app);
    beforeEach((done) => {
        agent
            .post("/auth/login")
            .send({
                email: "kys010306@sogang.ac.kr",
                password: "kimyush1n",
            })
            .end(done);
    });

    test("이미 로그인했으면 /로 redirect한다.", (done) => {
        const message = encodeURIComponent("로그인한 상태입니다.");

        agent
            .post("/auth/join")
            .send({
                email: "kys010306@sogang.ac.kr",
                nick: "yushin",
                password: "kimyush1n",
            })
            .expect("Location", `/?error=${message}`)
            .expect(302, done);
    });
});
```

첫 번째 `describe`는 회원 가입을 테스트하는 것, 두 번째 `describe`는 로그인한 상태에서 회원 가입을 시도하는 경우를 테스트하는 것이다. 이때 회원 가입을 테스트하기 전 로그인하는 코드를 작성하였다. 이때 `agent`를 만들어 하나 이상의 요청에서 재사용할 수 있다.

`beforeEach`에서는 `end(done)`으로 agent 객체의 메소드 체이닝이 마무리되었음을 알리고 있다.

아직 테스트가 완벽하지 않다. 반복해서 테스트를 수행하면 이미 회원 가입된 동일한 데이터가 존재하기 때문에 회원 가입 과정에서 오류가 발생한다. 따라서 테스트 종료 시 데이터를 정리하는 코드를 `afterAll`을 사용해 추가한다.

**routes/auth.test.js**
```
const request = require("supertest");
const { sequelize } = require("../models");
const app = require("../app");

beforeAll(async () => {
    await sequelize.sync();
});

describe("POST /join", () => {
    test("로그인하지 않았으면 회원 가입한다.", (done) => {
        request(app)
            .post("/auth/join")
            .send({
                email: "kys010306@sogang.ac.kr",
                "nick": "yushin",
                password: "kimyush1n",
            })
            .expect("Location", "/")
            .expect(302, done);
    });
});

describe("POST /join", () => {
    const agent = request.agent(app);
    beforeEach((done) => {
        agent
            .post("/auth/login")
            .send({
                email: "kys010306@sogang.ac.kr",
                password: "kimyush1n",
            })
            .end(done);
    });

    test("이미 로그인했으면 /로 redirect한다.", (done) => {
        const message = encodeURIComponent("로그인한 상태입니다.");

        agent
            .post("/auth/join")
            .send({
                email: "kys010306@sogang.ac.kr",
                nick: "yushin",
                password: "kimyush1n",
            })
            .expect("Location", `/?error=${message}`)
            .expect(302, done);
    });
});

afterAll(async () => {
    await sequelize.sync({ force: true });
});
```

추가한 데이터를 명시적으로 삭제할 필요 없이 `sequelize.sync`에 `force: true` 옵션을 주어 테이블을 다시 생성한다. 그러면 테이블이 초기화되면서 데이터도 자연스럽게 정리된다.

회원 가입 테스트는 끝났으므로 로그인과 로그아웃까지 테스트하는 코드를 작성한다.

**routes/auth.test.js**
```
const request = require("supertest");
const { sequelize } = require("../models");
const app = require("../app");

beforeAll(async () => {
    await sequelize.sync();
});

describe("POST /join", () => {
    test("로그인하지 않았으면 회원 가입한다.", (done) => {
        request(app)
            .post("/auth/join")
            .send({
                email: "kys010306@sogang.ac.kr",
                "nick": "yushin",
                password: "kimyush1n",
            })
            .expect("Location", "/")
            .expect(302, done);
    });
});

describe("POST /join", () => {
    const agent = request.agent(app);
    beforeEach((done) => {
        agent
            .post("/auth/login")
            .send({
                email: "kys010306@sogang.ac.kr",
                password: "kimyush1n",
            })
            .end(done);
    });

    test("이미 로그인했으면 /로 redirect한다.", (done) => {
        const message = encodeURIComponent("로그인한 상태입니다.");

        agent
            .post("/auth/join")
            .send({
                email: "kys010306@sogang.ac.kr",
                nick: "yushin",
                password: "kimyush1n",
            })
            .expect("Location", `/?error=${message}`)
            .expect(302, done);
    });
});

describe("POST /login", () => {
    test("회원 가입되지 않았다.", (done) => {
        const message = encodeURIComponent("가입되지 않은 회원입니다.");
        request(app)
            .post("/auth/login")
            .send({
                email: "ayw@sogang.ac.kr",
                password: "kimyush1n",
            })
            .expect("Location", `/?error=${message}`)
            .expect(302, done);
    });

    test("로그인을 수행한다.", (done) => {
        request(app)
            .post("/auth/login")
            .send({
                email: "kys010306@sogang.ac.kr",
                password: "kimyush1n",
            })
            .expect("Location", "/")
            .expect(302, done);
    });

    test("비밀번호가 일치하지 않는다.", (done) => {
        const message = encodeURIComponent("비밀번호가 일치하지 않습니다.");

        request(app)
            .post("/auth/login")
            .send({
                email: "kys010306@sogang.ac.kr",
                password: "1",
            })
            .expect("Location", `/?error=${message}`)
            .expect(302, done);
    });
});

describe("GET /logout", () => {
    test("로그인되어 있지 않으면 403 상태 코드가 응답된다.", (done) => {
        request(app)
            .get("/auth/logout")
            .expect(403, done);
    });

    const agent = request.agent(app);
    beforeEach((done) => {
        agent
            .post("/auth/login")
            .send({
                email: "kys010306@sogang.ac.kr",
                password: "kimyush1n",
            })
            .end(done);
    });

    test("로그아웃을 수행한다.", (done) => {
        agent
            .get("/auth/logout")
            .expect("Location", "/")
            .expect(302, done);
    });
});

afterAll(async () => {
    await sequelize.sync({ force: true });
});
```

- - -

## 11.5 부하 테스트

`부하 테스트(load test)`란 서버가 수용할 수 있는 요청의 한계를 테스트하는 것이다. 서버의 사용자마다 일정량의 서버 메모리를 차지하게 되는데, 부하 테스트를 통해 서버의 메모리 양으로 어느 정도의 사용자를 수용할 수 있는지 미리 파악할 수 있다.

부하 테스트를 위해 `artillery`를 설치하고 `npm start` 명령어로 서버를 실행한다.

**console**
```
Study_Node.js/Codes/chapter11/nodebird$ npm i -D artillery
npm WARN deprecated querystring@0.2.0: The querystring API is considered Legacy. new code should use the URLSearchParams API instead.

added 610 packages, and audited 1145 packages in 53s

106 packages are looking for funding
  run `npm fund` for details

5 moderate severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.

Study_Node.js/Codes/chapter11/nodebird$ npm start
```

이제 새로운 콘솔을 하나 더 띄운 후 `npx artillery quick --count 100 -n 50 http://localhost:8001` 명령어를 입력한다.

**console**
```
Study_Node.js/Codes/chapter11/nodebird$ npx artillery quick --count 100 -n 50 http://localhost:8001
Test run id: tje7h_c9k499kx7t5znj5bg39kfekc6ercp_q7g7
Phase started: unnamed (index: 0, duration: 1s) 23:16:18(+0900)

Phase completed: unnamed (index: 0, duration: 1s) 23:16:19(+0900)

--------------------------------------
Metrics for period to: 23:16:20(+0900) (width: 1.967s)
--------------------------------------

http.codes.200: ................................................................ 1189
http.downloaded_bytes: ......................................................... 4185280
http.request_rate: ............................................................. 659/sec
http.requests: ................................................................. 1289
http.response_time:
  min: ......................................................................... 9
  max: ......................................................................... 207
  mean: ........................................................................ 117.4
  median: ...................................................................... 127.8
  p95: ......................................................................... 175.9
  p99: ......................................................................... 194.4
http.responses: ................................................................ 1189
vusers.created: ................................................................ 100
vusers.created_by_name.0: ...................................................... 100


--------------------------------------
Metrics for period to: 23:16:30(+0900) (width: 3.982s)
--------------------------------------

http.codes.200: ................................................................ 3811
http.downloaded_bytes: ......................................................... 13414720
http.request_rate: ............................................................. 934/sec
http.requests: ................................................................. 3711
http.response_time:
  min: ......................................................................... 7
  max: ......................................................................... 143
  mean: ........................................................................ 99.1
  median: ...................................................................... 100.5
  p95: ......................................................................... 133
  p99: ......................................................................... 135.7
http.responses: ................................................................ 3811
vusers.completed: .............................................................. 100
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 4818.1
  max: ......................................................................... 5373.6
  mean: ........................................................................ 5200.5
  median: ...................................................................... 5272.4
  p95: ......................................................................... 5378.9
  p99: ......................................................................... 5378.9


All VUs finished. Total time: 7 seconds

--------------------------------
Summary report @ 23:16:25(+0900)
--------------------------------

http.codes.200: ................................................................ 5000
http.downloaded_bytes: ......................................................... 17600000
http.request_rate: ............................................................. 797/sec
http.requests: ................................................................. 5000
http.response_time:
  min: ......................................................................... 7
  max: ......................................................................... 207
  mean: ........................................................................ 103.4
  median: ...................................................................... 104.6
  p95: ......................................................................... 144
  p99: ......................................................................... 179.5
http.responses: ................................................................ 5000
vusers.completed: .............................................................. 100
vusers.created: ................................................................ 100
vusers.created_by_name.0: ...................................................... 100
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 4818.1
  max: ......................................................................... 5373.6
  mean: ........................................................................ 5200.5
  median: ...................................................................... 5272.4
  p95: ......................................................................... 5378.9
  p99: ......................................................................... 5378.9
```

`--count` 옵션은 가상의 사용자 수를 의미하고, `-n` 옵션은 요청 횟수를 의미한다. 출력된 로그를 보면 테스트에 총 7초의 시간이 소요된 것을 확인할 수 있다. 가상의 사용자 100명이 생성(`vusers.created`)되었고, 그들의 테스트가 전부 완료(`vusers.completed`)되었으며, 모든 요청과 응답이 각각 5,000번 수행되었음(`http.requests, http.responses`)이 나타난다. `http.response_time`은 응답 지연 속도를 나타내므로 유의한 지표로 활용할 수 있다.

부하 테스트를 할 때 단순히 한 페이지에만 요청을 보내는 것이 아닌 실제 사용자 시나리오를 작성할 수 있다. 이를 위해 JSON 형식의 설정 파일을 작성해야 한다.

**loadtest.json**
```
{
    "config": {
        "target": "http://localhost:8001",
        "http": {
            "timeout": 30
        },
        "phases": [
            {
                "duration": 30,
                "arrivalRate": 20
            }
        ]
    },

    "scenarios": [{
        "flow": [
            {
                "get": {
                    "url": "/"
                }
            }, {
                "post": {
                    "url": "/auth/login",
                    "json": {
                        "email": "kys010306@sogang.ac.kr",
                        "password": "kimyush1n"
                    },
                    "followRedirect": false
                }
            }, {
                "get": {
                    "url": "/hashtag?hashtag=nodebird"
                }
            }
        ]
    }]
}
```

`config` 객체에서 `target`을 현재 서버로 설정하고, `phases`에서 30초 동안(`duration`) 매초 20명의 사용자(`arrivalRate`)를 생성하도록 설정하였다. 즉, 600명이 접속하는 상황이다. `timeout`은 30초로, 요청이 30초 내에 처리되지 않으면 실패된 것으로 간주한다.

이제 이 가상 사용자들의 동작을 `scenarios` 속성에 명시한다. 첫 번째 `flow`로는 먼저 메인 페이지(**GET /**)에 접속하고 로그인(**POST /auth/login**)한 후 해시태그 검색(**GET /hashtag?hashtag=nodebird**)을 한다. 로그인 시 요청의 body를 JSON 형식으로 전송하였고, `followRedirect`는 false로 설정하여 테스트에서 redirect 동작은 무시하도록 하였다. 이러한 일련의 동작들을 `flow` 하나에 나열하면 된다.

`npx artillery run [시나리오 파일]` 명령어로 부하 테스트를 실행할 수 있다.

**console**
```
Study_Node.js/Codes/chapter11/nodebird$ npx artillery run loadtest.json
Test run id: tx5xe_y7cf5r3jqxejx4wfyebkpk3caaca6_njpb
Phase started: unnamed (index: 0, duration: 30s) 23:30:25(+0900)

--------------------------------------
Metrics for period to: 23:30:30(+0900) (width: 4.268s)
--------------------------------------

http.codes.200: ................................................................ 172
http.codes.302: ................................................................ 86
http.downloaded_bytes: ......................................................... 618082
http.request_rate: ............................................................. 67/sec
http.requests: ................................................................. 258
http.response_time:
  min: ......................................................................... 3
  max: ......................................................................... 77
  mean: ........................................................................ 5.7
  median: ...................................................................... 4
  p95: ......................................................................... 8.9
  p99: ......................................................................... 40
http.responses: ................................................................ 258
vusers.completed: .............................................................. 86
vusers.created: ................................................................ 86
vusers.created_by_name.0: ...................................................... 86
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 18.3
  max: ......................................................................... 208.1
  mean: ........................................................................ 32.4
  median: ...................................................................... 22.9
  p95: ......................................................................... 89.1
  p99: ......................................................................... 162.4


--------------------------------------
Metrics for period to: 23:30:40(+0900) (width: 9.935s)
--------------------------------------

http.codes.200: ................................................................ 400
http.codes.302: ................................................................ 200
http.downloaded_bytes: ......................................................... 1437400
http.request_rate: ............................................................. 60/sec
http.requests: ................................................................. 600
http.response_time:
  min: ......................................................................... 3
  max: ......................................................................... 13
  mean: ........................................................................ 3.9
  median: ...................................................................... 4
  p95: ......................................................................... 5
  p99: ......................................................................... 7.9
http.responses: ................................................................ 600
vusers.completed: .............................................................. 200
vusers.created: ................................................................ 200
vusers.created_by_name.0: ...................................................... 200
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 14.6
  max: ......................................................................... 31.7
  mean: ........................................................................ 18.5
  median: ...................................................................... 18
  p95: ......................................................................... 22.9
  p99: ......................................................................... 30.9


Phase completed: unnamed (index: 0, duration: 30s) 23:30:55(+0900)

--------------------------------------
Metrics for period to: 23:30:50(+0900) (width: 9.932s)
--------------------------------------

http.codes.200: ................................................................ 400
http.codes.302: ................................................................ 200
http.downloaded_bytes: ......................................................... 1437400
http.request_rate: ............................................................. 60/sec
http.requests: ................................................................. 600
http.response_time:
  min: ......................................................................... 2
  max: ......................................................................... 18
  mean: ........................................................................ 3.6
  median: ...................................................................... 3
  p95: ......................................................................... 5
  p99: ......................................................................... 7.9
http.responses: ................................................................ 600
vusers.completed: .............................................................. 200
vusers.created: ................................................................ 200
vusers.created_by_name.0: ...................................................... 200
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 13.8
  max: ......................................................................... 40.2
  mean: ........................................................................ 16.9
  median: ...................................................................... 16.3
  p95: ......................................................................... 20.3
  p99: ......................................................................... 29.7


--------------------------------------
Metrics for period to: 23:31:00(+0900) (width: 5.65s)
--------------------------------------

http.codes.200: ................................................................ 228
http.codes.302: ................................................................ 114
http.downloaded_bytes: ......................................................... 819318
http.request_rate: ............................................................. 67/sec
http.requests: ................................................................. 342
http.response_time:
  min: ......................................................................... 0
  max: ......................................................................... 14
  mean: ........................................................................ 3.3
  median: ...................................................................... 3
  p95: ......................................................................... 4
  p99: ......................................................................... 8.9
http.responses: ................................................................ 342
vusers.completed: .............................................................. 114
vusers.created: ................................................................ 114
vusers.created_by_name.0: ...................................................... 114
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 13.6
  max: ......................................................................... 42.9
  mean: ........................................................................ 16.3
  median: ...................................................................... 15.3
  p95: ......................................................................... 19.9
  p99: ......................................................................... 33.5


All VUs finished. Total time: 32 seconds

--------------------------------
Summary report @ 23:30:57(+0900)
--------------------------------

http.codes.200: ................................................................ 1200
http.codes.302: ................................................................ 600
http.downloaded_bytes: ......................................................... 4312200
http.request_rate: ............................................................. 67/sec
http.requests: ................................................................. 1800
http.response_time:
  min: ......................................................................... 0
  max: ......................................................................... 77
  mean: ........................................................................ 4
  median: ...................................................................... 4
  p95: ......................................................................... 6
  p99: ......................................................................... 10.1
http.responses: ................................................................ 1800
vusers.completed: .............................................................. 600
vusers.created: ................................................................ 600
vusers.created_by_name.0: ...................................................... 600
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 13.6
  max: ......................................................................... 208.1
  mean: ........................................................................ 19.5
  median: ...................................................................... 17.3
  p95: ......................................................................... 28.5
  p99: ......................................................................... 80.6
```

`artillery`만으로는 네트워크가 느린 것인지 서버가 느린 것인지 DB가 느린 것인지는 파악할 수 없으므로 `datadog`이나 `newrelic` 같은 상용 서비스를 사용해보면 좋다.

- - -

## 11.6 프로젝트 마무리하기

### 11.6.1 스스로 해보기

- 모든 함수에 대한 유닛 테스트 작성하기(테스트 커버리지 100% 도전하기)
- 모든 라우터에 대한 통합 테스트 작성하기
- 부하 테스트를 통해 병목점 및 개선점 찾기

### 11.6.2 핵심 정리

- 테스트를 작성한다고 해서 에러가 발생하지 않는 것은 아니다. 하지만 자신의 코드에 대한 믿음을 가질 수는 있다.
- 테스트를 올바르게 작성하지 않으면 테스트를 하지 않는 것보다 못한 상황이 발생한다.
- 테스트를 작성하면 나중에 코드 변경 시 어떤 부분에 영향을 미치는지 쉽게 파악할 수 있다. 이러한 긍정적인 영향과 테스트하는 데 드는 공수를 계산해 테스트 범위를 정해야 한다.
- 실제 서비스에서 모든 기능을 테스트하기는 어려우므로 우선순위를 정해 우선순위가 높은 기능 위주로 테스트한다.
- 테스트 커버리지가 100%라고 해서 에러가 발생하지 않는 것은 아니다.

### 11.6.3 함께 보면 좋은 자료

생략

- - -