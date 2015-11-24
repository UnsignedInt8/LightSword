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
var socks5Util = require('../socks5/util');
class LocalUdpAssociate {
    negotiate(options, callback) {
        this.udpType = 'udp' + net.isIP(options.dstAddr);
        process.nextTick(() => callback(true));
    }
    sendCommand(options, callback) {
        let _this = this;
        let socket = dgram.createSocket(_this.udpType);
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
            _this.transitUdp = socket;
            socket.removeListener('error', errorHandler);
            clearTimeout(t);
            callback(true);
        });
        socket.bind();
        this.transitUdp = socket;
    }
    fillReply(reply) {
        let addr = this.transitUdp.address();
        reply.writeUInt16BE(addr.port, reply.length - 2);
        return reply;
    }
    transport(options) {
        let _this = this;
        let clientSocket = options.clientSocket;
        this.transitUdp.on('message', (msg, rinfo) => {
            if (msg[2] !== 0)
                return;
            let tuple = socks5Util.refineATYP(msg);
            let dataSocket = dgram.createSocket(_this.udpType);
            dataSocket.send(msg, tuple.headerLength, msg.length - tuple.headerLength, tuple.port, tuple.addr);
        });
    }
}
module.exports = LocalUdpAssociate;
//# sourceMappingURL=local.udpAssociate.js.map