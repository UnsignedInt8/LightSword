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
var net = require('net');
var logger = require('winston');
class LocalConnect {
    negotiate(options, callback) {
        let _this = this;
        this.proxySocket = net.createConnection(options.dstPort, options.dstAddr, () => {
            logger.info(`connect: ${options.dstAddr}`);
            _this.proxySocket.removeAllListeners('error');
            _this = null;
            process.nextTick(() => callback(true));
        });
        this.proxySocket.on('error', (err) => {
            _this.proxySocket.dispose();
            _this = null;
            callback(false, err.message);
        });
    }
    initSocks5Proxy(options, callback) {
        process.nextTick(() => callback(true));
    }
    transport(options) {
        let _this = this;
        let proxySocket = this.proxySocket;
        let clientSocket = options.clientSocket;
        function disposeSocket() {
            proxySocket.dispose();
            clientSocket.dispose();
            _this = null;
        }
        proxySocket.once('end', () => disposeSocket());
        proxySocket.on('error', (err) => disposeSocket());
        clientSocket.once('end', () => disposeSocket());
        clientSocket.on('error', (err) => disposeSocket());
        proxySocket.pipe(clientSocket);
        clientSocket.pipe(proxySocket);
    }
}
module.exports = LocalConnect;
//# sourceMappingURL=local.connect.js.map