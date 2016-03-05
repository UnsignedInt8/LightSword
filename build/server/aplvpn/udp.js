//-----------------------------------
// Copyright(c) 2016 Neko
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
const dgram = require('dgram');
const crypto = require('crypto');
const cryptoEx = require('../../common/cipher');
const protocols_1 = require('./protocols');
function handleUDP(client, handshake, options) {
    let communicationPending = false;
    let udpType = handshake.ipVer == protocols_1.IP_VER.V4 ? 'udp4' : 'udp6';
    let destAddress = handshake.destHost;
    let decipher = null;
    let udpSocket = dgram.createSocket(udpType, (msg, rinfo) => __awaiter(this, void 0, void 0, function* () {
        let iv = crypto.randomBytes(options.ivLength);
        let cipher = cryptoEx.createCipher(options.cipherAlgorithm, options.password, iv).cipher;
        let len = new Buffer(2);
        len.writeUInt16LE(msg.length, 0);
        let encrypted = cipher.update(Buffer.concat([len, msg]));
        yield client.writeAsync(Buffer.concat([iv, encrypted]));
        communicationPending = true;
    }));
    udpSocket.on('error', () => dispose());
    udpSocket.send(handshake.extra, 0, handshake.extra.length, handshake.destPort, destAddress);
    client.on('data', (d) => {
        if (!decipher)
            decipher = cryptoEx.createDecipher(options.cipherAlgorithm, options.password, options.iv);
        let msg = decipher.update(d);
        udpSocket.send(msg, 0, msg.length, handshake.destPort, destAddress);
        communicationPending = true;
    });
    let cleanTimer = setInterval(() => {
        if (communicationPending) {
            communicationPending = false;
            return;
        }
        dispose();
    }, 30 * 1000);
    function dispose() {
        clearInterval(cleanTimer);
        client.dispose();
        udpSocket.close();
        udpSocket.unref();
        udpSocket.removeAllListeners();
    }
    client.on('error', () => dispose());
    client.on('end', () => dispose());
}
exports.handleUDP = handleUDP;
