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
var crypto = require('crypto');
var ipaddr = require('ipaddr.js');
var socks5Consts = require('../socks5/consts');
var socks5Util = require('../socks5/util');
var logger = require('winston');
var lightsword_1 = require('./lightsword');
class LightSwordUdpAssociate {
    constructor() {
        this.vNum = 0;
    }
    negotiate(options, callback) {
        return __awaiter(this, void 0, Promise, function* () {
            let ip = yield socks5Util.lookupHostIPAsync();
            this.udpType = 'udp' + (net.isIP(ip) || 4);
            let _this = this;
            this.proxySocket = net.createConnection(options.dstPort, options.dstAddr, () => __awaiter(this, void 0, Promise, function* () {
                let result = yield lightsword_1.negotiateAsync(_this.proxySocket, options);
                let success = result.success;
                let reason = result.reason;
                _this.proxySocket.removeAllListeners('error');
                _this.cipherKey = result.cipherKey;
                _this.vNum = result.vNum;
                _this = null;
                callback(success, reason);
            }));
            this.proxySocket.on('error', (err) => {
                _this.proxySocket.dispose();
                _this = null;
                callback(false, err.message);
            });
        });
    }
    initSocks5Proxy(options, callback) {
        return __awaiter(this, void 0, Promise, function* () {
            let _this = this;
            let result = yield lightsword_1.initSocks5Async(this.proxySocket, options, 'udpAssociate', this.cipherKey, this.vNum);
            if (!result.success)
                callback(false, result.reason);
            let udp = dgram.createSocket(this.udpType);
            udp.once('error', (err) => {
                udp.removeAllListeners();
                udp.close();
                udp.unref();
                udp = null;
                callback(false, err.message);
            });
            udp.once('listening', () => {
                udp.removeAllListeners('error');
                _this.udpSocket = udp;
                callback(true);
            });
            udp.bind();
        });
    }
    fillReply(reply) {
        let addr = this.udpSocket.address();
        reply.writeUInt16BE(addr.port, reply.length - 2);
        logger.info(`UDP listening on: ${addr.address}:${addr.port}`);
        return reply;
    }
    transport(options) {
        return __awaiter(this, void 0, Promise, function* () {
            let _this = this;
            let clientSocket = options.clientSocket;
            let udpReplyHeader;
            let udpReplyAddr;
            let udpReplyPort;
            let decipher = crypto.createDecipher(options.cipherAlgorithm, this.cipherKey);
            let cipher = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);
            this.proxySocket.on('data', (data) => {
                let reply = Buffer.concat([udpReplyHeader, decipher.update(data)]);
                _this.udpSocket.send(reply, 0, reply.length, udpReplyPort, udpReplyAddr);
            });
            this.proxySocket.on('error', dispose);
            this.proxySocket.on('end', dispose);
            this.proxySocket.on('close', dispose);
            _this.udpSocket.on('message', (msg, rinfo) => __awaiter(this, void 0, Promise, function* () {
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
                yield _this.proxySocket.writeAsync(cipher.update(new Buffer(msg.skip(tuple.headerLength).toArray())));
            }));
            _this.udpSocket.on('error', dispose);
            function dispose() {
                _this.udpSocket.removeAllListeners();
                _this.udpSocket.unref();
                _this.udpSocket.close();
                _this.udpSocket = null;
                _this.proxySocket.dispose();
                _this.proxySocket = null;
                clientSocket.dispose();
                clientSocket = null;
            }
            clientSocket.on('end', dispose);
            clientSocket.on('error', dispose);
            clientSocket.on('close', dispose);
        });
    }
}
module.exports = LightSwordUdpAssociate;
//# sourceMappingURL=lightsword.udpAssociate.js.map