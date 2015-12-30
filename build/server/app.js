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
require('async-node');
require('kinq').enable();
require('../lib/socketEx');
var server_1 = require('./server');
var constant_1 = require('../lib/constant');
class App {
    constructor(options) {
        let defaultOptions = {
            cipherAlgorithm: constant_1.defaultCipherAlgorithm,
            password: constant_1.defaultPassword,
            port: constant_1.defaultServerPort,
            timeout: 60
        };
        options = options || defaultOptions;
        Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] || defaultOptions[n]);
        let server = new server_1.LsServer(options);
        server.start();
        server.once('close', () => App.Users.delete(options.port));
        App.Users.set(options.port, server);
    }
    static addUser(port, cipherAlgorithm, password) {
        port = port || Number(Math.min(10000, Math.random() * 50000 + 10000).toFixed());
        cipherAlgorithm = cipherAlgorithm || constant_1.defaultCipherAlgorithm;
        password = password || constant_1.defaultPassword;
        let option = {
            cipherAlgorithm,
            password,
            port,
            timeout: 10
        };
        new App(option);
    }
    static removeUser(port) {
        if (!App.Users.has(port))
            return;
        let server = App.Users.get(port);
        server.stop();
    }
}
App.Users = new Map();
exports.App = App;
if (!module.parent) {
    process.title = 'LightSword Server Debug Mode';
    new App();
}
