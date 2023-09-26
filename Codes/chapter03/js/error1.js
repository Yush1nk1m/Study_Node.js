setInterval(() => {
    console.log("시작");

    try {
        throw new Error("의도적인 에러 발생!");
    } catch (err) {
        console.error(err);
    }
}, 1000);