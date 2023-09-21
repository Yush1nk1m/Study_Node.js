# Node.js 교과서 2장 요약
## *알아둬야 할 자바스크립트*
- - -


## 2.1 ES2015+

2015년 자바스크립트 문법에 거대한 변화가 있었고, 이것을 ES2015(또는 ES6)라고 한다. 2015년을 기점으로 매년 문법 변경 사항이 발표되고 있으며 이 요약본을 작성하는 2023년 기준으론 ES2023이 발표되었다. 이 서적에서는 **ES2015 이상의 자바스크립트**를 통틀어 `ES2015+`이라고 표현한다.

### 2.1.1 const, let

|   | var | let | const |
| :--: | :--: | :--: | :--: |
| **재선언 가능 여부** | O | X | X |
| **재할당 가능 여부** | O | O | X |
| **변수 스코프** | 함수 | 블록 | 블록 |

자바스크립트를 사용할 땐 한 번 초기화했던 변수에 다른 값을 할당하는 경우가 적다. 따라서 변수 선언 시에는 기본적으로 const를 사용하고, 다른 값을 할당해야 하는 상황이 생겼을 때 let을 사용하면 된다.


### 2.1.2 템플릿 문자열

문자열을 백틱( ` )으로 감싸서 문자열 안에 변수를 넣을 수 있다.

```
const num1 = 1;
const num2 = 2;
const result = num1 + num2;

console.log(`${num1} + ${num2} = ${result}`);
```

위 코드를 실행하면 1 + 2 = 3 과 같이 출력된다.


### 2.1.3 객체 리터럴

다음 코드는 ES2015 이전 버전 스타일으로 작성되었다.
```
var sayNode = function() {
    console.log("Node");
};
var es = "ES";

var oldObject = {
    sayJS: function() {
        console.log("JS");
    },
    sayNode: sayNode,
};

oldObject[es + 6] = "Fantastic";
oldObject.sayNode();
oldObject.sayJS();

console.log(oldObject.ES6);
```

ES2015+의 스타일로 코드를 작성한 후 변경점을 확인해 보겠다.
```
const newObject = {
    sayJS() {
        console.log("JS");
    },
    sayNode,
    [es + 6]: "Fantastic",
};

newObject.sayNode();
newObject.sayJS();

console.log(newObject.ES6);
```

**ES2015+에서의 변경점**
- 메소드에 함수를 연결할 때 콜론을 생략해도 된다. `sayJS() { ... }`
- 속성명과 변수명이 동일한 경우에는 한 번만 써도 된다. `sayNode: sayNode`
- 객체 리터럴 안에 동적 속성을 선언해도 된다. `[es + 6]`


### 2.1.4 화살표 함수

```
function add1(x, y) {
    return x + y;
}

const add2 = (x, y) => {
    return x + y;
}

const add3 = (x, y) => x + y;

const add4 = (x, y) => (x + y);

function not1(x) {
    return !x;
}

const not2 = x => !x;
```

add 함수들끼리는 모두 같은 의미이고, not 함수들끼리도 모두 같은 의미이다.

**화살표 함수의 특징**
- function 선언 대신 => 기호로 함수를 선언한다.
- 변수에 대입하면 재사용할 수 있다.
- 내부에 return문밖에 없는 경우 중괄호 대신 add3, add4처럼 식을 즉시 써서 return문을 줄일 수 있다.
- not2처럼 매개변수가 한 개이면 소괄호로 묶어주지 않아도 된다.

**this의 바인드 방식**

자바스크립트에서 this가 바인딩되는 방식을 먼저 알아보자.
- **전역 공간의 this**: 전역 객체를 지시한다. 
- **메소드 내부의 this**: 해당 메소드를 호출한 객체를 지시한다.
- **함수 내부의 this**: 지정되지 않았다. 지정되지 않은 객체는 전역 객체를 지시한다.

함수 내부에서 this를 사용하는 것은 this가 전역 객체를 가리키게 하기 때문에 이해하기 어려운 코드가 되어 버린다.

```
var relationship1 = {
    name: 'zero',
    friends: ['nero', 'hero', 'xero'],
    logFriends: function() {
        var that = this;    // relationship1을 가리키는 this를 that에 저장

        this.friends.forEach(function (friend) {
            console.log(that.name, friend);
        });
    },
};

relationship1.logFriends();
```
따라서, 위 코드에서 that이 사용되는 자리를 this로 대체하면 해당 this는 전역 객체를 지시하기 때문에

```
relationship1 = {
    name: 'zero',
    friends: ['nero', 'hero', 'xero'],
    logFriends: function() {

        this.friends.forEach(function (friend) {
            console.log(this.relationship1.name, friend);
        });
    },
};

relationship1.logFriends();
```
같은 결과가 나오게 하려면 이런 식으로 코드를 난잡하게 짜야 한다. 그리고 이것은 이해할 수 있는 코드가 아니다.

그러나 화살표 함수는 하나의 스코프로서의 자격을 가지지 않는 것처럼 동작하기 때문에 그 안에서 this를 사용하면 바깥 스코프의 this를 사용하게 된다. 위의 코드를 화살표 함수를 이용해 변형한 코드는 다음과 같다.

```
const relationship2 = {
    name: 'zero',
    friends: ['nero', 'hero', 'xero'],
    logFriends() {
        this.friends.forEach(friend => {
            console.log(this.name, friend);
        });
    }
}

relationship2.logFriends();
```

>*즉, 기본적으로 화살표 함수를 쓰되 this를 사용해야 하는 경우에는 화살표 함수와 함수 선언문(function) 둘 중 하나를 고르면 된다.*


### 2.1.5 구조 분해 할당

구조 분해 할당(destructuring)을 활용하면 객체와 배열로부터 속성이나 요소를 쉽게 추출할 수 있다.<br>
다음은 객체의 속성을 같은 이름의 변수에 대입하는 코드이다.

```
var candyMachine = {
    status: {
        name: 'node',
        count: 5,
    },
    getCandy() {
        this.status.count--;
        return this.status.count;
    },
};

var getCandy = candyMachine.getCandy;
var count = candyMachine.status.count;
```
이 코드의 할당문은 구조 분해 할당을 활용하여 다음과 같이 바꿀 수 있다.

```
const { getCandy, status: { count } } = candyMachine;
```

그러나, 구조 분해 할당을 사용하면 함수의 this가 달라질 수 있기 때문에 bind 함수를 따로 사용해야 한다. 사용에 주의가 필요하다.

다음은 배열에 대해 구조 분해 할당을 적용한 예시이다.
```
var array = ['nodejs', {}, 10, true];

var node = array[0];
var obj = array[1];
var bool = array[3];
```

적용 전 위와 같았던 코드에 구조 분해 할당을 적용하면 다음과 같이 바꿀 수 있다.

```
const [node, obj, , bool] = array;
```
2번 인덱스의 원소는 가져올 필요가 없으므로 구조 분해 할당 시 변수명을 지어주지 않았다는 점을 확인하자.


### 2.1.6 클래스

클래스(class) 문법은 존재하지만 다른 언어처럼 클래스 기반으로 동작하지 않고 프로토타입 기반으로 동작한다. 프로토타입 기반 문법을 보기 좋게 클래스로 바꾼 것이다.

다음은 클래스 문법 없이 프로토타입 문법으로 작성된 코드이다.

```
var Human = function(type) {
    this.type = type || 'human';
};

Human.isHuman = function(human) {
    return human instanceof Human;
}

Human.prototype.breathe = function() {
    alert('h-a-a-a-m');
};

var Zero = function(type, firstName, lastName) {
    Human.apply(this, arguments);
    this.firstName = firstName;
    this.lastName = lastName;
};

Zero.prototype = Object.create(Human.prototype);
Zero.prototype.constructor = Zero;  // 상속하는 부분
Zero.prototype.sayName = function() {
    alert(this.firstName + ' ' + this.lastName);
};

var oldZero = new Zero('human', 'Zero', 'Cho');
Human.isHuman(oldZero);     // true
```

Human 생성자 함수가 있고, 그 함수를 Zero 생성자 함수가 상속하는 코드이다. 그러나 Zero 생성자 함수를 보면 상속받기 위한 코드가 상당히 난해한 것을 확인할 수 있다. 이는 클래스 내부적으로 자바스크립트가 프로토타입 기반의 언어라는 것을 추상화하지 못한 탓이다. 이 코드를 추상화된 클래스 문법으로 작성하면 다음과 같다.

```
class Human {
    constructor(type = 'human') {
        this.type = type;
    }

    static isHuman(human) {
        return human instanceof Human;
    }

    breathe() {
        alert('h-a-a-a-m');
    }
}

class Zero extends Human {
    constructor(type, firstName, lastName) {
        super(type);
        this.firstName = firstName;
        this.lastName = lastName;
    }

    sayName() {
        super.breathe();
        alert(`${this.firstName} ${this.lastName}`);
    }
}

const newZero = new Zero('human', 'Zero', 'Cho');
Human.isHuman(newZero);     // true
```
확실히 클래스 문법으로 작성된 코드가 더 보기 간결하고 클래스 간의 관계를 파악하기 쉽다. 그러나 자바스크립트는 어디까지나 프로토타입 기반의 언어라는 사실을 명심하고 있어야 한다.


### 2.1.7 프로미스

**콜백 함수**: 어떤 함수의 파라미터로 전달되는 함수를 의미한다. 해당 함수 내부에서 사용됨으로써 사용자가 정의한 함수들의 실행 순서가 보장될 수 있다.

**프로미스**: 자바스크립트 비동기 처리에 사용되는 객체이다. 작업들이 미리 정한 순서에 따라 처리되도록 조절할 수 있다. 실행은 바로 하되 결과는 나중에 받는 객체라고 볼 수도 있다.

ES2015부터는 자바스크립트와 노드의 API들이 콜백 대신 프로미스(Promise) 기반으로 재구성되며, 악명 높은 콜백 지옥(callback hell) 현상을 극복했다는 평가를 받고 있다. 프로미스는 반드시 알아둬야 하는 객체이므로 숙지해 두어야 한다. 다음은 프로미스 예제 코드이다.

```
const condition = true;     // true이면 resolve, false이면 reject
const promise = new Promise((resolve, reject) => {
    if (condition) {
        resolve('성공');
    } else {
        reject('실패');
    }
});

// 다른 코드가 들어갈 수 있음
promise
    .then((message) => {
        console.log(message);   // 성공(resolve)한 경우 실행
    })
    .catch((error) => {
        console.error(error);   // 실패(reject)한 경우 실행
    })
    .finally(() => {            // 끝나고 무조건 실행
        console.log('무조건');
    });
```

프로미스에는 다음과 같은 규칙들이 있다.
- `new Promise`로 프로미스를 생성할 수 있으며, 안에 resolve와 reject를 매개변수로 갖는 콜백 함수를 넣는다.
- 생성된 promise 변수에 then, catch 메소드를 붙일 수 있다. 프로미스 내부에서 resolve가 호출되면 then이 실행되고, reject가 호출되면 catch가 실행된다. finally 부분은 성공/실패 여부와 상관없이 실행된다.
- resolve와 reject에 넣어준 인수는 각각 then과 catch의 매개변수에서 받을 수 있다.

위 규칙들을 활용하여 then이나 catch에서 다시 다른 then이나 catch를 붙인 코드는 다음과 같다.

```
promise
    .then((message) => {
        return new Promise((resolve, reject) => {
            resolve(message);
        });
    })
    .then((message2) => {
        console.log(message2);
        return new Promise((resolve, reject) => {
            resolve(message2);
        });
    })
    .then((message3) => {
        console.log(message3);
    })

    .catch((error) => {
        console.error(error);
    });
```

다음은 콜백을 쓰는 패턴 중 하나이다.

```
function findAndSaveUser(Users) {
    Users.findOne({}, (err, user) => {                      // 첫 번째 콜백
        if (err) {
            return console.error(err);
        }

        user.name = 'zero';
        
        user.save((err) => {                                // 두 번째 콜백
            if (err) {
                return console.error(err);
            }

            Users.findOne({ gender: 'm' }, (err, user) => { // 세 번째 콜백
                // 생략
            });
        });
    });
}
```

콜백 함수가 세 번 중첩되어 있고, 콜백 함수마다 에러도 따로 처리해 주어야 한다. 이 복잡한 코드는 프로미스를 활용하여 다음과 같이 바꿀 수 있다.

```
function findAndSaveUser(Users) {
    Users.findOne({})
        .then((user) => {
            user.name = 'zero';
            return user.save();
        })
        .then((user) => {
            return Users.findOne({ gender: 'm' });
        })
        .then((user) => {
            // 생략
        })
        .catch(err => {
            console.log(err);
        });
}
```

코드의 깊이가 일정하고, then 메소드들은 순차적으로 실행된다. 위 코드는 findOne과 save 메소드가 내부적으로 프로미스 객체로 갖고 있다고 가정하고 쓰여진 코드이므로 가능한 것이다. (`new Promise`가 함수 내부에 구현되어 있어야 한다.)

프로미스 여러 개를 한 번에 실행할 수 있는 방법도 존재한다. `Promise.all()`을 활용한 것으로 다음은 그 예제 코드이다.

```
const promise1 = Promise.resolve('성공');
const promise2 = Promise.resolve('성공2');

Promise.all([promise1, promise2])
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.error(error);
    });
```

`Promise.resolve()`는 즉시 resolve하는 프로미스를 만드는 방법이고, 즉시 reject하는 프로미스를 만드는 `Promise.reject()`도 존재한다. 프로미스가 여러 개 있을 때 `Promise.all()`에 넣으면 **모두 resolve될 때까지 기다렸다가 then으로 넘어간다.** then에 전달하는 익명 함수의 매개변수 result는 모든 프로미스의 결과들을 배열로 저장한다. 그 중 **하나라도 reject되면 then이 아닌 catch로 넘어간다.** 다만, **Promise.all()로는 어떤 프로미스가 reject되었는지는 알 수 없다.**

`Promise.allSettled()`를 사용하면 어떤 프로미스가 reject되었는지까지 알 수 있다. 다음은 `Promise.allSettled()`를 활용한 코드이다.

```
const prm1 = Promise.resolve('성공1');
const prm2 = Promise.reject('실패2');
const prm3 = Promise.resolve('성공3');

Promise.allSettled([prm1, prm2, prm3])
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.error(error);
    });
```
```
OUTPUT

[
  { status: 'fulfilled', value: '성공1' },
  { status: 'rejected', reason: '실패2' },
  { status: 'fulfilled', value: '성공3' }
]
```

어떤 프로미스가 reject되었는지 로그를 통해 쉽게 알 수 있기 때문에 `Promise.all()`보다는 `Promise.allSettled()`의 사용이 조금 더 권장되는 편이다.


### 2.1.8 async/wait

프로미스는 콜백 지옥을 해결했지만, 여전히 코드가 장황하다는 문제점이 있다. async/wait 문법은 프로미스를 사용한 코드를 한 번 더 깔끔하게 압축한다.

2.1.7절의 프로미스 코드를 다시 한번 보자.
```
function findAndSaveUser(Users) {
    Users.findOne({})
        .then((user) => {
            user.name = 'zero';
            return user.save();
        })
        .then((user) => {
            return Users.findOne({ gender: 'm' });
        })
        .then((user) => {
            // 생략
        })
        .catch(err => {
            console.log(err);
        });
}
```

이 코드를 async/wait 문법을 이용하여 다음과 같이 바꿀 수 있다.

```
async function findAndSaveUser(Users) {
    let user = Users.findOne({});
    user.name = 'zero';
    user = await user.save();
    user = await Users.findOne({ gender: 'm' });
    // 생략
}
```

**async/wait 문법**

1. 함수 선언부를 일반 함수 대신 async function으로 교체한다.
2. 프로미스 앞에 await을 붙인다.

함수는 해당 프로미스가 resolve될 떄까지 기다린 후 다음 로직으로 넘어간다. 위 코드는 에러를 처리하는 부분이 없으므로 다음과 같은 추가 작업이 필요하다.

```
async function findAndSaveUser(Users) {
    try {
        let user = await Users.findOne({});
        user.name = 'zero';
        user = await user.save();
        user = await Users.findOne({ gender: 'm' });
        // 생략
    } catch (error) {
        console.error(error);
    }
}
```

이렇게 단 한 번의 try/catch 문으로 감싸는 것만으로 에러를 처리할 수 있다.<br>
화살표 함수도 다음과 같이 async와 함께 사용할 수 있다.

```
const findAndSaveUser = async (Users) => {
    try {
        let user = await Users.findOne({});
        user.name = 'zero';
        user = await user.save();
        user = await findOne({ gender: 'm' });
        // 생략
    } catch (error) {
        console.log(error);
    }
};
```

다음과 같이 for문과 async/await을 함께 사용하여 프로미스를 순차적으로 실행할 수도 있다.

```

const prms1 = Promise.resolve('성공1');
const prms2 = Promise.resolve('성공2');
const prms3 = Promise.resolve('성공3');
const prmsArr = [prms1, prms2, prms3];

(async () => {
    for await (p of prmsArr) {
        console.log(`resolve: ${p}`);
    }
})();
```

for await of문을 사용해서 프로미스 배열을 순회하는 코드이다. async 함수의 반환값은 항상 Promise로 감싸지기 때문에 실행 후 then을 붙이거나 또 다른 async 함수 안에서 await을 붙여 처리할 수 있다.


### 2.1.9 Map/Set

ES2015에는 새로운 자료구조들이 추가되었다. 그 중 자주 쓰이는 Map과 Set에 대해 알아본다.

**Map 사용법**
```
const m = new Map();

m.set('k', 'v');    // set(key, value)로 Map에 속성 추가
m.set(3, 'c');      // 문자열이 아닌 값을 key로 사용할 수 있다.
const d = {};       // 임의의 객체 생성
m.set(d, 'e');      // 객체도 key로 사용할 수 있다.

m.get(d);           // get(key)로 속성 값 조회
console.log(`m.get(d): ${m.get(d)}`);

m.size;             // size로 속성 개수 조회
console.log(`m.size: ${m.size}`);

for (const [k, v] of m) {   // 반복문에 바로 넣어 사용 가능하다.
    console.log(`key: ${k} -> value: ${v}`);
}                           // 속성 간의 순서도 보장된다.

m.forEach((v, k) => {   // forEach도 사용 가능하다. (value, key) 순서로 추출됨을 기억하자.
    console.log(`key: ${k}, value: ${v}`);
});

m.has(d);           // has(key)로 속성의 존재 여부를 확인한다.
console.log(`m.has(d): ${m.has(d)}`);

m.delete(d);        // delete(key)로 속성을 삭제한다.
m.clear();          // clear()로 속성을 전부 제거한다.
console.log(`m.size: ${m.size}`);
```

Map은 속성들 간의 순서가 보장되고 반복문을 사용할 수 있다. 속성명(key)로 문자열이 아닌 값도 사용할 수 있고, size 메소드를 통해 속성의 수를 쉽게 알 수 있다는 점에서 일반적인 객체와 다르다.

**Set 사용법**

```
const s = new Set();

s.add(false);           // add(element)로 Set에 요소를 추가한다.
s.add(1);
s.add('1');
s.add(1);               // 중복 추가는 무시된다.
s.add(2);

console.log(`s.size: ${s.size}`);

s.has(1);               // has(element)로 요소 존재 여부를 확인한다.
console.log(`s.has(1): ${s.has(1)}`);

for (const a of s) {
    console.log(a);
}

s.forEach((element) => {
    console.log(element);
})

s.delete(2);            // delete(element)로 요소를 제거한다.
s.clear();              // clear()로 요소를 전부 제거한다.
```

Set은 중복을 허용하지 않는다는 것이 가장 큰 특징이다. 따라서 배열 자료구조를 사용하고 싶으나 중복은 허용하고 싶지 않을 때 Set을 대신 사용할 수 있다. 또는 기존 배열에서 중복을 제거할 때도 다음과 같이 Set을 활용할 수 있다.

```
const arr = [1, 3, 2, 7, 2, 6, 3, 5];

const uniqueArr = new Set(arr);         // 배열을 Set으로 변환
const result = Array.from(uniqueArr);   // Set을 배열로 변환

console.log(result);
```

`new Set(배열)`을 하는 순간 배열의 중복된 요소들이 제거되고, `Array.from(Set)`을 통해 Set을 다시 배열로 되돌릴 수 있다.

### 2.1.10 널 병합/옵셔널 체이닝

- `??` **널 병합(nullish coalescing) 연산자**: || 연산자 대용으로 사용되며, falsy 값(0, '', false, Nan, null, undefined) 중 null과 undefined가 앞에 올 때만 뒤의 값을 검사한다. 즉, null과 undefined만 false로 인식하는 || 연산자와 같다.

```
const a = 0;
const b = a || 3;       // || 연산자는 falsy 값이면 뒤로 넘어간다.
console.log(b);

const c = 0;
const d = c ?? 3;       // ?? 연산자는 null과 undefined일 때만 뒤로 넘어간다.
console.log(d);

const e = null;
const f = e ?? 3;
console.log(f);

const g = undefined;
const h = g ?? 3;
console.log(h);
```

- `?.` **옵셔널 체이닝(optional chaining) 연산자**: null이나 undefined의 속성을 조회하는 경우 에러가 발생하는 것을 막는다.

```
const a = {};
a.b;            // a가 객체이므로 문제 없다.

const c = null;
try {
    c.d;        // error 발생
} catch (e) {
    console.error(e);
}
c?.d;           // 옵셔널 체이닝 연산자를 사용했으므로 문제 없다.

try {
    c.f();      // error 발생
} catch (e) {
    console.error(e);
}
c?.f();         // 옵셔널 체이닝 연산자를 사용했으므로 문제 없다.

try {
    c[0];       // error 발생
} catch (e) {
    console.error(e);
}
c?.[0];         // 옵셔널 체이닝 연산자를 사용했으므로 문제 없다.
```

옵셔널 체이닝 연산자를 사용하면 속성, 함수 호출, 배열 요소 접근 등에 대해서도 에러가 발생하는 것을 방지할 수 있다. 이때 null이나 undefined에 옵셔널 체이닝 연산자를 사용해 접근하면 그 값은 **undefined**로 고정된다.
- - -


## 2.2 프런트엔드 자바스크립트

HTML에서 \<script\> 태그 안에 작성하는 부분

### 2.2.1 AJAX

`AJAX(Asynchronous Javascript And XML)`: 비동기적 웹 서비스를 개발할 때 사용하는 기법이다. *페이지 이동 없이 서버에 요청을 보내고 응답을 받는다.* 이름에 XML이 들어 있지만 요즘에는 XML보다는 JSON을 많이 사용한다.

>이 책에서는 전반적으로 axios 라이브러리를 사용해서 AJAX 요청 방법을 설명한다.

프런트엔드에서 사용하려면 HTML 파일을 하나 만들고 그 안에 `<script>` 태그를 두 개 추가해야 한다. 첫 번째 태그는 양식이 정해져 있고, 예제 코드는 두 번째 태그 안에 넣으면 된다.

```
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script>
    // 예제 코드가 위치할 곳
</script>
```

위 코드를 사용해서 axios 요청들을 보내본다. 다음은 GET 요청을 보내는 코드이다. `axios.get()` 함수의 인수로 요청을 보낼 url을 넣으면 된다.

```
// GET 요청(프로미스)
        axios.get("https://www.zerocho.com/api/get")
            .then((result) => {
                console.log(result);
                console.log(result.data);
            })
            .catch((error) => {
                console.error(error);
            });
```

`axios.get()`도 내부에 `new Promise`가 들어 있으므로 then, catch를 사용할 수 있다. `result.data`에는 서버로부터 보낸 데이터가 들어 있다. 프로미스이므로 다음과 같이 async/await 방식으로 변경할 수 있다.

```
// GET 요청(async/await)
        (async () => {
            try {
                const result = await axios.get("https://www.zerocho.com/api/get");
                console.log(result);
                console.log(result.data);
            } catch (error) {
                console.error(error);
            }
        })();
```

이번에는 POST 방식의 요청을 보낸다. POST 요청에서는 데이터를 서버로 보낼 수 있다. `axios.post()`를 사용하여 보낼 수 있으며, 두 번째 인수로는 데이터를 넣어 보낸다.

```
// POST 방식(async/await)
        (async () => {
            try {
                const result = await axios.post("https://www.zerocho.com/api/post/json", {
                    name: "zerocho",
                    birth: 1994,
                });

                console.log(result);
                console.log(result.data);
            } catch (error) {
                console.error(error);
            }
        })();
```


### 2.2.2 FormData

`FormData`: HTML form 태그의 데이터를 동적으로 제어할 수 있는 기능이다. 주로 AJAX와 함께 사용된다.

**FormData 사용법**

```
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script>
    // FormData 객체 생성
    const formData = new FormData();
    
    // key - value 형식의 데이터 저장
    formData.append("name", "yushin");
    formData.append("item", "orange");
    formData.append("item", "melon");   // key 하나에 여러 개의 value 저장 가능

    formData.has("item");
    formData.has("money");
    
    formData.get("item");       // 첫 번째 value
    formData.getAll("item");    // 모든 value의 리스트

    formData.append("test", ["hi", "zero"]);    // 배열 객체 자체가 value
    formData.get("test");                       // 배열 객체 자체를 가져오게 된다.
    formData.delete("test");
    formData.get("test");

    formData.set("item", "apple");      // 덮어 쓰기
    formData.getAll("item");
</script>
```

`FormData.append(key, value)`: 키-값 형식의 데이터를 저장한다.<br>
`FormData.has(key)`: 주어진 키에 해당하는 값이 있는지 여부를 알린다.<br>
`FormData.get(key)`: 주어진 키에 해당하는 값 하나를 가져온다.<br>
`FormData.getAll(key)`: 주어진 키에 해당하는 모든 값을 가져온다.<br>
`FormData.delete(key)`: 주어진 키를 제거한다.<br>
`FormData.set(key, value)`: 현재 키의 값을 수정한다.

이제 다음과 같이 axios를 사용해 생성한 폼 데이터를 서버에 보내야 한다.

```
(async () => {
    try {
        const formData = new FormData();
        formData.append("name", "yushin");
        formData.append("birth", 1994);
        const result = await axios.post("https://www.zerocho.com/api/post/formdata", formData);

        console.log(result);
        console.log(result.data);
    } catch (error) {
        console.error(error);
    }
})();
```


### 2.2.3 encodeURIComponent, decodeURIComponent

AJAX 요청을 보낼 때 주소에 한글이 포함되는 경우가 있다. 간혹 서버가 한글을 이해하지 못하는 경우가 있는데 이럴 때 `window` 객체의 메소드인 `encodeURIComponent`를 사용한다. 이 메소드는 노드에서도 사용할 수 있으며, 한글 부분만 `encodeURIComponent` 메소드로 감싸면 된다.

```
(async () => {
    try {
        const result = await axios.get(`https://www.zerocho.com/api/search/${encodeURIComponent("노드")}`);

        console.log(result);
        console.log(result.data);
    } catch (error) {
        console.error(error);
    }
})();
```

받는 쪽에서는 `decodeURIComponent` 메소드를 사용하여 한글을 복원하면 된다. 브라우저뿐만 아니라 노드에서도 사용할 수 있다.


### 2.2.4 데이터 속성과 dataset

>프런트엔드에 데이터를 내려보낼 때 첫 번째로 고려해야 할 점은 보안이다. 민감한 데이터는 프런트엔드로 내려보내지 말아야 한다.

노드를 웹 서버로 사용할 경우 클라이언트(프런트엔드)와 빈번하게 데이터를 주고 받게 된다. 이때 서버에서 보내준 데이터를 프런트엔드의 어디에 넣어야 할지 고민하게 된다. 자바스크립트 변수에 지정해도 되지만, HTML5에도 HTML과 관련된 데이터를 저장하는 공식적인 방법이 있다. 바로 `데이터 속성(data attribute)`이다.

```
<body>
    <div>
        <ul>
            <li data-id="1" data-user-job="programmer">Yushin</li>
            <li data-id="2" data-user-job="homeless">Choco</li>
            <li data-id="3" data-user-job="designer">Yeonwoo</li>
            <li data-id="4" data-user-job="ceo">YUSHIN</li>
        </ul>
    </div>
    
    <script>
        console.log(document.querySelector("li").dataset);
    </script>
</body>
```

위와 같이 HTML 태그의 속성으로 `data-`로 시작하는 것들을 넣는다. 이것들이 데이터 속성으로, 화면에 나타나지는 않지만 웹 애플리케이션 구동에 필요한 데이터들이다. 나중에 이 데이터들을 사용해서 서버에 요청을 보내게 된다.

## 2.3 함께 보면 좋은 자료

생략