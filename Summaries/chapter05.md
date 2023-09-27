# Node.js 교과서 5장 요약
## *패키지 매니저*
- - -


## 5.1 npm 알아보기

`npm(Node Package Manager)`은 이름 그대로 노드 패키지 매니저이다. 대부분의 자바스크립트 프로그램은 패키지라는 이름으로 `npm`에 등록되어 있다. 그러므로 특정 기능을 사용하고 싶다면 `npm`에서 찾아보는 것을 고려해볼 수 있다.
- - -


## 5.2 package.json으로 패키지 관리하기

`package.json`은 설치한 패키지의 버전을 관리할 수 있도록 해주는 파일이다. **노드 프로젝트를 시작하기 전에는 디렉터리 내부에 무조건 package.json부터 만들어야 한다.** `npm`은 `package.json`을 생성하는 명령어를 제공한다. 다음과 같이 콘솔에 `npm init`을 입력하면 된다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05> npm init
This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

See `npm help init` for definitive documentation on these fields
and exactly what they do.

Use `npm install <pkg>` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.
package name: (chapter05) test-package
version: (1.0.0) 0.0.1                                                                                                                                                                                                                       
description: A package for test                                                                                                                                                                                                              
entry point: (index.js)                                                                                                                                                                                                                      
test command:                                                                                                                                                                                                                                
git repository:                                                                                                                                                                                                                              
keywords:                                                                                                                                                                                                                                    
author: Yushin Kim                                                                                                                                                                                                                           
license: (ISC)                                                                                                                                                                                                                               
About to write to D:\공부\Javascript\Study_Node.js\Codes\chapter05\package.json:

{
  "name": "test-package",
  "version": "0.0.1",
  "description": "A package for test",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Yushin Kim",
  "license": "ISC"
}


Is this OK? (yes) yes
```

프로젝트를 생성할 위치로 이동한 후 `npm init`을 입력하고, 요청하는 정보들을 입력하면 `package.json`이 생성된다.

- **package name**: 패키지의 이름이다. `name` 속성에 저장된다.
- **version**: 패키지의 버전이다. `npm`의 버전은 다소 엄격하게 관리된다.
- **entry point**: 자바스크립트 실행 파일 진입점이다. 보통 마지막으로 `module.exports` 하는 파일을 지정한다. `main` 속성에 저장된다.
- **test command**: 코드를 테스트할 때 입력할 명령어를 의미한다. `scripts` 속성 안의 `test` 속성에 저장된다.
- **git repository**: 코드를 저장해둔 Git 저장소 주소를 의미한다. `repository` 속성에 저장된다.
- **keywords**: npm 공식 홈페이지에서 패키지를 쉽게 찾을 수 있게 한다. `keywords` 속성에 저장된다.
- **license**: 해당 패키지의 라이센스를 넣으면 된다.

**package.json**
```
{
  "name": "test-package",
  "version": "0.0.1",
  "description": "A package for test",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Yushin Kim",
  "license": "ISC"
}
```

`sciprts` 부분은 `npm` 명령어를 저장해두는 부분이다. 콘솔에서 `npm run [스크립트 명령어]`를 입력하면 해당 스크립트가 실행된다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05> npm run test

> test-package@0.0.1 test
> echo "Error: no test specified" && exit 1

"Error: no test specified" 
```

현재 `sciprts`에 저장된 `test` 명령어를 `npm run test`를 통해 실행했더니, 그에 대응되는 스크립트인 `echo "Error: no test specified" && exit 1`가 실행되었다. `test` 스크립트 외에도 `scripts` 속성에 명령어 여러 개를 등록해두고 사용할 수 있다. 보통 `start` 명령어에 `node [파일명]`을 저장해두고 `npm start`로 실행한다. `start`나 `test` 같은 스크립트는 `run`을 붙이지 않아도 실행된다.

이제 패키지들을 설치해볼 것이다. `npm install [패키지 이름]`을 `package.json`이 있는 디렉터리의 콘솔에서 입력하면 된다. 예제로는 `Express` 모듈을 설치한다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05\test-package> npm install express

added 58 packages, and audited 59 packages in 6s

8 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05\test-package> tree
새 볼륨 볼륨에 대한 폴더 경로의 목록입니다.
볼륨 일련 번호는 74AC-A98F입니다.
D:.
└─node_modules
    ├─.bin
    ├─accepts
    ├─array-flatten
    ├─body-parser
    │  └─lib
    │      └─types
    ├─bytes
    ├─call-bind
    │  ├─.github
    │  └─test
    ├─content-disposition
    ├─content-type
    ├─cookie
    ├─cookie-signature
    ├─debug
    │  └─src
    ├─depd
    │  └─lib
    │      └─browser
    ├─destroy
    ├─ee-first
    ├─encodeurl
    ├─escape-html
    ├─etag
    ├─express
    │  └─lib
    │      ├─middleware
    │      └─router
    ├─finalhandler
    ├─forwarded
    ├─fresh
    ├─function-bind
    │  └─test
    ├─get-intrinsic
    │  ├─.github
    │  └─test
    ├─has
    │  ├─src
    │  └─test
    ├─has-proto
    │  ├─.github
    │  └─test
    ├─has-symbols
    │  ├─.github
    │  └─test
    │      └─shams
    ├─http-errors
    ├─iconv-lite
    │  ├─encodings
    │  │  └─tables
    │  └─lib
    ├─inherits
    ├─ipaddr.js
    │  └─lib
    ├─media-typer
    ├─merge-descriptors
    ├─methods
    ├─mime
    │  └─src
    ├─mime-db
    ├─mime-types
    ├─ms
    ├─negotiator
    │  └─lib
    ├─object-inspect
    │  ├─.github
    │  ├─example
    │  └─test
    │      └─browser
    ├─on-finished
    ├─parseurl
    ├─path-to-regexp
    ├─proxy-addr
    ├─qs
    │  ├─.github
    │  ├─dist
    │  ├─lib
    │  └─test
    ├─range-parser
    ├─raw-body
    ├─safe-buffer
    ├─safer-buffer
    ├─send
    │  └─node_modules
    │      └─ms
    ├─serve-static
    ├─setprototypeof
    │  └─test
    ├─side-channel
    │  ├─.github
    │  └─test
    ├─statuses
    ├─toidentifier
    ├─type-is
    ├─unpipe
    ├─utils-merge
    └─vary
```

**package.json**
```
{
  "name": "test-package",
  "version": "0.0.1",
  "description": "A package for test",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Yushin Kim",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

패키지가 성공적으로 설치되면 `package.json`의 내용도 변하는 것을 확인할 수 있다. 설치된 패키지에 대한 정보가 반영된 것이다. **프로젝트 이름과 설치하는 패키지의 이름은 달라야 하므로 주의해야 한다.**

패키지는 **node_modules**라는 디렉터리에 설치되는데, `Express`가 의존하는 모든 패키지가 함께 설치된 것을 확인할 수 있다. 이렇게 함께 설치된 내부적인 패키지들에 대한 버전 정보는 `package-lock.json`에 저장된다. 이 파일엔 패키지들 간의 의존 관계가 정리되어 있다.

패키지 여러 개를 동시에 설치하려면 `npm install [패키지 1] [패키지 2] ...`과 같이 명령어 뒤에 패키지 이름들을 나열하면 된다.

`npm`에는 전역 설치라는 옵션도 있다. 패키지를 현재 프로젝트 폴더에만 설치하는 것이 아니라 `npm`이 설치되어 있는 폴더에 설치하는 것이다. 이 폴더는 환경 변수에 등록되어 있는 것이므로 설치한 패키지를 콘솔의 명령어로 사용할 수 있게 된다. 간단하게 `npm install --global [패키지 이름]`과 같이 `--global`을 옵션으로 제공하면 된다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05\test-package> npm install --global rimraf

added 41 packages in 6s

14 packages are looking for funding
  run `npm fund` for details
```

예시로 `rimraf`라는 패키지를 전역 설치했다. 이 패키지는 리눅스나 맥의 `rm -rf` 명령어를 윈도우에서 사용할 수 있게 해준다. 전역 설치했으므로 다음과 같이 콘솔에서 명령어를 바로 사용할 수 있다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05\test-package> rimraf node_modules
```
또는
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05\test-package> npx rimraf node_modules
```
