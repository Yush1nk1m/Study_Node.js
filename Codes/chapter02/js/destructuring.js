// 구조 분해 할당 적용 전
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

//var getCandy = candyMachine.getCandy;
//var count = candyMachine.status.count;

// 구조 분해 할당 적용 후

const { getCandy, status: { count } } = candyMachine;
getCandy();


// 구조 분해 할당 적용 전

var array = ['nodejs', {}, 10, true];
var node = array[0];
var obj = array[1];
var bool = array[3];

// 구조 분해 할당 적용 후

const [node, obj, , bool] = array;