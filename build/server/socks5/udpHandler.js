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
var cryptoEx = require('../../lib/cipher');
var socks5Constant_1 = require('../../lib/socks5Constant');
var socksHelper = require('../../lib/socks5Helper');
function udpAssociate(client, rawData, dst, options) {
    let udpType = 'udp' + (net.isIP(dst.addr) || 4);
    let serverUdp = dgram.createSocket(udpType);
    let cipher;
    serverUdp.bind();
    serverUdp.unref();
    serverUdp.once('listening', () => __awaiter(this, void 0, Promise, function* () {
        let udpAddr = serverUdp.address();
        let reply = socksHelper.buildSocks5Reply(0x0, udpAddr.family === '' ? socks5Constant_1.ATYP.IPV4 : socks5Constant_1.ATYP.IPV6, udpAddr.address, udpAddr.port);
        let encryptor = cryptoEx.createCipher(options.cipherAlgorithm, options.password);
        cipher = encryptor.cipher;
        let iv = encryptor.iv;
        let pl = Number((Math.random() * 0xff).toFixed());
        let pd = crypto.randomBytes(pl);
        let el = cipher.update(new Buffer([pl]));
        let er = cipher.update(reply);
        yield client.writeAsync(Buffer.concat([iv, el, pd, er]));
    }));
    let udpTable = new Map();
    serverUdp.on('message', (msg, rinfo) => __awaiter(this, void 0, Promise, function* () {
        let udpMsg = options.decipher.update(msg);
        let dst = socksHelper.refineDestination(msg);
        let proxyUdp = dgram.createSocket(udpType);
        proxyUdp.unref();
        proxyUdp.send(udpMsg, dst.headerSize, udpMsg.length - dst.headerSize, dst.port, dst.addr);
        proxyUdp.on('error', () => { proxyUdp.removeAllListeners(); proxyUdp.close(); udpTable.delete(dst); });
        proxyUdp.on('message', (msg) => {
            let header = socksHelper.buildSocks5UdpReply(rinfo.address, rinfo.port);
            // serverUdp.send()
        });
        udpTable.set(dst, proxyUdp);
    }));
    function dispose() {
        serverUdp.removeAllListeners();
        serverUdp.close();
        serverUdp.unref();
        client.dispose();
    }
    client.on('error', dispose);
    client.on('end', dispose);
    serverUdp.on('error', dispose);
    serverUdp.on('close', dispose);
}
exports.udpAssociate = udpAssociate;
