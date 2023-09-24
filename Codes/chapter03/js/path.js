const path = require("path");

const string = __filename;

console.log(`path.sep: ${path.sep}`);
console.log(`path.delimeter: ${path.delimiter}`);
console.log("- - -");

console.log(`path.dirname(): ${path.dirname(string)}`);
console.log(`path.extname(): ${path.extname(string)}`);
console.log(`path.basename(): ${path.basename(string)}`);
console.log(`path.basename - extname: ${path.basename(string, path.extname(string))}`);
console.log("- - -");

console.log("path.parse():");
console.log(path.parse(string));
console.log(`path.format(): ${path.format({
    dir: "D:/공부/Javascript/Study_Node.js/Codes/chapter03/js",
    name: "path",
    ext: ".js",
})}`);
console.log(`path.normalize(): ${path.normalize("D://공부\\\\Javascript//Study_Node.js\\\\Codes/chapter03\\js")}`);
console.log("- - -");

console.log(`path.isAbsolute(C:\\): ${path.isAbsolute("C:\\")}`);
console.log(`path.isAbsolute(./home): ${path.isAbsolute("./home")}`);
console.log("- - -");

console.log(`path.relative(): ${path.relative("D:/공부/Javascript/Study_Node.js/Codes/chapter03/js/path.js", "D:/")}`);
console.log(`path.join(): ${path.join(__dirname, '..', '..', '/users', '.', '/yushin')}`);
console.log(`path.resolve(): ${path.resolve(__dirname, '..', 'users', '.', '/yushin')}`);