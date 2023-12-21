jest.mock("../models/user");
const User = require("../models/user");
const { follow } = require("./user");

describe("follow", () => {
    const req = {
        user: { id: 1 },
        params: { id: 2 },
    };
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    const next = jest.fn();
    
    test("사용자를 찾아 팔로잉을 추가하고 success를 응답해야 한다.", async () => {
        User.findOne.mockReturnValue({
            addFollowing(id) {
                return Promise.resolve(true);
            }
        });

        await follow(req, res, next);
        
        expect(res.send).toBeCalledWith("success");
    });

    test("사용자를 찾지 못하면 res.status(404).send(\"no user\")를 호출해야 한다.", async () => {
        User.findOne.mockReturnValue(null);
        
        await follow(req, res, next);

        expect(res.status).toBeCalledWith(404);
        expect(res.send).toBeCalledWith("no user");
    });

    test("데이터베이스에서 오류가 발생하면 next(error)를 호출한다.", async () => {
        const message = "데이터베이스 오류";

        User.findOne.mockReturnValue(Promise.reject(message));

        await follow(req, res, next);

        expect(next).toBeCalledWith(message);
    });
});