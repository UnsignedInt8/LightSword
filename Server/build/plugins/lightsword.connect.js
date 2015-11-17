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
var lightsword_1 = require('./lightsword');
class LightSwordConnect {
    constructor() {
        this.vNum = 0;
    }
    negotiate(options, callback) {
        let { success, cipherKey, okNum, reason, digest } = yield lightsword_1.negotiateAsync(options);
        callback(success, reason);
        this.cipherKey = cipherKey;
        this.vNum = okNum;
        this.digest = digest;
    }
    transport(options) {
        let clientSocket = options.clientSocket;
        // Resolving Command Type
        let cmdData = yield clientSocket.readAsync();
        let decipher = crypto.createDecipher(options.cipherAlgorithm, this.cipherKey);
        let buf = Buffer.concat([decipher.update(cmdData), decipher.final()]);
        let request;
        try {
            request = JSON.parse(buf.toString('utf8'));
        }
        catch (ex) {
            clientSocket.end();
        }
    }
}
exports.LightSwordConnect = LightSwordConnect;
//# sourceMappingURL=lightsword.connect.js.map