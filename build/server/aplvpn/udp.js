//-----------------------------------
// Copyright(c) 2016 Neko
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
var dgram = require('dgram');
var crypto = require('crypto');
var cryptoEx = require('../../common/cipher');
var protocols_1 = require('./protocols');
var addrHelper = require('../lib/addressHelper');
function handleUDP(client, handshake, options) {
    let communicationPending = false;
    let udpType = handshake.ipVer == protocols_1.IP_VER.V4 ? 'udp4' : 'udp6';
    let destAddress = addrHelper.ntoa(handshake.destAddress);
    let decipher = null;
    let udpSocket = dgram.createSocket(udpType, (msg, rinfo) => __awaiter(this, void 0, Promise, function* () {
        let iv = crypto.randomBytes(options.ivLength);
        let cipher = cryptoEx.createCipher(options.cipherAlgorithm, options.password, iv).cipher;
        let len = new Buffer(2);
        len.writeUInt16LE(msg.length, 0);
        let encrypted = cipher.update(Buffer.concat([len, msg]));
        yield client.writeAsync(Buffer.concat([iv, encrypted]));
        disposeResource();
    }));
    udpSocket.on('error', () => disposeResource());
    udpSocket.send(handshake.extra, 0, handshake.extra.length, handshake.destPort, destAddress);
    function disposeResource() {
        clearInterval(cleanTimer);
        client.dispose();
        udpSocket.close();
        udpSocket.removeAllListeners();
    }
    let cleanTimer = setInterval(() => {
        if (communicationPending) {
            communicationPending = false;
            return;
        }
        disposeResource();
    }, 30 * 1000);
    client.on('error', () => disposeResource());
}
exports.handleUDP = handleUDP;
