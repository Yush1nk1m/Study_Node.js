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