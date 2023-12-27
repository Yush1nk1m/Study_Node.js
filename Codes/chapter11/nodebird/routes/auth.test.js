const request = require("supertest");
const { sequelize } = require("../models");
const app = require("../app");

beforeAll(async () => {
    await sequelize.sync();
});

describe("POST /join", () => {
    test("로그인하지 않았으면 회원 가입한다.", (done) => {
        request(app)
            .post("/auth/join")
            .send({
                email: "kys010306@sogang.ac.kr",
                "nick": "yushin",
                password: "kimyush1n",
            })
            .expect("Location", "/")
            .expect(302, done);
    });
});

describe("POST /join", () => {
    const agent = request.agent(app);
    beforeEach((done) => {
        agent
            .post("/auth/login")
            .send({
                email: "kys010306@sogang.ac.kr",
                password: "kimyush1n",
            })
            .end(done);
    });

    test("이미 로그인했으면 /로 redirect한다.", (done) => {
        const message = encodeURIComponent("로그인한 상태입니다.");

        agent
            .post("/auth/join")
            .send({
                email: "kys010306@sogang.ac.kr",
                nick: "yushin",
                password: "kimyush1n",
            })
            .expect("Location", `/?error=${message}`)
            .expect(302, done);
    });
});

describe("POST /login", () => {
    test("회원 가입되지 않았다.", (done) => {
        const message = encodeURIComponent("가입되지 않은 회원입니다.");
        request(app)
            .post("/auth/login")
            .send({
                email: "ayw@sogang.ac.kr",
                password: "kimyush1n",
            })
            .expect("Location", `/?error=${message}`)
            .expect(302, done);
    });

    test("로그인을 수행한다.", (done) => {
        request(app)
            .post("/auth/login")
            .send({
                email: "kys010306@sogang.ac.kr",
                password: "kimyush1n",
            })
            .expect("Location", "/")
            .expect(302, done);
    });

    test("비밀번호가 일치하지 않는다.", (done) => {
        const message = encodeURIComponent("비밀번호가 일치하지 않습니다.");

        request(app)
            .post("/auth/login")
            .send({
                email: "kys010306@sogang.ac.kr",
                password: "1",
            })
            .expect("Location", `/?error=${message}`)
            .expect(302, done);
    });
});

describe("GET /logout", () => {
    test("로그인되어 있지 않으면 403 상태 코드가 응답된다.", (done) => {
        request(app)
            .get("/auth/logout")
            .expect(403, done);
    });

    const agent = request.agent(app);
    beforeEach((done) => {
        agent
            .post("/auth/login")
            .send({
                email: "kys010306@sogang.ac.kr",
                password: "kimyush1n",
            })
            .end(done);
    });

    test("로그아웃을 수행한다.", (done) => {
        agent
            .get("/auth/logout")
            .expect("Location", "/")
            .expect(302, done);
    });
});

afterAll(async () => {
    await sequelize.sync({ force: true });
});