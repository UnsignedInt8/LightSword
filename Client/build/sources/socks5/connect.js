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
var consts = require('./consts');
var socks5Util = require('./util');
class Socks5Connect {
    receive(msg, args) {
        let options = args;
        let _this = this;
        Object.getOwnPropertyNames(options).forEach(n => _this[n] = options[n]);
    }
    connectServer() {
        let _this = this;
        let proxySocket = net.connect(this.serverPort, this.serverAddr, () => __awaiter(this, void 0, Promise, function* () {
            let negotiater = require('../plugins/connect/negotiate');
            let negotiationOps = {
                serverAddr: _this.serverAddr,
                serverPort: _this.serverPort,
                cipherAlgorithm: _this.cipherAlgorithm,
                password: _this.password,
                proxySocket: proxySocket
            };
            let reply = yield socks5Util.buildDefaultSocks5ReplyAsync();
            // Step1: negotiate with server
            negotiater(negotiationOps, (success) => __awaiter(this, void 0, Promise, function* () {
                // If negotiation failed, refuse client socket
                if (!success) {
                    reply[1] = consts.REPLY_CODE.CONNECTION_NOT_ALLOWED;
                    yield _this.clientSocket.writeAsync(reply);
                    _this.clientSocket.destroy();
                    return proxySocket.destroy();
                }
                // Step2
                let transporter = require('../plugins/connect/transport');
                let transportOps = {
                    dstAddr: _this.dstAddr,
                    dstPort: _this.dstPort,
                    serverAddr: _this.serverAddr,
                    serverPort: _this.serverPort,
                    clientSocket: _this.clientSocket,
                    proxySocket: proxySocket
                };
                transporter(transportOps, () => {
                });
            }));
        }));
    }
}
exports.Socks5Connect = Socks5Connect;
