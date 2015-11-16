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
var crypto = require('crypto');
var logger = require('winston');
/**
 * LightSword Default Connect Implementator
 */
class LightSwordConnectExecutor {
    negotiate(options, callback) {
        return __awaiter(this, void 0, Promise, function* () {
            let proxySocket = options.proxySocket;
            let sha = crypto.createHash('sha256');
            sha.update((Math.random() * Date.now()).toString());
            let cipherKey = sha.digest().toString('hex');
            let vNum = Number((Math.random() * Date.now()).toFixed());
            let handshake = {
                cipherKey: cipherKey,
                cipherAlgorithm: options.cipherAlgorithm,
                vNum: vNum,
                version: process.versions
            };
            let handshakeCipher = crypto.createCipher(options.cipherAlgorithm, options.password);
            let hello = Buffer.concat([handshakeCipher.update(new Buffer(JSON.stringify(handshake))), handshakeCipher.final()]);
            yield proxySocket.writeAsync(hello);
            let data = yield proxySocket.readAsync();
            if (!data)
                return callback(false);
            let handshakeDecipher = crypto.createDecipher(options.cipherAlgorithm, cipherKey);
            let buf = Buffer.concat([handshakeDecipher.update(data), handshakeDecipher.final()]);
            try {
                let res = JSON.parse(buf.toString('utf8'));
                let okNum = Number(res.okNum);
                if (okNum !== vNum + 1)
                    return callback(false, "Can't confirm verification number.");
                this.cipherKey = cipherKey;
                this.vNum = okNum;
                callback(true);
            }
            catch (ex) {
                logger.error(ex.message);
                callback(false, ex.message);
            }
        });
    }
    connectDestination(options, callback) {
        return __awaiter(this, void 0, Promise, function* () {
            let proxySocket = options.proxySocket;
            let connect = {
                dstAddr: options.dstAddr,
                dstPort: options.dstPort,
                vNum: this.vNum,
                type: 'connect'
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
        let proxySocket = options.proxySocket;
        let clientSocket = options.clientSocket;
        let decipher = crypto.createDecipher(options.cipherAlgorithm, this.cipherKey);
        proxySocket.on('data', data => clientSocket.write(decipher.update(data)));
        let cipher = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);
        clientSocket.on('data', (data) => proxySocket.write(cipher.update(data)));
    }
}
module.exports = LightSwordConnectExecutor;
//# sourceMappingURL=lightsword.js.map