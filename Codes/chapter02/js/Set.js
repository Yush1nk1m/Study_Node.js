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

// Set의 활용: 기존 배열에서 중복되는 요소 제거

const arr = [1, 3, 2, 7, 2, 6, 3, 5];

const uniqueArr = new Set(arr);         // 배열을 Set으로 변환
const result = Array.from(uniqueArr);   // Set을 배열로 변환

console.log(result);