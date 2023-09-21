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