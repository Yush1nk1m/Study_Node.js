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