//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const net = require('net');
const socks5constant_1 = require('../../common/socks5constant');
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
        let server = net.createServer((client) => __awaiter(this, void 0, void 0, function* () {
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
        let code = data.skip(2).take(methodCount).contains(socks5constant_1.AUTHENTICATION.NOAUTH)
            ? socks5constant_1.AUTHENTICATION.NOAUTH
            : socks5constant_1.AUTHENTICATION.NONE;
        let success = code === socks5constant_1.AUTHENTICATION.NOAUTH;
        return { success: success, data: new Buffer([socks5constant_1.SOCKS_VER.V5, code]) };
    }
}
exports.Socks5Server = Socks5Server;
