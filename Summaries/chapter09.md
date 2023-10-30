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

```

**.env**
```

```