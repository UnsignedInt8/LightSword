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
var socks5Helper = require('../../lib/socks5Helper');
var socks5Server_1 = require('./socks5Server');
class LocalProxyServer extends socks5Server_1.Socks5Server {
    connectRemoteServer(client, request) {
        let dst = socks5Helper.refineDestination(request);
        let proxySocket = net.createConnection(dst.port, dst.addr, () => __awaiter(this, void 0, Promise, function* () {
            let reply = new Buffer(request.length);
            request.copy(reply);
            reply[0] = 0x05;
            reply[1] = 0x00;
            yield client.writeAsync(reply);
            proxySocket.pipe(client);
            client.pipe(proxySocket);
        }));
        function dispose() {
            proxySocket.dispose();
            client.dispose();
        }
        proxySocket.on('end', dispose);
        proxySocket.on('error', dispose);
        client.on('end', dispose);
        client.on('error', dispose);
        proxySocket.setTimeout(this.timeout);
    }
}
exports.LocalProxyServer = LocalProxyServer;
