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
var crypto = require('crypto');
var logger = require('winston');
var lightsword_1 = require('./lightsword');
class LightSwordConnect {
    constructor() {
        this.vNum = 0;
    }
    negotiate(options, callback) {
        return __awaiter(this, void 0, Promise, function* () {
            let _this = this;
            this.proxySocket = net.createConnection(options.serverPort, options.serverAddr, () => __awaiter(this, void 0, Promise, function* () {
                logger.info(`connect: ${options.dstAddr}`);
                _this.proxySocket.removeAllListeners('error');
                let result = yield lightsword_1.negotiateAsync(_this.proxySocket, options);
                let success = result.success;
                let reason = result.reason;
                _this.cipherKey = result.cipherKey;
                _this.vNum = result.vNum;
                _this = null;
                callback(success, reason);
            }));
            this.proxySocket.on('error', (error) => {
                _this.proxySocket.dispose();
                _this = null;
                callback(false, error.message);
            });
            if (!options.timeout)
                return;
            this.proxySocket.setTimeout(options.timeout * 1000);
        });
    }
    initSocks5Proxy(options, callback) {
        return __awaiter(this, void 0, Promise, function* () {
            let result = yield lightsword_1.initSocks5Async(this.proxySocket, options, 'connect', this.cipherKey, this.vNum);
            callback(result.success, result.reason);
        });
    }
    transport(options) {
        return __awaiter(this, void 0, Promise, function* () {
            let _this = this;
            let proxySocket = this.proxySocket;
            let clientSocket = options.clientSocket;
            function disposeSocket() {
                proxySocket.dispose();
                clientSocket.dispose();
                _this = null;
            }
            proxySocket.once('end', () => disposeSocket());
            proxySocket.on('error', (err) => disposeSocket());
            clientSocket.once('end', () => disposeSocket());
            clientSocket.on('error', (err) => disposeSocket());
            let decipher = crypto.createDecipher(options.cipherAlgorithm, this.cipherKey);
            proxySocket.pipe(decipher).pipe(clientSocket);
            let cipher = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);
            clientSocket.pipe(cipher).pipe(proxySocket);
        });
    }
}
module.exports = LightSwordConnect;
//# sourceMappingURL=lightsword.connect.js.map