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
var socks5const = require('./const');
class LocalServer {
    constructor(options) {
        let _this = this;
        if (options)
            Object.getOwnPropertyNames(options).forEach(n => _this[n] = options[n]);
    }
    start() {
        if (this._server)
            return;
        let _this = this;
        let server = net.createServer((client) => __awaiter(this, void 0, Promise, function* () {
            let data = yield client.readAsync();
            if (!data)
                return client.destroy();
            let reply = _this.handleHandshake(data);
            yield client.writeAsync(reply.data);
            if (!reply.success)
                return client.destroy();
        }));
        server.listen(this.listenPort, this.listenAddr);
        this._server = server;
    }
    handleHandshake(data) {
        let methodCount = data[1];
        let code = data.skip(2).take(methodCount).contains(socks5const.AUTHENTICATION.NOAUTH)
            ? socks5const.AUTHENTICATION.NOAUTH
            : socks5const.AUTHENTICATION.NONE;
        let success = code === socks5const.AUTHENTICATION.NOAUTH;
        return { success: success, data: new Buffer([socks5const.SOCKS_VER.V5, code]) };
    }
}
