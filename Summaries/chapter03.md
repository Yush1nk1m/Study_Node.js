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