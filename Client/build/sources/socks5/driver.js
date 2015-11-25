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
var logger = require('winston');
var socks5Util = require('./util');
var consts_1 = require('./consts');
class Socks5Driver {
    constructor(executor, args) {
        this.executor = executor;
        let _this = this;
        Object.getOwnPropertyNames(args).forEach(n => _this[n] = args[n]);
        this.connectServer();
    }
    connectServer() {
        return __awaiter(this, void 0, Promise, function* () {
            let _this = this;
            // Handling errors, disposing resources.
            function disposeSocket(error, from) {
                _this.clientSocket.dispose();
                _this.clientSocket = null;
                _this = null;
            }
            let executor = _this.executor;
            let socks5Opts = {
                cipherAlgorithm: _this.cipherAlgorithm,
                password: _this.password,
                dstAddr: _this.dstAddr,
                dstPort: _this.dstPort,
                serverAddr: _this.serverAddr,
                serverPort: _this.serverPort
            };
            function negotiateAsync() {
                return __awaiter(this, void 0, Promise, function* () {
                    return new Promise(resolve => {
                        executor.negotiate(socks5Opts, (success, reason) => {
                            if (!success)
                                logger.warn(reason);
                            resolve(success);
                        });
                    });
                });
            }
            function sendCommandAsync() {
                return __awaiter(this, void 0, Promise, function* () {
                    return new Promise(resolve => {
                        executor.initSocks5Proxy(socks5Opts, (success, reason) => {
                            if (!success)
                                logger.warn(reason);
                            resolve(success);
                        });
                    });
                });
            }
            let reply = yield socks5Util.buildDefaultSocks5ReplyAsync();
            // Step 1: Negotiate with server      
            let success = yield negotiateAsync();
            if (!success) {
                reply[1] = consts_1.REPLY_CODE.CONNECTION_REFUSED;
                yield _this.clientSocket.writeAsync(reply);
                return disposeSocket(null, 'proxy');
            }
            // Step 2: Send command to Server
            success = yield sendCommandAsync();
            reply[1] = success ? consts_1.REPLY_CODE.SUCCESS : consts_1.REPLY_CODE.CONNECTION_REFUSED;
            // Step 3: Fill reply structure, reply client socket.
            if (executor.fillReply)
                reply = executor.fillReply(reply);
            yield _this.clientSocket.writeAsync(reply);
            if (!success)
                return disposeSocket(null, 'proxy');
            // Step 4: Transport data.
            let transportOps = {
                cipherAlgorithm: _this.cipherAlgorithm,
                password: _this.password,
                dstAddr: _this.dstAddr,
                dstPort: _this.dstPort,
                serverAddr: _this.serverAddr,
                serverPort: _this.serverPort,
                clientSocket: _this.clientSocket,
            };
            executor.transport(transportOps);
        });
    }
}
exports.Socks5Driver = Socks5Driver;
//# sourceMappingURL=driver.js.map