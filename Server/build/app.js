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
require('kinq').enable();
require('async-node');
var server_1 = require('./socks5/server');
class App {
    constructor(options) {
        let defaultOptions = {
            cipherAlgorithm: 'aes-256-cfb',
            password: 'lightsword.neko',
            port: 23333,
            plugin: 'lightsword'
        };
        options = options || defaultOptions;
        Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] || defaultOptions[n]);
        new server_1.Server(options).start();
    }
}
module.exports = App;
if (!module.parent) {
    process.title = 'LightSword Server Debug Mode';
    new App();
}
//# sourceMappingURL=app.js.map