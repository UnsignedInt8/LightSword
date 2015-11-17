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
class LocalConnect {
    negotiate(options, callback) {
        process.nextTick(() => callback(true));
    }
    sendCommand(options, callback) {
        process.nextTick(() => callback(true));
    }
    transportStream(options) {
        let proxySocket = options.proxySocket;
        let clientSocket = options.clientSocket;
        proxySocket.pipe(clientSocket);
        clientSocket.pipe(proxySocket);
    }
}
module.exports = LocalConnect;
//# sourceMappingURL=local.connect.js.map