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