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
var logger = require('winston');
var socks5Consts = require('../socks5/consts');
var socks5Util = require('../socks5/util');
var ipaddr = require('ipaddr.js');
class LocalUdpAssociate {
    negotiate(options, callback) {
        this.udpType = 'udp' + (net.isIP(options.dstAddr) || 4);
        process.nextTick(() => callback(true));
    }
    sendCommand(options, callback) {
        let _this = this;
        let socket = dgram.createSocket(_this.udpType);
        let errorHandler = (err) => {
            socket.removeAllListeners();
            socket.close();
            socket.unref();
            socket = null;
            callback(false, err.message);
        };
        socket.once('error', errorHandler);
        socket.on('listening', () => {
            socket.removeListener('error', errorHandler);
            _this.transitUdp = socket;
            callback(true);
        });
        socket.bind();
    }
    fillReply(reply) {
        let addr = this.transitUdp.address();
        reply.writeUInt16BE(addr.port, reply.length - 2);
        logger.info(`UDP listening on: ${addr.address}:${addr.port}`);
        return reply;
    }
    transport(options) {
        let _this = this;
        let clientSocket = options.clientSocket;
        let dataSocket = dgram.createSocket(_this.udpType);
        let udpReplyHeader;
        let udpReplyAddr;
        let udpReplyPort;
        dataSocket.on('message', (msg, rinfo) => {
            let reply = Buffer.concat([udpReplyHeader, msg]);
            _this.transitUdp.send(reply, 0, reply.length, udpReplyPort, udpReplyAddr);
        });
        dataSocket.on('error', dispose);
        _this.transitUdp.on('message', (msg, rinfo) => {
            if (msg[2] !== 0)
                return dispose();
            udpReplyAddr = rinfo.address;
            udpReplyPort = rinfo.port;
            // ----------------------Build Reply Header----------------------
            let replyAtyp = 0;
            let addrBuf;
            switch (net.isIP(udpReplyAddr)) {
                case 0:
                    replyAtyp = socks5Consts.ATYP.DN;
                    addrBuf = new Buffer(rinfo.address).toArray();
                    break;
                case 4:
                    replyAtyp = socks5Consts.ATYP.IPV4;
                    break;
                case 6:
                    replyAtyp = socks5Consts.ATYP.IPV6;
                    break;
            }
            if (!addrBuf)
                addrBuf = ipaddr.parse(rinfo.address).toByteArray();
            let header = [0x0, 0x0, 0x0, replyAtyp];
            if (replyAtyp === socks5Consts.ATYP.DN)
                header.push(addrBuf.length);
            header = header.concat(addrBuf).concat([0x0, 0x0]);
            udpReplyHeader = new Buffer(header);
            udpReplyHeader.writeUInt16BE(rinfo.port, udpReplyHeader.length - 2);
            // -------------------------------End-------------------------------
            let tuple = socks5Util.refineATYP(msg);
            dataSocket.send(msg, tuple.headerLength, msg.length - tuple.headerLength, tuple.port, tuple.addr);
        });
        _this.transitUdp.on('error', dispose);
        function dispose() {
            _this.transitUdp.removeAllListeners();
            _this.transitUdp.unref();
            _this.transitUdp.close();
            _this.transitUdp = null;
            dataSocket.removeAllListeners();
            dataSocket.unref();
            dataSocket.close();
            dataSocket = null;
            clientSocket.dispose();
            clientSocket = null;
        }
        clientSocket.on('end', dispose);
        clientSocket.on('error', dispose);
        clientSocket.on('close', dispose);
    }
}
module.exports = LocalUdpAssociate;
//# sourceMappingURL=local.udpAssociate.js.map