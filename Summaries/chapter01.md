# Node.js 교과서 1장 요약
## *노드 시작하기*
- - -


## 1.1 핵심 개념 이해하기

**Node.js**: Chrome V8 Javascript 엔진으로 빌드된 자바스크립트 런타임


### 1.1.1 서버

<img src="https://velog.velcdn.com/images/dnflekf2748/post/3ae851c0-f5a1-4b24-a9f0-00dd4d1efe2d/%EC%84%9C%EB%B2%84%ED%81%B4%EB%9D%BC%EC%9D%B4%EC%96%B8.png">

**서버**: 네트워크를 통해 클라이언트에 정보나 서비스를 제공하는 컴퓨터 또는 프로그램

**클라이언트**: 요청을 보내는 주체 (ex: 브라우저, 데스크톱 프로그램, 모바일 앱, 다른 서버에 요청을 보내는 서버 등)

>*Node.js는 자바스크립트 프로그램이 서버로서 기능하기 위한 도구를 제공하므로 서버 역할을 수행할 수 있다.*


### 1.1.2 자바스크립트 런타임

*Node.js는 Chrome V8 Javascript 엔진으로 빌드된 자바스크립트 런타임이다.*

**런타임**: 특정 언어로 만든 프로그램들을 실행할 수 있는 환경

>*즉, Node.js는 자바스크립트 실행기라고 보아도 무방하다.*


### 1.1.3 이벤트 기반

**이벤트 기반(event-driven)**: 이벤트가 발생할 때 미리 지정해둔 작업을 수행하는 방식, 이벤트의 대표적인 예로 클릭, 네트워크 요청 등이 있다. 이벤트 기반 시스템에서는 특정 이벤트가 발생할 때 무엇을 할지 미리 등록해 두어야 한다. 이를 이벤트 리스너(event listener)에 콜백(callback) 함수를 등록한다고 표현한다.

>*노드도 이벤트 기반 방식으로 동작하므로 이벤트가 발생하면 이벤트 리스너에 등록해둔 콜백 함수를 호출한다. 발생한 이벤트가 없거나 발생했던 이벤트를 모두 처리하면 다음 이벤트가 발생할 때까지 대기한다.*

**이벤트 루프(event-loop)**: 이벤트 발생 시 호출할 콜백 함수들을 관리하고, 호출된 콜백 함수의 실행 순서를 결정하는 역할을 담당한다. 노드가 종료될 때까지 이벤트 처리를 위한 작업을 반복하므로 루프(loop)라고 부른다.

**백그라운드(background)**: setTimeout 같은 타이머나 이벤트 리스너들이 대기하는 곳이다. 자바스크립트가 아닌 다른 언어로 작성된 프로그램이라고 봐도 무방하며, 여러 작업이 동시에 실행될 수 있다.

**태스크 큐(task queue)**: 이벤트 발생 후 백그라운드에서는 태스크 큐로 타이머나 이벤트 리스너의 콜백 함수를 보낸다. 정해진 순서대로 콜백 함수들이 줄을 서 있으므로 콜백 큐라고도 한다. 보통 완료된 순서대로 줄을 서 있지만 특정 경우 순서가 바뀌기도 한다.

<pre>
<code>
function run() {
    console.log("3초 후 실행");
}

console.log("시작");
setTimeout(run, 3000);

console.log("끝");
</code>
</pre>
위 코드에서 setTimeout의 동작은 다음과 같다.

1. 전역 콘텍스트 anonymous와 setTimeout()이 호출 스택에 쌓인다.
2. setTimeout() 실행 시 콜백 run은 백그라운드로 보낸다. 동시에 호출 스택에서 setTimeout()이 빠진다.
3. 백그라운드에서 3초 후 태스크 큐로 보낸다.
4. 전역 콘텍스트 anonymous가 실행 완료되어 호출 스택에서 빠진다.
5. 호출 스택이 비워지면 이벤트 루프가 태스크 큐의 콜백 run()을 호출 스택으로 올린다.
6. run()이 호출 스택에서 실행되고 빠진다.
7. 이벤트 루프는 다시 태스크 큐에 콜백이 들어올 때까지 대기한다.


### 1.1.4 논블로킹 I/O

**블로킹(blocking)**: 이전 작업이 끝나야만 다음 작업을 수행할 수 있는 것

**논블로킹(non-blocking)**: 이전 작업이 완료될 때까지 대기하지 않고 다음 작업을 수행하는 것

>*노드는 I/O 작업을 백그라운드로 넘겨 동시에 처리하곤 한다. 따라서 동시에 처리될 수 있는 작업들은 최대한 묶어서 백그라운드로 넘겨야 시간을 절약할 수 있다.*

논블로킹 코드 만들기
<pre>
<code>
function longRunningTask() {
    // 오래 걸리는 작업
    console.log("작업 끝");
}

console.log("시작");
setTimeout(longRunningTask, 0);
console.log("다음 작업");
</code>
</pre>
longRunningTask()가 태스크 큐로 보내지므로 순서대로 실행되지 않는다. 다음 작업이 먼저 실행된 후 오래 걸리는 작업(longRunningTask)이 완료된다.

>***논블로킹**과 **동시**는 같은 의미가 아니다. 동시성은 동시 처리가 가능한 작업을 논블로킹 처리해야 얻을 수 있는 것이다.*

>**setTimeout(콜백, 0)**: 밀리초를 0으로 설정했지만 브라우저와 노드 사이에는 기본적인 지연 시간이 있으므로 바로 실행되지 않는다. HTML5 브라우저에서는 4ms, 노드에서는 1ms의 지연 시간이 있습니다.


### 1.1.5 싱글 스레드

**프로세스와 스레드의 차이**
- **프로세스**는 운영체제에서 할당하는 작업의 단위이다. 노드나 웹 브라우저 같은 프로그램은 개별적인 프로세스로, 프로세스 간에는 메모리 등의 자원을 공유하지 않는다.
- **스레드**는 프로세스 내에서 실행되는 흐름의 단위이다. 프로세스는 스레드를 여러 개 생성해 여러 작업을 동시에 처리할 수 있다. 스레드들은 부모 프로세스의 자원을 공유하고, 같은 주소의 메모리에 접근 가능하므로 데이터를 공유할 수 있다.


>**스레드 풀과 워커 스레드**: 노드가 싱글 스레드로 동작하지 않는 경우가 있다. 한 가지는 스레드 풀(Thread Pool)이고, 다른 한 가지는 워커 스레드(Worker Thread)이다.<br/>
스레드 풀은 노드가 특정 동작을 수행할 때 스스로 멀티 스레드를 사용한다. 대표적인 예로 암호화, 파일 입출력, 압축 등이 있다. <br/>
워커 스레드는 노드 12 버전에서 안정화된 기능으로, 이제 노드에서도 멀티 스레드를 사용할 수 있게 되었다. 사용자가 직접 다수의 스레드를 다룰 수 있으며, CPU 작업이 많은 경우 워커 스레드를 사용하면 된다.

**멀티 스레딩과 멀티 프로세싱 비교**
| 멀티 스레딩 | 멀티 프로세싱 |
| :--: | :--: |
| 하나의 프로세스 안에서 여러 개의 스레드 사용 | 여러 개의 프로세스 사용 |
| CPU 작업이 많이 사용될 때 사용 | I/O 요청이 많을 때 사용 |
| 프로그래밍이 어려움 | 프로그래밍이 비교적 쉬움 |
- - -


## 1.2 서버로서의 노드

>*노드(및 자바스크립트)는 싱글 스레드, 논블로킹 모델을 사용한다. 그러므로 노드 서버의 장단점은 싱글 스레드, 논블로킹 모델의 장단점과 크게 다르지 않다.*

노드는 논블로킹 방식으로 I/O 작업을 처리할 수 있으므로 스레드 하나가 많은 수의 I/O 요청을 감당할 수 있다. 그러나 CPU 부하가 큰 작업에는 적합하지 않다. 따라서 노드는 개수는 많으나 크기는 작은 데이터를 실시간으로 주고 받는 데 적합하다. 실시간 채팅 애플리케이션, 주식 차트, JSON 데이터를 제공하는 API 서버 등이 노드를 많이 사용한다.

**노드의 장단점**
| 장점 | 단점 |
| :--: | :--: |
| 멀티 스레드 방식에 비해 적은 컴퓨터 자원 사용 | 기본적으로 싱글 스레드라서 CPU 코어를 하나만 사용 |
| I/O 작업이 많은 서버로 적합 | CPU 작업이 많은 서버로는 부적합 |
| 멀티 스레드 방식보다 쉬움 | 하나뿐인 스레드가 멈추지 않도록 관리 필요 |
| 웹 서버가 내장되어 있음 | 서버 규모가 커졌을 때 서버를 관리하기 어려움 |
| 자바스크립트를 사용함 | 어중간한 성능 |
| JSON 형식과 쉽게 호환됨 | |
- - -


## 1.3 서버 외의 노드

처음에는 노드를 대부분 서버로 사용했지만, 노드는 자바스크립트 런타임이므로 그 용도가 서버로만 국한되지 않는다.

**노드의 사용처**
- 서버
- 웹 애플리케이션
    - 웹 프레임워크: 앵귤러(Angular), 리액트(React), 뷰(Vue) 등
- 모바일 애플리케이션
    - 모바일 개발 도구: 리액트 네이티브(React Native)
- 데스크톱 애플리케이션
    - 데스크톱 개발 도구: 일렉트론(Electron)
- - -


## 1.4 개발 환경 설정하기


### 1.4.1 노드 설치하기
생략


### 1.4.2 npm 버전 업데이트하기
터미널에 다음 명령어 입력

    $ npm install -g npm


### 1.4.3 비주얼 스튜디오 코드 설치하기
생략
- - -

## 1.5 함께 보면 좋은 자료
생략