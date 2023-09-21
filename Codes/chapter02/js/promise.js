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

// 콜백 패턴

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

// 프로미스 패턴

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

// Promise.all() 활용

const promise1 = Promise.resolve('성공');
const promise2 = Promise.resolve('성공2');

Promise.all([promise1, promise2])
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.error(error);
    });

// Promise.allSettled() 활용

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

// async/wait 문법 활용

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

// 화살표 함수 async/wait 문법

const findAndSaveUserArrow = async (Users) => {
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

// for문과 async/await의 조합

const prms1 = Promise.resolve('성공1');
const prms2 = Promise.resolve('성공2');
const prms3 = Promise.resolve('성공3');
const prmsArr = [prms1, prms2, prms3];

(async () => {
    for await (p of prmsArr) {
        console.log(`resolve: ${p}`);
    }
})();