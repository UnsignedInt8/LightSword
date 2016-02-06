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
var net = require('net');
var cryptoEx = require('../../common/cipher');
function handleTCP(client, handshake, options) {
    if (handshake.flags == 0x80) {
        handleOutbound(client, handshake.destHost, handshake.destPort, handshake.extra, options);
    }
}
exports.handleTCP = handleTCP;
function handleOutbound(client, host, port, desiredIv, options) {
    let proxy = net.createConnection({ port, host }, () => __awaiter(this, void 0, Promise, function* () {
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
