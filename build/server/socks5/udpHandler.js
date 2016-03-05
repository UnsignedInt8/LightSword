//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const net = require('net');
const dgram = require('dgram');
const crypto = require('crypto');
const cryptoEx = require('../../common/cipher');
const socks5constant_1 = require('../../common/socks5constant');
const socksHelper = require('../../common/socks5helper');
function udpAssociate(client, rawData, dst, options) {
    let udpType = 'udp' + (net.isIP(dst.addr) || 4);
    let serverUdp = dgram.createSocket(udpType);
    let ivLength = cryptoEx.SupportedCiphers[options.cipherAlgorithm][1];
    serverUdp.bind();
    serverUdp.unref();
    serverUdp.once('listening', () => __awaiter(this, void 0, void 0, function* () {
        let udpAddr = serverUdp.address();
        let reply = socksHelper.createSocks5TcpReply(0x0, udpAddr.family === 'IPv4' ? socks5constant_1.ATYP.IPV4 : socks5constant_1.ATYP.IPV6, udpAddr.address, udpAddr.port);
        let encryptor = cryptoEx.createCipher(options.cipherAlgorithm, options.password);
        let cipher = encryptor.cipher;
        let iv = encryptor.iv;
        let pl = Number((Math.random() * 0xff).toFixed());
        let el = new Buffer([pl]);
        let pd = crypto.randomBytes(pl);
        let er = cipher.update(Buffer.concat([el, pd, reply]));
        yield client.writeAsync(Buffer.concat([iv, er]));
    }));
    let udpSet = new Set();
    serverUdp.on('message', (msg, cinfo) => __awaiter(this, void 0, void 0, function* () {
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
