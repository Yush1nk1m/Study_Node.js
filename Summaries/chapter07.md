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