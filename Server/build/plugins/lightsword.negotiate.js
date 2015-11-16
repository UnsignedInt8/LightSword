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
function negotiate(options) {
    return __awaiter(this, void 0, Promise, function* () {
        let clientSocket = options.clientSocket;
        let cipherAlgorithm = options.cipherAlgorithm;
        let password = options.password;
        let decipher = crypto.createDecipher(cipherAlgorithm, password);
        let data = yield clientSocket.readAsync();
        let buf = Buffer.concat([decipher.update(data), decipher.final()]);
        return true;
    });
}
exports.negotiate = negotiate;
//# sourceMappingURL=lightsword.negotiate.js.map