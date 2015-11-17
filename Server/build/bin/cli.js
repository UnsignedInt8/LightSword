//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, Promise, generator) {
    return new Promise(function (resolve, reject) {
        generator = generator.call(thisArg, _arguments);
        function cast(value) { return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); }); }
        function onfulfill(value) { try { step("next", value); } catch (e) { reject(e); } }
        function onreject(value) { try { step("throw", value); } catch (e) { reject(e); } }
        function step(verb, value) {
            var result = generator[verb](value);
            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);
        }
        step("next", void 0);
    });
};
var program = require('commander');
var app_1 = require('../app');
program
    .options('-p, --port [number]', 'Server Listening Port', Number.parseInt)
    .options('-k, --password [password]', 'Cipher Password', String)
    .options('-m, --method [algorithm]', 'Cipher Algorithm', String)
    .options('-c, --config <path>', 'Configuration File Path', String)
    .parse(progress.argv);
let args = program;
function parseFile(path) {
    if (!path)
        return;
    if (!fs.existsSync(path))
        return;
    let content = fs.readFileSync(path).toString();
    try {
        return JSON.parse(content);
    }
    catch (ex) {
        logger.warn('Configuration file error');
        logger.warn(ex.message);
    }
}
let fileOptions = parseFile(args.config) || {};
let argsOptions = {
    port: args.port,
    password: args.password,
    cipherAlgorithm: args.method
};
Object.getOwnPropertyNames(argsOptions).forEach(n => argsOptions[n] = argsOptions[n] || fileOptions[n]);
process.title = 'LightSword Server';
new app_1.App(argsOptions);
//# sourceMappingURL=cli.js.map