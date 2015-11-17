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
function negotiate(options) {
    return __awaiter(this, void 0, Promise, function* () {
        let cipherAlgorithm = options.cipherAlgorithm;
        let password = options.password;
        let proxySocket = options.proxySocket;
        let cipherKey = crypto.createHash('sha256').update((Math.random() * Date.now()).toString()).digest().toString('hex');
        let vNum = Number((Math.random() * Date.now()).toFixed());
        let handshake = {
            cipherKey: cipherKey,
            cipherAlgorithm: cipherAlgorithm,
            vNum: vNum,
            version: process.version
        };
        let handshakeCipher = crypto.createCipher(cipherAlgorithm, password);
        let hello = Buffer.concat([handshakeCipher.update(new Buffer(JSON.stringify(handshake))), handshakeCipher.final()]);
        yield proxySocket.writeAsync(hello);
        let data = yield proxySocket.readAsync();
        if (!data)
            return { result: false };
        let handshakeDecipher = crypto.createDecipher(cipherAlgorithm, cipherKey);
        let buf = Buffer.concat([handshakeDecipher.update(data), handshakeDecipher.final()]);
        try {
            let res = JSON.parse(buf.toString('utf8'));
            let okNum = Number(res.okNum);
            if (okNum !== vNum + 1)
                return { result: false, reason: "Can't confirm verification number." };
            return { result: true, vNum: okNum, cipherKey: cipherKey };
        }
        catch (ex) {
            logger.error(ex.message);
            return { result: false, reason: ex.message };
        }
    });
}
exports.negotiate = negotiate;
//# sourceMappingURL=lightsword.js.map