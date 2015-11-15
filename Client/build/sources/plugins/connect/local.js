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
class LocalConnectExecutor {
    negotiate(options, callback) {
        callback(true);
    }
    connectDestination(options, callback) {
        let proxySocket = options.proxySocket;
        let errorHandler = (error) => callback(false, error.message);
        proxySocket.connect(options.dstPort, options.dstAddr, () => {
            proxySocket.removeListener('error', errorHandler);
            callback(true);
        });
        proxySocket.once('error', errorHandler);
    }
    transport(options, communicationEnd) {
        let proxySocket = options.proxySocket;
        let clientSocket = options.clientSocket;
        proxySocket.on('data', (data) => clientSocket.write(data));
        clientSocket.on('data', (data) => proxySocket.write(data));
        proxySocket.once('end', () => communicationEnd());
        clientSocket.once('end', () => communicationEnd());
    }
}
exports.LocalConnectExecutor = LocalConnectExecutor;
module.exports.createExecutor = function () {
    return new LocalConnectExecutor();
};
//# sourceMappingURL=local.js.map