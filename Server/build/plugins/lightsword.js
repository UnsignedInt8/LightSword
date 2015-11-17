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
function negotiateAsync(options) {
    return __awaiter(this, void 0, Promise, function* () {
        let clientSocket = options.clientSocket;
        let cipherAlgorithm = options.cipherAlgorithm;
        let password = options.password;
        let decipher = crypto.createDecipher(cipherAlgorithm, password);
        let data = yield clientSocket.readAsync();
        if (!data)
            return { success: false };
        let buf = Buffer.concat([decipher.update(data), decipher.final()]);
        try {
            let handshake = JSON.parse(buf.toString('utf8'));
            let cipherKey = handshake.cipherKey;
            let clientCipherAlgorithm = handshake.cipherAlgorithm;
            let okNum = Number(handshake.vNum);
            let fields = [cipherKey, okNum, clientCipherAlgorithm];
            let digest = '';
            if (fields.any(f => !f))
                return { success: false, reason: 'Fields lost' };
            if (typeof okNum !== 'number')
                return { success: false, reason: 'Not recognizable data!!!' };
            if (cipherAlgorithm !== clientCipherAlgorithm)
                return { success: false, reason: 'Cipher algorithm not equal' };
            let welcome = {
                okNum: ++okNum,
                digest: digest
            };
            let cipher = crypto.createCipher(cipherAlgorithm, cipherKey);
            yield clientSocket.writeAsync(Buffer.concat([cipher.update(new Buffer(JSON.stringify(welcome))), cipher.final()]));
            return { success: true, cipherKey: cipherKey, okNum: okNum };
        }
        catch (ex) {
            return { success: false, reason: ex.message };
        }
    });
}
exports.negotiateAsync = negotiateAsync;
//# sourceMappingURL=lightsword.js.map