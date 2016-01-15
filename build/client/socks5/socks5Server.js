//-----------------------------------
// Copyright(c) 2015 Neko
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
var socks5Constant_1 = require('../../lib/socks5Constant');
class Socks5Server {
    constructor(options) {
        this.localArea = ['10.', '192.168.', 'localhost', '127.0.0.1', '172.16.', '::1', '169.254.0.0'];
        let me = this;
        if (options)
            Object.getOwnPropertyNames(options).forEach(n => me[n] = options[n]);
    }
    start() {
        if (this.server)
            return;
        let me = this;
        let server = net.createServer((client) => __awaiter(this, void 0, Promise, function* () {
            let data = yield client.readAsync();
            if (!data)
                return client.dispose();
            let reply = me.handleHandshake(data);
            yield client.writeAsync(reply.data);
            if (!reply.success)
                return client.dispose();
            data = yield client.readAsync();
            me.handleRequest(client, data);
        }));
        server.on('error', (err) => console.error(err.message));
        server.listen(this.listenPort, this.listenAddr);
        this.server = server;
    }
    stop() {
        this.server.removeAllListeners();
        this.server.close();
    }
    handleHandshake(data) {
        let methodCount = data[1];
        let code = data.skip(2).take(methodCount).contains(socks5Constant_1.AUTHENTICATION.NOAUTH)
            ? socks5Constant_1.AUTHENTICATION.NOAUTH
            : socks5Constant_1.AUTHENTICATION.NONE;
        let success = code === socks5Constant_1.AUTHENTICATION.NOAUTH;
        return { success, data: new Buffer([socks5Constant_1.SOCKS_VER.V5, code]) };
    }
}
exports.Socks5Server = Socks5Server;
