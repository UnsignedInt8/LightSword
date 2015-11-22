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
var consts_1 = require('./consts');
var socks5Util = require('./util');
var logger = require('winston');
class Socks5Connect {
    constructor(plugin, cmdType, args) {
        this.socks5Plugin = plugin;
        this.cmdType = cmdType;
        let _this = this;
        Object.getOwnPropertyNames(args).forEach(n => _this[n] = args[n]);
        this.connectServer();
    }
    connectServer() {
        let _this = this;
        // Handling errors, disposing resources.
        function disposeSockets(error, from) {
            if (!_this || !_this || !proxySocket)
                return;
            _this.clientSocket.removeAllListeners();
            _this.clientSocket.end();
            _this.clientSocket.destroy();
            proxySocket.removeAllListeners();
            proxySocket.end();
            proxySocket.destroy();
            _this.clientSocket = null;
            proxySocket = null;
            _this = null;
        }
        var proxySocket = net.connect(this.serverPort, this.serverAddr, () => __awaiter(this, void 0, Promise, function* () {
            logger.info(`connect: ${_this.dstAddr}`);
            let reply = yield socks5Util.buildDefaultSocks5ReplyAsync();
            let connect = _this.socks5Plugin.getSocks5(this.cmdType);
            function negotiateAsync() {
                return __awaiter(this, void 0, Promise, function* () {
                    let negotiationOps = {
                        cipherAlgorithm: _this.cipherAlgorithm,
                        password: _this.password,
                        proxySocket: proxySocket
                    };
                    return new Promise(resolve => {
                        connect.negotiate(negotiationOps, (success, reason) => {
                            if (!success)
                                logger.warn(reason);
                            resolve(success);
                        });
                    });
                });
            }
            function sendCommandAsync() {
                return __awaiter(this, void 0, Promise, function* () {
                    let commandOpts = {
                        dstAddr: _this.dstAddr,
                        dstPort: _this.dstPort,
                        cipherAlgorithm: _this.cipherAlgorithm,
                        password: _this.password,
                        proxySocket: proxySocket
                    };
                    return new Promise(resolve => {
                        connect.sendCommand(commandOpts, (success, reason) => {
                            if (!success)
                                logger.warn(reason);
                            resolve(success);
                        });
                    });
                });
            }
            // Step 1: Negotiate with server      
            let success = yield negotiateAsync();
            if (!success) {
                reply[1] = consts_1.REPLY_CODE.CONNECTION_REFUSED;
                yield _this.clientSocket.writeAsync(reply);
                return disposeSockets(null, 'proxy');
            }
            // Step 2: Send command to Server
            success = yield sendCommandAsync();
            reply[1] = success ? consts_1.REPLY_CODE.SUCCESS : consts_1.REPLY_CODE.CONNECTION_REFUSED;
            // Step 3: Fill reply structure.
            if (connect.fillReply)
                reply = connect.fillReply(reply);
            yield _this.clientSocket.writeAsync(reply);
            if (!success)
                return disposeSockets(null, 'proxy');
            // Step 4: Transport data.
            let transportOps = {
                cipherAlgorithm: _this.cipherAlgorithm,
                password: _this.password,
                clientSocket: _this.clientSocket,
                proxySocket: proxySocket
            };
            connect.transport(transportOps);
            proxySocket.once('end', () => disposeSockets(null, 'proxy end'));
            _this.clientSocket.once('end', () => disposeSockets(null, 'end end'));
            proxySocket.on('error', (err) => disposeSockets(err, 'proxy'));
            _this.clientSocket.on('error', (err) => disposeSockets(err, 'client'));
        }));
        proxySocket.once('error', (error) => disposeSockets(error, 'first'));
        if (!this.timeout)
            return;
        proxySocket.setTimeout(this.timeout * 1000);
        _this.clientSocket.setTimeout(this.timeout * 1000);
    }
}
exports.Socks5Connect = Socks5Connect;
//# sourceMappingURL=connect.js.map