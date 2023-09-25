# Node.js 교과서 3장 요약
## *노드 기능 알아보기*
- - -

## 3.1 REPL 사용하기

자바스크립트는 스크립트 언어이므로 미리 컴파일하지 않아도 즉석에서 코드를 실행할 수 있다. 그 예로 브라우저 콘솔 탭에서 자바스크립트 코드를 입력할 수 있는데, 노드도 비슷한 콘솔 기능을 제공한다. 이 콘솔 기능을 `REPL(Read Eval Print Loop)`이라고 부른다.

**REPL**
- **Read**: 코드를 읽는다.
- **Eval**: 코드를 해석한다.
- **Print**: 결과물을 반환한다.
- **Loop**: 종료할 때까지 반복한다.


터미널에 `node`라고 입력하면 REPL을 이용할 수 있다. 프롬프트가 `>` 모양으로 바뀌면 자바스크립트 코드를 입력할 수 있다.

```
PS D:\> node  
Welcome to Node.js v18.17.1.
Type ".help" for more information.
>
```

이제 프롬프트 창에 직접 코드를 입력해 보자.

```
> const str = "Hello World, Hello Node.js";
undefined
> console.log(str);
Hello World, Hello Node.js
undefined
>
```
위와 같이 REPL이 나의 코드를 **읽고(Read)**, **해석(Eval)**한 뒤, 그 결과를 터미널에 **출력(Print)**했다. 이후엔 종료되기 전까지 새로운 입력을 **기다린다(Loop)**. REPL을 종료하려면 `Ctrl`+`C`를 두 번 누르거나 프롬프트에 `.exit`을 입력하면 된다.

REPL은 1~2줄 분량의 짧은 코드를 확인하는 용도로는 좋지만 여러 줄의 코드를 실행하기는 불편하기 때문에 자바스크립트 코드로 만든 후 파일을 한꺼번에 실행하는 것이 좋다.
- - -


## 3.2 JS 파일 실행하기

노드로 자바스크립트 파일 실행하는 방법을 알아본다. 다음과 같은 예제 코드를 실행할 것이다.

```
function helloWorld() {
    console.log("Hello World");
    helloNode();
}

function helloNode() {
    console.log("Hello Node");
}

helloWorld();
```

콘솔에서 `node [자바스크립트 파일 경로]`로 실행한다. 확장자(.js)는 생략해도 된다. REPL에서 실행하는 것이 아닌 콘솔에서 실행하는 것임을 기억하자.

```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node helloWorld
Hello World
Hello Node
```
- - -


## 3.3 모듈로 만들기

>노드는 코드를 모듈로 만들 수 있다는 점에서 브라우저의 자바스크립트와는 다르다.

`모듈`: 특정한 기능을 하는 변수나 함수들의 집합이다. 그 자체로도 하나의 프로그램이면서 다른 프로그램의 부품으로도 사용할 수 있다.

노드는 CommonJS 모듈과 ECMAScript 모듈이 존재하여 두 가지 형식의 모듈을 사용할 수 있다.


### 3.3.1 CommonJS 모듈

표준 자바스크립트 모듈은 아니지만, 표준보다 먼저 등장했기 때문에 노드 생태계에서 가장 널리 쓰인다. CommonJS 형식으로 모듈을 만드는 방법을 살펴보겠다. 다음과 같이 **var.js**, **func.js**, **index.js**를 같은 디렉터리에 생성한다.

**var.js**
```
const odd = "CJS 홀수입니다.";
const even = "CJS 짝수입니다.";

module.exports = {
    odd,
    even,
};
```
변수 두 개를 선언하고 `module.exports`에 변수들을 담은 객체를 대입했다. 이제 이 파일은 변수들을 모아둔 모듈로서 기능한다. 다른 파일에서 이 파일을 불러오면 `module.exports`에 대입된 값을 사용할 수 있다.

이번에는 var.js를 참조하는 func.js를 작성한다.

**func.js**
```
const { odd, even } = require("./var");

function checkOddOrEven(num) {
    if (num % 2 != 0) {
        return odd;
    }
    return even;
}

module.exports = checkOddOrEven;
```
`require` 함수 안에 불러올 모듈의 경로를 적는다. 다른 디렉터리에 있는 파일도 모듈로 사용할 수 있다. 파일 경로에서 `js`나 `json` 같은 확장자는 생략할 수 있다. 또한 `index.js`도 생략할 수 있는데, 이는 디렉터리 경로까지만 입력함으로써 불러올 수 있다. 그리고 `module.exports`에는 객체만 대입해야 하는 것은 아니며 변수나 함수를 대입해도 된다.

마지막으로 index.js를 작성한다.

**index.js**
```
const { odd, even } = require('./var');
const checkNumber = require('./func');

function checkStringOddOrEven(str) {
    if (str.length % 2 != 0) {
        return odd;
    }
    return even;
}

console.log(`checkNumber(10): ${checkNumber(10)}`);
console.log(`checkStringOddOrEven("Hello"): ${checkStringOddOrEven("Hello")}`);
```
index.js는 var.js와 func.js를 모두 참조한다. 이처럼 모듈 하나가 여러 개의 모듈 을 사용할 수 있고, 모듈 하나가 여러 개의 모듈에 사용될 수도 있다. 그리고 func.js의 `checkOddOrEven()`이 index.js에서는 `checkNumber()`로 사용되는 것처럼 이름도 임의로 지정할 수 있다.

index.js를 콘솔에서 실행한 결과는 다음과 같다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\module> node index
checkNumber(10): CJS 짝수입니다.
checkStringOddOrEven("Hello"): CJS 홀수입니다.
```

지금까지는 모듈을 만들 때 `module.exports`만 사용했는데 `module` 객체 말고도 `exports`객체로도 모듈을 만들 수 있다. 앞의 var.js를 다음과 같이 수정해도 index.js에서는 동일하게 불러올 수 있다.

**var.js**
```
exports.odd = "CJS 홀수입니다.";
exports.even = "CJS 짝수입니다.";
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\module> node index
checkNumber(10): CJS 짝수입니다.
checkStringOddOrEven("Hello"): CJS 홀수입니다.
```

`module.exports`와 `exports`가 같은 객체를 참조하기 때문에 동일하게 동작할 수 있다. 정확히는 `exports`가 `module.exports`를 참조하고, `module.exports`가 실제 객체를 참조한다. 둘을 동시에 사용하지 않는 것이 좋다.

**Note: 노드에서의 this**

노드에서의 `this`는 브라우저의 `this`와는 조금 다르다.

**this.js**
```
console.log(this);
console.log(this === module.exports);
console.log(this === exports);

function whatIsThis() {
    console.log(`function ${this === exports}, ${this === global}`);
}

whatIsThis();
```

**console**
```
{}
true
true
function false, true
```

다른 부분은 브라우저의 자바스크립트와 동일하지만 최상위 스코프에 존재하는 `this`는 `module.exports` 또는 `exports`를 가리킨다. 함수 선언문 내부의 `this`는 `global` 객체를 가리킨다.

이번에는 모듈을 불러오는 `require`에 대해 알아본다. `require`는 함수이고, 함수는 객체이므로 `require`는 객체로서의 속성을 몇 개 갖고 있다. 그 중 `require.cache`와 `require.main`을 알아본다.

var.js가 있는 곳에 require.js를 만들어 보자.

**require.js**
```
console.log("require가 가장 위에 오지 않아도 된다.");

module.exports = "저를 찾아보세요.";

require("./var");

console.log("require.cache 입니다.");
console.log(require.cache);

console.log("require.main 입니다.");
console.log(require.main === module);
console.log(require.main.filename);
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\module> node require
require가 가장 위에 오지 않아도 된다.
require.cache 입니다.
[Object: null prototype] {
  'D:\\공부\\Javascript\\Study_Node.js\\Codes\\chapter03\\module\\require.js': {
    id: '.',
    path: 'D:\\공부\\Javascript\\Study_Node.js\\Codes\\chapter03\\module',
    exports: '저를 찾아보세요.',
    filename: 'D:\\공부\\Javascript\\Study_Node.js\\Codes\\chapter03\\module\\require.js',
    loaded: false,
    children: [ [Object] ],
    paths: [
      'D:\\공부\\Javascript\\Study_Node.js\\Codes\\chapter03\\module\\node_modules',
      'D:\\공부\\Javascript\\Study_Node.js\\Codes\\chapter03\\node_modules',
      'D:\\공부\\Javascript\\Study_Node.js\\Codes\\node_modules',
      'D:\\공부\\Javascript\\Study_Node.js\\node_modules',
      'D:\\공부\\Javascript\\node_modules',
      'D:\\공부\\node_modules',
      'D:\\node_modules'
    ]
  },
  'D:\\공부\\Javascript\\Study_Node.js\\Codes\\chapter03\\module\\var.js': {
    id: 'D:\\공부\\Javascript\\Study_Node.js\\Codes\\chapter03\\module\\var.js',
    path: 'D:\\공부\\Javascript\\Study_Node.js\\Codes\\chapter03\\module',
    exports: { odd: 'CJS 홀수입니다.', even: 'CJS 짝수입니다.' },
    filename: 'D:\\공부\\Javascript\\Study_Node.js\\Codes\\chapter03\\module\\var.js',
    loaded: true,
    children: [],
    paths: [
      'D:\\공부\\Javascript\\Study_Node.js\\Codes\\chapter03\\module\\node_modules',
      'D:\\공부\\Javascript\\Study_Node.js\\Codes\\chapter03\\node_modules',
      'D:\\공부\\Javascript\\Study_Node.js\\Codes\\node_modules',
      'D:\\공부\\Javascript\\Study_Node.js\\node_modules',
      'D:\\공부\\Javascript\\node_modules',
      'D:\\공부\\node_modules',
      'D:\\node_modules'
    ]
  }
}
require.main 입니다.
true
D:\공부\Javascript\Study_Node.js\Codes\chapter03\module\require.js
```

`require.cache` 객체에 require.js나 var.js 같은 파일 이름이 속성명으로 들어 있고 속성값으로는 각 파일의 모듈 객체가 들어 있는 것을 확인할 수 있다. 한 번 `require`한 파일은 `require.cache`에 저장되므로 다음 번에 `require`할 때는 새로 불러오지 않고 `require.cache`에 있는 것이 재사용된다.

`require.main`은 노드 실행 시의 첫 모듈을 가리킨다. 지금 예시에서는 `node require` 명령어로 실행했으므로 require.js가 `require.main`이 된다. 현재 파일이 첫 모듈인지 확인해 보려면 `require.main === module`을 입력해 보거나 `require.main.filename`을 입력해 봄으로써 확인할 수 있다.

모듈을 사용할 때는 다음과 같이 두 모듈이 서로를 `require`하는 `순환 참조(circular dependency)`를 방지해야 한다.

**dep1.js**
```
const dep2 = require("./dep2");
console.log(`require dep2: ${dep2}`);

module.exports = () => {
    console.log(`dep2: ${dep2}`);
};
```

**dep2.js**
```
const dep1 = require("./dep1");
console.log(`require dep1: ${dep1}`);

module.exports = () => {
    console.log(`dep1: ${dep1}`);
};
```

**dep-run.js**
```
const dep1 = require("./dep1");
const dep2 = require("./dep2");

dep1();
dep2();
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node dep-run
require dep1: [object Object]
require dep2: () => {
    console.log(`dep1: ${dep1}`);
}
dep2: () => {
    console.log(`dep1: ${dep1}`);
}
dep1: [object Object]
(node:10652) Warning: Accessing non-existent property 'Symbol(Symbol.toPrimitive)' of module exports inside circular dependency
(Use `node --trace-warnings ...` to show where the warning was created)
(node:10652) Warning: Accessing non-existent property 'Symbol(Symbol.toStringTag)' of module exports inside circular dependency
(node:10652) Warning: Accessing non-existent property 'Symbol(Symbol.toPrimitive)' of module exports inside circular dependency
(node:10652) Warning: Accessing non-existent property 'Symbol(Symbol.toStringTag)' of module exports inside circular dependency
```

순환 참조가 있을 경우에는 순환 참조되는 대상을 빈 객체로 만든다. 이때 에러가 발생하지 않기 때문에 순환 참조가 발생하지 않도록 미리 구조를 잘 잡아 두어야 한다.


### 3.3.2 ECMAScript 모듈

`ECMAScript`(이하 ES 모듈)는 표준 자바스크립트 모듈 형식이다. 브라우저에도 사용할 수 있어 노드와 브라우저가 모두 같은 모듈 형식을 사용할 수 있다는 장점이 있다.

**3.3.1**절의 코드를 ES 모듈 스타일로 바꿔보겠다.

**var.mjs**
```
export const odd = "MJS 홀수입니다.";
export const even = "MJS 짝수입니다.";
```

**func.mjs**
```
const { odd, even } = require("./var");

function checkOddOrEven(num) {
    if (num % 2 != 0) {
        return odd;
    }
    return even;
}

module.exports = checkOddOrEven;
```

**index.mjs**
```
import { odd, even } from "./var.mjs";
import checkNumber from "./func.mjs";

function checkStringOddOrEven(str) {
    if (str.length % 2 != 0) {
        return odd;
    }
    return even;
}

console.log(`checkNumber(10): ${checkNumber(10)}`);
console.log(`checkStringOddOrEven("Hello"): ${checkStringOddOrEven("Hello")}`);
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\module\mjs> node index.mjs
checkNumber(10): MJS 짝수입니다.
checkStringOddOrEven("Hello"): MJS 홀수입니다.
```

바뀐 문법은 다음과 같다.
- `require` -> `import`
- `exports` -> `export`
- `module.exports` -> `export default`

ES 모듈 문법은 CommonJS 모듈처럼 함수나 객체가 아니라 문법 그 자체이다. 파일도 **js** 대신 **mjs** 확장자로 사용해야 하며, 생략 표현이 불가능하기 때문에 주의해야 한다.

| 차이점 | CommonJS 모듈 | ECMAScript 모듈 |
| :--: | :-- | :-- |
| **문법** | require('/a');<br>module.exports = 'A'<br>const A = require('./a');<br>exports.C = D;<br>const E = F; exports.E = E;<br>const { C, E } = require('./b'); | import './a.mjs';<br>export default A;<br>import A from './a.mjs';<br>export const C = D;<br>const E = F; export { E };<br>import { C, E } from './b.mjs'; |
| **확장자** | js<br>cjs | js(package.json에 type: "module" 필요)<br>mjs |
| **확장자 생략** | 가능 | 불가능 |
| **다이내믹 임포트** | 가능 | 불가능 |
| **인덱스(index) 생략** | 가능(require('./folder')) | 불가능(import './folder/index.mjs') |
| **top level await** | 불가능 | 가능 |
| **__filename,<br>__dirname,<br>require, module.exports,<br>exports** | 사용 가능 | 사용 불가능(__filename 대신 import.meta.url 사용) |
| **서로 간 호출** | 가능 | 가능 |

서로 간에 호환되지 않는 케이스가 많으므로 웬만하면 한 가지 형식만 사용하는 것을 권장합니다.


### 3.3.3 다이내믹 임포트

앞의 표에서 CommonJS 모듈과 ES 모듈을 비교할 때, CommonJS 모듈에서는 다이내믹 임포트가 가능하고 ES 모듈에서는 불가능하다고 표현했다. 이 절에서는 다이내믹 임포트에 대해 알아본다.

**dynamic.js**
```
const a = false;
if (a) {
    require("./func");
}
console.log("성공");
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\module\js> node dynamic
성공
```

dynamic.js에서 `require("./func")`는 if문이 false라서 실행되지 않으므로 실행되지 않는다. 이렇게 조건부로 모듈을 불러오는 것을 다이내믹 임포트라고 한다.

**dynamic.mjs**
```
const a = false;
if (a) {
    import "./func.mjs";
}
console.log("성공");
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\module\mjs> node dynamic.mjs
file:///D:/%EA%B3%B5%EB%B6%80/Javascript/Study_Node.js/Codes/chapter03/module/mjs/dynamic.mjs:3
    import "./func.mjs";
           ^^^^^^^^^^^^

SyntaxError: Unexpected string
    at ESMLoader.moduleStrategy (node:internal/modules/esm/translators:119:18)
    at ESMLoader.moduleProvider (node:internal/modules/esm/loader:468:14)
    at async link (node:internal/modules/esm/module_job:68:21)

Node.js v18.17.1
```

하지만 ES 모듈은 if문 안에서 import하는 것이 불가능하다. 이럴 때 다이내믹 임포트를 사용한다. 다음과 같이 dynamic.mjs를 수정한다.

**dynamic.mjs**
```
const a = true;
if (a) {
    const m1 = await import("./func.mjs");
    console.log(m1);

    const m2 = await import("./var.mjs");
    console.log(m2);
}
console.log("성공");
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\module\mjs> node dynamic.mjs
[Module: null prototype] { default: [Function: checkOddOrEven] }
[Module: null prototype] { even: 'MJS 짝수입니다.', odd: 'MJS 홀수입니다.' }
성공
```

`import`를 문법이 아닌 함수로 사용해서 모듈을 동적으로 불러올 수 있다. `import()`는 Promise를 반환하기 때문에 await이나 then을 붙여야 한다. 위 코드에서는 async 함수를 사용하지 않았는데 ES 모듈의 최상위 스코프에서는 async 함수 없이도 await할 수 있다. (CommonJS 모듈에서는 불가능하다.)


### 3.3.4 __filename, __dirname

노드에서는 파일 사이에 모듈 관계가 있는 경우가 많으므로 현재 파일의 경로나 파일명을 알아야 하는 경우가 있다. 이럴 때 `__filename`, `__dirname`이라는 키워드로 경로에 대한 정보를 제공한다. 파일에 `__filename`, `__dirname`을 넣어두면 실행 시 현재 파일명과 현재 파일 경로로 변경된다.

**filename.js**
```
console.log(__filename);
console.log(__dirname);
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node filename
D:\공부\Javascript\Study_Node.js\Codes\chapter03\js\filename.js
D:\공부\Javascript\Study_Node.js\Codes\chapter03\js
```

경로 구분자가 시스템마다 `/` 또는 `\`로 다르므로 이를 해결해 주는 path 모듈과 함께 사용한다. ES 모듈에서는 `__filename`과 `__dirname`을 사용할 수 없기 때문에 `import.meta.url`로 경로를 가져올 수 있다.

**filename.mjs**
```
console.log(import.meta.url);
console.log('__filename은 에러 발생');
console.log(__filename);
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\mjs> node filename.mjs
file:///D:/%EA%B3%B5%EB%B6%80/Javascript/Study_Node.js/Codes/chapter03/mjs/filename.mjs
__filename은 에러 발생
file:///D:/%EA%B3%B5%EB%B6%80/Javascript/Study_Node.js/Codes/chapter03/mjs/filename.mjs:3
console.log(__filename);
            ^

ReferenceError: __filename is not defined in ES module scope
    at file:///D:/%EA%B3%B5%EB%B6%80/Javascript/Study_Node.js/Codes/chapter03/mjs/filename.mjs:3:13
    at ModuleJob.run (node:internal/modules/esm/module_job:194:25)

Node.js v18.17.1
```
- - -


## 3.4 노드 내장 객체 알아보기

노드에서는 기본적인 내장 객체와 내장 모듈을 제공한다. 따로 설치하지 않아도 바로 사용할 수 있으며, 브라우저의 window 객체와 비슷하다고 보면 된다. 이 절에서는 노드 프로그래밍을 할 때 자주 쓰이는 내장 객체에 대해 알아본다.


### 3.4.1 global

`global` 객체는 브라우저의 `window` 객체와 대응되는 전역 객체이며, 모든 파일에서 접근할 수 있다. `window.open()` 메소드를 그냥 `open()`으로 호출할 수 있는 것처럼 `global`도 생략할 수 있다. `require()` 함수도 `global.require()`이 생략된 것이다. `console` 객체도 원래는 `global.console()`이다.

`global` 객체 내부에는 수십 가지의 속성들이 들어 있고, 내부를 보려면 REPL을 이용해야 한다. 속성 모두를 알 필요는 없고 자주 사용되는 속성들만 알아보도록 한다.

다음은 전역 객체를 이용해 파일 간에 간단한 데이터를 공유하는 코드를 살펴보겠다.

**globalA.js**
```
module.exports = () => global.message;
```

**globalB.js**
```
const A = require('./globalA');

global.message = "안녕하세요";
console.log(A());
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node globalB
안녕하세요
```

globalA와 globalB는 `global.message`를 이용해 데이터를 교환하고 있다. 이처럼 간단한 프로그램에선 전역 객체의 속성에 값을 대입해 파일 간에 데이터를 공유할 수 있지만, 프로그램의 규모가 커지면 어떤 파일에서 전역 객체의 값을 변경하고 있는지 알기 어렵게 되어 유지 보수가 어려워지므로 전역 객체 사용에 주의해야 한다. 이럴 시엔 전역 객체보단 모듈을 사용하는 것이 바람직하다.


### 3.4.2 console

`console`도 노드에서는 `window` 대신 `global` 객체에 포함되어 있다.

`console` 객체는 보통 로깅을 통한 디버깅에 사용된다. 변수 값 출력, 에러 출력, 시간대 출력 등의 기능을 지원한다. 이 절에서는 `console.log` 외의 다른 로깅 함수들을 알아본다.

**console.js**
```
const string = "abc";
const number = 1;
const boolean = true;
const obj = {
    outside: {
        inside: {
            key: "value",
        },
    },
};

console.time("전체 시간");
console.log("console.log: 평범한 로그입니다. 쉼표로 구분해 값을 여러 개 출력할 수 있습니다.");
console.log(string, number, boolean);
console.error("에러 메시지는 console.error로 출력합니다.");

console.table([{ name: "유신", birth: 2001 }, { name: "연우", birth: 2002 }]);

console.dir(obj, { colors: false, depth: 2 });
console.dir(obj, { colors: true, depth: 1 });

console.time("시간 측정");
for (let i = 0; i < 100000; i++) {}
console.timeEnd("시간 측정");

function b() {
    console.trace("에러 위치 추적");
}

function a() {
    b();
}

a();

console.timeEnd("전체 시간");
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node console
console.log: 평범한 로그입니다. 쉼표로 구분해 값을 여러 개 출력할 수 있습니다.
abc 1 true
에러 메시지는 console.error로 출력합니다.
┌─────────┬────────┬───────┐
│ (index) │  name  │ birth │
├─────────┼────────┼───────┤
│    0    │ '유신' │ 2001  │
│    1    │ '연우' │ 2002  │
└─────────┴────────┴───────┘
{ outside: { inside: { key: 'value' } } }
{ outside: { inside: [Object] } }
시간 측정: 1.958ms
Trace: 에러 위치 추적
    at b (D:\공부\Javascript\Study_Node.js\Codes\chapter03\js\console.js:27:13)
    at a (D:\공부\Javascript\Study_Node.js\Codes\chapter03\js\console.js:31:5)
    at Object.<anonymous> (D:\공부\Javascript\Study_Node.js\Codes\chapter03\js\console.js:34:1)
    at Module._compile (node:internal/modules/cjs/loader:1256:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1310:10)
    at Module.load (node:internal/modules/cjs/loader:1119:32)
    at Module._load (node:internal/modules/cjs/loader:960:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:23:47
전체 시간: 17.511ms
```

- `console.time(label)`: `console.timeEnd(label)`과 대응되어 같은 레이블을 가진 time과 timeEnd 사이의 시간을 측정한다.
- `console.log(content)`: 평범한 로그를 콘솔에 표시한다. `console.log(content, content, content, ...)`처럼 여러 내용을 동시에 표시할 수 있다.
- `console.error(error)`: 에러를 콘솔에 표시한다.
- `console.table(array)`: 배열의 요소로 객체 리터럴을 넣으면 객체의 속성들이 테이블 형식으로 표현된다.
- `console.dir(object, option)`: 객체를 콘솔에 표시할 때 사용한다. 첫 번째 인수로 표시할 객체를 넣고, 두 번째 인수로 옵션을 넣는다. 옵션 중 colors를 true로 하면 콘솔에 색이 추가되고 depth의 숫자를 조절하면 객체 안의 객체를 몇 단계까지 보여줄지 결정할 수 있다. depth의 기본값은 2이다.
- `console.trace(label)`: 에러가 어디서 발생했는지 추적할 수 있게 한다.


### 3.4.3 타이머

타이머 기능을 제공하는 함수인 `setTimeout`, `setInterval`, `setImmediate`는 노드에서 `window` 대신 `global` 객체 안에 들어 있다. 특히 `setTimeout`, `setInterval`은 웹 브라우저에서도 사주 사용된다.

- `setTimeout(callback function, millisecond)`: 주어진 밀리초(1,000분의 1초) 이후에 콜백 함수를 실행한다.
- `setInterval(callback function, millisecond)`: 주어진 밀리초(1,000분의 1초)마다 콜백 함수를 반복 실행한다.
- `setImmediate(callback function)`: 콜백 함수를 즉시 실행한다.

위의 타이머 함수들은 모두 아이디를 반환하므로, 아이디를 사용해 타이머를 취소할 수 있다.

- `clearTimeout(id)`: `setTimeout`을 취소한다.
- `clearInterval(id)`: `setInterval`을 취소한다.
- `clearImmediate(id)`: `setImmediate`를 취소한다.

**timer.js**
```
const timeout = setTimeout(() => {
    console.log("1.5초 후 실행");
}, 1500);

const interval = setInterval(() => {
    console.log("1초마다 실행");
}, 1000);

const timeout2 = setTimeout(() => {
    console.log("실행되지 않습니다.");
}, 3000);

setTimeout(() => {
    clearTimeout(timeout2);
    clearInterval(interval);
}, 2500);

const immediate = setImmediate(() => {
    console.log("즉시 실행");
});

const immediate2 = setImmediate(() => {
    console.log("실행되지 않습니다.");
});

clearImmediate(immediate2);
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node timer
즉시 실행
1초마다 실행
1.5초 후 실행
1초마다 실행
```

`setImmediate`는 **즉시 실행**한다고 표현되어 있으나 실제로는 이벤트 루프를 거치는 데 걸리는 시간이 있어 즉시 `clearImmediate`를 호출하면 실행되지 않는다.

`setImmediate(callback)`과 `setTimeout(callback, 0)`의 의미는 동일하지만, 특수한 경우 `setImmediate`가 우선 호출되기도 한다. 헷갈리지 않도록 `setTimeout(callback, 0)`은 사용하지 않는 것이 권장된다.

타이머는 기본적으로 콜백 기반의 API이지만 프로미스 방식을 사용할 수도 있다. 그러나 프로미스 기반 타이머는 **노드 내장 객체**가 아닌 **노드 내장 모듈**이다.

**timerPromise.mjs**
```
import { setTimeout, setInterval } from "timers/promises";

await setTimeout(3000);
console.log("3초 뒤 실행");

for await (const startTime of setInterval(1000, Date.now())) {
    console.log("1초마다 실행", new Date(startTime));
}
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\mjs> node timerPromise.mjs
3초 뒤 실행
1초마다 실행 2023-09-23T08:17:23.115Z
1초마다 실행 2023-09-23T08:17:23.115Z
1초마다 실행 2023-09-23T08:17:23.115Z
1초마다 실행 2023-09-23T08:17:23.115Z
1초마다 실행 2023-09-23T08:17:23.115Z
1초마다 실행 2023-09-23T08:17:23.115Z
1초마다 실행 2023-09-23T08:17:23.115Z
...
```

프로미스 기반이므로 then 대신 await을 사용하기 위해 ES 모듈을 사용했다. **timers/promise**라는 모듈에서 `setTimeout`과 `setInterval`을 새롭게 제공한다. `setTimeout(millisecond)`로 몇 밀리초를 기다릴지 정할 수 있고, `setInterval(millisecond, start value)`은 for await of 문법과 함께 사용할 수 있다. 이때 시작값은 필수가 아니므로 굳이 넣지 않아도 된다.


### 3.4.4 process

`process` 객체는 현재 실행되고 있는 노드 프로세스에 대한 정보를 담고 있다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\mjs> node
Welcome to Node.js v18.17.1.
Type ".help" for more information.
> process.version
'v18.17.1'
> process.arch
'x64'
> process.platform
'win32'
> process.pid
6168
> process.uptime()
27.4826704
> process.execPath
'C:\\Program Files\\nodejs\\node.exe'
> process.cwd()
'D:\\공부\\Javascript\\Study_Node.js\\Codes\\chapter03\\mjs'
> process.cpuUsage()
{ user: 31000, system: 15000 }
> process.memoryUsage()
{
  rss: 38846464,
  heapTotal: 8056832,
  heapUsed: 7112520,
  external: 1056692,
  arrayBuffers: 639397
}
> .exit
```

일반적으로 운영체제나 실행 환경별로 다른 동작을 하고 싶을 때 사용한다. `process.env`, `process.nextTick`, `process.exit()`은 중요하므로 별도로 설명한다.


#### 3.4.4.1 process.env

REPL에 `process.env`을 입력하면 매우 많은 정보가 출력된다. 이는 시스템 환경 변수로, 노드에 직접 영향을 미치기도 한다. 대표적으로 `UV_THREADPOOL_SIZE`와 `NODE_OPTIONS`가 있다.

시스템 환경 변수 외에도 임의로 환경 변수를 저장할 수 있다. `process.env`는 서비스의 중요한 키를 저장하는 공간으로도 사용된다. 중요한 정보를 코드에 직접 입력하는 것은 위험하기 때문에 환경 변수에 저장하고 `process.env`의 속성을 참조하여 사용하는 것이다.

#### process.nextTick(callback)

이벤트 루프로 하여금 다른 콜백 함수들보다 `nextTick`으로 주어진 콜백 함수를 우선적으로 처리하게끔 만든다.

**nextTick.js**
```
setImmediate(() => {
    console.log("immediate");
});

process.nextTick(() => {
    console.log("nextTick");
});

setTimeout(() => {
    console.log("timeout");
}, 0);

Promise.resolve().then(() => console.log("promise"));
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node nextTick
nextTick
promise
timeout
immediate
```

`process.nextTick`은 `setImmediate`나 `setTimeout`보다 먼저 실행된다. 코드 맨 밑에 `Promise`를 넣은 것은 `resolve`된 `Promise` 역시 `nextTick`처럼 다른 콜백들보다 우선시되기 때문이다. 그래서 `process.nextTick`과 `Promise`를 **마이크로태스크(microtask)** 라고 구분해서 부른다.

**마이크로태스크**를 재귀 호출하면 이벤트 루프가 다른 콜백 함수들보다 마이크로태스크를 우선해 처리하므로 콜백 함수들이 실행되지 않을 수도 있다. 이 점을 주의해야 한다.


#### 3.4.4.3 process.exit(code number)

실행 중인 노드 프로세스를 종료한다. 서버 환경에서 사용 시 서버가 멈추므로 특수한 경우를 제외하고는 서버에서 잘 사용하지 않는다. 그러나 서버 외의 독립적인 프로그램에서는 노드를 멈추게 하기 위해 사용한다.

**exit.js**
```
let i = 1;
setInterval(() => {
    if (i === 5) {
        console.log("종료!");
        process.exit();
    }

    console.log(i);
    i++;
}, 1000);
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node exit
1
2
3
4
종료!
```

`process.exit` 메소드는 인수로 코드 번호를 줄 수 있다. 인수를 주지 않거나 0을 주면 정상 종료, 1을 주면 비정상 종료를 의미한다. 에러가 발생해서 종료하는 경우엔 1을 넣으면 된다.


### 3.4.5 기타 내장 객체

`fetch`를 노드에서도 쓸 수 있게 됨에 따라 브라우저에 존재하던 객체들이 노드에서 동일하게 생성되었다. 따라서 브라우저의 코드를 일부 재사용할 수 있게 되었다.

- **URL, URLSearchParams**: 3.5.3절에서 다룬다.
- **AbortController, FormData, fetch, Headers, Request, Response, Event, EventTarget**: 브라우저에서 사용하던 API가 노드에도 동일하게 생성되었다.

- **TextDecoder**: Buffer를 문자열로 바꾼다.
- **TextEncoder**: 문자열을 Buffer로 바꾼다.
- **WebAssembly**: 웹어셈블리 처리를 담당한다.
- - -

## 3.5 노드 내장 모듈 사용하기

노드는 웹 브라우저에서 사용되는 자바스크립트보다 더 많은 기능을 제공한다. 이 절에서는 버전과 상관없이 안정적이고 유용한 기능을 가지면서도 자주 사용되는 모듈들을 위주로 설명한다.


### 3.5.1 os

`os` 모듈은 운영체제의 정보를 가져올 때 사용되는 모듈이다. 내장 모듈인 `os`를 불러오려면 `require("os")` 또는 `require("node:os")`를 입력하면 된다. `os`라는 파일이 따로 존재하는 것은 아니지만 노드가 알아서 내장 모듈임을 파악하고 불러온다.

**os.js**
```
const os = require('os');

console.log("운영체제 정보 - - -");
console.log(`os.arch(): ${os.arch()}`);
console.log(`os.platform(): ${os.platform()}`);
console.log(`os.type(): ${os.type()}`);
console.log(`os.uptime(): ${os.uptime()}`);
console.log(`os.hostname(): ${os.hostname()}`);
console.log(`os.release(): ${os.release()}`);

console.log(`경로 - - -`);
console.log(`os.homedir(): ${os.homedir()}`);
console.log(`os.tmpdir(): ${os.tmpdir()}`);

console.log("CPU 정보 - - -");
console.log(`os.cpus():`);
console.log(os.cpus());
console.log(`os.cpus().length: ${os.cpus().length}`);

console.log("메모리 정보 - - -");
console.log(`os.freemem(): ${os.freemem()}`);
console.log(`os.totalmem(): ${os.totalmem()}`);
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node os
운영체제 정보 - - -
os.arch(): x64
os.platform(): win32
os.type(): Windows_NT
os.uptime(): 331118.765
os.hostname(): YUSHIN-GRAM
os.release(): 10.0.22621
경로 - - -
os.homedir(): C:\Users\kys01
os.tmpdir(): C:\Users\kys01\AppData\Local\Temp
CPU 정보 - - -
os.cpus():
[
  {
    model: 'Intel(R) Core(TM) i7-1065G7 CPU @ 1.30GHz',
    speed: 1498,
    times: {
      user: 1446156,
      nice: 0,
      sys: 2350312,
      idle: 42053968,
      irq: 112828
    }
  },
  {
    model: 'Intel(R) Core(TM) i7-1065G7 CPU @ 1.30GHz',
    speed: 1498,
    times: { user: 711703, nice: 0, sys: 627265, idle: 44511281, irq: 12843 }
  },
  {
    model: 'Intel(R) Core(TM) i7-1065G7 CPU @ 1.30GHz',
    speed: 1498,
    times: { user: 1029093, nice: 0, sys: 888296, idle: 43932843, irq: 12718 }
  },
  {
    model: 'Intel(R) Core(TM) i7-1065G7 CPU @ 1.30GHz',
    speed: 1498,
    times: { user: 626312, nice: 0, sys: 520390, idle: 44703500, irq: 7171 }
  },
  {
    model: 'Intel(R) Core(TM) i7-1065G7 CPU @ 1.30GHz',
    speed: 1498,
    times: { user: 624468, nice: 0, sys: 934687, idle: 44291046, irq: 11812 }
  },
  {
    model: 'Intel(R) Core(TM) i7-1065G7 CPU @ 1.30GHz',
    speed: 1498,
    times: { user: 398437, nice: 0, sys: 354500, idle: 45097281, irq: 5515 }
  },
  {
    model: 'Intel(R) Core(TM) i7-1065G7 CPU @ 1.30GHz',
    speed: 1498,
    times: { user: 468468, nice: 0, sys: 459562, idle: 44922171, irq: 6984 }
  },
  {
    model: 'Intel(R) Core(TM) i7-1065G7 CPU @ 1.30GHz',
    speed: 1498,
    times: { user: 408703, nice: 0, sys: 361765, idle: 45079765, irq: 4359 }
  }
]
os.cpus().length: 8
메모리 정보 - - -
os.freemem(): 17308487680
os.totalmem(): 25465364480
```

- `os.arch()`: `process.arch`와 동일하다.
- `os.platform()`: `process.platform`과 동일하다.
- `os.type()`: 운영체제의 종류를 보여준다.
- `os.uptime()`: 운영체제 부팅 이후 흐른 시간을 보여준다. `process.uptime()`은 노드의 실행 시간이다.
- `os.hostname()`: 컴퓨터의 이름을 보여준다.
- `os.release()`: 운영체제의 버전을 보여준다.
- `os.homedir()`: 홈 디렉터리 경로를 보여준다.
- `os.tmpdir()`: 임시 파일 저장 경로를 보여준다.
- `os.cpus()`: CPU의 코어 정보를 보여준다.
- `os.freemem()`: 사용 가능한 메모리(RAM)를 보여준다.
- `os.totalmem()`: 전체 메모리 용량을 보여준다.

`os.cpus().length`로 CPU 코어의 개수를 확인할 수 있다. 그러나 노드에서 싱글 스레드 프로그래밍을 하면 코어가 몇 개이든 상관없이 대부분의 경우 코어를 하나만 사용한다.

예제에는 없지만, `os.constants`라는 객체도 존재한다. 이것은 각종 에러와 신호에 대한 정보를 담고 있으며 에러가 발생했을 때 `EADDRINUSE`, `ECONNRESET` 같은 에러 코드를 함께 보여준다. 이 종류가 매우 방대하기 때문에 예제에 담지 못했다.


### 3.5.2 path

`path`는 파일의 경로를 쉽게 조작할 수 있도록 도와주는 모듈이다. 운영체제별로 경로 구분자가 다르기 때문에 `path` 모듈이 필요하다. 경로 구분자는 크게 WINDOW 타입과 POSIX 타입으로 구분된다.

- **WINDOW**: `\`로 파일 경로를 구분한다.
- **POSIX**: `/`로 파일 경로를 구분한다.

**path.js**
```
const path = require("path");

const string = __filename;

console.log(`path.sep: ${path.sep}`);
console.log(`path.delimeter: ${path.delimiter}`);
console.log("- - -");

console.log(`path.dirname(): ${path.dirname(string)}`);
console.log(`path.extname(): ${path.extname(string)}`);
console.log(`path.basename(): ${path.basename(string)}`);
console.log(`path.basename - extname: ${path.basename(string, path.extname(string))}`);
console.log("- - -");

console.log("path.parse():");
console.log(path.parse(string));
console.log(`path.format(): ${path.format({
    dir: "D:/공부/Javascript/Study_Node.js/Codes/chapter03/js",
    name: "path",
    ext: ".js",
})}`);
console.log(`path.normalize(): ${path.normalize("D://공부\\\\Javascript//Study_Node.js\\\\Codes/chapter03\\js")}`);
console.log("- - -");

console.log(`path.isAbsolute(C:\\): ${path.isAbsolute("C:\\")}`);
console.log(`path.isAbsolute(./home): ${path.isAbsolute("./home")}`);
console.log("- - -");

console.log(`path.relative(): ${path.relative("D:/공부/Javascript/Study_Node.js/Codes/chapter03/js/path.js", "D:/")}`);
console.log(`path.join(): ${path.join(__dirname, '..', '..', '/users', '.', '/yushin')}`);
console.log(`path.resolve(): ${path.resolve(__dirname, '..', 'users', '.', '/yushin')}`);
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node path
path.sep: \
path.delimeter: ;
- - -
path.dirname(): D:\공부\Javascript\Study_Node.js\Codes\chapter03\js
path.extname(): .js
path.basename(): path.js
path.basename - extname: path
- - -
path.parse():
{
  root: 'D:\\',
  dir: 'D:\\공부\\Javascript\\Study_Node.js\\Codes\\chapter03\\js',
  base: 'path.js',
  ext: '.js',
  name: 'path'
}
path.format(): D:/공부/Javascript/Study_Node.js/Codes/chapter03/js\path.js
path.normalize(): D:\공부\Javascript\Study_Node.js\Codes\chapter03\js
- - -
path.isAbsolute(C:\): true
path.isAbsolute(./home): false
- - -
path.relative(): ..\..\..\..\..\..\..
path.join(): D:\공부\Javascript\Study_Node.js\Codes\users\yushin
path.resolve(): D:\yushin
```

- `path.sep`: 경로의 구분자이다. WINDOW는 `\`, POSIX는 `/`이다.
- `path.delimeter`: 환경 변수의 구분자이다. `process.env.PATH`를 입력하면 여러 개의 경로가 이 구분자로 구분되어 있다. WINDOW는 세미콜론(`;`)이고, POSIX는 콜론(`:`)이다.
- `path.dirname(path)`: 파일이 위치한 디렉터리 경로를 보여준다.
- `path.extname(path)`: 파일의 확장자를 보여준다.
- `path.basename(path, ext)`: 파일의 이름(확장자 포함)을 표시한다. 파일 이름만 표시하고 싶으면 두 번째 인수로 파일의 확장자를 넣으면 된다.
- `path.parse(path)`: 파일 경로를 **root**, **dir**, **base**, **ext**, **name**으로 분리한다.
- `path.format(object)`: `path.parse()`를 통해 얻은 객체를 파일 경로로 합친다.
- `path.normalize(path)`: `/`나 `\`를 실수로 여러 번 사용했거나 혼용했을 때 정상적인 경로로 반환한다.
- `path.isAbsolute(path)`: 파일의 경로가 절대경로인지 상대경로인지를 **true**나 **false**로 알려준다.
- `path.relative(base path, comparison path)`: 경로를 두 개 넣으면 첫 번째 경로에서 두 번째 경로로 가는 방법을 알려준다.
- `path.join(path, ...)`: 여러 인수를 넣으면 하나의 경로로 합친다. 상대경로인 ..(부모 디렉터리)과 .(현재 위치)도 알아서 처리한다.
- `path.resolve(path, ...)`: `path.join()`과 비슷하지만 차이가 있다.

**join과 resolve의 차이**
```
/ 를 만났을 때 path.resolve는 절대경로로 인식해서 앞의 경로를 무시하고, path.join은 상대경로로 처리한다.

path.join('/a', '/b', '/c');    /* result: /a/b/c/ */
path.resolve('/a', '/b', '/c'); /* result: /b/c */
```


### 3.5.3 url

`url`은 인터넷 주소를 쉽게 조작하도록 도와주는 모듈이다. url 처리에는 크게 WHATWG 방식과 예전부터 노드에서 사용하던 방식 두 가지가 있다. 그러나 현재는 WHATWG 방식만을 사용하므로 이에 초점을 맞춘다.

**url.js**
```
const url = require("url");

const { URL } = url;
const myURL = new URL("http://www.gilbut.co.kr/book/bookList.aspx?sercate1=001001000#anchor");

console.log("new URL():", myURL);
console.log("url.format():", url.format(myURL));
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node url
new URL(): URL {
  href: 'http://www.gilbut.co.kr/book/bookList.aspx?sercate1=001001000#anchor',
  origin: 'http://www.gilbut.co.kr',
  protocol: 'http:',
  username: '',
  password: '',
  host: 'www.gilbut.co.kr',
  hostname: 'www.gilbut.co.kr',
  port: '',
  pathname: '/book/bookList.aspx',
  search: '?sercate1=001001000',
  searchParams: URLSearchParams { 'sercate1' => '001001000' },
  hash: '#anchor'
}
url.format(): http://www.gilbut.co.kr/book/bookList.aspx?sercate1=001001000#anchor
```

`URL`은 노드 내장 객체이기도 해서 굳이 `require`할 필요는 없다. 이 생성자에 주소를 넣어 객체로 만들면 주소가 부분별로 정리되는데, 이 방식이 WHATWG의 url이다. username, password, origin, searchParams 속성이 존재한다.

- `url.format(object)`: 분해되었던 url 객체를 다시 원래 상태로 조립한다.

주소가 `host` 부분 없이 `pathname` 부분만 오는 경우(ex: /book/bookList.apsx), WHATWG 방식은 이러한 주소를 처리할 수 없다. 이럴 경우엔 `new URL("/book/bookList.apsx", "https://www.gilbut.co.kr")`처럼 두 번째 인수로 `host`를 주어야 한다.

`search` 부분(쿼리스트링)은 보통 주소를 통해 데이터를 전달할 때 사용된다. `search`는 물음표(`?`)로 시작하고, 그 뒤에 **key=value** 형식으로 데이터를 전달한다. 여러 키가 있을 경우엔 `&`로 구분한다. `search` 부분을 다루기 위해 `searchParams`라는 특수한 객체가 생성된다.

**http://www.gilbut.co.kr/?page=3&limit=10&category=nodejs&category=javascript**와 같은 주소에서는 **?page=3&limit=10&category=nodejs&category=javascript** 부분이 `search`이다.

다음과 같은 예제를 통해 `searchParams`에 대해 알아본다.

**searchParams.js**
```
const myURL = new URL("http://www.gilbut.co.kr/?page=3&limit=10&category=nodejs&category=javascript");

console.log("searchParams:", myURL.searchParams);
console.log("searchParams.getAll():", myURL.searchParams.getAll("category"));
console.log("searchParams.get():", myURL.searchParams.get("limit"));
console.log("searchParams.has():", myURL.searchParams.has("page"));

console.log("searchParams.keys():", myURL.searchParams.keys());
console.log("searchParams.values():", myURL.searchParams.values());

myURL.searchParams.append("filter", "es3");
myURL.searchParams.append("filter", "es5");
console.log(myURL.searchParams.getAll("filter"));

myURL.searchParams.set("filter", "es6");
console.log(myURL.searchParams.getAll("filter"));

myURL.searchParams.delete("filter");
console.log(myURL.searchParams.getAll("filter"));

console.log("searchParams.toString():", myURL.searchParams.toString());
myURL.search = myURL.searchParams.toString();
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node searchParams
searchParams: URLSearchParams {
  'page' => '3',
  'limit' => '10',
  'category' => 'nodejs',
  'category' => 'javascript' }
searchParams.getAll(): [ 'nodejs', 'javascript' ]
searchParams.get(): 10
searchParams.has(): true
searchParams.keys(): URLSearchParams Iterator { 'page', 'limit', 'category', 'category' }
searchParams.values(): URLSearchParams Iterator { '3', '10', 'nodejs', 'javascript' }
[ 'es3', 'es5' ]
[ 'es6' ]
[]
searchParams.toString(): page=3&limit=10&category=nodejs&category=javascript
```

`URL`과 `URLSearchParams` 모두 노드 내장 객체이므로 이번 예제에서는 `require("url")`을 생략하였다. `URL` 생성자를 통해 `myURL`이라는 주소 객체를 만들었다. `myURL` 안에는 `searchParams` 객체가 있으며, 이 객체는 `search` 부분을 조작하는 다양한 메소드를 지원한다. `myURL.searchParams` 대신 `new URLSearchParams(myURL.search)`로도 같은 결과를 얻을 수 있다.

- `getAll(key)`: 키에 해당하는 모든 값을 가져온다.
- `get(key)`: 키에 해당하는 첫 번째 값만 가져온다.
- `has(key)`: 해당 키가 존재하는지 검사한다.
- `keys()`: `searchParams`의 모든 키를 **반복자(iterator)**(ES2015 문법) 객체로 가져온다.
- `values()`: `searchParams`의 모든 값을 **반복자(iterator)** 객체로 가져온다.
- `append(key, value)`: 해당 키에 대한 값을 추가한다. 같은 키의 값이 있다면 유지하고 값을 하나 더 추가한다.
- `set(key, value)`: `append`와 비슷하지만 같은 키의 값들을 모두 지우고 새로 추가한다.
- `delete(key)`: 해당 키를 제거한다.
- `toString()`: 조작한 `searchParams` 객체를 다시 문자열로 만든다. 이 문자열을 `search`에 대입하면 `searchParams`의 변경 사항이 주소 객체에 반영된다.


### 3.5.4 dns

`dns`는 주로 도메인을 통해 IP나 기타 DNS 정보를 얻고자 할 때 사용한다.

**dns.mjs**
```
import dns from "dns/promises";

const ip = await dns.lookup("gilbut.co.kr");
console.log("IP:", ip);

const a = await dns.resolve("gilbut.co.kr", "A");
console.log("A:", a);

const mx = await dns.resolve("gilbut.co.kr", "MX");
console.log("MX:", mx);

const cname = await dns.resolve("www.gilbut.co.kr", "CNAME");
console.log("CNAME:", cname);

const any = await dns.resolve("gilbut.co.kr", "ANY");
console.log("ANY:", any);
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\mjs> node dns.mjs
IP: { address: '49.236.151.220', family: 4 }
A: [ '49.236.151.220' ]
MX: [
  { exchange: 'alt2.aspmx.l.google.com', priority: 5 },
  { exchange: 'aspmx2.googlemail.com', priority: 10 },
  { exchange: 'aspmx.l.google.com', priority: 1 },
  { exchange: 'alt1.aspmx.l.google.com', priority: 5 },
  { exchange: 'aspmx3.googlemail.com', priority: 10 }
]
CNAME: [ 'slb-1088813.ncloudslb.com' ]
ANY: [
  { value: 'ns1-2.ns-ncloud.com', type: 'NS' },
  { value: 'ns1-1.ns-ncloud.com', type: 'NS' },
  {
    nsname: 'ns1-1.ns-ncloud.com',
    hostmaster: 'ns1-2.ns-ncloud.com',
    serial: 67,
    refresh: 21600,
    retry: 1800,
    expire: 1209600,
    minttl: 300,
    type: 'SOA'
  }
]
```

ip 주소는 간단하게 `dns.lookup`이나 `dns.resolve(domain)`으로 얻을 수 있다. A(ipv4 주소), AAAA(ipv6 주소), NS(네임서버), SOA(도메인 정보), CNAME(별칭, 주로 www가 붙은 주소는 별칭인 경우가 많다), MX(메일 서버) 등은 **레코드**라고 부른다. 레코드에 대한 정보는 `dns.resolve(domain, record)`로 조회할 수 있다.


### 3.5.5 crypto

`crypto`는 암호화를 도와주는 모듈이다. 몇 가지 메소드는 실제 서비스에도 적용할 수 있어 유용하다. 고객의 비밀번호와 같이 중요한 정보에 대한 안전 장치를 이중으로 만들 때 쓰인다.

#### 3.5.5.1 단방향 암호화

**단방향 암호화**는 복호화할 수 없는 암호화 방식을 뜻한다. 비밀번호는 보통 단방향 암호화를 통해 암호화되는데 복호화할 수 없으므로 암호화라고 표현하는 대신 **해시 함수**라고 부르기도 한다. 비밀번호의 경우 고객이 입력한 값을 해시 함수에 통과시킨 것이 데이터베이스에 저장되어 있는 암호화된 값과 같은지만 비교하면 되므로 별도의 복호화 과정이 필요하지 않다. 단방향 암호화는 이처럼 복호화가 굳이 필요하지 않은 상황에 사용된다.

단방향 암호화 알고리즘은 주로 **해시 기법**을 사용한다. 해시 기법이란 어떤 문자열을 **고정된 길이**의 다른 문자열로 바꿔버리는 방식이다. 즉, 입력 문자열의 길이가 abc, abcd, abcde, ... 등으로 다르더라도 그 출력 문자열의 길이는 고정되어 있다.

**hash.js**
```
const crypto = require("crypto");

console.log("base64:", crypto.createHash("sha512").update("비밀번호").digest("base64"));
console.log("hex:", crypto.createHash("sha512").update("비밀번호").digest("hex"));
console.log("base64:", crypto.createHash("sha512").update("또 다른 비밀번호").digest("base64"));
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node hash
base64: dvfV6nyLRRt3NxKSlTHOkkEGgqW2HRtfu19Ou/psUXvwlebbXCboxIPmDYOFRIpqav2eUTBFuHaZri5x+usy1g==
hex: 76f7d5ea7c8b451b773712929531ce92410682a5b61d1b5fbb5f4ebbfa6c517bf095e6db5c26e8c483e60d8385448a6a6afd9e513045b87699ae2e71faeb32d6
base64: PlvUgVU0++e6OYLQsSyCwkjCy+yO6Gp0hNA27ohTxJVmoFpKvVLL/SYAR0KNurCUvTtGwfbctoJtCvrrufykgg==
```

- `createHash(algorithm)`: 사용할 해시 알고리즘을 넣는다. **md5, sha1, sha256, sha512** 등이 가능하지만, **md5**와 **sha1**은 이미 취약점이 발견되었다. 현재는 **sha512** 정도로 충분하지만 나중에 **sha512**마저도 취약해지면 더 강화된 알고리즘을 사용해야 한다.
- `update(string)`: 암호화할 문자열을 넣는다.
- `digest(encoding)`: 인코딩 알고리즘을 넣는다. **base64, hex, latin1**이 주로 사용되는데, **base64**가 결과 문자열이 가장 짧기 때문에 애용된다. 암호화된 문자열을 반환한다.

가끔 두 문자열이 똑같은 해시 값으로 변환되는 경우가 있다. 이런 상황을 **충돌**이 발생했다고 표현한다. 해킹용 컴퓨터의 역할은 어떤 문자열이 서로 충돌하는지 밝혀내는 것이다. 보안이 취약해진 알고리즘들은 해킹용 컴퓨터가 충돌 가능성을 밝혀낸 것들이며, 현재는 **sha512**가 안전하다고 평가받고 있지만 나중에 보안이 취약해질 경우엔 **sha3**으로 대체할 수 있다.

현재는 주로 **pbkdf2, bcrypt, scrypt**라는 알고리즘으로 비밀번호를 암호화하고 있다. 그중 노드에서는 **pbkdf2**를 지원하는데, 이는 간단히 말해 기존 문자열에 **salt**라고 불리는 문자열을 붙인 후 해시 알고리즘을 반복해서 적용하는 것이다.

**pbkdf2.js**
```
const crypto = require("crypto");

crypto.randomBytes(64, (err, buf) => {
    const salt = buf.toString("base64");
    console.log("salt:", salt);

    crypto.pbkdf2("비밀번호", salt, 100000, 64, "sha512", (err, key) => {
        console.log("password:", key.toString("base64"));
    });
});
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node pbkdf2.js
salt: BT/9uXY1T33lAsPFLQLrOoKOVurdgDIaMY9ZUTH9k+/x1PDw/w0XBRsJ4b+LdhjnOJjFdVsqz8WVlWNIXEW7mQ==
password: +DuVJFvLOyC0JNEqWNApuxqJbx9DFPkt8nFPa4X//TRjTpgOTn6Pa5swOM+cqEky01e1ncxOZXS6WxFklIRZtg==
```

**pbkdf2** 알고리즘의 구체적인 작동 과정은 다음과 같다.

1. `randomBytes()` 메소드로 64바이트 길이의 문자열을 만든다. 이것이 `salt`가 된다.
2. `pbkdf2()` 메소드에는 순서대로 **비밀번호, salt, 반복 횟수, 출력 바이트 길이, 해시 알고리즘**을 인수로 넣는다.

예시에서는 10만 회 반복하게 설정하였는데, 즉 **sha512** 알고리즘을 10만 회 반복 적용하여 결과를 내는 것이다. 이 작업은 1초 정도가 소요되는데 `crypto.randomBytes`와 `crypto.pbkdf2` 메소드는 내부적으로 스레드 풀을 사용해 멀티 스레딩으로 동작하기 때문에 논블로킹 방식으로 동작한다.

`pbkdf2` 방식은 간단하지만 `bcrypt`나 `scrypt`보다 취약하므로 더 나은 보안이 필요한 경우엔 다른 둘을 사용할 수 있다.


#### 3.5.5.2 양방향 암호화

**양방향 대칭형 암호화**는 암호화된 문자열을 복호화할 수 있으며, 키(열쇠)라는 것이 사용된다. 대칭형 암호화에서는 암호화와 복호화 시 같은 키를 사용해야 한다.

**cipher.js**
```
const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const key = "abcdefghijklmnopqrstuvwxyz123456";
const iv = "1234567890123456";

const cipher = crypto.createCipheriv(algorithm, key, iv);
let result = cipher.update("암호화할 문장", "utf8", "base64");
result += cipher.final("base64");
console.log("암호화:", result);

const decipher = crypto.createDecipheriv(algorithm, key, iv);
let result2 = decipher.update(result, "base64", "utf8");
result2 += decipher.final("utf8");
console.log("복호화:", result2);
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node cipher
암호화: iiopeG2GsYlk6ccoBoFvEH2EBDMWv1kK9bNuDjYxiN0=
복호화: 암호화할 문장
```

- `crypto.createCipheriv(algorithm, key, iv)`: 암호화 알고리즘과 키, 초기화 벡터를 넣는다. 암호화 알고리즘은 **aes-256-cbc**를 사용했지만 다른 알고리즘을 사용할 수 있다. **aes-256-cbc** 알고리즘의 경우 키는 32바이트여야 하고, 초기화 벡터는 16바이트여야 한다. 초기화 벡터는 어떤 평문이 암호화 시 매번 동일한 결과를 산출하는 것을 방지하기 위해 임의로 생성되어 암호화에 사용된다. 사용 가능한 알고리즘 목록은 `crypto.getCiphers()`를 호출하여 확인할 수 있다.
- `cipher.update(string, input encoding, output encoding)`: 암호화할 대상과 그 대상의 인코딩 방식, 암호화된 데이터의 인코딩 방식을 인수로 전달한다. 보통 문자열은 utf8 인코딩을, 암호는 base64 인코딩을 많이 사용한다.
- `cipher.final(output encoding)`: 암호화 결과물의 인코딩을 넣으면 암호화가 완료된다.
- `crypto.createDecipheriv(algorithm, key, iv)`: 복호화할 때 사용한다. 암호화할 때 사용했던 인수들을 똑같이 넣어야 한다.
- `decipher.update(string, input encoding, output encoding)`: 암호화된 문장, 그 문장의 인코딩 방식, 복호화할 데이터의 인코딩 방식을 인수로 전달한다. `createCipheriv`의 `update()`에서 **utf8, base64** 순으로 넣었다면 `createDecipheriv`의 `update()`에서는 **base64, utf8** 순으로 넣으면 된다.
- `decipher.final(output encoding)`: 복호화 결과물의 인코딩을 넣으면 복호화가 완료된다.

지금까지 알아본 방식 외에도 `crypto` 모듈은 **양방향 비대칭형 암호화, HMAC** 등의 다양한 암호화 방식을 제공하고 있다.


### 3.5.6 util

`util`은 각종 편의 기능을 모아둔 모듈이다. 계속해서 API가 추가되고 있다.

**util.js**
```
const util = require("util");
const crypto = require("crypto");

const dontUseMe = util.deprecate((x, y) => {
    console.log(x + y);
}, "dontUseMe 함수는 deprecated 되었으니 더 이상 사용하지 마세요.");

dontUseMe(1, 2);

const randomBytesPromise = util.promisify(crypto.randomBytes);
randomBytesPromise(64)
    .then((buf) => {
        console.log(buf.toString("base64"));
    })
    .catch((error) => {
        console.error(error);
    });
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node util
3
(node:14748) DeprecationWarning: dontUseMe 함수는 deprecated 되었으니 더 이상 사용하지 마세요.
(Use `node --trace-deprecation ...` to show where the warning was created)
N90DzUtNKGI31j1gOjGAgPAfkT+5T0Fa5p6D7GPolqo82Kr9B5xJvn7f//rD2nJpFOQV2ywS3vtBk4UY8tvNLQ==
```

- `util.deprecate`: 함수가 deprecated 처리되었음을 알린다. 첫 번째 인수로 전달한 함수를 사용하면 경고 메시지가 출력된다. 두 번째 인수로는 경고 메시지의 내용을 전달한다. 함수가 조만간 사라지거나 변경될 예정일 때 이를 알릴 수 있어 유용하다.
- `util.promisify`: 콜백 패턴을 프로미스 패턴으로 바꾼다. 바꿀 함수를 인수로 전달하면 된다. 이렇게 바뀐 함수는 async/await 패턴까지 적용할 수 있다. 반대로 프로미스를 콜백으로 바꾸는 `util.callbackify`도 존재한다.


### 3.5.7 worker_threads

`worker_threads` 모듈을 사용하면 노드에서 멀티 스레드 방식으로 작업을 진행할 수 있다.

먼저 간단한 예제를 살펴본다.

**worker_threads.js**
```
const {
    Worker, isMainThread, parentPort,
} = require("worker_threads");

if (isMainThread) {     // 메인 스레드인 경우
    const worker = new Worker(__filename);
    worker.on("message", message => console.log("from worker:", message));
    worker.on("exit", () => console.log("worker exit"));
    worker.postMessage("ping");
} else {                // 워커 스레드인 경우
    parentPort.on("message", (value) => {
        console.log("from parent:", value);
        parentPort.postMessage("pong");
        parentPort.close();
    });
}
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node worker_threads
from parent: ping
from worker: pong
worker exit
```

`isMainThread`를 통해 현재 코드가 메인 스레드(기존에 동작하던 싱글 스레드)에서 실행되는지, 아니면 사용자가 생성한 워커 스레드에서 실행되는지 구분할 수 있다. 메인 스레드에서는 `new Worker`를 통해 현재 파일(__filename)을 워커 스레드에서 실행한다. 워커 스레드의 `isMainThread` 값은 false이므로 현재 코드에서 else 부분만 실행된다.

메인 스레드에서는 워커 스레드 생성 후 `worker.postMessage`로 워커 스레드에 데이터를 보낼 수 있다. 워커 스레드는 `parentPort.on("message")` 이벤트 리스너로 메인 스레드로부터 메시지를 받고, `parentPort.postMessage`로 메인 스레드에게 메시지를 보낸다. 메인 스레드는 `worker.on("message")`로 메시지를 받는다. 이때 메시지를 한 번만 받고 싶으면 `once("message")`를 사용하면 된다.

워커 스레드에서 `on` 메소드를 사용할 때는 직접 워커 스레드를 종료해야 한다는 점을 주의해야 한다. `parentPort.close()`를 사용하면 메인 스레드와의 연결이 종료된다. 종료될 때는 `worker.on("exit")`이 실행된다.

다음으로는 여러 개의 워커 스레드에 데이터를 전송하는 예제를 살펴본다.

**worker_data.js**
```
const {
    Worker, isMainThread, parentPort, workerData,
} = require("worker_threads");

if (isMainThread) {     // 메인 스레드일 때
    const threads = new Set();
    
    threads.add(new Worker(__filename, {
        workerData: { start: 1 },
    }));

    threads.add(new Worker(__filename, {
        workerData: { start: 2 },
    }));

    for (let worker of threads) {
        worker.on("message", message => console.log("from worker:", message));
        worker.on("exit", () => {
            threads.delete(worker);
            
            if (threads.size === 0) {
                console.log("job done");
            }
        });
    }
} else {                // 워커 스레드일 때
    const data = workerData;
    parentPort.postMessage(data.start + 100);
}
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node worker_data
from worker: 101
from worker: 102
job done
```

`new Worker`를 호출할 때 두 번째 인수의 `workerData` 속성으로 원하는 데이터를 보낼 수 있다. 워커 스레드에서는 `workerData`로 데이터를 전달받는다. 이 예제에서는 두 개의 워커 스레드가 돌아가고 있으며, 부모로부터 숫자를 받아서 100을 더해 돌려준다. 돌려주는 순간 워커 스레드가 종료되어 `worker.on("exit")`이 실행된다. 워커 스레드 두 개가 모두 종료되면 **job done**이 로깅된다.

다음으로는 조금 더 실전적인 예제로, 소수의 개수를 구하는 작업을 워커 스레드를 사용하지 않을 때와 사용할 때로 나누어 구현해 본다.

먼저 워커 스레드를 사용하지 않은 예제는 다음과 같다.

**prime.js**
```
const min = 2;
const max = 10000000;
const primes = [];

function findPrimes(start, range) {
    let isPrime = true;
    const end = start + range;

    for (let i = start; i < end; i++) {
        for (let j = min; j < Math.sqrt(end); j++) {
            if (i !== j && i % j === 0) {
                isPrime = false;
                break;
            }
        }

        if (isPrime) {
            primes.push(i);
        }

        isPrime = true;
    }
}

console.time("prime");
findPrimes(min, max);
console.timeEnd("prime");
console.log(primes.length);
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node prime
prime: 4.225s
664579
```

다음은 워커 스레드를 사용해 여러 스레드가 문제를 나눠서 풀도록 하는 예제이다.

**prime-worker.js**
```
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");

const min = 2;
let primes = [];

function findPrimes(start, range) {
    let isPrime = true;
    const end = start + range;

    for (let i = start; i < end; i++) {
        for (let j = min; j < Math.sqrt(end); j++) {
            if (i !== j && i % j === 0) {
                isPrime = false;
                break;
            }
        }

        if (isPrime) {
            primes.push(i);
        }

        isPrime = true;
    }
}

if (isMainThread) {
    const max = 10000000;
    const threadCount = 8;
    const threads = new Set();
    const range = Math.floor((max - min) / threadCount);
    let start = min;
    
    console.time("prime");
    for (let i = 0; i < threadCount - 1; i++) {
        const wStart = start;
        threads.add(new Worker(__filename, { workerData: { start: wStart, range }}));
        start += range;
    }
    threads.add(new Worker(__filename , { workerData: { start, range: max - start }}));

    for (let worker of threads) {
        worker.on("error", (err) => {
            throw err;
        });

        worker.on("exit", () => {
            threads.delete(worker);
            
            if (threads.size === 0) {
                console.timeEnd("prime");
                console.log(primes.length);
            }
        });

        worker.on("message", (msg) => {
            primes = primes.concat(msg);
        });
    }
} else {
    findPrimes(workerData.start, workerData.range);
    parentPort.postMessage(primes);
}
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node prime-worker
prime: 1.147s
664579
```

여덟 개의 스레드가 일을 나누어 처리하도록 하니 실행 시간이 약 4배 정도 단축되었다. 코드가 복잡한 것을 보면 알 수 있듯이, 멀티 스레딩을 할 때는 일을 나누는 것이 가장 어렵다.


### 3.5.8 child_process

`child_process`는 노드에서 다른 프로그램을 실행하고 싶거나 명령어를 수행하고 싶을 때 사용하는 모듈이다. 이 모듈을 통해 다른 언어로 작성된 코드를 실행하고 결과를 얻을 수도 있다.

먼저 프롬프트 명령어인 `dir`을 `child_process`를 통해 실행하는 예제이다.

**exec.js**
```
const exec = require("child_process").exec;

const process = exec("dir");

process.stdout.on("data", data => {
    console.log(data.toString());
});

process.stderr.on("data", (data) => {
    console.error(data.toString());
})
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node exec
 D ����̺��� ����: �� ����
 ���� �Ϸ� ��ȣ: 74AC-A98F


 D:\����\Javascript\Study_Node.js\Codes\chapter03\js ���͸�

2023-09-25  ���� 07:56    <DIR>          .
2023-09-22  ���� 05:26    <DIR>          ..
2023-09-25  ���� 02:34               548 cipher.js
2023-09-23  ���� 04:38               863 console.js
2023-09-22  ���� 02:43                84 dep-run.js
2023-09-22  ���� 02:42               137 dep1.js
2023-09-22  ���� 02:43               137 dep2.js
2023-09-25  ���� 08:02               236 exec.js
2023-09-23  ���� 05:40               160 exit.js
2023-09-22  ���� 05:23                49 filename.js
2023-09-23  ���� 04:27                38 globalA.js
2023-09-23  ���� 04:28                89 globalB.js
2023-09-25  ���� 02:09               322 hash.js
2023-09-22  ���� 02:04               155 helloWorld.js
2023-09-23  ���� 05:33               235 nextTick.js
2023-09-24  ���� 12:48               748 os.js
2023-09-24  ���� 01:17             1,297 path.js
2023-09-25  ���� 02:23               304 pbkdf2.js
2023-09-25  ���� 07:51             1,618 prime-worker.js
2023-09-25  ���� 07:23               585 prime.js
2023-09-24  ���� 01:50               960 searchParams.js
2023-09-22  ���� 02:29               206 this.js
2023-09-23  ���� 04:54               573 timer.js
2023-09-24  ���� 01:36               234 url.js
2023-09-25  ���� 05:14               475 util.js
2023-09-25  ���� 05:39               809 worker_data.js
2023-09-25  ���� 05:22               571 worker_threads.js
              25�� ����              11,433 ����Ʈ
               2�� ���͸�  200,445,661,184 ����Ʈ ����
```

`exec`의 첫 번째 인수로 명령어를 전달한다. 결과는 `stdout(표준출력)` 또는 `stderr(표준에러)`에 붙여둔 data 이벤트 리스너에 버퍼 형태로 전달된다. 성공적인 결과는 표준출력에, 실패한 결과는 표준에러에 전달된다.

다음은 파이썬 프로그램을 실행하는 예제 코드이다.

**test.py**
```
print("hello world");
```

**spawn.js**
```
const spawn = require("child_process").spawn;

const process = spawn("python", ["../test.py"]);

process.stdout.on("data", (data) => {
    console.log(data.toString());
});

process.stderr.on("data", (data) => {
    console.error(data.toString());
});
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node spawn
hello world

```

위 코드는 그저 파이썬 코드의 실행 명령어인 **python ../test.py**를 노드의 `spawn`을 통해 실행한 것뿐이다. `spawn`의 첫 번째 인수로는 명령어를, 두 번째 인수로는 옵션 배열을 전달하면 된다. 결과는 `exec`와 동일하게 `stdout` 또는 `stderr`로 전달된다.

`exec`와 `spawn`를 통해 결과를 받는 과정은 비슷하다. 그러나 `exec`는 셸을 실행해서 명령어를 수행하고, `spawn`은 새로운 프로세스를 생성하여 명령어를 실행한다. `spawn`에서도 세 번째 인수로 `{ shell: true }`를 전달하면 `exec`처럼 셸을 실행해서 명령어를 수행한다. 셸 실행 여부에 따라 수행할 수 있는 명령어에 차이가 있다.


### 3.5.9 기타 모듈들

이 서적에서 소개되지 않은 다양한 모듈들의 용례를 간단히 설명한다.

- `async_hooks`: 비동기 코드의 흐름을 추적할 수 있는 실험적인 모듈이다.
- `dgram`: UDP와 관련된 작업을 할 때 유용하다.
- `net`: HTTP보다 로우 레벨인 TCP나 IPC 통신을 할 때 유용하다.
- `perf_hooks`: 성능 측정을 할 때 `console.time`보다 정교하게 측정한다.
- `querystring`: `URLSearchParams`가 나오기 전에 쿼리스트링을 다루기 위해 사용했던 모듈이다. 요즘은 `URLSearchParams`의 사용이 권장된다.
- `string_decoder`: 버퍼 데이터를 문자열로 바꾸는 데 사용한다.
- `tls`: TLS와 SSL에 관련된 작업을 할 때 사용한다.
- `tty`: 터미널과 관련된 작업을 할 때 사용한다.
- `v8`: v8 엔진에 직접 접근할 때 사용한다.
- `vm`: 가상 머신에 직접 접근할 때 사용한다.
- `wasi`: 웹어셈블리를 실행할 때 사용하는 실험적인 모듈이다.
- - -


## 3.6 파일 시스템 접근하기

`fs` 모듈은 파일 시스템에 접근하는 모듈이다. 파일을 생성, 삭제, 읽기, 쓰기 할 수 있으며, 디렉터리도 생성, 삭제 할 수 있다.

**readme.txt**
```
저를 읽어주세요.
```

**readFile.js**
```
const fs = require("fs");

fs.readFile("../readme.txt", (err, data) => {
    if (err) {
        throw err;
    }

    console.log(data);
    console.log(data.toString());
});
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node readFile
<Buffer ec a0 80 eb a5 bc 20 ec 9d bd ec 96 b4 ec a3 bc ec 84 b8 ec 9a 94 2e>
저를 읽어주세요.
```

`fs` 모듈을 불러온 뒤 읽을 파일의 경로를 지정한다. 이때, 파일의 경로가 현재 파일 기준이 아니라 node 명령어를 실행하는 **콘솔 기준**이라는 점에 유의해야 한다. 만약, 예제 코드를 실행하는 위치가 **D:/공부**라면, **D:/readme.txt**를 찾을 것이다.

파일을 읽은 후 실행될 콜백 함수도 `readFile`의 두 번째 인수로 함께 전달한다. 이 콜백 함수는 매개변수로 에러 또는 데이터를 전달받는다.

결과를 보면 알 수 있듯이, 기본적으로 `readFile`을 통해 전달받은 데이터 자체는 `버퍼(buffer)`라는 형식을 갖고 있다. 따라서 `toString`을 사용해 문자열로 변환해야 사람이 읽을 수 있다.

`fs`는 기본적으로 **콜백** 형식의 모듈이므로 실무에서 사용하기가 불편하다. 따라서 다음과 같이 **프로미스** 형식으로 바꾸어 주는 작업이 필요하다.

**readFilePromise.js**
```
const fs = require("fs").promises;

fs.readFile("../readme.txt")
    .then((data) => {
        console.log(data);
        console.log(data.toString());
    })
    .catch((err) => {
        console.error(err);
    });
```

`fs` 모듈에서 `promises` 속성을 불러오면 프로미스 기반의 `fs` 모듈을 사용할 수 있다.

이번에는 파일을 생성하는 예제를 살펴본다.

**writeFile.js**
```
const fs = require("fs").promises;

fs.writeFile("../writeme.txt", "글이 입력됩니다.")
    .then(() => {
        return fs.readFile("../writeme.txt");
    })
    .then((data) => {
        console.log(data.toString());
    })
    .catch((err) => {
        throw err;
    })
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node writeFile
글이 입력됩니다.
```

`writeFile` 메소드에 생성될 파일의 경로와 내용을 입력한다. 서적의 예제 코드는 콜백 형식을 사용하고 있지만, 임의로 프로미스 형식의 코드를 작성하였다.


### 3.6.1 동기 메소드와 비동기 메소드

`setTimeout` 같은 타이머와 `process.nextTick` 외에도 노드는 대부분의 메소드를 **비동기 방식**으로 처리한다. 하지만 몇몇 메소드는 **동기 방식**으로도 사용할 수 있다. 특히 `fs` 모듈이 그러한 메소드를 많이 갖고 있다. 지금부터는 어떤 메소드가 동기 또는 비동기 방식으로 동작하고, 언제 어떤 메소드를 사용하는 것이 적절한지 살펴본다.

먼저 파일 하나를 여러 번 읽는 예제를 살펴본다.

**readme2.txt**
```
저를 여러 번 읽어보세요.
```

**async.js**
```
const fs = require("fs").promises;

console.log("시작");

fs.readFile("../readme2.txt")
    .then((data) => {
        console.log("1번", data.toString());
    })
    .catch((err) => {
        throw err;
    });

fs.readFile("../readme2.txt")
    .then((data) => {
        console.log("2번", data.toString());
    })
    .catch((err) => {
        throw err;
    });

fs.readFile("../readme2.txt")
    .then((data) => {
        console.log("3번", data.toString());
    })
    .catch((err) => {
        throw err;
    });

console.log("끝");
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node async
시작
끝
1번 저를 여러 번 읽어보세요.
2번 저를 여러 번 읽어보세요.
3번 저를 여러 번 읽어보세요.
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node async
시작
끝
1번 저를 여러 번 읽어보세요.
3번 저를 여러 번 읽어보세요.
2번 저를 여러 번 읽어보세요.
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node async
시작
끝
1번 저를 여러 번 읽어보세요.
2번 저를 여러 번 읽어보세요.
3번 저를 여러 번 읽어보세요.
...
```

반복 실행할 때마다 결과가 달라진다. 출력되는 값들 중 **시작**, **끝**을 제외하고는 순서가 임의적이다. `비동기 메소드`들은 백그라운드에 해당 파일을 읽으라고만 요청하고 다음 작업으로 넘어간다. 따라서 요청만 세 번을 보내고 `console.log("끝")`을 실행하는 것이다. 나중에 읽기가 완료되면 백그라운드가 메인 스레드에 알리고, 메인 스레드는 그때 프로미스의 resolve 동작을 실행한다.

수백 개의 I/O 요청이 들어와도 메인 스레드는 백그라운드에 처리를 위임할 수 있기 때문에 이 방식은 상당히 효율적이다. 백그라운드에서는 위임된 요청들을 거의 동시에 실행한다.

**동기와 비동기, 블로킹과 논블로킹**이라는 네 개의 용어가 노드에서 혼용되고 있는데, 이들은 의미상의 차이가 있다.

- **동기와 비동기**: 백그라운드 작업 완료 확인 여부
- **블로킹과 논블로킹**: 함수가 바로 return 되는지의 여부

노드에서는 **동기-블로킹** 방식과 **비동기-논블로킹** 방식이 대부분이다. **동기-논블로킹**이나 **비동기-블로킹**은 없다고 봐도 무방하다.

**동기-블로킹** 방식에서는 백그라운드 작업 완료 여부를 계속해서 확인하며, 호출한 함수는 백그라운드 작업이 완료되어야 return 한다. **비동기-논블로킹** 방식에서는 호출한 함수가 바로 return 되어 다음 작업으로 넘어가고, 백그라운드 작업 완료 여부는 신경쓰지 않고 있다가 나중에 백그라운드가 알림을 주어야 처리한다.

만약 요청을 순서대로 처리하고 싶다면 다음과 같은 메소드를 사용할 수도 있다.

**sync.js**
```
const fs = require("fs");

console.log("시작");

let data = fs.readFileSync("../readme2.txt");
console.log("1번", data.toString());

data = fs.readFileSync("../readme2.txt");
console.log("2번", data.toString());

data = fs.readFileSync("../readme2.txt");
console.log("3번", data.toString());

console.log("끝");
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node sync
시작
1번 저를 여러 번 읽어보세요.
2번 저를 여러 번 읽어보세요.
3번 저를 여러 번 읽어보세요.
끝
```

동기 방식을 이용할 경우 코드의 모양이 많이 바뀐다. `readFile` 대신 `readFileSync`라는 메소드를 사용하고, 콜백 방식을 사용하는 대신 직접 return 값을 받아온다. 그 값을 다음 줄부터 바로 사용할 수 있다는 것은 요청을 보낸 후 결과를 기다린다는 의미이다.

`readFileSync` 또는 `writeFileSync` 등의 메소드를 사용하면 요청이 수백 개 이상 들어올 때 성능에 문제가 생긴다. `Sync` 메소드를 사용할 때는 이전 작업이 완료되어야 다음 작업을 진행할 수 있기 때문에 메인 스레드의 가동률이 떨어진다. 백그라운드는 원래 `fs` 작업을 동시에 처리할 수도 있는데, `Sync` 메소드를 사용하면 백그라운드도 동시 처리가 불가능하게 된다.

동기 메소드는 위와 같은 단점 때문에 프로그램 실행 시 초기화 용도로만 사용하는 것이 권장된다. 대부분의 경우 비동기 메소드가 훨씬 효율적이다.

다음은 비동기 방식을 사용하면서도 출력의 순서를 보장하는 예제이다.

**asyncOrder.js(콜백 형식)**
```
const fs = require("fs");

console.log("시작");
fs.readFile("../readme2.txt", (err, data) => {
    if (err) {
        throw err;
    }

    console.log("1번", data.toString());

    fs.readFile("../readme2.txt", (err, data) => {
        if (err) {
            throw err;
        }

        console.log("2번", data.toString());

        fs.readFile("../readme2.txt", (err, data) => {
            if (err) {
                throw err;
            }

            console.log("3번", data.toString());
            console.log("끝");
        });
    });
});
```

이전 `readFile`의 콜백에 다음 `readFile`을 넣는 방식이다. **콜백 지옥** 현상이 발생하지만 순서가 어긋나진 않는다.

**asyncOrderPromise.js(프로미스 형식)**
```
const fs = require("fs").promises;

console.log("시작");

fs.readFile("../readme2.txt")
    .then((data) => {
        console.log("1번", data.toString());
        return fs.readFile("../readme2.txt");
    })
    .then((data) => {
        console.log("2번", data.toString());
        return fs.readFile("../readme2.txt");
    })
    .then((data) => {
        console.log("3번", data.toString());
        console.log("끝");
    })
    .catch((err) => {
        console.error(err);
    });
```

콜백 지옥은 Promise나 async/await으로 어느 정도 해결할 수 있다.

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node asyncOrder
시작
1번 저를 여러 번 읽어보세요.
2번 저를 여러 번 읽어보세요.
3번 저를 여러 번 읽어보세요.
끝
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node asyncOrderPromise
시작
1번 저를 여러 번 읽어보세요.
2번 저를 여러 번 읽어보세요.
3번 저를 여러 번 읽어보세요.
끝
```


### 3.6.2 버퍼와 스트림 이해하기

노드는 파일을 읽을 때 메모리에 파일 크기만큼의 공간을 마련해두고 파일 데이터를 메모리에 저장한 뒤 사용자가 조작할 수 있게 한다. 이때 메모리에 저장되는 데이터가 **버퍼**이다.

`Buffer` 클래스를 사용하면 버퍼를 직접 조작할 수 있다. 예시와 함께 살펴본다.

**buffer.js**
```
const buffer = Buffer.from("저를 버퍼로 바꿔보세요.");

console.log("from():", buffer);
console.log("length:", buffer.length);
console.log("toString():", buffer.toString());

const array = [Buffer.from("띄엄 "), Buffer.from("띄엄 "), Buffer.from("띄어쓰기")];
const buffer2 = Buffer.concat(array);
console.log("concat():", buffer2.toString());

const buffer3 = Buffer.alloc(5);
console.log("alloc():", buffer3);
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node buffer
from(): <Buffer ec a0 80 eb a5 bc 20 eb b2 84 ed 8d bc eb a1 9c 20 eb b0 94 ea bf 94 eb b3 b4 ec 84 b8 ec 9a 94 2e>
length: 33
toString(): 저를 버퍼로 바꿔보세요.
concat(): 띄엄 띄엄 띄어쓰기
alloc(): <Buffer 00 00 00 00 00>
```

`Buffer` 객체는 여러 가지 메소드를 제공한다.

- `from(string)`: 문자열을 버퍼로 바꾼다. `length` 속성은 버퍼의 크기를 바이트 단위로 알려준다.
- `toString(buffer)`: 버퍼를 다시 문자열로 바꾼다. 이때 **base64**나 **hex**를 인수로 전달하면 해당 인코딩으로도 변환할 수 있다.
- `concat(array)`: 배열 안에 든 버퍼들을 하나로 합친다.
- `alloc(byte)`: 빈 버퍼를 생성한다. 바이트 단위로 수를 인수로 넣으면 해당 크기의 버퍼가 생성된다.

`readFile` 방식의 버퍼가 편리하긴 하지만 매번 파일 크기만큼의 버퍼를 생성하기 때문에 문제가 있다. 몇 명이 이용할지 모르는 서버 환경에서는 메모리 사용량을 예측할 수 없고, 파일의 모든 내용이 버퍼에 쓰인 이후에야 다음 동작으로 넘어갈 수 있기 때문에 속도 문제도 존재한다.

그래서 버퍼의 크기를 작게 만들고 데이터를 여러 번에 걸쳐 나눠 보내는 방식이 등장했다. 이를 편리하게 만든 것이 `스트림`이다.

파일을 읽는 스트림 메소드로는 `createReadStream`이 있다. 사용 방법은 다음과 같다.

**readme3.txt**
```
저는 조금씩 조금씩 나눠서 전달됩니다. 나눠진 조각을 chunk라고 부릅니다.
```

**createReadStream.js**
```
const fs = require("fs");

const readStream = fs.createReadStream("../readme3.txt", { highWaterMark: 16 });
const data = [];

readStream.on("data", (chunk) => {
    data.push(chunk);
    console.log("data: ", chunk, chunk.length);
});

readStream.on("end", () => {
    console.log("end: ", Buffer.concat(data).toString());
});

readStream.on("error", (err) => {
    console.error(err);
});
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node createReadStream
data:  <Buffer ec a0 80 eb 8a 94 20 ec a1 b0 ea b8 88 ec 94 a9> 16
data:  <Buffer 20 ec a1 b0 ea b8 88 ec 94 a9 20 eb 82 98 eb 88> 16
data:  <Buffer a0 ec 84 9c 20 ec a0 84 eb 8b ac eb 90 a9 eb 8b> 16
data:  <Buffer 88 eb 8b a4 2e 20 eb 82 98 eb 88 a0 ec a7 84 20> 16
data:  <Buffer ec a1 b0 ea b0 81 ec 9d 84 20 63 68 75 6e 6b eb> 16
data:  <Buffer 9d bc ea b3 a0 20 eb b6 80 eb a6 85 eb 8b 88 eb> 16
data:  <Buffer 8b a4 2e> 3
end:  저는 조금씩 조금씩 나눠서 전달됩니다. 나눠진 조각을 chunk라고 부릅니다.
```

`createReadStream`으로 읽기 스트림을 만든다. 첫 번째 인수로는 읽을 파일의 경로를 전달한다. 두 번째 인수는 옵션 객체인데, `highWaterMark`라는 옵션이 버퍼의 크기(바이트 단위)를 의미하는 옵션이다. 기본값은 64KB이다.

`readStream`은 이벤트 리스너를 등록해서 사용한다. 보통 `data`, `end`, `error` 이벤트를 사용한다. 위 예제에서의 `readStream.on("data")`와 같이 이벤트 리스너를 등록할 수 있다. 파일 읽기가 시작되면 `data` 이벤트가, 파일 읽기가 끝나면 `end` 이벤트가, 파일을 읽는 도중 에러가 발생하면 `error` 이벤트가 발생한다.

이번에는 스트림을 사용해 파일을 쓰는 코드를 살펴본다.

**createWriteStream.js**
```
const fs = require("fs");

const writeStream = fs.createWriteStream("../writeme2.txt");

writeStream.on("finish", () => {
    console.log("파일 쓰기 완료");
});

writeStream.write("이 글을 씁니다.\n");
writeStream.write("한 번 더 씁니다.");
writeStream.end();
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node createWriteStream
파일 쓰기 완료
```

`createWriteStream`으로 쓰기 스트림을 만든다. 첫 번째 인수로는 출력 파일명을 전달하고, 두 번째 인수로는 옵션을 전달할 수 있다.

`finish` 이벤트 리스너를 등록했는데, 이 이벤트는 파일 쓰기 종료 시 발생한다.

`writeStream`에서 제공하는 `write` 메소드로 쓰고자 하는 데이터를 전달한다. 이는 여러 번 호출할 수 있고, 쓰기가 완료되면 `end` 메소드로 종료를 알린다. 이때 `finish` 이벤트가 발생한다.

`createReadStream`으로 파일을 읽고 그 스트림을 전달받아 `createWriteStream`으로 파일을 쓸 수도 있다. 이는 파일 복사와 비슷한 과정으로, 스트림끼리 연결하는 것을 **파이핑**한다고 표현한다. 실제 이러한 작업을 수행하는 메소드가 존재하는데, 그 코드는 다음과 같다.

**readme4.txt**
```
저를 writeme3.txt로 보내주세요.
```

**pipe.js**
```
const fs = require("fs");

const readStream = fs.createReadStream("../readme4.txt");
const writeStream = fs.createWriteStream("../writeme3.txt");

readStream.pipe(writeStream);
```

**writeme3.txt**
```
저를 writeme3.txt로 보내주세요.
```

미리 읽기 스트림과 쓰기 스트림을 생성한 후 두 개의 스트림을 `pipe` 메소드로 연결하면 저절로 데이터가 `writeStream`으로 넘어간다. 따로 `on("data")` 또는 `writeStream.write`를 사용하지 않아도 알아서 전달되므로 편리하다.

`pipe`는 스트림 사이에 여러 번 연결할 수 있다. 다음 예제는 파일을 읽은 후 gzip 방식으로 압축하는 코드이다.

**gzip.js**
```
const zlib = require("zlib");
const fs = require("fs");

const readStream = fs.createReadStream("../readme4.txt");
const zlibStream = zlib.createGzip();
const writeStream = fs.createWriteStream("../readme4.txt.gz");

readStream.pipe(zlibStream).pipe(writeStream);
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node gzip
```

또는 `stream` 모듈의 `pipeline` 메소드를 사용해 여러 개의 파이프를 연결하는 방법도 있다.

**pipeline.mjs**
```
import { pipeline } from "stream/promises";
import zlib from "zlib";
import fs from "fs";

await pipeline(
    fs.createReadStream("../readme4.txt"),
    zlib.createGzip(),
    fs.createWriteStream("../readme4.txt.gz"),
);
```

`pipeline` 메소드를 사용하면 중간에 `AbortController`를 사용해 원할 때 파이프를 중단할 수 있다.

**pipelineAbort.js**
```
import { pipeline } from "stream/promises";
import zlib from "zlib";
import fs from "fs";

const ac = new AbortController();
const signal = ac.signal;

setTimeout(() => ac.abort(), 1);    // 1ms 뒤에 중단
await pipeline(
    fs.createReadStream("../readme4.txt"),
    zlib.createGzip(),
    fs.createWriteStream("../readme4.txt.gz"),
    { signal },
);
```

`pipeline`의 마지막 인수로 `{ signal }`을 추가하면 된다. 원하는 시점에 `ac.abort()`를 호출하면 파이프가 중단된다.

다음으로 약 500MB 용량의 텍스트 파일을 만들고 `readFile` 메소드와 `createReadStream`의 메모리 사용량 차이를 확인해 보겠다.

**createBigFile.js**
```
const fs = require("fs");
const file = fs.createWriteStream("../big.txt");

for (let i = 0; i < 10000000; i++) {
    file.write("이 파일은 굉장히 큰 사이즈의 파일입니다.\n");
}
file.end();
```

다음과 같이 `readFile` 메소드를 사용해 big.txt를 big2.txt로 복사한다.

**buffer-memory.js**
```
const fs = require("fs");

console.log("before:", process.memoryUsage().rss);

const data1 = fs.readFileSync("../big.txt");
fs.writeFileSync("../big2.txt", data1);

console.log("buffer:", process.memoryUsage().rss);
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node buffer-memory
before: 30691328
buffer: 611442688
```

메모리 사용량을 보면 파일을 복사하기 위해 메모리에 파일을 전부 올려둔 후 `writeFileSync`를 수행했음을 확인할 수 있다.

이번에는 `stream`을 사용해 파일을 big3.txt로 복사한다.

**stream-memory**
```
const fs = require("fs");

console.log("before:", process.memoryUsage().rss);

const readStream = fs.createReadStream("../big.txt");
const writeStream = fs.createWriteStream("../big3.txt");

readStream.pipe(writeStream);
readStream.on("end", () => {
    console.log("stream:", process.memoryUsage().rss);
});
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node stream-memory
before: 30695424
stream: 59412480
```

`stream`을 사용한 경우, 큰 파일을 조각내어 버퍼 단위로 이동했기 때문에 메모리 사용량이 훨씬 적어졌음을 확인할 수 있다. 이러한 효율성 때문에 동영상 같은 큰 파일들을 전송할 때 스트림을 사용한다.


### 3.6.3 기타 fs 메소드 알아보기

`fs`는 파일 읽기/쓰기 이외에도 파일 생성/삭제, 디렉터리 생성/삭제와 같이 파일 시스템을 조작하는 다양한 메소드를 제공한다.

**fsCreate.js**
```
const fs = require("fs").promises;
const constants = require("fs").constants;

fs.access("../folder", constants.F_OK | constants.W_OK | constants.R_OK)
    .then(() => {
        return Promise.reject("이미 디렉터리 있음");
    })
    .catch((err) => {
        if (err.code === "ENOENT") {
            console.log("디렉터리 없음");
            return fs.mkdir("../folder");
        }

        return Promise.reject(err);
    })
    .then(() => {
        console.log("디렉터리 만들기 성공");
        return fs.open("../folder/file.js", "w");
    })
    .then((fd) => {
        console.log("빈 파일 만들기 성공", fd);
        return fs.rename("../folder/file.js", "../folder/newfile.js");
    })
    .then(() => {
        console.log("이름 바꾸기 성공");
    })
    .catch((err) => {
        console.error(err);
    });
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node fsCreate
디렉터리 없음
디렉터리 만들기 성공
빈 파일 만들기 성공 FileHandle {
  _events: [Object: null prototype] {},
  _eventsCount: 0,
  _maxListeners: undefined,
  close: [Function: close],
  [Symbol(kCapture)]: false,
  [Symbol(kHandle)]: FileHandle {},
  [Symbol(kFd)]: 3,
  [Symbol(kRefs)]: 1,
  [Symbol(kClosePromise)]: null
}
이름 바꾸기 성공
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node fsCreate
이미 디렉터리 있음
```

위 코드에서는 다음과 같은 네 가지 **비동기 메소드**가 등장한다.

- `fs.access(path, option, callback)`: 디렉터리나 파일에 접근할 수 있는지 확인한다. 두 번째 인수로 `constants`를 통해 가져온 상수들을 전달했다. `F_OK`는 파일 존재 여부, `R_OK`는 읽기 권한 여부, `W_OK`는 쓰기 권한 여부를 검사한다. 파일/디렉터리가 없거나 권한이 없다면 에러가 발생하는데, 파일/디렉터리가 없을 때의 에러 코드는 `ENOENT`이다.
- `fs.mkdir(path, callback)`: 디렉터리를 만드는 메소드이다. 이미 디렉터리가 있다면 에러가 발생하므로 먼저 `access` 메소드를 호출하여 확인하는 것이 중요하다.
- `fs.open(path, option, callback)`: 파일의 아이디(fd 변수)를 가져오는 메소드이다. 파일이 없다면 생성한 뒤 그 아이디를 가져온다. 아이디를 사용해 `fs.read` 또는 `fs.write`로 읽거나 쓸 수 있다. 두 번째 인수로 어떤 동작을 할 것인지 설정할 수 있다. 쓰려면 `w`, 읽으려면 `r`, 기존 파일에 추가하려면 `a`이다.
- `fs.rename(old path, new path, callback)`: 파일의 이름을 바꾸는 메소드이다.

다음으로는 디렉터리의 내용을 확인하거나 삭제하는 메소드를 살펴본다.

**fsDelete.js**
```
const fs = require("fs").promises;

fs.readdir("../folder")
    .then((dir) => {
        console.log("디렉터리 내용 확인:", dir);
        return fs.unlink("../folder/newfile.js");
    })
    .then(() => {
        console.log("파일 삭제 성공");
        return fs.rmdir("../folder");
    })
    .then(() => {
        console.log("디렉터리 삭제 성공");
    })
    .catch((err) => {
        console.error(err);
    });
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node fsDelete
디렉터리 내용 확인: [ 'newfile.js' ]
파일 삭제 성공
디렉터리 삭제 성공
```

- `fs.readdir(path, callback)`: 디렉터리 안의 내용을 확인할 수 있다. 배열 안에 내부의 파일과 디렉터리들의 이름이 저장된다.
- `fs.unlink(path, callback)`: 파일을 지울 수 있다. 파일이 없다면 에러가 발생하므로 먼저 파일이 있는지를 검사해야 한다.
- `fs.rmdir(path, callback)`: 디렉터리를 지울 수 있다. 디렉터리 안에 파일들이 있다면 에러가 발생하므로 먼저 디렉터리 내부의 파일들을 모두 지우고 호출해야 한다.

노드 8.5 버전 이후에는 `readFileStream`과 `writeFileStream`을 `pipe`로 연결하지 않아도 파일을 복사할 수 있다. 다음과 같이 코드를 작성하면 된다.

**copyFile.js**
```
const fs = require("fs").promises;

fs.copyFile("../readme4.txt", "../writeme4.txt")
    .then(() => {
        console.log("복사 완료");
    })
    .catch((err) => {
        console.error(err);
    });
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node copyFile
복사 완료
```

- `fs.copyFile(old file path, new file path, callback)`: 파일을 복사한다.

파일/디렉터리의 변경 사항을 감시할 수 있는 `watch` 메소드도 존재한다. 빈 텍스트 파일 target.txt를 생성하고 다음 코드를 작성한다.

**watch.js**
```
const fs = require("fs");

fs.watch("../target.txt", (eventType, filename) => {
    console.log(eventType, filename);
});
```

**console**
```
PS D:\공부\Javascript\Study_Node.js\Codes\chapter03\js> node watch
change target.txt
change target.txt
change target.txt
change target.txt
change target.txt
rename target.txt
```

watch.js를 실행하고 target.txt의 내용을 변경하거나 파일의 이름을 변경하면 터미널에 결과가 출력된다. 내용을 수정할 때는 `change` 이벤트가 발생하고, 파일명을 변경하거나 파일을 삭제하면 `rename` 이벤트가 발생한다. `rename` 이벤트가 발생한 이후엔 `watch`로 변경을 추적할 수 없다. `change` 이벤트가 두 번씩 발생하기도 하므로 실무에서 사용 시 주의해야 한다.


### 3.6.4 스레드 풀 알아보기

이전 절에서는 `fs` 모듈의 다양한 비동기 메소드들을 사용해 보았다. 비동기 메소드들은 백그라운드에서 실행되고 실행된 후에는 다시 메인 스레드의 콜백 함수나 프로미스의 then 부분이 실행된다. 이때 `fs` 메소드를 동시에 여러 번 실행해도 백그라운드에서 동시에 처리될 수 있는데, 이는 스레드 풀이 있기 때문이다.

`fs` 외에도 `crypto`, `zlib`, `dns.lookup` 등의 모듈들이 내부적으로 스레드 풀을 사용한다. 이들 중 `crypto.pbkdf2` 메소드로 스레드 풀의 존재를 확인해 본다.

**threadpool.js**
```

```

**console**
```

```