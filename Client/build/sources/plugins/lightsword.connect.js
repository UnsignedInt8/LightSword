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
    disposeSocket(error, from) {
        this.proxySocket.removeAllListeners();
        this.proxySocket.end();
        this.proxySocket.destroy();
        this.proxySocket = null;
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
                _this.disposeSocket(error, 'connect');
                _this = null;
                callback(false, error.message);
            });
            if (!options.timeout)
                return;
            this.proxySocket.setTimeout(options.timeout * 1000);
        });
    }
    sendCommand(options, callback) {
        return __awaiter(this, void 0, Promise, function* () {
            let proxySocket = this.proxySocket;
            let vNum = this.vNum;
            let connect = {
                dstAddr: options.dstAddr,
                dstPort: options.dstPort,
                type: 'connect',
                vNum: vNum
            };
            let cipher = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);
            let connectBuffer = cipher.update(new Buffer(JSON.stringify(connect)));
            yield proxySocket.writeAsync(connectBuffer);
            let data = yield proxySocket.readAsync();
            if (!data)
                return callback(false, 'Data not available.');
            let decipher = crypto.createDecipher(options.cipherAlgorithm, this.cipherKey);
            try {
                let connectOk = JSON.parse(decipher.update(data).toString());
                if (connectOk.vNum === connect.vNum + 1) {
                    return callback(true);
                }
                return callback(false, "Can't confirm verification number.");
            }
            catch (ex) {
                return callback(false, ex.message);
            }
        });
    }
    transport(options) {
        return __awaiter(this, void 0, Promise, function* () {
            let _this = this;
            let proxySocket = this.proxySocket;
            let clientSocket = options.clientSocket;
            proxySocket.once('end', () => _this.disposeSocket(null, 'proxy end'));
            proxySocket.on('error', (err) => _this.disposeSocket(err, 'proxy error'));
            let decipher = crypto.createDecipher(options.cipherAlgorithm, this.cipherKey);
            proxySocket.pipe(decipher).pipe(clientSocket);
            let cipher = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);
            clientSocket.pipe(cipher).pipe(proxySocket);
        });
    }
}
module.exports = LightSwordConnect;
//# sourceMappingURL=lightsword.connect.js.map