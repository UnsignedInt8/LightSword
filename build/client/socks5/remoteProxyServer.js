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
var crypto = require('../../lib/cipher');
var socks5Constant_1 = require('../../lib/socks5Constant');
var socks5Server_1 = require('./socks5Server');
// +------+------+-------+
// | IV   | TYPE | DATA  |
// +------+------+-------+
// | 8-16 | 1    | VAR   |
// +------+------+-------+
class RemoteProxyServer extends socks5Server_1.Socks5Server {
    connectRemoteServer(client, request) {
        let me = this;
        let proxySocket = net.createConnection(this.serverPort, this.serverAddr, () => __awaiter(this, void 0, Promise, function* () {
            let encryptor = crypto.createCipher(me.cipherAlgorithm, me.password);
            let cipher = encryptor.cipher;
            let et = cipher.update(new Buffer(socks5Constant_1.VPN_TYPE.SOCKS5));
            let ed = cipher.update(request);
            yield proxySocket.writeAsync(Buffer.concat([encryptor.iv, et, ed]));
        }));
        function dispose() {
            client.dispose();
            proxySocket.dispose();
        }
        proxySocket.on('end', () => dispose);
        proxySocket.on('error', () => dispose);
        client.on('end', () => dispose);
        client.on('error', () => dispose);
        proxySocket.setTimeout(this.timeout);
    }
}
exports.RemoteProxyServer = RemoteProxyServer;
