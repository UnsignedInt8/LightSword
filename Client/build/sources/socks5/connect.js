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
var logger = require('winston');
class Socks5Connect {
    receive(msg, args) {
        let _this = this;
        Object.getOwnPropertyNames(args).forEach(n => _this[n] = args[n]);
    }
    connectServer() {
        let _this = this;
        let proxySocket = net.connect(this.serverPort, this.serverAddr, () => __awaiter(this, void 0, Promise, function* () {
            let reply = yield socks5Util.buildDefaultSocks5ReplyAsync();
            let executor;
            try {
                let isLocal = ['localhost', '', undefined, null].contains(_this.serverAddr.toLowerCase());
                let plugin = '../plugins/connect/' + isLocal ? 'local' : 'main';
                executor = require('../plugins/connect/main').createExecutor();
            }
            catch (ex) {
                logger.error(ex.message);
                return process.exit(1);
            }
            let negotiationOps = {
                dstAddr: _this.dstAddr,
                dstPort: _this.dstPort,
                cipherAlgorithm: _this.cipherAlgorithm,
                password: _this.password,
                proxySocket: proxySocket
            };
            function negotiateAsync() {
                return __awaiter(this, void 0, Promise, function* () {
                    return new Promise(resolve => {
                        executor.negotiate(negotiationOps, (success) => {
                            resolve(success);
                        });
                    });
                });
            }
            function connectDestinationAsync() {
                return __awaiter(this, void 0, Promise, function* () {
                    return new Promise(resolve => {
                        executor.connectDestination(negotiationOps, (success) => {
                            resolve(success);
                        });
                    });
                });
            }
            // Step 1: Negotiate with server      
            let success = yield negotiateAsync();
            // If negotiation failed, refuse client socket
            if (!success) {
                reply[1] = consts.REPLY_CODE.CONNECTION_NOT_ALLOWED;
                yield _this.clientSocket.writeAsync(reply);
                _this.clientSocket.destroy();
                return proxySocket.destroy();
            }
            // Step 2: Reply client destination connected or not. 
            success = yield connectDestinationAsync();
            reply[1] = success ? consts.REPLY_CODE.SUCCESS : consts.REPLY_CODE.CONNECTION_REFUSED;
            yield _this.clientSocket.writeAsync(reply);
            if (!success) {
                _this.clientSocket.destroy();
                return proxySocket.destroy();
            }
            // Step 3: Transport data.
            let transportOps = {
                cipherAlgorithm: _this.cipherAlgorithm,
                password: _this.password,
                clientSocket: _this.clientSocket,
                proxySocket: proxySocket
            };
            executor.transport(transportOps, () => {
                _this.clientSocket.destroy();
                proxySocket.destroy();
            });
        }));
    }
}
exports.Socks5Connect = Socks5Connect;
//# sourceMappingURL=connect.js.map