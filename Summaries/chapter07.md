# Node.js 교과서 7장 요약
## *MySQL*
- - -

## 7.1 데이터베이스란?

관련성을 가지며 중복이 없는 데이터들의 집합을 칭한다. **DBMS(DataBase Management System)**으로 관리한다.

DBMS 중에는 **RDBMS(Relational DBMS)**라고 부르는 **관계형 DBMS**가 많이 사용된다. 대표적인 **RDBMS**로는 Oracle, MySQL, MSSQL 등이 있다. 이들은 SQL 문법으로 데이터를 관리한다.
- - -


## 7.2 MySQL 설치하기

설치 과정 생략

MySQL 설치 이후 MySQL Server가 설치된 디렉터리로 이동하여 다음과 같은 명령어로 접속한다.

**console**
```
PS C:\Program Files\MySQL\MySQL Server 8.0\bin> mysql -h localhost -u root -p
Enter password: ***********
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.33 MySQL Community Server - GPL

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

`-h` 옵션 뒤에는 접속할 주소를, `-u` 옵션 뒤에는 사용자 이름을 입력한다. `-p` 옵션은 비밀번호를 사용하겠다는 의미이다.

다시 콘솔로 돌아가려면 다음과 같은 명령어를 입력한다.

**console**
```
mysql> exit
Bye
PS C:\Program Files\MySQL\MySQL Server 8.0\bin>
```
- - -


## 7.3 워크벤치 설치하기

설치 과정 생략

데이터를 시각적으로 확인할 수 있어 콘솔로 관리하는 것보다 워크벤치로 관리하는 것이 편리하다.
- - -


## 7.4 데이터베이스 및 테이블 생성하기

### 7.4.1 데이터베이스 생성하기

7.2절의 명령대로 MySQL 프롬프트에 접속한 후, `CREATE SCHEMA [DB 이름]` 명령어로 데이터베이스를 생성한다. 여기서 `SCHEMA`는 데이터베이스를 의미한다.

다음과 같이 `nodejs`라는 데이터베이스를 생성한 후, `use nodejs` 명령어로 생성한 데이터베이스를 사용하겠다고 선언한다.

**console**
```
mysql> CREATE SCHEMA `nodejs` DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_general_ci;
Query OK, 1 row affected (0.02 sec)

mysql> use nodejs
Database changed
mysql>
```

`utf8mb4`으로 `CHARACTER SET`을 설정하여 한글과 이모티콘을 사용할 수 있게 되었다. `COLLATE`는 해당 `CHARACTER SET`을 어떤 식으로 정렬할 것인지를 의미한다. MySQL 8 버전의 기본 `COLLATE`는 `utf8mb4_0900_ai_ci`이지만 한글 사용 문제 방지를 위해 `utf8mb4_general_ci`를 사용하였다.

`CREATE SCHEMA` 같은 예약어는 사용자가 정의한 이름과 구분하기 위해 웬만하면 대문자로 사용한다.


### 7.4.2 테이블 생성하기

다음과 같이 **사용자 정보**를 나타내는 테이블을 하나 생성한다.

**console**
```
mysql> CREATE TABLE nodejs.users (
    -> id INT NOT NULL AUTO_INCREMENT,
    -> name VARCHAR(20) NOT NULL,
    -> age INT UNSIGNED NOT NULL,
    -> married TINYINT NOT NULL,
    -> comment TEXT NULL,
    -> created_at DATETIME NOT NULL DEFAULT now(),
    -> PRIMARY KEY(id),
    -> UNIQUE INDEX name_UNIQUE (name ASC))
    -> COMMENT = '사용자 정보'
    -> ENGINE = InnoDB;
Query OK, 0 rows affected (0.06 sec)
```

`CREATE TABLE [DB 이름].[테이블 이름]` 명령어로 테이블을 생성한다. 위 코드는 `nodejs` 데이터베이스 내에 `users`라는 테이블을 생성한 것이다. `use nodejs` 명령어를 이미 사용했으므로 `[DB 이름]`은 생략해도 된다.

생성한 **컬럼들의 의미**는 다음과 같다.

- `id`: 고유 식별자
- `name`: 이름
- `age`: 나이
- `married`: 결혼 여부
- `comment`: 자기소개
- `created_at`: 로우 생성일

이렇게 컬럼을 정의해 두면, 이후 데이터 삽입 시에도 컬럼 규칙에 맞는 정보들만 넣을 수 있다.

**컬럼의 자료형**은 다음과 같은 것들이 있다.

- `INT`: 정수
- `TINYINT`: -128 ~ 127 범위의 정수, 1 또는 0만 저장함으로써 불 값과 같은 역할을 할 수 있음
- `FLOAT`, `DOUBLE`: 실수
- `CHAR`: 고정 길이 문자열, CHAR(10)이면 10글자 문자열만 저장 가능, 부족한 길이만큼 스페이스로 채워짐
- `VARCHAR`: 가변 길이 문자열, VARCHAR(10)이면 0~10글자 문자열 저장 가능
- `TEXT`: 긴 글을 저장할 때 사용, 수백 자 이내의 문자열은 보통 `VARCHAR`로 처리하고, 그 이상은 `TEXT`로 처리
- `DATETIME`: 날짜와 시간에 대한 정보
- `DATE`: 날짜 정보
- `TIME`: 시간 정보

**컬럼의 옵션**은 다음과 같은 것들이 있다.

- `NULL`, `NOT NULL`: 빈칸 허용 여부, `NOT NULL`이면 컬럼 생성 시 데이터를 반드시 입력해야 함
- `AUTO_INCREMENT`: 숫자를 저절로 올리겠다는 의미, 데이터가 들어옴에 따라 자동적으로 1부터 2, 3, ... 순서대로 숫자를 부여
- `UNSIGNED`: 숫자 자료형에 사용되는 옵션, 음수 범위가 무시되고 그 범위만큼 양수의 범위를 확대함, `FLOAT`과 `DOUBLE`에는 적용 불가
- `ZEROFILL`: 숫자의 자릿수가 고정되어 있을 때 비어 있는 자리에 모두 0을 넣음, `INT(자릿수)`처럼 선언된 자료형에 사용 가능
- `DEFAULT now()`: 데이터베이스에 로우 저장 시 해당 컬럼에 값이 없으면 MySQL이 기본값을 대신 넣음, `now()`는 이때 현재 시각을 넣으라는 의미로 `CURRENT_TIMESTAMP`를 대신 사용할 수 있음
- `PRIMARY KEY`: 특정 컬럼(들)을 로우를 구별할 수 있는 고유한 식별자로 설정
- `UNIQUE INDEX`: 해당 값이 고유해야 하는지에 대한 옵션, 위 예시에서 인덱스의 이름은 `name_UNIQUE`이고, `name` 컬럼을 오름차순(`ASC`)으로 기억하겠다는 의미, 내림차순은 `DESC`를 사용, `PRIMARY KEY`는 자동적으로 `UNIQUE INDEX`를 포함

이어서 **테이블 자체에 대한 설정**을 알아본다.

- `COMMENT`: 테이블에 대한 보충 설명
- `ENGINE`: `MyISAM`과 `InnoDB`가 가장 많이 사용됨

이렇게 만들어진 테이블은 `DESC [테이블 이름]`으로 확인할 수 있다.

**console**
```
mysql> DESC users;
+------------+--------------+------+-----+-------------------+-------------------+
| Field      | Type         | Null | Key | Default           | Extra             |
+------------+--------------+------+-----+-------------------+-------------------+
| id         | int          | NO   | PRI | NULL              | auto_increment    |
| name       | varchar(20)  | NO   | UNI | NULL              |                   |
| age        | int unsigned | NO   |     | NULL              |                   |
| married    | tinyint      | NO   |     | NULL              |                   |
| comment    | text         | YES  |     | NULL              |                   |
| created_at | datetime     | NO   |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
+------------+--------------+------+-----+-------------------+-------------------+
6 rows in set (0.01 sec)
```

테이블을 잘못 만들었을 경우엔 다음과 같이 `DROP TABLE [테이블 이름]` 명령어로 삭제할 수 있다.

**console**
```
mysql> DROP TABLE users;
```

이번에는 **사용자의 댓글**을 저장하는 테이블을 생성해 본다.

**console**
```
mysql> CREATE TABLE nodejs.comments (
    -> id INT NOT NULL AUTO_INCREMENT,
    -> commenter INT NOT NULL,
    -> comment VARCHAR(100) NOT NULL,
    -> created_at DATETIME NOT NULL DEFAULT now(),
    -> PRIMARY KEY(id),
    -> INDEX commenter_idx (commenter ASC),
    -> CONSTRAINT commenter
    -> FOREIGN KEY (commenter)
    -> REFERENCES nodejs.users (id)
    -> ON DELETE CASCADE
    -> ON UPDATE CASCADE)
    -> COMMENT = '댓글'
    -> ENGINE = InnoDB;
Query OK, 0 rows affected (0.07 sec)
```

위 테이블의 **컬럼들의 의미**는 다음과 같다.

- `id`: 고유 식별자
- `commenter`: 댓글을 쓴 사용자 아이디
- `comment`: 댓글 내용
- `created_at`: 로우 생성일

`commenter` 컬럼에는 댓글을 작성한 사용자의 `id`를 저장할 것이다. 그런데 이것은 이미 `users` 테이블에 저장되어 있는 정보이다. 그러므로 이를 **다른 테이블의 기본 키를 저장하는 컬럼**인 `외래 키(foreign key)`로 설정한다. 위 예시에서는 `CONSTRAINT [제약 조건 이름] FOREIGN KEY [컬럼 이름] REFERENCES [참고하는 컬럼명]` 명령어를 사용하여 `comments.commenter`와 `users.id` 컬럼을 연결하였다.

`ON UPDATE`와 `ON DELETE`는 모두 `CASCADE`로 설정했는데, 이는 해당 컬럼의 원본이 수정되거나 삭제되면 그것과 연결된 정보도 같이 수정하거나 삭제한다는 의미이다. 그래야 데이터가 불일치하는 문제가 발생하지 않는다.

다음과 같은 명령어로 `users`의 테이블과 `comments`의 테이블이 제대로 생성되었는지 확인한다.

**console**
```
mysql> SHOW TABLES;
+------------------+
| Tables_in_nodejs |
+------------------+
| comments         |
| users            |
+------------------+
2 rows in set (0.01 sec)
```
- - -


## 7.5 CRUD 작업하기

`CRUD`는 데이터베이스에서 많이 수행하는 네 가지 작업인 `CREATE`, `READ`, `UPDATE`, `DELETE`의 약어이다. 이 절에서는 SQL 문법 위주로 `CRUD`를 수행한다.


### 7.5.1 Create(생성)

`Create(생성)`는 데이터를 생성해서 데이터베이스에 삽입하는 작업이다. 다음과 같은 예시를 살펴본다. `user nodejs` 명령어를 사용했다면 테이블 이름으로 `nodejs.users` 대신 `users`만 사용해도 된다.

**console**
```
mysql> INSERT INTO nodejs.users (name, age, married, comment) VALUES ("Yushin", 22, 0, "안녕");
Query OK, 1 row affected (0.01 sec)

mysql> INSERT INTO nodejs.users (name, age, married, comment) VALUES ("Yeonwoo", 21, 0, "하세요");
Query OK, 1 row affected (0.01 sec)
```

`INSERT INTO [테이블 이름] ([컬럼 1], [컬럼 2], ...) VALUES ([값 1], [값 2], ...)` 명령어로 DB에 데이터를 삽입할 수 있다. 위 예시에서 `id` 컬럼은 `AUTO_INCREMENT`에 의해, `created_at` 컬럼은 `DEFAULT` 값에 의해 그 값이 자동으로 결정된다.

다음과 같이 `comments` 테이블에도 데이터를 삽입해 본다.

**console**
```
mysql> INSERT INTO nodejs.comments (commenter, comment) VALUES (1, "안녕하세요, Yushin의 댓글입니다.");
Query OK, 1 row affected (0.02 sec)
```


### 7.5.2 Read(조회)

`Read(조회)`는 데이터베이스에 있는 데이터를 조회하는 작업이다.

**console**
```
mysql> SELECT * FROM nodejs.users;
+----+---------+-----+---------+---------+---------------------+
| id | name    | age | married | comment | created_at          |
+----+---------+-----+---------+---------+---------------------+
|  1 | Yushin  |  22 |       0 | 안녕    | 2023-10-27 14:27:44 |
|  2 | Yeonwoo |  21 |       0 | 하세요  | 2023-10-27 14:28:06 |
+----+---------+-----+---------+---------+---------------------+
2 rows in set (0.00 sec)

...

mysql> SELECT * FROM nodejs.comments;
+----+-----------+----------------------------------+---------------------+
| id | commenter | comment                          | created_at          |
+----+-----------+----------------------------------+---------------------+
|  1 |         1 | 안녕하세요, Yushin의 댓글입니다. | 2023-10-27 14:32:16 |
+----+-----------+----------------------------------+---------------------+
1 row in set (0.00 sec)
```

`SELECT * FROM [테이블 이름]`은 테이블의 모든 데이터를 조회하는 SQL 문이다.

다음과 같이 특정 컬럼만 조회할 수도 있다.

**console**
```
mysql> SELECT name, married FROM nodejs.users;
+---------+---------+
| name    | married |
+---------+---------+
| Yushin  |       0 |
| Yeonwoo |       0 |
+---------+---------+
2 rows in set (0.00 sec)
```

`SELECT [컬럼 1], [컬럼 2], ... FROM [테이블 이름]` 명령어로 특정 컬럼을 조회한다.

이때 `WHERE` 절을 사용하면 특정 조건을 가진 데이터만 조회할 수도 있다. 다음은 결혼을 하지 않았고 나이가 20세 이상인 사용자를 조회하는 SQL 문이다. `AND`로 여러 조건을 묶어줄 수 있다.

**console**
```
mysql> SELECT name, age FROM nodejs.users WHERE married = 0 AND age > 20; 
+---------+-----+
| name    | age |
+---------+-----+
| Yushin  |  22 |
| Yeonwoo |  21 |
+---------+-----+
2 rows in set (0.00 sec)
```

`AND`가 조건을 모두 만족하는 데이터를 찾는다면, `OR`은 조건들 중 어느 하나라도 만족하는 데이터를 모두 찾는다.

**console**
```
mysql> SELECT name, age FROM nodejs.users WHERE married = 1 OR age > 20;
+---------+-----+
| name    | age |
+---------+-----+
| Yushin  |  22 |
| Yeonwoo |  21 |
+---------+-----+
2 rows in set (0.00 sec)
```

`ORDER BY [컬럼 이름] [ASC | DESC]` 키워드를 사용하여 출력 데이터를 정렬할 수도 있다.

**console**
```
mysql> SELECT id, name FROM nodejs.users ORDER BY age ASC;
+----+---------+
| id | name    |
+----+---------+
|  2 | Yeonwoo |
|  1 | Yushin  |
+----+---------+
2 rows in set (0.00 sec)
```

`LIMIT [숫자]` 키워드로 조회할 로우 개수를 설정할 수 있다.

**console**
```
mysql> SELECT name, id FROM nodejs.users ORDER BY age ASC LIMIT 1;
+---------+----+
| name    | id |
+---------+----+
| Yeonwoo |  2 |
+---------+----+
1 row in set (0.00 sec)
```

`OFFSET [건너뛸 횟수]` 키워드를 `LIMIT [숫자]` 키워드와 함께 사용하면서 조회할 때 먼저 건너뛸 요소의 개수를 설정할 수도 있다. 이러한 기능은 한 페이지에 글이 20개인 게시판에서 특정 번째 페이지의 글들을 불러오려 할 때 유용하게 사용할 수 있다.

**console**
```
mysql> SELECT id, name FROM nodejs.users ORDER BY age DESC LIMIT 1 OFFSET 1;
+----+---------+
| id | name    |
+----+---------+
|  2 | Yeonwoo |
+----+---------+
1 row in set (0.00 sec)
```


### 7.5.3 Update(수정)

`Update(수정)`는 데이터베이스에 있는 데이터를 수정하는 작업이다.

기본적인 수정 명령어는 `UPDATE [테이블 이름] SET [컬럼 이름 = 바꿀 값] WHERE [조건]`이다. 예제는 다음과 같다.

**console**
```
mysql> UPDATE nodejs.users SET comment = "바꿀 내용" WHERE id = 2;  
Query OK, 1 row affected (0.01 sec)
Rows matched: 1  Changed: 1  Warnings: 0
```

조건에 `AND`와 `OR`을 사용하여 복잡한 조건문도 만들 수 있다.


### 7.5.4 Delete(삭제)

`Delete(삭제)`는 데이터베이스에 있는 데이터를 삭제하는 작업이다.

기본적인 삭제 명령어는 `DELETE FROM [테이블 이름] WHERE [조건]`이다. 예제는 다음과 같다.

**console**
```
mysql> DELETE FROM nodejs.users WHERE id = 3;
Query OK, 1 row affected (0.01 sec)
```

삭제 명령어 역시 `AND`, `OR`을 조합해 조건문을 더 복잡하게 만들 수 있다.
- - -


## 7.6 시퀄라이즈 사용하기

`시퀄라이즈(Sequelize)`는 노드에서 MySQL 작업을 쉽게 할 수 있도록 도와주는 라이브러리이다. 시퀄라이즈는 `ORM(Object-Relational Mapping)`으로 분류된다. 이는 자바스크립트 객체와 데이터베이스의 릴레이션을 매핑해주는 도구이다.

MySQL뿐만 아니라 MariaDB, PostgreSQL, SQLite, MSSQL 등 다른 데이터베이스도 함께 사용할 수 있다. 문법이 어느 정도 호환되므로 프로젝트를 다른 SQL 데이터베이스로 전환할 때도 편리하다.

시퀄라이즈는 자바스크립트 문법을 자동적으로 SQL 구문으로 바꿔준다. 따라서 SQL 문법을 잘 몰라도 자바스크립트를 이용해 SQL 데이터베이스를 조작할 수 있어 편리하다.

시퀄라이즈 실습을 위해 `learn-sequelize` 디렉터리를 생성하고 `package.json`을 생성한다.

**package.json**
```
{
  "name": "learn-sequelize",
  "version": "0.0.1",
  "description": "시퀄라이즈를 배우자",
  "main": "app.js",
  "scripts": {
    "start": "nodemon app"
  },
  "author": "Yushin Kim",
  "license": "MIT"
}
```

그리고 시퀄라이즈에 필요한 `sequelize`, `sequelize-cli`, `mysql2`를 설치한다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter07\learn-sequelize> npm i express nodemon morgan nunjucks sequelize sequelize-cli mysql2

added 166 packages, and audited 167 packages in 2m

19 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

추가적으로 설치한 패키지의 용도는 다음과 같다.

- `sequelize-cli`: 시퀄라이즈 명령어를 실행하기 위한 패키지
- `mysql2`: MySQL과 시퀄라이즈를 이어주는 드라이버로, 데이터베이스 프로그램이 아니므로 이에 주의할 것

설치 완료 후 `sequelize init` 명령어를 호출하면 된다. 전역 설치 없이 명령어로 사용하려면 앞에 `npx`를 붙이면 된다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter07\learn-sequelize> npx sequelize init

Sequelize CLI [Node: 18.17.1, CLI: 6.6.1, ORM: 6.33.0]

Created "config\config.json"
Successfully created models folder at "D:\공부\Javascript\Study_Node.js\Codes\chapter07\learn-sequelize\models".
Successfully created migrations folder at "D:\공부\Javascript\Study_Node.js\Codes\chapter07\learn-sequelize\migrations".
Successfully created seeders folder at "D:\공부\Javascript\Study_Node.js\Codes\chapter07\learn-sequelize\seeders".
```

이제 `config`, `models`, `migrations`, `seeders` 디렉터리가 생성되었을 것이다. `models/index.js`가 생성되었는지 확인하고, `sequelize-cli`가 자동 생성해주는 코드는 그대로 사용할 시 에러가 발생하고 필요 없는 부분이 많으므로 다음과 같이 수정한다.

**models/index.js**
```
const Sequelize = require("sequelize");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

module.exports = db;
```

`Sequelize`는 시퀄라이즈 패키지이자 생성자이다. `config/config.json`에서 데이터베이스 설정을 불러온 후 `new Sequelize`를 통해 MySQL 연결 객체를 생성한다. 이후 연결 객체를 재사용하기 위해 `db.sequelize`에 넣어두었다.


### 7.6.1 MySQL 연결하기

이제 시퀄라이즈를 통해 익스프레스 앱과 MySQL을 연결한다. 다음과 같이 `app.js`를 생성하고 익스프레스와 시퀄라이즈를 연결하는 코드를 작성한다.

**app.js**
```
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");

const { sequelize } = require("./models");

const app = express();
app.set("port", process.env.PORT || 3001);
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

디렉터리 안의 `index.js`는 그 이름을 생략할 수 있으므로 코드에서 `require("./models")`는 `require("./models/index.js")`와 같다.

이 코드로 `db.sequelize`를 불러와서 `sync` 메소드를 사용해 서버 실행 시 MySQL과 연동되도록 하였다. 그 내부의 `force: false` 옵션을 `true`로 설정하면 서버 실행 시마다 테이블을 재생성한다. 테이블을 잘못 만든 경우 `true`로 설정하면 된다.

`MySQL`과 연동할 때는 `config/config.json`의 정보가 사용되므로 다음과 같이 수정한다. 자동으로 생성된 파일에 `operatorAliases` 속성이 있다면 삭제한다.

**config/config.json**
```
{
  "development": {
    "username": "root",
    "password": "[root 비밀번호]",
    "database": "nodejs",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  ...
}
```

`development.password`와 `development.database`를 현재 MySQL 커넥션과 일치하게 수정하면 된다. `test`와 `production`은 각각 테스트와 배포 용도로 접속하기 위해 사용되는 것이므로 여기서는 설정하지 않는다.

`password` 속성에는 내 데이터베이스의 비밀번호를, `database` 속성에는 내 데이터베이스의 이름을 입력하였다.

이 설정은 `process.env.NODE_ENV`가 `development`일 때 사용된다. 이는 기본값이므로 만약 테스트할 일이 생기면 `process.env.NODE_ENV`를 `test`로 수정하고, 배포할 일이 생기면 `production`으로 수정한다. 이때 각각 `config/config.json`의 `test`, `production` 속성을 수정하는 것에도 주의한다.

`npm start`로 서버를 실행하면 3001번 포트에서 서버가 돌아간다. 라우터를 만들지 않았기 때문에 실제 접속은 불가하지만 데이터베이스 연결 여부는 확인할 수 있다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter07\learn-sequelize> npm start

> learn-sequelize@0.0.1 start
> nodemon app

[nodemon] 3.0.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node app.js`
3001 번 포트에서 대기 중
Executing (default): SELECT 1+1 AS result
데이터베이스 연결 성공
```

마지막 두 로그가 출력되면 연결에 성공한 것이다. 만약 연결에 실패하면 에러가 로깅된다. 에러는 주로 MySQL 데이터베이스를 실행하지 않은 경우(`Error: connect ECONNREFUSED 127.0.0.1:3306`), 비밀번호가 틀린 경우(`Error: Access denied for user 'root'@'localhost' (using password: YES)`), 존재하지 않는 데이터베이스를 적은 경우(`Error: Unknown database`) 발생한다.


### 7.6.2 모델 정의하기

MySQL에서 정의한 테이블은 시퀄라이즈에서도 정의해야 한다. MySQL의 테이블은 시퀄라이즈의 모델과 대응된다. 즉, 시퀄라이즈는 모델과 테이블을 연결해주는 역할을 담당하는 것이다. 다음의 예제들을 통해 모델을 만들어 정의한 테이블에 연결한다.

시퀄라이즈는 기본적으로 모델 이름은 단수형, 테이블 이름은 복수형으로 사용한다. 먼저 `User` 모델 예제이다.

**models/user.js**
```
const Sequelize = require("sequelize");

class User extends Sequelize.Model {
    static initiate(sequelize) {
        User.init({
            name: {
                type: Sequelize.STRING(20),
                allowNull: false,
                unique: true,
            },
            
            age: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },

            married: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },

            comment: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: "User",
            tableName: "users",
            paranoid: false,
            charset: "utf8",
            collate: "utf8_general_ci",
        });
    }

    static associate(db) {}
};

module.exports = User;
```

`User` 모델을 만들고 모듈로 exports했다. `User` 모델은 `extends Sequelize.Model`처럼 `Sequelize.Model`을 확장한 클래스로 선언한다. 클래스 문법을 사용하는데, 클래스 문법을 숙지할 필요는 없고 모델이 크게 `static initiate` 메소드와 `static associate` 메소드로 나누어진다는 패턴만 기억하면 된다.

`static initiate` 메소드에는 테이블에 대한 설정을 하고, `static associate` 메소드에는 다른 모델과의 관계를 명시한다. 위 예제에서는 `static initiate` 메소드만 정의하였는데, 첫 번째 인수는 테이블 컬럼에 대한 설정이고 두 번째 인수는 테이블 자체에 대한 설정이다.

위 예제에서는 `id` 컬럼에 대한 설정을 하지 않았는데, 이는 시퀄라이즈가 `id`를 알아서 기본 키로 연결해주기 때문이다. 나머지 컬럼의 스펙은 MySQL 테이블의 내용과 일치해야 정확하게 대응된다.

단, 시퀄라이즈는 다른 SQL 데이터베이스들과도 호환이 돼야 하기에 MySQL의 자료형과 조금 다른 자료형을 갖는다. 

**MySQL과 시퀄라이즈의 자료형 비교**
| MySQL | Sequelize |
| :--: | :--: |
| VARCHAR(100) | STRING(100) |
| INT | INTEGER |
| TINYINT | BOOLEAN |
| DATETIME | DATE |
| INT UNSIGNED | INTEGER.UNSIGNED |
| NOT NULL | allowNull: false |
| UNIQUE | unique: true |
| DEFAULT: now() | defaultValue: Sequelize.NOW |

`static initiate`의 두 번째 인수인 **테이블 옵션**들은 다음과 같은 의미를 갖는다.

- `sequelize`: `static initiate` 메소드의 매개변수와 연결되는 옵션으로 `db.sequelize` 객체를 전달해야 한다. 나중에 `model/index.js`에서 연결한다.
- `timestamps`: 현재 값은 `false`로 설정되어 있다. `true`이면 시퀄라이즈는 `createdAt`과 `updatedAt` 컬럼을 추가한다. 각각 로우가 생성되었을 때와 수정되었을 때의 시간이 자동으로 입력된다. 하지만 예제에서는 테이블에 `created_at` 컬럼을 직접 생성하였으므로 `timestamps` 컬럼이 필요하지 않다.
- `underscored`: 시퀄라이즈는 기본적으로 테이블 이름과 컬럼 이름을 캐멀 케이스(camel case)로 만든다. 이를 스네이크 케이스(snake case)로 바꿔주는 옵션이다.
- `modelName`: 모델 이름을 설정한다. 노드 프로젝트에서 사용한다.
- `tableName`: 실제 데이터베이스의 테이블 이름이 된다. 기본적으로는 모델 이름의 소문자 및 복수형 형태이다. 예제에서처럼 모델 이름이 User이면 테이블 이름은 users가 된다.
- `paranoid`: `true`로 설정하면 `deletedAt`이라는 컬럼이 생기면서 삭제 연산 시 실제로 로우를 삭제하지 않고 삭제 시간이 해당 컬럼에 기록된다. 실제 데이터베이스에 로우 조회 명령을 내리면 이 값이 `null`인 로우들만 필터링된다. 로우를 복원하고 싶다면 미리 설정한다.
- `charset`, `collate`: 각각 `utf8`과 `utf8_general_ci`로 설정해야 한글이 입력된다. 이모티콘까지 입력할 수 있게 하고 싶으면 `utf8mb4`와 `utf8mb4_general_ci`를 입력한다.

다음으로는 `Comment` 모델을 만드는 예제이다.

**models/comment.js**
```
const Sequelize = require("sequelize");

class Comment extends Sequelize.Model {
    static initiate(sequelize) {
        Comment.init({
            comment: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.NOW,
            },
        }, {
            sequelize,
            timestamps: false,
            modelName: "Comment",
            tableName: "comments",
            paranoid: false,
            charset: "utf8mb4",
            collate: "utf8mb4_general_ci",
        });
    }

    static associate(db) {
        db.Comment.belongsTo(db.User, { foreignKey: "commenter", targetKey: "id" });
    }
};

module.exports = Comment;
```

위 코드의 `Comment` 모델에는 `users` 테이블과 연결된 `commenter` 컬럼이 없다. 이 부분은 모델을 정의할 때 넣어도 되지만, 시퀄라이즈 자체에서 관계를 따로 정의할 수 있다. 이에 대해서는 이어지는 절들에서 알아본다.

모델 생성 이후엔 `models/index.js`와 연결한다.

**models/index.js**
```
const Sequelize = require("sequelize");
const User = require("./user");
const Comment = require("./comment");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

db.User = User;
db.Comment = Comment;

User.initiate(sequelize);
Comment.initiate(sequelize);

User.associate(db);
Comment.associate(db);

module.exports = db;
```

`db`라는 객체에 `User`와 `Comment` 모델을 담아 두었다. 앞으로 `db` 객체를 `require`하면 `User`, `Comment` 모델에 접근할 수 있다. 모델의 `initiate` 메소드가 호출되어야 테이블이 모델로 연결될 수 있다. 따라서 코드에서 `User.initiate`, `Comment.initiate` 메소드를 호출하였다. 다른 테이블과의 관계를 연결하는 `associate` 메소드도 미리 호출해 둔다.


### 7.6.3 관계 정의하기

이번 절에서는 `users` 테이블과 `comments` 테이블 간의 관계를 정의해 본다.

**하나**의 사용자는 **여러** 댓글을 작성할 수 있다. 하지만 **하나**의 댓글에 사용자(작성자)가 **여러** 명일 수는 없다. 이러한 관계를 `일대다(1:N)` 관계라고 한다. 예제의 `1:N` 관계에서는 사용자가 `1`이고, 댓글이 `N`이다.

다른 관계로는 `일대일(1:1)`, `다대다(N:M)` 관계가 있다. `1:1` 관계의 예로는 **사용자 - 사용자에 대한 정보**가 있고, `N:M` 관계의 예로는 **게시글 - 해시태그**가 있다.

MySQL에서는 `JOIN`이라는 기능으로 여러 테이블 간의 관계를 파악해 결과를 도출한다. 시퀄라이즈는 이러한 `JOIN` 기능을 알아서 구현한다. 그러나 테이블 간에 어떠한 관계가 있는지는 미리 알려주어야 한다.


#### 7.6.3.1 1:N

시퀄라이즈에는 `hasMany`라는 메소드로 1:N 관계를 표현한다. `users` 테이블의 로우 **하나**를 불러올 때, 연결된 `comments`의 로우 **여러** 개를 같이 불러올 수 있다.

반대로 `belongsTo` 메소드도 있다. 이는 `comments`의 로우 하나를 불러올 때 연결된 `users` 테이블의 로우 하나를 불러온다.

이를 모델 각각의 `static associate` 메소드에 표시하면 된다.

**models/user.js**
```
...
static associate(db) {
    db.User.hasMany(db.Comment, { foreignKey: "commenter", sourceKey: "id" });
}
```

**models/comment.js**
```
static associate(db) {
    db.Comment.belongsTo(db.User, { foreignKey: "commenter", targetKey: "id" });
}
```

`associate` 메소드에서 `db`라는 매개변수를 사용하는 것은 순환 참조를 방지하기 위함이다. 만약 `Comment`와 `User` 객체를 불러오기 위해 각각의 코드에 `require` 문을 넣는다면 서로가 서로를 불러오는 순환 참조 현상이 일어난다. 이는 자바스크립트에서는 지양해야 하는 방식이다.

`belongsTo`는 다른 모델의 정보가 들어가는 테이블의 `associate` 메소드에 사용하면 된다. 예제에서는 `Comment` 모델의 `commenter` 컬럼이 다른 모델(`User`)의 정보를 사용하고 있었으므로 해당 모델에 사용되었다.

시퀄라이즈는 위에서 정의한 대로 모델 간의 관계를 파악해 `Comment` 모델에 `commenter` 컬럼을 외래 키로 추가한다. 그러면 이 외래 키 컬럼은 `User` 모델의 `id` 컬럼을 가리키고 있게 된다.

`hasMany` 메소드에서는 `sourceKey` 속성에, `belongsTo` 메소드에서는 `targetKey` 속성에 각각 외래 키가 가리키는 키(`User.id`)를 명시하게 된다.

`foreignKey` 속성을 따로 지정하지 않으면 이름이 `[모델 이름 + 기본 키]`인 컬럼이 해당 모델에 생성된다. 예제에서 `foreignKey` 속성을 제거하면 `UserId`라는 이름을 가진 컬럼이 `Comment` 모델에 추가될 것이다.

이제 `npm start` 명령어로 서버를 실행하면 다음과 같이 시퀄라이즈가 스스로 SQL 문을 실행한다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter07\learn-sequelize> npm start

> learn-sequelize@0.0.1 start
> nodemon app

[nodemon] 3.0.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node app.js`
3001 번 포트에서 대기 중
Executing (default): SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'users' AND TABLE_SCHEMA = 'nodejs'
Executing (default): SHOW INDEX FROM `users` FROM `nodejs`
Executing (default): SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'comments' AND TABLE_SCHEMA = 'nodejs'       
Executing (default): SHOW INDEX FROM `comments` FROM `nodejs`
데이터베이스 연결 성공
```

`IF NOT EXISTS` 옵션 덕분에 미리 데이터베이스에 테이블을 만들어 두어도 충돌되지 않는다.


#### 7.6.3.2 1:1

1:1 관계에서는 `hasMany` 메소드 대신 `hasOne` 메소드를 사용한다. 사용자의 정보를 담고 있는 가상의 `Info`라는 모델이 있다고 가정하면 다음과 같이 표현할 수 있다.

```
db.User.hasOne(db.Info, { foreignKey: "UserId", sourceKey: "id" });
db.Info.belongsTo(db.User, { foreignKey: "UserId", targetKey: "id" });
```

1:1 관계에서도 `belongsTo`는 동일한 규칙으로 외래 키를 갖는 모델이 사용하는 것에 주의한다.


#### 7.6.3.3 N:M

시퀄라이즈에는 N:M 관계를 표현하기 위한 `belongsToMany` 메소드가 있다. 게시글 정보를 담고 있는 가상의 `Post` 모델과 해시태그 정보를 담고 있는 가상의 `Hashing` 모델이 있다고 가정하면 다음과 같이 표현할 수 있다.

```
db.Post.belongsToMany(db.Hashing, { through: "PostHashtag" });
db.Hashing.belongsToMany(db.Post, { through: "PostHashtag" });
```

주의해야 할 점은 이전 관계들과 달리 N:M 관계에서는 양쪽 모델 모두 `belongsToMany` 메소드를 사용해야 한다는 것, 속성이 `through` 하나뿐이고 해당 속성에 명시한 것은 새로운 모델의 이름이 된다는 것이다.

N:M 관계의 특성상 새로운 모델이 생성되어 두 모델 간의 관계를 나타내게 된다. `PostHashtag` 모델에는 게시글과 해시태그의 아이디가 각각 저장된다.

이렇게 자동으로 만들어진 모델들은 다음과 같이 접근할 수 있다.

```
db.sequelize.models.PostHashtag
```


### 7.6.4 쿼리 알아보기

시퀄라이즈로 CRUD 작업을 하기 위해선 시퀄라이즈 쿼리를 알아야 한다. SQL 문을 자바스크립트로 생성하는 것이기 때문에 시퀄라이즈만의 방식이 있다. 쿼리는 프로미스를 반환하므로 `then`을 붙여 결과를 받을 수 있다. 또한 `async/await` 문법과 같이 사용할 수도 있다.

**로우 생성**
- **SQL**
```
INSERT INTO nodejs.users (name, age, married, comment) VALUES ("Yushin", 22, 0, "안녕하세요.");
```
- **Sequelize**
```
const { User } = require("../models");

User.create({
    name: "Yushin",
    age: 22,
    married: false,
    comment: "안녕하세요.",
});
```

위와 같이 `models` 모듈에서 `User` 모델을 불러와 `create` 메소드를 사용하면 된다.

주의할 점은 모델에 데이터를 삽입할 때 MySQL의 자료형이 아닌 시퀄라이즈 자료형에 맞춰 값을 전달해야 한다는 것이다. 때문에 `married` 속성의 값은 `0`이 아닌 `false`로 전달된다. 이렇게 전달하면 시퀄라이즈가 알아서 이를 MySQL 자료형으로 변환한다.

**모든 로우 조회**
- **SQL**
```
SELECT * FROM nodejs.users;
```
- **Sequelize**
```
const { User } = require("../models");

User.findAll({});
```

**로우 하나만 조회**
- **SQL**
```
SELECT * FROM nodejs.users LIMIT 1;
```
- **Sequelize**
```
const { User } = require("../models");

User.findOne({});
```

**로우 조회 시 원하는 컬럼만 추출**
- **SQL**
```
SELECT name, married FROM nodejs.users;
```
- **Sequelize**
```
const { User } = require("../models");

User.findAll({
    attributes: ["name", "married"],
});
```

**Where 옵션을 사용한 조회**
- **SQL**
```
SELECT name, age FROM nodejs.users WHERE married = 1 AND age > 30;
```
- **Sequelize**
```
const { User } = require("../models");

User.findAll({
    attributes: ["name", "age"],
    where: {
        married: true,
        age: { [Op.gt]: 30 },
    },
});
```

MySQL에서는 `undefined`라는 자료형을 지원하지 않으므로 빈 값을 넣고자 한다면 `where` 옵션에는 `undefined` 대신 `null`을 넣어야 한다.

시퀄라이즈는 자바스크립트 객체를 사용해 쿼리를 생성해야 하므로 `Op.gt` 같은 특수한 연산자들이 사용된다. `Sequelize` 객체 내부의 `Op` 객체를 불러와 사용한다.

자주 쓰이는 연산자들은 다음과 같다.

| 연산자 | 의미 |
| :--: | :--: |
| Op.gt | 초과 |
| Op.gte | 이상 |
| Op.lt | 미만 |
| Op.lte | 이하 |
| Op.ne | 같지 않음 |
| Op.or | 또는 |
| Op.in | 배열 요소 중 하나 |
| Op.notIn | 배열 요소와 모두 다름 |

**OR로 조건을 나열한 조회**
- **SQL**
```
SELECT id, name FROM users WHERE married = 0 OR age > 30;
```
- **Sequelize**
```
const { Op } = require("sequelize");
const { User } = require("../models");

User.findAll({
    attributes: ["id", "name"],
    where: {
        [Op.or]: [{ married: false }, { age: { [Op.gt]: 30 } }],
    },
});
```

`Op.or` 속성에 `OR` 연산을 적용할 쿼리들을 배열로 나열하면 된다.

**정렬을 사용한 조회**
- **SQL**
```
SELECT id, name FROM users ORDER BY age DESC;
```
- **Sequelize**
```
const { User } = require("../models");

User.findAll({
    attributes: ["id", "name"],
    order: [["age", "DESC"]],
});
```

`order` 속성으로 정렬할 수 있다. 이때 배열 안에 배열이 있는 것에 주의한다. 정렬은 컬럼 여러 개를 기준으로 할 수도 있기 때문에 배열 안에 다른 정렬 조건을 나열할 수도 있다.

**로우 개수를 설정하여 조회**
- **SQL**
```
SELECT id, name FROM users ORDER BY age DESC LIMIT 1;
```
- **Sequelize**
```
const { User } = require("../models");

User.findAll({
    attributes: ["id, "name"],
    order: [["age", "DESC"]],
    limit: 1,
});
```

`limit` 속성으로 조회할 로우 개수를 제한할 수 있다. `LIMIT 1`인 경우엔 `findOne` 메소드를 대신 사용할 수도 있지만 `findAll` 메소드를 사용해서도 같은 결과를 구현할 수 있음에 유의한다.

**OFFSET 옵션을 사용한 조회**
- **SQL**
```
SELECT id, name FROM users ORDER BY age DESC LIMIT 1 OFFSET 1;
```
- **Sequelize**
```
const { User } = require("../models");

User.findAll({
    attributes: ["id", "name"],
    order: [["age", "DESC"]],
    limit: 1,
    offset: 1,
});
```

`offset` 속성으로 `limit`과 비슷하게 구현할 수 있다.

**로우 수정**
- **SQL**
```
UPDATE nodejs.users SET comment = "바꿀 내용" WHERE id = 2;
```
- **Sequelize**
```
const { User } = require("../models");

User.update({
    comment: "바꿀 내용",
}, {
    where: { id: 2 },
});
```

`update` 메소드로 수정 연산을 할 수 있다. 첫 번째 인수로는 수정할 내용을, 두 번째 인수로는 `where` 속성을 사용하여 수정할 로우의 조건을 전달한다.

**로우 삭제**
- **SQL**
```
DELETE FROM nodejs.users WHERE id = 2;
```
- **Sequelize**
```
const { User } = require("../models");

User.destroy({
    where: { id: 2 },
});
```

`destroy` 메소드로 삭제 연산을 할 수 있다. `where` 속성을 사용해 삭제할 로우의 조건을 전달한다.


#### 7.6.4.1 관계 쿼리

`findOne`이나 `findAll` 메소드를 호출할 때 프로미스의 결과로 모델을 반환한다. 이때, `findAll`은 조건에 해당하는 모든 결과를 찾으므로 모델의 배열을 반환한다.

```
const user = await User.findOne({});

console.log(user.nick);     // 사용자 닉네임
```

위와 같이 `User` 모델의 정보에도 바로 접근할 수 있다.

이 외에도 관계 쿼리라는 것이 있는데, MySQL의 JOIN 기능과 같은 것이다. 현재 `User` 모델은 `Comment` 모델과 `hasMany-belongsTo` 관계가 맺어져 있다. 그러므로 특정 사용자의 정보를 가져오면서 그 사용자의 댓글까지 모두 가져오고 싶다면 `include` 속성을 사용하면 된다.

```
const user = await User.findOne({
    include: [{
        model: Comment,
    }]
});

console.log(user.Comments);     // 사용자 댓글
```

어떤 모델과 관계가 있는지를 `include` 속성에 배열로 전달하면 된다. 다양한 모델들과 관계가 있을 수 있기 때문에 배열의 형태이다. 댓글은 여러 개일 수 있으므로(`hasMany`) `user.Comments`로 접근 가능하다. 또는 다음과 같이 댓글에 접근할 수도 있다.

```
const user = await User.findOne({});
const comments = await user.getComments();

console.log(comments);      // 사용자 댓글
```

관계를 설정했다면 `getComments(조회)`, `setComments(수정)`, `addComment(하나 생성)`, `addComments(여러 개 생성)`, `removeComments(삭제)` 메소드가 지원된다. 동사 뒤에 모델의 이름이 붙는 형식이다.

이렇게 자동으로 부여되는 모델의 이름을 바꾸고 싶다면 관계를 설정할 때 다음과 같이 `as` 옵션을 사용할 수 있다.

```
// 관계 설정할 때 as 옵션에 등록
db.User.hasMany(db.Comment, { foreignKey: "commenter", sourceKey: "id", as: "Answers" });

// 쿼리
const user = await User.findOne({});
const comments = await user.getAnswers();

console.log(comments);      // 사용자 댓글
```

`as` 옵션을 설정하면 `include` 시 추가되는 댓글 객체도 `user.Answers`로 바뀐다.

`include`나 관계 쿼리 메소드에도 다음과 같이 `where`이나 `attributes` 같은 옵션을 사용할 수 있다.

```
const user = await User.findOne({
    include: [{
        model: Comment,
        where: {
            id: 1,
        },
        attributes: ["id"],
    }]
});
// 또는
const comments = await user.getComments({
    where: {
        id: 1,
    },
    attributes: ["id"],
});
```

위 예제에서는 댓글을 가져올 때 `id`가 1인 댓글만 가져오고, 컬럼도 `id`만 가져오도록 설정하였다. 관계 쿼리 시 조회는 위와 같이 할 수 있다.

그러나 수정, 생성, 삭제 때는 조금 다르게 해야 한다.

```
const user = await User.findOne({});
const comment = await Comment.create();

await user.addComment(comment);
// 또는
await user.addComment(comment.id);
```

여러 개를 추가할 때는 배열로 추가할 수 있다.

```
const user = await User.findOne({});
const comment1 = await Comment.create();
const comment2 = await Comment.create();

await user.addComment([comment1, comment2]);
```

관계 쿼리 메소드의 인수로 추가할 댓글 모델을 넣거나 댓글의 아이디를 넣으면 된다. 수정이나 삭제도 같은 방법으로 할 수 있다.


#### 7.6.4.2 SQL 쿼리하기

만약 시퀄라이즈의 쿼리를 사용하기 싫거나 어떻게 해야 할지 모르겠다면 SQL 쿼리를 다음과 같이 직접 전달하는 방법도 있다.

```
const [result, metadata] = await sequelize.query("SELECT * FROM comments");

console.log(result);
```

위와 같이 `sequelize.query` 메소드를 사용하면 된다.


### 7.6.5 쿼리 수행하기

이 장에서는 쿼리로 CRUD 작업을 수행하는 예제를 살펴본다. 모델에서 데이터를 받아 페이지를 렌더링하는 방법, JSON 형식으로 데이터를 가져오는 방법 두 가지에 대한 예제를 진행한다.

먼저, 간단하게 사용자 정보를 등록하고 사용자가 등록한 댓글을 가져오는 서버이다. 프로젝트 디렉터리에 `views` 디렉터리를 생성하고 그 안에 `sequelize.html` 파일과 `error.html` 파일을 생성한다. 4.2절의 `restFront.html`처럼 AJAX를 사용해 서버와 통신한다.

**views/sequelize.html**
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>시퀄라이즈 서버</title>
    <style>
        table { border: 1px solid black; border-collapse: collapse; }
        table th, table td { border: 1px solid black; }
    </style>
</head>
<body>
    <div>
        <form id="user-form">
            <filedset>
                <legend>사용자 등록</legend>
                <div><input id="username" type="text" placeholder="이름"></div>
                <div><input id="age" type="number" placeholder="나이"></div>
                <div><input id="married" type="checkbox"><label for="married">결혼 여부</label></div>
                <button type="submit">등록</button>
            </filedset>
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
            <fieldset>
                <legend>댓글 등록</legend>
                <div><input id="userid" type="text" placeholder="사용자 아이디"></div>
                <div><input id="comment" type="text" placeholder="댓글"></div>
                <button type="submit">등록</button>
            </fieldset>
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
    <script src="/sequelize.js"></script>
</body>
</html>
```

**views/error.html**
```
<h1>{{message}}</h1>
<h2>{{error.status}}</h2>
<pre>{{error.stack}}</pre>
```

`public` 디렉터리 안에 다음과 같이 `sequelize.js` 파일도 생성한다.

**public/sequelize.js**
```
// 사용자 이름을 눌렀을 때 댓글 로딩
document.querySelectorAll("#user-list tr").forEach((el) => {
    el.addEventListener("click", function() {
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
                getComment(user.id);
            });

            // 로우 셀 추가
            let td = document.createElement("td");
            td.textContent = user.id;
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
            td.textContent = comment.id;
            row.appendChild(td);

            td = document.createElement("td");
            td.textContent = comment.User.name;
            row.appendChild(td);

            td = document.createElement("td");
            td.textContent = comment.comment;
            row.appendChild(td);

            const edit = document.createElement("button");
            edit.textContent = "수정";
            edit.addEventListener("click", async () => {    // 수정 버튼 클릭 시
                const newComment = prompt("바꿀 내용을 입력하세요.");
                if (!newComment) {
                    return alert("내용을 반드시 입력해야 합니다.");
                }

                try {
                    await axios.patch(`/comments/${comment.id}`, { comment: newComment });
                    getComment(id);
                } catch (err) {
                    console.error(err);
                }
            });
            
            const remove = document.createElement("button");
            remove.textContent = "삭제";
            remove.addEventListener("click", async () => {  // 삭제 버튼 클릭 시
                try {
                    axios.delete(`/comments/${comment.id}`);
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

`script` 태그에는 버튼들을 눌렀을 때 서버의 라우터로 AJAX 요청을 보내는 코드가 들어 있다.

지금부터는 라우터를 만든다. `public/sequelize.js`에 나오는 `GET`, `POST`, `PUT`, `DELETE` 요청에 대응되는 라우터를 만들면 된다. `routes` 디렉터리를 생성하고 그 안에 `index.js`를 다음과 같이 작성한다.

**routes/index.js**
```
const express = require("express");
const User = require("../models/user");

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.render("sequelize", { users });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
```

먼저 `GET /`로 요청을 보내올 때의 라우터이다. `User.findAll` 메소드로 모든 사용자를 찾은 후 `sequelize.html`을 렌더링할 때 결과인 `users`를 전달한다.

이렇게 미리 데이터베이스에서 데이터를 조회한 후 템플릿 렌더링에 사용할 수 있다.

다음은 `users.js`이다. `router.route` 메소드로 같은 라우트 경로는 하나로 묶었다.

**routes/users.js**
```
const express = require("express");
const User = require("../models/user");
const Comment = require("../models/comment");

const router = express.Router();

router.route("/")
    .get(async (req, res, next) => {
        try {
            const users = await User.findAll();
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
        const comments = await Comment.findAll({
            include: {
                model: User,
                where: { id: req.params.id },
            },
        });

        console.log(comments);
        res.json(comments);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
```

`GET /users`와 `POST /users` 주소로 요청이 들어올 때의 라우터이다. 각각 사용자를 조회하는 요청과 사용자를 등록하는 요청을 처리한다. `GET /`에 대한 요청도 사용자 데이터를 조회하고 있지만, `GET /users`에 대한 요청에선 데이터가 JSON 형식으로 반환된다는 차이점이 있다.

`GET /users/:id/comments` 라우터에는 `findAll` 메소드에 옵션이 추가되어 있다. `include` 속성에서 `model` 속성에는 `User` 모델을, `where` 속성에는 `:id`로 전달받은 아이디 값을 추가하였다. `:id`는 라우트 매개변수로 6.3절에 설명되어 있다. `req.params.id`로 그 값을 가져올 수 있다.

만약 요청이 `GET /users/1/comments`라면 사용자 id가 1인 댓글을 불러온다. 조회된 댓글 객체에는 `include`로 넣어준 사용자 정보도 들어 있으므로 작성자의 이름이나 나이 등을 조회할 수도 있다.

다음은 `comments.js`이다.

**routes/comments.js**
```
const express = require("express");
const { Comment } = require("../models");

const router = express.Router();

router.post("/", async (req, res, next) => {
    try {
        const comment = await Comment.create({
            commenter: req.body.id,
            comment: req.body.comment,
        });

        console.log(comment);
        res.status(201).json(comment);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.route("/:id")
    .patch(async (req, res, next) => {
        try {
            const result = await Comment.update({
                comment: req.body.comment,
            }, {
                where: { id: req.params.id },
            });

            res.json(result);
        } catch (err) {
            console.error(err);
            next(err);
        }
    })
    .delete(async (req, res, next) => {
        try {
            const result = await Comment.destroy({ where: { id: req.params.id } });
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

module.exports = router;
```

댓글과 관련된 CRUD 작업을 하는 라우터이다. `POST /comments`, `PATCH /comments/:id`, `DELETE /comments/:id`를 등록하였다.

`POST /comments`는 댓글 생성 요청이다. 라우터에서는 `commenter` 속성에 사용자 아이디를 전달하여 사용자와 댓글을 연결한다.

`PATCH /comments/:id`와 `DELETE /comments/:id`는 각각 댓글 수정, 삭제 요청이다. 라우터에서는 각각 `update`, `destroy` 메소드로 요청한 수정, 삭제 작업을 수행한다.

마지막으로 이렇게 만들어준 라우터들을 모두 `app.js`에 연결한다.

**app.js**
```
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");

const { sequelize } = require("./models");
const indexRouter = require("./routes/");
const usersRouter = require("./routes/users");
const commentsRouter = require("./routes/comments");

const app = express();
app.set("port", process.env.PORT || 3001);
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

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/comments", commentsRouter);

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

이제 `npm start`로 서버를 실행하고 `http://localhost:3001`로 접속하면 사용자 동작에 따라 시퀄라이즈가 수행하는 SQL 문을 확인할 수 있다.
- - -


## 7.7 함께 보면 좋은 자료

생략