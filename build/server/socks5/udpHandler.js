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
    let ivLength = cryptoEx.SupportedCiphers[options.cipherAlgorithm][1];
    serverUdp.bind();
    serverUdp.unref();
    serverUdp.once('listening', () => __awaiter(this, void 0, Promise, function* () {
        let udpAddr = serverUdp.address();
        let reply = socksHelper.createSocks5TcpReply(0x0, udpAddr.family === 'IPv4' ? socks5Constant_1.ATYP.IPV4 : socks5Constant_1.ATYP.IPV6, udpAddr.address, udpAddr.port);
        let encryptor = cryptoEx.createCipher(options.cipherAlgorithm, options.password);
        let cipher = encryptor.cipher;
        let iv = encryptor.iv;
        let pl = Number((Math.random() * 0xff).toFixed());
        let pd = crypto.randomBytes(pl);
        let el = cipher.update(new Buffer([pl]));
        let er = cipher.update(reply);
        yield client.writeAsync(Buffer.concat([iv, el, pd, er]));
    }));
    let udpSet = new Set();
    serverUdp.on('message', (msg, cinfo) => __awaiter(this, void 0, Promise, function* () {
        let iv = new Buffer(ivLength);
        msg.copy(iv, 0, 0, ivLength);
        let decipher = cryptoEx.createDecipher(options.cipherAlgorithm, options.password, iv);
        let cipher = cryptoEx.createCipher(options.cipherAlgorithm, options.password, iv).cipher;
        let data = decipher.update(msg.slice(iv.length, msg.length));
        let pl = data[0];
        let udpMsg = data.slice(1 + pl, data.length);
        let dst = socksHelper.refineDestination(udpMsg);
        let socketId = `${cinfo.address}:${cinfo.port}`;
        let proxyUdp = dgram.createSocket(udpType);
        proxyUdp.unref();
        proxyUdp.send(udpMsg, dst.headerSize, udpMsg.length - dst.headerSize, dst.port, dst.addr);
        proxyUdp.on('message', (msg, rinfo) => {
            let data = cipher.update(msg);
            proxyUdp.send(data, 0, data.length, cinfo.port, cinfo.address);
        });
        proxyUdp.on('error', (err) => console.log(err.message));
        udpSet.add(proxyUdp);
    }));
    function dispose() {
        serverUdp.removeAllListeners();
        serverUdp.close();
        serverUdp.unref();
        client.dispose();
        udpSet.forEach(udp => {
            udp.close();
        });
    }
    client.on('error', dispose);
    client.on('end', dispose);
    serverUdp.on('error', dispose);
    serverUdp.on('close', dispose);
}
exports.udpAssociate = udpAssociate;
