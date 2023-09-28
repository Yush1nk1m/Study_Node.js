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

이제 패키지들을 설치해볼 것이다. `npm install [패키지 이름]` 또는 `npm i [패키지 이름]`을 `package.json`이 있는 디렉터리의 콘솔에서 입력하면 된다. 예제로는 `Express` 모듈을 설치한다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05\test-package> npm install express

added 58 packages, and audited 59 packages in 6s

8 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05\test-package> tree
새 볼륨 볼륨에 대한 디렉터리 경로의 목록입니다.
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

`npm`에는 전역 설치라는 옵션도 있다. 패키지를 현재 프로젝트 디렉터리에만 설치하는 것이 아니라 `npm`이 설치되어 있는 디렉터리에 설치하는 것이다. 이 디렉터리는 환경 변수에 등록되어 있는 것이므로 설치한 패키지를 콘솔의 명령어로 사용할 수 있게 된다. 간단하게 `npm install --global [패키지 이름]`과 같이 `--global`을 옵션으로 제공하면 된다.

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

`rimraf` 명령어로 **node_modules** 디렉터리를 삭제했다. 그러나 `package.json`과 `package-lock.json`에 패키지 정보가 들어있기 때문에 언제든 `npm install` 또는 `npm i` 명령어로 복구할 수 있다. 하지만 전역 설치된 패키지는 복구가 불가능하기 때문에 다른 방법으로 설치해야 한다.

이러한 경우를 위한 명령어가 바로 `npx`이다.

**console**
```
$ npm install --save-dev rimraf
$ npx rimraf node_modules
```

위와 같은 명령어를 실행하면 모듈을 `package.json`의 `devDependencies` 속성에 기록하게 되어 **node modules**를 삭제해도 복구할 수 있으며, 명령어처럼 사용할 수 있게 되어 전역 설치한 것과 같은 효과를 볼 수 있다.
- - -


## 5.3 패키지 버전 이해하기

노드 패키지들의 버전은 항상 `SemVer` 방식의 버전 넘버링에 따라 `X.X.X`와 같이 세 자리로 이루어져 있다. `SemVer(Semantic Versioning)`은 `유의적 버전`이라고 하며, 버전을 구성하는 세 자리의 숫자가 모두 의미를 갖고 있음을 의미한다.

버전의 첫 번째 자리는 `메이저 버전`이라고 한다. 메이저 버전이 `0`이면 **초기 개발 중**이라는 의미이고, `1`부터는 **정식 버전**을 의미한다. 메이저 버전은 하위 호환이 되지 않을 정도로 패키지의 내용이 방대하게 수정되었을 때 올린다. 하위 호환이 안 된다는 것은 이전 버전에서 업그레이드 후 에러가 발생할 가능성이 크다는 것을 의미한다.

버전의 두 번째 자리는 `마이너 버전`이라고 한다. 마이너 버전은 하위 호환이 되는 기능 업데이트를 할 때 올린다. 그러므로 마이너 버전 단위의 업그레이드에서는 아무 문제가 없어야 한다.

버전의 세 번째 자리는 `패치 버전`이라고 한다. 새로운 것을 추가하기보단 기존 기능에 문제가 있어 수정했을 경우 패치 버전을 올린다. 이 경우에도 업그레이드 후 아무 문제가 없어야 한다.

새 버전을 배포한 뒤에는 그 버전의 내용을 절대로 수정할 수 없다. 만약 수정 사항이 생기면 세 버전들 중 하나를 의미에 맞게 올려서 새로운 버전으로 배포해야 한다. 이러면 동일한 버전은 동일하게 동작한다는 믿음을 줄 수 있다.

`package.json`에는 `SemVer`식 버전 표현 앞에 `^`, `~`, `<`, `>` 같은 문자가 추가로 붙기도 한다. 이것은 버전 설치 조건을 알리는 문자들이다.

- `^`: 마이너 버전까지만 설치하거나 업데이트한다. 예를 들어 `npm i express@^1.1.1`은 **1.1.1 이상부터 2.0.0 미만** 버전까지 설치된다.
- `~`: 패치 버전까지만 설치하거나 업데이트한다. 예를 들어 `npm i express@~1.1.1`은 **1.1.1 이상부터 1.2.0 미만** 버전까지 설치된다. `1.1.x`와 같은 표현도 허용된다.
- `<`, `>`, `< =`, `> =`, `=`: 표현 그대로 미만, 초과, 이하, 이상, 동일을 의미한다.
- `@latest`: 안정된 최신 버전의 패키지를 설치한다. `@x`로도 표현할 수 있다.
- `@next`: 안정적인지의 여부에 상관없이 가장 최신의 배포판을 사용할 수 있다.
- - -


## 5.4 기타 npm 명령어

`npm`으로 설치한 패키지를 사용하는 중 새로운 버전이 있는지 확인하고 싶다면 `npm outdated` 명령어를 사용하면 된다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05\test-package> npm outdated
Package  Current  Wanted  Latest  Location  Depended by
express  MISSING  4.18.2  4.18.2  -         test-package
```

`Current`와 `Wanted`가 다르다면 업데이트가 필요한 경우이다. 이럴 때는 `npm update [패키지 이름]` 명령어로 업데이트할 수 있다. 패키지 이름을 명시하지 않고 `npm update`를 입력하면 업데이트 가능한 모든 패키지가 `Wanted` 버전으로 업데이트된다. `Latest`는 해당 패키지의 가장 최신 버전이지만 `package.json`에 명시된 조건에 맞지 않는다면 설치되지 않는다.

`npm uninstall [패키지 이름]`은 해당 패키지를 영구히 제거하는 명령어이다. **node modules** 디렉터리에서 제거함과 동시에 `package.json`에서 사라진다. `npm rm [패키지 이름]`과 같이 사용할 수도 있다.

`npm search [검색어]`는 패키지를 검색할 수 있다. GUI가 없는 리눅스에서 이 명령어를 사용하면 유용하다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05\test-package> npm search express
NAME                      | DESCRIPTION          | AUTHOR          | DATE       | VERSION  | KEYWORDS
express                   | Fast,…               | =mikeal…        | 2022-10-08 | 4.18.2   | express framework sinatra web http rest restful router app api
express-validator         | Express middleware…  | =ctavan…        | 2023-04-16 | 7.0.1    | express validator validation validate sanitize sanitization xss
path-to-regexp            | Express style path…  | =blakeembrey…   | 2022-05-06 | 6.2.1    | express regexp route routing
express-handlebars        | A Handlebars view…   | =ericf =sahat…  | 2023-08-08 | 7.1.2    | express express3 handlebars view layout partials templates
cors                      | Node.js CORS…        | =dougwilson…    | 2018-11-04 | 2.8.5    | cors express connect middleware
connect-redis             | Redis session store… | =tjholowaychuk… | 2023-05-11 | 7.1.0    | connect redis session express
helmet                    | help secure…         | =adam_baldwin…  | 2023-05-06 | 7.0.0    | express security headers backend
express-session           | Simple session…      | =dougwilson     | 2022-05-11 | 1.17.3   |
is-regex                  | Is this value a JS…  | =ljharb         | 2021-08-06 | 1.1.4    | regex regexp is regular expression regular expression
express-rate-limit        | Basic IP…            | =nfriedly…      | 2023-09-26 | 7.0.2    | express-rate-limit express rate limit ratelimit rate-limit middleware ip auth authorization security brute force bruteforce brute-force attack  
regexp.prototype.flags    | ES6 spec-compliant…  | =ljharb         | 2023-09-13 | 1.5.1    | RegExp.prototype.flags regex regular expression ES6 shim flag flags regexp RegExp#flags polyfill es-shim API
string.prototype.matchall | Spec-compliant…      | =ljharb         | 2023-09-13 | 4.0.10   | ES2020 ES String.prototype.matchAll matchAll match regex regexp regular expression matches
anymatch                  | Matches strings…     | =es128 =phated… | 2022-11-21 | 3.1.3    | match any string file fs list glob regex regexp regular expression function
express-fileupload        | Simple express file… | =richardgirges… | 2023-09-24 | 1.4.1    | express file-upload upload forms multipart files busboy middleware
multer                    | Middleware for…      | =hacksparrow…   | 2022-05-30 | 1.4.5-l… | form post multipart form-data formdata express middleware
escape-string-regexp      | Escape RegExp…       | =sindresorhus   | 2021-04-17 | 5.0.0    | escape regex regexp regular expression string special characters
sails                     | API-driven…          | =rachaelshaw…   | 2023-09-01 | 1.5.8    | mvc web-framework express sailsjs sails.js REST API orm socket.io
ignore                    | Ignore is a manager… | =kael           | 2022-12-19 | 5.2.4    | ignore .gitignore gitignore npmignore rules manager filter regexp regex fnmatch glob asterisks regular-expression
express-http-proxy        | http proxy…          | =villadora…     | 2023-09-04 | 2.0.0    | express-http-proxy
webpack-hot-middleware    | Webpack hot…         | =glenjamin…     | 2023-06-20 | 2.25.4   | webpack hmr hot module reloading hot-reloading middleware express
```

`npm info [패키지 이름]`은 패키지의 세부 정보를 파악하고자 할 때 사용하는 명령어이다. `package.json`의 내용과 의존 관계, 설치 가능한 버전 정보 등이 표시된다.

`npm login`은 `npm` 로그인을 위한 명령어로, 공식 사이트에서 가입한 계정으로 로그인하면 된다. 패키지를 배포할 때 필요하다. `npm logout`으로 로그아웃할 수 있다.

`npm whoami`는 로그인한 사용자가 누구인지 알려준다. 로그인되지 않았다면 에러가 발생한다.

`npm version [버전]`으로 `package.json`의 버전을 올릴 수 있다. 원하는 버전의 숫자를 올릴 수 있다. 또는 `major`, `minor`, `patch`라는 문자열을 넣어서 해당 부분의 숫자를 1 올릴 수도 있다. 예를 들어 `npm version minor`와 같은 표현이다.

`npm deprecate [패키지 이름] [버전] [메시지]`는 패키지의 해당 버전을 설치할 때 경고 메시지를 띄워주는 기능으로, 자신의 패키지에만 사용 가능하다.

`npm publish`는 자신이 만든 패키지를 배포할 때 사용한다. `npm unpublish`는 반대로 배포한 패키지를 제거할 때 사용되며, 24시간 이내에 배포한 패키지만 제거할 수 있다.

npm 공식 문서의 CLI Commands에서 더 많은 명령어를 확인할 수 있다.
- - -


## 5.5 패키지 배포하기

먼저 패키지로 만들 임의의 코드를 작성한다.

**index.js**
```
module.exports = () => {
    return "hello package";
};
```

이제 패키지 디렉터리에서 `npm publish` 명령어로 배포할 수 있다. 단, 이미 배포된 패키지와 이름이 동일하면 안 되므로 `npm info [패키지 이름]` 명령어로 이미 같은 이름의 패키지가 존재하는지 확인한다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05\test-package> npm publish
npm notice 
npm notice 📦  yushin-test-package@0.0.1
npm notice === Tarball Contents ===
npm notice 57B  index.js
npm notice 293B package.json
npm notice === Tarball Details ===
npm notice name:          yushin-test-package
npm notice version:       0.0.1
npm notice filename:      yushin-test-package-0.0.1.tgz
npm notice package size:  351 B
npm notice unpacked size: 350 B
npm notice shasum:        0bae75624f0f61e86b233a8615479d451f6c6eba
npm notice integrity:     sha512-kNbwJ4zxgriO4[...]E+wTqFpuf3dXQ==
npm notice total files:   2
npm notice
npm notice Publishing to https://registry.npmjs.org/ with tag latest and default access
+ yushin-test-package@0.0.1
```

배포가 성공했는지 확인하기 위해 `npm info` 명령어를 활용할 수 있다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05\test-package> npm info yushin-test-package

yushin-test-package@0.0.1 | ISC | deps: 1 | versions: 1
A package for test

dist
.tarball: https://registry.npmjs.org/yushin-test-package/-/yushin-test-package-0.0.1.tgz
.shasum: 0bae75624f0f61e86b233a8615479d451f6c6eba
.integrity: sha512-kNbwJ4zxgriO4tQ3YbquANQyIWJ34tMZ6Zv3i7Wooh0BJ1fAd4jy825EOgRSC9lJEGh4vJV+TE+wTqFpuf3dXQ==
.unpackedSize: 350 B

dependencies:
express: ^4.18.2

maintainers:
- youth_1n <kys010306@sogang.ac.kr>

dist-tags:
latest: 0.0.1

published a minute ago by youth_1n <kys010306@sogang.ac.kr>
```

다음과 같이 버전을 올려 배포할 수 있다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05\test-package> npm version patch
v0.0.2
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05\test-package> npm publish
npm notice 
npm notice 📦  yushin-test-package@0.0.2
npm notice === Tarball Contents ===
npm notice 57B  index.js
npm notice 293B package.json
npm notice === Tarball Details ===
npm notice name:          yushin-test-package
npm notice version:       0.0.2
npm notice filename:      yushin-test-package-0.0.2.tgz
npm notice package size:  352 B
npm notice unpacked size: 350 B
npm notice shasum:        6dd63d987b73f8de18544b7da165796bce717559
npm notice integrity:     sha512-4ai7O5ALOZPLo[...]SxOYX2+PGJqag==
npm notice total files:   2
npm notice
npm notice Publishing to https://registry.npmjs.org/ with tag latest and default access
+ yushin-test-package@0.0.2
```

이제 배포한 패키지를 삭제하겠다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter05\test-package> npm unpublish yushin-test-package --force
npm WARN using --force Recommended protections disabled.
- yushin-test-package
```
- - -


## 5.6 함께 보면 좋은 자료

생략
- - -