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

바뀐 문법은 다음과 같다.<br>
`require` -> `import`<br>
`exports` -> `export`<br>
`module.exports` -> `export default`

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

`global` 객체 내부에는 많은 속성들이 들어 있고, 내부를 보려면 REPL을 이용해야 한다.