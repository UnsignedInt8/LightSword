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
var dgram = require('dgram');
class LocalUdpAssociate {
    negotiate(options, callback) {
        process.nextTick(() => callback(true));
    }
    sendCommand(options, callback) {
        let _this = this;
        let socket = dgram.createSocket('udp' + net.isIP(options.dstAddr));
        let t = setTimeout(callback(false, 'timeout'), 10 * 1000);
        let errorHandler = (err) => {
            socket.removeAllListeners();
            socket.close();
            socket.unref();
            socket = null;
            callback(false, err.message);
        };
        socket.once('error', errorHandler);
        socket.once('listening', () => {
            _this.proxyUdp = socket;
            socket.removeListener('error', errorHandler);
            clearTimeout(t);
            callback(true);
        });
        socket.bind();
    }
    fillReply(reply) {
        let addr = this.proxyUdp.address();
        reply.writeUInt16BE(addr.port, reply.length - 2);
        return reply;
    }
    transport(options) {
        let clientSocket = options.clientSocket;
        this.proxyUdp.on('message', (msg, rinfo) => {
        });
    }
}
module.exports = LocalUdpAssociate;
//# sourceMappingURL=local.udpAssociate.js.map