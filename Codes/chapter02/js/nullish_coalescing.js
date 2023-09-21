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