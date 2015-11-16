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
function negotiate(options) {
    return __awaiter(this, void 0, Promise, function* () {
        let cipherAlgorithm = options.cipherAlgorithm;
        let proxySocket = options.proxySocket;
        let dstAddr = options.dstAddr;
        let dstPort = options.dstPort;
        let sha = crypto.createHash('sha256');
        sha.update((Math.random() * Date.now()).toString());
        let cipherKey = sha.digest().toString('hex');
        let vNum = Number((Math.random() * Date.now()).toFixed());
        let handshake = {
            cipherKey: cipherKey,
            cipherAlgorithm: options.cipherAlgorithm,
            vNum: vNum,
            version: process.version
        };
        let handshakeCipher = crypto.createCipher(options.cipherAlgorithm, options.password);
        let hello = Buffer.concat([handshakeCipher.update(new Buffer(JSON.stringify(handshake))), handshakeCipher.final()]);
        yield proxySocket.writeAsync(hello);
        let data = yield proxySocket.readAsync();
        if (!data)
            return { result: false };
        let handshakeDecipher = crypto.createDecipher(options.cipherAlgorithm, cipherKey);
        let buf = Buffer.concat([handshakeDecipher.update(data), handshakeDecipher.final()]);
        try {
            let res = JSON.parse(buf.toString('utf8'));
            let okNum = Number(res.okNum);
            if (okNum !== vNum + 1)
                return { result: false, reason: "Can't confirm verification number." };
            let { result, reason } = yield connect();
            return { result: result, vNum: okNum, cipherKey: cipherKey };
        }
        catch (ex) {
            logger.error(ex.message);
            return { result: false, reason: ex.message };
        }
        // Connect to destination resource.  
        function connect() {
            return __awaiter(this, void 0, Promise, function* () {
                let connect = {
                    dstAddr: dstAddr,
                    dstPort: dstPort,
                    vNum: vNum,
                    type: 'connect'
                };
                let cipher = crypto.createCipher(cipherAlgorithm, cipherKey);
                let connectBuffer = cipher.update(new Buffer(JSON.stringify(connect)));
                yield proxySocket.writeAsync(connectBuffer);
                let data = yield proxySocket.readAsync();
                if (!data)
                    return { result: false, reason: 'Data not available.' };
                let decipher = crypto.createDecipher(cipherAlgorithm, cipherKey);
                try {
                    let connectOk = JSON.parse(decipher.update(data).toString());
                    if (connectOk.vNum === connect.vNum + 1) {
                        return { result: true };
                    }
                    return { result: false, "Can't confirm verification number.":  };
                }
                catch (ex) {
                    return { result: false, reason: ex.message };
                }
            });
        }
    });
}
exports.negotiate = negotiate;
//# sourceMappingURL=lightsword.js.map