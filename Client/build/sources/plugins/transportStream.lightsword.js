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
function transport(options) {
    let proxySocket = options.proxySocket;
    let clientSocket = options.clientSocket;
    let decipher = crypto.createDecipher(options.cipherAlgorithm, this.cipherKey);
    // proxySocket.on('data', data => clientSocket.write(decipher.update(data)));
    proxySocket.pipe(decipher).pipe(clientSocket);
    let cipher = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);
    // clientSocket.on('data', (data) => proxySocket.write(cipher.update(data)));
    clientSocket.pipe(cipher).pipe(proxySocket);
}
module.exports = transport;
//# sourceMappingURL=transportStream.lightsword.js.map