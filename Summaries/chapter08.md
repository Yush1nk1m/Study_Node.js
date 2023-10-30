# Node.js 교과서 8장 요약
## *몽고디비*

MongoDB는 자바스크립트 문법 기반의 NoSQL 데이터베이스이다.
- - -



## 8.1 NoSQL vs. SQL

`SQL`을 사용하는 대표적인 데이터베이스는 `MySQL`이 있다. 반면 `SQL`을 사용하지 않는 `NoSQL(Not only SQL)`이라는 데이터베이스도 있는데, 대표적으로 `MongoDB`가 있다.

**SQL과 NoSQL의 비교**
| SQL(MySQL) | NoSQL(MongoDB) |
| :-- | :-- |
| 규칙에 맞는 데이터 입력 | 자유로운 데이터 입력 |
| 테이블 간 JOIN 지원 | 컬렉션 간 JOIN 미지원 |
| 안정성, 일관성 | 확장성, 가용성 |
| 용어(테이블, 로우, 컬럼) | 용어(컬렉션, 다큐먼트, 필드) |

`NoSQL` 데이터베이스에는 고정된 테이블이 없다. `SQL` 데이터베이스에서는 일단 테이블을 하나 생성하면 테이블에 들어가는 모든 로우들은 같은 컬럼들을 갖게 된다. 하지만 `NoSQL` 데이터베이스에서는 컬렉션을 하나 생성하면 그 안에 들어가는 다큐먼트마다 다른 데이터가 들어갈 수 있다.

이렇게 다큐먼트마다 포함하고 있는 정보의 종류가 다를 수 있기 때문에 JOIN 연산 역시 지원되지 않는다는 단점이 있다. 또한 데이터의 일관성을 보장하기가 어렵다. 그렇지만 데이터를 빠르게 삽입할 수 있고, 쉽게 여러 서버에 데이터를 분산할 수 있기 때문에 확장성과 가용성이 좋아 사용된다.
- - -


## 8.2 몽고디비 설치하기

생략
- - -


## 8.3 컴퍼스 설치하기

생략
- - -


## 8.4 데이터베이스 및 컬렉션 생성하기

이 장에서는 `nodejs`라는 이름의 데이터베이스와 7장의 MySQL 테이블에 상응하는 컬렉션을 만들어 본다. 먼저 몽고디비 프롬프트로 접속하여 다음과 같이 입력한다.

**console**
```
PS C:\Users\kys01\AppData\Local\Programs\mongosh> ./mongosh

...

test> use nodejs
switched to db nodejs
nodejs>
```

`show dbs` 명령어로 데이터베이스 목록을 확인할 수 있다.

**MongoDB prompt**
```
nodejs> show dbs
admin   132.00 KiB
config   12.00 KiB
local    72.00 KiB
```

방금 생성한 `nodejs` 데이터베이스가 나타나지 않는다. 이것은 데이터가 없기 때문이므로 아무 데이터나 하나 추가하면 생성된다.

`db` 명령어로 현재 사용하고 있는 데이터베이스를 확인할 수 있다.

**MongoDB prompt**
```
nodejs> db
nodejs
```

컬렉션은 굳이 따로 생성할 필요는 없고, 다큐먼트를 넣는 순간 자동으로 생성된다. 하지만 다음과 같이 `db.createCollection("[컬렉션 이름]")` 명령으로 컬렉션을 직접 생성할 수도 있다.

**MongoDB prompt**
```
nodejs> db.createCollection("users")
{ ok: 1 }
nodejs> db.createCollection("comments")
{ ok: 1 }
```

`show collections` 명령어로는 생성한 컬렉션 목록을 확인할 수 있다.

**MongoDB prompt**
```
nodejs> show collections
comments
users
```
- - -


## 8.5 CRUD 작업하기


### 8.5.1 Create(생성)

컬렉션에는 컬럼을 정의하지 않아도 되므로 아무 데이터나 삽입할 수 있다. MongoDB의 자료형은 MySQL과는 조금 다르다. 기본적으로 자바스크립트 자료형을 따르면서 몇 가지 자료형을 더 가진다.

`Date`나 `정규표현식` 같은 자바스크립트 객체를 자료형으로 사용할 수 있고, `Binary Data`, `ObjectId`, `Int`, `Long`, `Timestamp`, `JavaScript` 등의 추가적인 자료형이 존재한다. `Undefined`와 `Symbol`은 자료형으로 사용하지 않는다. 추가적인 자료형들 중에선 주로 `Binary Data`, `ObjectId`, `Timestamp` 정도만 자주 사용된다. `ObjectId`는 MySQL에서 기본 키로 쓰이는 값과 비슷한 역할을 한다. 고유한 값을 가지므로 다큐먼트를 조회할 때 사용할 수 있다.

MongoDB 프롬프트를 실행해 다음과 같은 명령어를 입력한다.

**MongoDB prompt**
```
nodejs> db.users.insertOne({ name: "yushin", age: 23, married: false, comment: "안녕하세요.", createdAt: new Date() });
{
  acknowledged: true,
  insertedId: ObjectId("653f5be748ed04337501b8cf")
}
nodejs> db.users.insertOne({ name: "yeonwoo", age: 22, married: false, comment: "연우예요.", createdAt: new Date() });
{
  acknowledged: true,
  insertedId: ObjectId("653f5c0f48ed04337501b8d0")
}
```

`db.[컬렉션 이름].insertOne([다큐먼트])`로 다큐먼트를 생성할 수 있다. 다큐먼트는 자바스크립트 객체 형태로 생성하면 된다. 명령이 성공적으로 수행되면 `acknowledged` 속성이 `true`로 반환되며 `insertedId: ObjectId("653f5c0f48ed04337501b8d0")`처럼 객체마다 다른 `ObjectId` 속성이 반환된다. 이것이 특정 다큐먼트를 검색할 때 사용되는 키이다.

`comments` 컬렉션에도 데이터를 삽입해 볼 것이다. 그 전에 SQL의 외래 키와 같은 것을 구현하기 위해 다음과 같이 `ObjectId`를 알아낸다.

**MongoDB prompt**
```
nodejs> db.users.find({ name: "yushin" }, { _id: 1 });
[ { _id: ObjectId("653f5be748ed04337501b8cf") } ]
```

찾아낸 `ObjectId`를 갖고 다음과 같이 입력한다.

**MongoDB prompt**
```
nodejs> db.comments.insertOne({ commenter: ObjectId("653f5be748ed04337501b8cf"), comment: "안녕하세요. yushin의 댓글입니다.", createdAt: new Date() });
{
  acknowledged: true,
  insertedId: ObjectId("653f5d4848ed04337501b8d1")
}
```


### 8.5.2 Read(조회)

이번 절에서는 8.5.1 절에서 생성한 다큐먼트들을 조회한다.

**MongoDB prompt**
```
nodejs> db.users.find({});
[
  {
    _id: ObjectId("653f5be748ed04337501b8cf"),
    name: 'yushin',
    age: 23,
    married: false,
    comment: '안녕하세요.',
    createdAt: ISODate("2023-10-30T07:31:51.921Z")
  },
  {
    _id: ObjectId("653f5c0f48ed04337501b8d0"),
    name: 'yeonwoo',
    age: 22,
    married: false,
    comment: '연우예요.',
    createdAt: ISODate("2023-10-30T07:32:31.049Z")
  }
]
```

`find({})` 메소드는 컬렉션 내의 모든 다큐먼트들을 조회하는 명령어이다.

특정 필드만 조회하고 싶다면 다음과 같이 입력한다.

**MongoDB prompt**
```
nodejs> db.users.find({}, { _id: 0, name: 1, married: 1 });
[
  { name: 'yushin', married: false },
  { name: 'yeonwoo', married: false }
]
```

`find` 메소드의 두 번째 인수로 조회할 필드를 전달하였다. `1` 또는 `true`로 표시한 필드만 가져온다. 그러나 `_id`는 기본적으로 가져오도록 되어 있으므로 명시적으로 `0` 또는 `false`로 가져오지 않도록 해야 한다.

조회 시 조건을 주려면 첫 번째 인수 객체에 명시하면 된다. `age > 20`, `married == false`인 다큐먼트를 조회하는 예제는 다음과 같다.

**MongoDB prompt**
```
nodejs> db.users.find({ age: { $gt: 20 }, married: false }, { _id: 0, name: 1, age: 1 });
[ { name: 'yushin', age: 23 }, { name: 'yeonwoo', age: 22 } ]
```

`$gt`라는 특수한 속성을 사용하였는데, 이는 시퀄라이즈의 쿼리와도 비슷하다. 그러나 MongoDB는 자바스크립트 객체로 명령어 쿼리를 생성해야 하므로 `$gt` 같은 특수한 연산자를 사용한다.

자주 사용되는 연산자로는 다음과 같은 것들이 있다.

| 연산자 | 의미 |
| :--: | :--: |
| $gt | 초과 |
| $gte | 이상 |
| $lt | 미만 |
| $lte | 이하 |
| $ne | 같지 않음 |
| $or | 또는 |
| $in | 배열 요소 중 하나 |

MongoDB에서 OR 연산을 하는 예제는 다음과 같다. `age > 20 OR married == true`인 조건을 구현하였다.

**MongoDB prompt**
```
nodejs> db.users.find({ $or: [{ age: { $gt: 20 } }, { married: true }] }, { _id: 0, name: 1, age: 1 });
[ { name: 'yushin', age: 23 }, { name: 'yeonwoo', age: 22 } ]
```

`sort` 메소드를 사용하면 정렬도 가능하다. 나이에 대해 오름차순으로 정렬한 예제는 다음과 같다.

**MongoDB prompt**
```
nodejs> db.users.find({}, { _id: 0, name: 1, age: 1 }).sort({ age: 1 });
[ { name: 'yeonwoo', age: 22 }, { name: 'yushin', age: 23 } ]
```

`sort` 메소드의 인자로 전달되는 객체의 속성 이름은 정렬할 기준이 되는 필드의 이름이고, 그 값이 -1이면 내림차순, 1이면 오름차순으로 정렬한다.

조회할 다큐먼트의 개수를 지정할 수도 있다. 다음과 같이 `limit` 메소드를 사용하면 된다.

**MongoDB prompt**
```
nodejs> db.users.find({}, { _id: 0, name: 1, age: 1 }).sort({ age: 1 }).limit(1);
[ { name: 'yeonwoo', age: 22 } ]
```

다큐먼트 개수를 설정하면서 몇 개를 건너뛸지 설정할 수도 있다. 이는 SQL의 `OFFSET`과도 비슷하다. MongoDB에서는 다음과 같이 `skip` 메소드를 사용한다.

**MongoDB prompt**
```
nodejs> db.users.find({}, { _id: 0, name: 1, age: 1 }).sort({ age: 1 }).limit(1).skip(1);
[ { name: 'yushin', age: 23 } ]
```
- - -


### 8.5.3 Update(수정)

기존의 데이터를 수정하는 명령어는 다음과 같다.

**MongoDB prompt**
```
nodejs> db.users.updateOne({ name: "yushin" }, { $set: { comment: "안녕하세요. 이 필드를 바꾸어 보겠습니다." } });
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
```

첫 번째 객체로는 수정할 다큐먼트를 지정할 수 있고, 두 번째 객체로는 수정할 내용을 입력할 수 있다. 주의할 점은 `$set` 연산자를 사용하지 않으면 두 번째 인수 자체가 새로운 다큐먼트가 된다는 것이다. 일부 필드만 수정하고 싶다면 반드시 `$set` 연산자를 사용해야 한다.

수정에 성공하면 첫 번째 객체에 해당하는 다큐먼트의 개수(`matchedCount`)와 수정된 다큐먼트의 수(`modifedCount`)가 출력된다. `updateOne` 메소드는 하나의 다큐먼트만 수정한다. 여러 개의 다큐먼트를 수정하고자 한다면 `updateMany` 메소드를 사용해야 한다.


### 8.5.4 Delete(삭제)

데이터를 삭제하는 명령어는 다음과 같다.

**MongoDB prompt**
```
nodejs> db.users.deleteOne({ name: "yushin" });
{ acknowledged: true, deletedCount: 1 }
```

삭제할 다큐먼트에 대한 정보를 첫 번째 인수로 전달하면 된다. 성공 시 삭제된 다큐먼트의 개수(`deletedCount`)가 반환된다. `deleteOne` 메소드는 하나의 다큐먼트만 삭제하므로, 여러 개를 삭제해야 한다면 `deleteMany` 메소드를 사용한다.
- - -


## 8.6 몽구스 사용하기

`몽구스(Mongoose)`는 노드와 MongoDB를 연동해줄뿐만 아니라 쿼리까지 만들어주는 라이브러리이다. MySQL에 시퀄라이즈가 있다면 MongoDB에는 몽구스가 있다.

몽구스는 Relation이 아닌 Document를 사용하므로 `ODM(Object Document Mapping)`이라고 불린다. 앞서 시퀄라이즈는 `ORM(Object Relational Mapping)`이라고 설명한 바 있다.

MongoDB 자체가 자바스크립트 기반임에도 불구하고 자바스크립트 객체와 매핑하는 이유는 몽구스가 MongoDB에 없는 기능을 보완해주기 때문이다.

먼저 몽구스에는 `스키마(Schema)`라는 것이 있는데, 이것으로 다른 다큐먼트에는 없는 필드가 삽입되었을 때 이를 감지하고 필터링해줄 수 있다. MongoDB의 단점으로 꼽히는 일관성 문제를 어느 정도 해결해 줄 수 있는 것이다.

또한, MySQL에 있는 JOIN 기능을 `populate`라는 메소드로 어느 정도 보완할 수 있다. 따라서 관계가 있는 데이터들을 쉽게 가져올 수 있다. 비록 쿼리 한 번에 데이터를 합쳐서 가져오는 방식은 아니지만, 사용자가 여러 개의 쿼리를 짜야 하는 것이 아니므로 편리하다.

ES2015 프로미스 문법과, 강력하고 가독성이 높은 쿼리 빌더를 지원하는 것도 장점이다.

지금부터는 실습 진행을 위해 `learn-mongoose` 프로젝트 디렉터리를 생성하고 다음과 같이 `package.json`을 생성한다.

**package.json**
```
{
  "name": "learn-mongoose",
  "version": "0.0.1",
  "description": "몽구스를 배우자",
  "main": "app.js",
  "scripts": {
    "start": "nodemon app"
  },
  "author": "Yushin Kim",
  "license": "MIT"
}
```

그리고 몽구스와 필요한 패키지들을 설치한다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter08\learn-mongoose> npm i express morgan nunjucks mongoose nodemon

added 129 packages, and audited 130 packages in 9s

15 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```


### 8.6.1 몽고디비 연결하기

이제 노드와 몽고디비를 몽구스를 통해 연결해 본다. 몽고디비는 주소를 사용해 연결한다. 주소 형식은 `mongodb://[username:password@]host[:port][/[database][?options]]`와 같다. `[]` 부분은 있어도 되고 없어도 된다.

나의 작업 환경에서 주소는 다음과 같다.

```
mongodb://yushin:비밀번호@localhost:27017/admin
```

먼저 `schemas` 디렉터리를 루트 디렉터리에 생성하고, 디렉터리 안에 `index.js`를 다음과 같이 생성한다.

**schemas/index.js**
```
const mongoose = require("mongoose");

const connect = () => {

    if (process.env.NODE_ENV !== "production") {
        mongoose.set("debug", true);
    }

    mongoose.connect("mongodb://yushin:비밀번호@localhost:27017/admin", {
        dbName: "nodejs",
        useNewUrlParser: true,
    }).then(() => {
        console.log("몽고디비 연결 성공");
    }).catch((err) => {
        console.error("몽고디비 연결 에러", err);
    });
};

mongoose.connection.on("error", (error) => {
    console.error("몽고디비 연결 에러", error);
});

mongoose.connection.on("disconnected", () => {
    console.error("몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.");
    connect();
});

module.exports = connect;
```

```
if (process.env.NODE_ENV !== "production") {
    mongoose.set("debug", true);
}
```

위 코드는 개발 환경일 때만 콘솔을 통해 몽구스가 생성하는 쿼리 내용을 확인할 수 있게 해주는 코드이다.

```
mongoose.connect("mongodb://yushin:비밀번호@localhost:27017/admin", {
    dbName: "nodejs",
    useNewUrlParser: true,
}).then(() => {
    console.log("몽고디비 연결 성공");
}).catch((err) => {
    console.error("몽고디비 연결 에러", err);
});
```

위 코드는 몽구스와 몽고디비를 연결하는 코드이다. 접속을 시도하는 주소는 `admin`이지만 실제로 사용할 데이터베이스는 `nodejs`이므로 두 번째 인수로 `dbName` 속성에 값을 주어 접속할 수 있게 하였다. 이후엔 콜백 함수를 통해 연결의 성공/실패 여부를 확인할 수 있게 하였다.

```
mongoose.connection.on("error", (error) => {
    console.error("몽고디비 연결 에러", error);
});

mongoose.connection.on("disconnected", () => {
    console.error("몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.");
    connect();
});
```

위 코드는 몽구스 커넥션에 이벤트 리스너를 설정한 것이다. 에러 발생 시 그 내용을 기록하고, 연결 종료 시 재연결을 시도한다.

다음으로는 `app.js`를 생성하고 `schemas/index.js`와 연결한다.

**app.js**
```
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");

const connect = require("./schemas");

const app = express();

app.set("port", process.env.PORT || 3002);
app.set("view engine", "html");
nunjucks.configure("views", {
    express: app,
    watch: true,
});

connect();

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
})

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

서버가 잘 실행되는지 테스트하기 위해 이전 절에서 배웠던 방식으로 먼저 몽고디비를 실행해야 한다. 그 이후 프로젝트 디렉터리에서 `npm start` 명령어로 서버를 실행한다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter08\learn-mongoose> npm start

> learn-mongoose@0.0.1 start
> nodemon app

[nodemon] 3.0.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node app.js`
3002 번 포트에서 대기 중
몽고디비 연결 성공
```


### 8.6.2 스키마 정의하기

이번에는 시퀄라이즈에서 테이블을 만들었던 것과 같이 몽구스 스키마를 만든다. `schemas` 디렉터리에 `user.js`와 `comment.js`를 생성한다.

**schemas/user.js**
```
const mongoose = require("mongoose");

const { Schema } = mongoose;
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },

    age: {
        type: Number,
        required: true,
    },

    married: {
        type: Boolean,
        required: true,
    },

    comment: String,

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("User", userSchema);
```

시퀄라이즈에서 모델을 정의하는 것과 비슷하게 몽구스 모듈에서 `Schema` 생성자를 사용해 스키마를 생성한다.

몽구스는 알아서 `_id` 필드를 생성하므로 `_id` 필드는 정의할 필요가 없다. 그러므로 나머지 필드만 정의해 준다.

몽구스 스키마에서 특이한 점은 `String`, `Number`, `Date`, `Buffer`, `Boolean`, `Mixed`, `ObjectId`, `Array`를 값으로 가질 수 있다는 것이다. 몽고디비의 자료형과는 조금 다르다.

`name` 필드의 자료형은 `String`이고 필수이며 고유한 값이어야 한다. `age` 필드의 자료형은 `Number`이고 필수이다. `married` 필드의 자료형은 `Boolean`이고 필수이다. `comment` 필드의 자료형은 `String`이다. `required` 또는 `default` 등의 옵션이 필요하지 않다면 간단히 자료형만 명시하면 된다. `createdAt` 필드의 자료형은 `Date`이고 기본값은 `Date.now`(데이터 생성 당시의 시간)이다.

마지막은 몽구스의 `model` 메소드로 스키마와 몽고디비 컬렉션을 연결하는 모델을 생성한다.

**schemas/mongoose.js**
```
const mongoose = require("mongoose");

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const commentSchema = new Schema({
    commenter: {
        type: ObjectId,
        required: true,
        ref: "User",
    },

    comment: {
        type: String,
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Comment", commentSchema);
```

`commenter` 속성의 자료형이 `ObjectId`인 것에 주목한다. 옵션으로는 `ref` 속성의 값이 `User`로 주어져 있다. 이는 `commenter` 필드에 `User` 스키마의 `ObjectId`가 들어간다는 의미이다. 나중에 몽구스가 JOIN과 비슷한 연산을 할 때 사용된다.

몽구스는 `model` 메소드의 첫 번째 인수로 컬렉션 이름을 만든다. 위 예제들에서는 첫 번째 인수가 `User`, `Comment`로 주어져 있는데, 첫 글자를 소문자로 만들고 복수형으로 변환해 각각 `users`, `comments` 컬렉션을 생성하는 것이다. 이러한 강제 개명이 싫다면 세 번째 인수로 컬렉션 이름을 지정할 수 있다.


### 8.6.3 쿼리 수행하기

이 절에서는 7.6.4절과 같이 몽구스를 사용해 쿼리를 수행하는 예제를 살펴본다.

`views` 디렉터리 안에 다음과 같이 `mongoose.html`과 `error.html` 파일을 생성한다.

**views/mongoose.html**
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>몽구스 서버</title>
    <style>
        table { border: 1px solid black; border-collapse: collapse; }
        table th, table td { border: 1px solid black; }
    </style>
</head>
<body>
    <div>
        <form id="user-form">
            <fieldset>
                <legend>사용자 등록</legend>
                <div><input id="username" type="text" placeholder="이름"></div>
                <div><input id="age" type="number" placeholder="나이"></div>
                <div><input id="married" type="checkbox"><label for="married">결혼 여부</label></div>
                <button type="submit">등록</button>
            </fieldset>
        </form>
    </div>
    <br>
    <table id="user-list">
        <thead>
            <tr>
                <th>아이디</th>
                <th>이름</th>
                <th>나이</th>
                <th>결혼 여부</th>
            </tr>
        </thead>
        <tbody>
            {% for user in users %}
            <tr>
                <td>{{user.id}}</td>
                <td>{{user.name}}</td>
                <td>{{user.age}}</td>
                <td>{{ "기혼" if user.married else "미혼" }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
    <br>
    <div>
        <form id="comment-form">
            <filedset>
                <legend>댓글 등록</legend>
                <div><input id="userid" type="text" placeholder="사용자 아이디"></div>
                <div><input id="comment" type="text" placeholder="댓글"></div>
                <button type="submit">등록</button>
            </filedset>
        </form>
    </div>
    <br>
    <table id="comment-list">
        <thead>
            <tr>
                <th>아이디</th>
                <th>작성자</th>
                <th>댓글</th>
                <th>수정</th>
                <th>삭제</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script src="/mongoose.js"></script>
</body>
</html>
```

**views/error.html**
```
<h1>{{message}}</h1>
<h2>{{error.status}}</h2>
<pre>{{error.stack}}</pre>
```

다음으로는 `public` 디렉터리 안에 `mongoose.js` 파일을 생성한다. 7.6.4절의 `public/sequelize.js`와는 구조가 조금 다르므로 유의한다.

**public/mongoose.js**
```
// 사용자 이름을 눌렀을 때 댓글 로딩
document.querySelectorAll("#user-list tr").forEach((el) => {
    el.addEventListener("click", function () {
        const id = el.querySelector("td").textContent;
        getComment(id);
    });
});

// 사용자 로딩
async function getUser() {
    try {
        const res = await axios.get("/users");
        const users = res.data;

        console.log(users);

        const tbody = document.querySelector("#user-list tbody");
        tbody.innerHTML = "";

        users.map(function (user) {
            const row = document.createElement("tr");
            row.addEventListener("click", () => {
                getComment(user._id);
            });

            // 로우 셀 추가
            let td = document.createElement("td");
            td.textContent = user._id;
            row.appendChild(td);

            td = document.createElement("td");
            td.textContent = user.name;
            row.appendChild(td);

            td = document.createElement("td");
            td.textContent = user.age;
            row.appendChild(td);

            td = document.createElement("td");
            td.textContent = user.married ? "기혼" : "미혼";
            row.appendChild(td);

            tbody.appendChild(row);
        });
    } catch (err) {
        console.error(err);
    }
}

// 댓글 로딩
async function getComment(id) {
    try {
        const res = await axios.get(`/users/${id}/comments`);
        const comments = res.data;
        
        const tbody = document.querySelector("#comment-list tbody");
        tbody.innerHTML = "";

        comments.map(function (comment) {
            // 로우 셀 추가
            const row = document.createElement("tr");
            
            let td = document.createElement("td");
            td.textContent = comment._id;
            row.appendChild(td);

            td = document.createElement("td");
            td.textContent = comment.commenter.name;
            row.appendChild(td);
            
            td = document.createElement("td");
            td.textContent = comment.comment;
            row.appendChild(td);

            const edit = document.createElement("button");
            edit.textContent = "수정";
            edit.addEventListener("click", async () => {    // 수정 클릭 시
                const newComment = prompt("바꿀 내용을 입력하세요.");
                if (!newComment) {
                    return alert("내용을 반드시 입력해야 합니다.");
                }

                try {
                    await axios.patch(`/comments/${comment._id}`, { comment: newComment });
                    getComment(id);
                } catch (err) {
                    console.error(err);
                }
            });

            const remove = document.createElement("button");
            remove.textContent = "삭제";
            remove.addEventListener("click", async () => {      // 삭제 클릭 시
                try {
                    await axios.delete(`/comments/${comment._id}`);
                    getComment(id);
                } catch (err) {
                    console.error(err);
                }
            });

            // 버튼 추가
            td = document.createElement("td");
            td.appendChild(edit);
            row.appendChild(td);

            td = document.createElement("td");
            td.appendChild(remove);
            row.appendChild(td);

            tbody.appendChild(row);
        });
    } catch (err) {
        console.error(err);
    }
}

// 사용자 등록 시
document.getElementById("user-form").addEventListener("submit", async (e) => {
    console.log("TEST");
    e.preventDefault();

    const name = e.target.username.value;
    const age = e.target.age.value;
    const married = e.target.married.checked;

    if (!name) {
        return alert("이름을 입력하세요.");
    }

    if (!age) {
        return alert("나이를 입력하세요.");
    }

    try {
        await axios.post("/users", { name, age, married });
        getUser();
    } catch (err) {
        console.error(err);
    }

    e.target.username.value = "";
    e.target.age.value = "";
    e.target.married.checked = false;
});

// 댓글 등록 시
document.getElementById("comment-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = e.target.userid.value;
    const comment = e.target.comment.value;

    if (!id) {
        return alert("아이디를 입력하세요.");
    }

    if (!comment) {
        return alert("댓글을 입력하세요.");
    }

    try {
        await axios.post("/comments", { id, comment });
        getComment(id);
    } catch (err) {
        console.error(err);
    }

    e.target.userid.value = "";
    e.target.comment.value = "";
});
```

이제 라우터를 작성한다.

**routes/index.js**
```
const express = require("express");
const User = require("../schemas/user");

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const users = await User.find({});
        res.render("mongoose", { users });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
```

`GET /`로 접속했을 때의 라우터이다. `User.find({})` 메소드로 모든 사용자를 찾은 뒤 `mongoose.html`을 렌더링할 때 사용할 수 있도록 `users` 변수로 전달한다. `find` 메소드는 `User` 스키마를 `require`한 뒤 사용할 수 있다. 몽고디비의 `db.users.find({})` 쿼리와 같다.

몽구스도 기본적으로 프로미스를 지원하므로 `async/await`과 `try/catch` 문을 사용해서 각각 조회 성공 시와 실패 시의 정보를 얻을 수 있다. 이렇게 미리 데이터베이스에서 데이터를 조회한 후 템플릿 렌더링에 사용할 수 있다.

다음은 `users.js`이다.

**routes/users.js**
```
const express = require("express");
const User = require("../schemas/user");
const Comment = require("../schemas/comment");

const router = express.Router();

router.route("/")
    .get(async (req, res, next) => {
        try {
            const users = await User.find({});
            res.json(users);
        } catch (err) {
            console.error(err);
            next(err);
        }
    })
    .post(async (req, res, next) => {
        try {
            const user = await User.create({
                name: req.body.name,
                age: req.body.age,
                married: req.body.married,
            });

            console.log(user);
            
            res.status(201).json(user);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

router.get("/:id/comments", async (req, res, next) => {
    try {
        const comments = await Comment.find({ commenter: req.params.id })
            .populate("commenter");

        console.log(comments);

        res.json(comments);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
```

`GET /users`와 `POST /users` 주소로 요청이 들어올 때의 라우터이다. 각각 사용자를 조회하는 요청과 등록하는 요청을 처리한다. `GET /`에서도 사용자 데이터를 조회했지만 `GET /users`에서는 데이터를 JSON 형식으로 반환한다는 점에서 차이가 있다.

사용자를 등록할 때는 먼저 모델의 `create` 메소드로 저장한다. 몽고디비와 메소드가 다르므로 몽구스용 메소드를 따로 외워야 한다. 정의한 스키마에 부합하지 않는 데이터를 삽입할 시 몽구스가 에러를 발생시킨다. `_id`는 자동으로 생성된다.

`GET /users/:id/comments` 라우터는 댓글 다큐먼트를 조회하는 라우터이다. `find` 메소드에는 옵션이 추가되어 있다. 댓글을 쓴 사용자의 아이디로 댓글을 조회한 뒤 `populate` 메소드로 관련 있는 컬렉션의 다큐먼트를 불러올 수 있다. `Comment` 스키마 정의에서 `commenter` 필드의 `ref`가 `User`로 되어 있으므로, 자동으로 `users` 컬렉션에서 사용자 다큐먼트를 찾아 합친다. `commenter` 필드가 사용자 다큐먼트로 치환된다. 이제 `commenter` 필드는 하나의 다큐먼트로 치환된다. 따라서 응답을 받은 사용자는 `comment.commenter.name`처럼 마치 `commenter` 필드를 다큐먼트를 취급하듯이 조회하게 된다.

**routes/comments.js**
```
const express = require("express");
const Comment = require("../schemas/comment");

const router = express.Router();

router.post("/", async (req, res, next) => {
    try {
        const comment = await Comment.create({
            commenter: req.body.id,
            comment: req.body.comment,
        });

        console.log(comment);

        const result = await Comment.populate(comment, { path: "commenter" });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.route("/:id")
    .patch(async (req, res, next) => {
        try {
            const result = await Comment.updateOne({
                _id: req.params.id,
            }, {
                comment: req.body.comment,
            });
            
            res.json(result);
        } catch (err) {
            console.error(err);
            next(err);
        }
    })
    .delete(async (req, res, next) => {
        try {
            const result = await Comment.deleteOne({ id: req.params.id });
            
            res.json(result);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

module.exports = router;
```

댓글과 관련된 CRUD 작업을 하는 라우터로, `POST /comments`, `PATCH /comments/:id`, `DELETE /comments/:id`를 등록했다.

`POST /comments`는 다큐먼트를 등록하는 라우터이다. `Comment.create` 메소드로 댓글을 저장한다. 그 후 `populate` 메소드로 프로미스의 결과로 반환된 `comment` 객체에 다른 컬렉션 다큐먼트를 불러온다. 이때 `path` 속성에 어떤 필드를 합칠지 설정할 수 있다. 이렇게 합쳐진 결과를 클라이언트에게 응답한다.

`PATCH /comments/:id` 라우터는 다큐먼트를 수정하는 라우터이다. 수정에는 `updateOne` 메소드를 사용한다. `updateOne` 메소드의 첫 번째 인수로는 어떤 다큐먼트를 수정할 것인지를 나타낸 쿼리 객체를 전달하고, 두 번째 인수로는 수정할 필드와 값이 들어 있는 객체를 전달한다. 시퀄라이즈와 인수의 순서가 반대이다. 몽고디비와는 다르게 `$set` 연산자를 사용하지 않아도 지정한 필드만 변경한다.

`DELETE /comments/:id`는 다큐먼트를 삭제하는 라우터이다. `deleteOne` 메소드를 사용해 삭제한다. `deleteOne` 메소드의 첫 번째 인수로는 삭제할 다큐먼트에 대한 조건을 전달하면 된다.

마지막으로는 이제까지 작성한 라우터들을 연결한다.

**app.js**
```
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");

const connect = require("./schemas");
const indexRouter = require("./routes");
const usersRouter = require("./routes/users");
const commentsRouter = require("./routes/comments");

const app = express();

app.set("port", process.env.PORT || 3002);
app.set("view engine", "html");
nunjucks.configure("views", {
    express: app,
    watch: true,
});

connect();

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/comments", commentsRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
})

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

이제 `npm start`로 웹 서버를 실행해 본다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter08\learn-mongoose> npm start

> learn-mongoose@0.0.1 start
> nodemon app

[nodemon] 3.0.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node app.js`
3002 번 포트에서 대기 중
```
- - -


## 8.7 함꼐 보면 좋은 자료

생략
- - -