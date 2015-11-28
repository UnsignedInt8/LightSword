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
var net = require('net');
class Socks5Server {
    constructor(options) {
        let _this = this;
        ['cipherAlgorithm', 'password', 'port'].forEach(n => _this[n] = options[n]);
    }
    start() {
        let server = net.createServer((client) => {
        });
        server.listen(this.port);
        server.on('error', (err) => console.error(err.message));
        this._server = server;
    }
    stop() {
        this._server.end();
        this._server.close();
        this._server.destroy();
    }
}
exports.Socks5Server = Socks5Server;
