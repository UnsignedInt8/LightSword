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
 * LightSword Negotiation Algorithm
 */
function negotiateAsync(socket, options) {
    return __awaiter(this, void 0, Promise, function* () {
        let cipherAlgorithm = options.cipherAlgorithm;
        let password = options.password;
        let proxySocket = socket;
        let cipherKey = crypto.createHash('sha256').update((Math.random() * Date.now()).toString()).digest('hex');
        let vNum = Number((Math.random() * Date.now()).toFixed());
        let handshake = {
            padding: cipherKey.where(c => c >= 'a' && c <= 'z').toArray(),
            cipherKey: cipherKey,
            cipherAlgorithm: cipherAlgorithm,
            vNum: vNum,
        };
        let handshakeCipher = crypto.createCipher(cipherAlgorithm, password);
        let message = JSON.stringify(handshake);
        let digest = crypto.createHash('md5').update(message).digest('hex');
        message = `${message}\n${digest}`;
        let hello = Buffer.concat([handshakeCipher.update(new Buffer(message)), handshakeCipher.final()]);
        yield proxySocket.writeAsync(hello);
        let data = yield proxySocket.readAsync();
        if (!data)
            return { success: false };
        let handshakeDecipher = crypto.createDecipher(cipherAlgorithm, cipherKey);
        let buf = Buffer.concat([handshakeDecipher.update(data), handshakeDecipher.final()]);
        try {
            let res = JSON.parse(buf.toString('utf8'));
            let okNum = Number(res.okNum);
            if (res.digest !== digest)
                return { success: false, reason: 'Message has been falsified' };
            if (okNum !== (vNum + 1))
                return { success: false, reason: "Can't confirm verification number." };
            return { success: true, vNum: okNum, cipherKey: cipherKey };
        }
        catch (ex) {
            logger.error(ex.message);
            return { success: false, reason: ex.message };
        }
    });
}
exports.negotiateAsync = negotiateAsync;
function initSocks5Async(socket, options, cmdType, cipherKey, vNum) {
    return __awaiter(this, void 0, Promise, function* () {
        let proxySocket = socket;
        let connect = {
            dstAddr: options.dstAddr,
            dstPort: options.dstPort,
            type: cmdType,
            vNum: vNum
        };
        let cipher = crypto.createCipher(options.cipherAlgorithm, cipherKey);
        let connectBuffer = cipher.update(new Buffer(JSON.stringify(connect)));
        yield proxySocket.writeAsync(connectBuffer);
        let data = yield proxySocket.readAsync();
        if (!data)
            return { success: false, reason: 'Data not available.' };
        let decipher = crypto.createDecipher(options.cipherAlgorithm, cipherKey);
        try {
            let connectOk = JSON.parse(decipher.update(data).toString());
            if (connectOk.vNum === vNum + 1) {
                return { success: true };
            }
            console.log(connectOk);
            console.log('vNum', vNum);
            return { success: false, reason: "Can't confirm verification number." };
        }
        catch (ex) {
            return { success: false, reason: ex.message };
        }
    });
}
exports.initSocks5Async = initSocks5Async;
//# sourceMappingURL=lightsword.js.map