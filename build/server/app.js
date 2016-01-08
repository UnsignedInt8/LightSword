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
            timeout: 10,
            expireTime: undefined,
            disableSelfProtection: false
        };
        options = options || defaultOptions;
        Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] || defaultOptions[n]);
        let server = new server_1.LsServer(options);
        server.start();
        server.once('close', () => App.Users.delete(options.port));
        App.Users.set(options.port, server);
    }
    static addUser(options) {
        if (App.Users.has(options.port))
            return false;
        new App(options);
        return true;
    }
    static addUsers(options) {
        let results = options.map(o => App.addUser(o));
        return results.all(r => r === true);
    }
    static updateUser(port, options) {
        if (!App.Users.has(port))
            return false;
        App.Users.get(port).updateConfiguration(options);
        return true;
    }
    static removeUser(port) {
        if (!App.Users.has(port))
            return false;
        let server = App.Users.get(port);
        server.stop();
        return true;
    }
}
App.Users = new Map();
exports.App = App;
if (!module.parent) {
    process.title = 'LightSword Server Debug Mode';
    new App();
}
