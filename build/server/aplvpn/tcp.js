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
const net = require('net');
const cryptoEx = require('../../common/cipher');
function handleTCP(client, handshake, options) {
    if (handshake.flags == 0x80) {
        handleOutbound(client, handshake.destHost, handshake.destPort, handshake.extra, options);
    }
}
exports.handleTCP = handleTCP;
function handleOutbound(client, host, port, desiredIv, options) {
    let proxy = net.createConnection({ port: port, host: host }, () => __awaiter(this, void 0, void 0, function* () {
        let success = new Buffer([0x01, 0x00]);
        let randomLength = Number((Math.random() * 64).toFixed());
        let reply = Buffer.concat([success, new Buffer(randomLength)]);
        let cipher = cryptoEx.createCipher(options.cipherAlgorithm, options.password, desiredIv).cipher;
        yield client.writeAsync(cipher.update(reply));
        let decipher = cryptoEx.createDecipher(options.cipherAlgorithm, options.password, options.iv);
        client.pipe(decipher).pipe(proxy);
        proxy.pipe(cipher).pipe(client);
    }));
    function dispose() {
        client.dispose();
        proxy.dispose();
    }
    proxy.on('error', dispose);
    proxy.on('end', dispose);
    client.on('error', dispose);
    client.on('end', dispose);
    proxy.setTimeout(options.timeout * 1000);
    client.setTimeout(options.timeout * 1000);
}
