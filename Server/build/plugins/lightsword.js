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
var crypto = require('crypto');
class LightSwordSocks5 {
    constructor() {
        this.vNum = 0;
    }
    negotiate(options, callback) {
        return __awaiter(this, void 0, Promise, function* () {
            let clientSocket = options.clientSocket;
            let cipherAlgorithm = options.cipherAlgorithm;
            let password = options.password;
            let decipher = crypto.createDecipher(cipherAlgorithm, password);
            let data = yield clientSocket.readAsync();
            if (!data)
                return callback(false);
            let buf = Buffer.concat([decipher.update(data), decipher.final()]);
            try {
                let handshake = JSON.parse(buf.toString('utf8'));
                let cipherKey = handshake.cipherKey;
                let clientCipherAlgorithm = handshake.cipherAlgorithm;
                let okNum = Number(handshake.vNum);
                let fields = [cipherKey, okNum, clientCipherAlgorithm];
                let digest = '';
                if (fields.any(f => !f))
                    return callback(false, 'Fields lost.');
                if (typeof okNum !== 'number')
                    return callback(false, 'Not recognizable data!!!');
                if (cipherAlgorithm !== clientCipherAlgorithm)
                    return callback(false, 'Cipher algorithm not equal.');
                let welcome = {
                    okNum: ++okNum,
                    digest: digest
                };
                let cipher = crypto.createCipher(cipherAlgorithm, cipherKey);
                yield clientSocket.writeAsync(Buffer.concat([cipher.update(new Buffer(JSON.stringify(welcome))), cipher.final()]));
                this.cipherKey = cipherKey;
                this.vNum = okNum;
                this.digest = digest;
                return callback(true);
            }
            catch (ex) {
                return callback(false, ex.message);
            }
        });
    }
    transport(options) {
        return __awaiter(this, void 0, Promise, function* () {
            let clientSocket = options.clientSocket;
            let cipherAlgorithm = options.cipherAlgorithm;
            function disposeSocket() {
                clientSocket.removeAllListeners();
                clientSocket.end();
                clientSocket.destroy();
                if (!proxySocket)
                    return;
                proxySocket.removeAllListeners();
                proxySocket.end();
                proxySocket.destroy();
            }
            // Resolving Command Type
            let cmdData = yield clientSocket.readAsync();
            let decipher = crypto.createDecipher(cipherAlgorithm, this.cipherKey);
            let buf = Buffer.concat([decipher.update(cmdData), decipher.final()]);
            let request;
            try {
                request = JSON.parse(buf.toString('utf8'));
            }
            catch (ex) {
                return disposeSocket();
            }
            if (request.vNum !== this.vNum)
                return disposeSocket();
            let dstAddr = request.dstAddr;
            let dstPort = request.dstPort;
            let cmdType = request.type;
            var proxySocket = net.createConnection(dstPort, dstAddr, () => __awaiter(this, void 0, Promise, function* () {
                let cipherOnce = crypto.createCipher(options.cipherAlgorithm, this.cipherKey);
                let conncetOk = { msg: 'connect ok', vNum: this.vNum + 1, digest: this.digest };
                yield clientSocket.writeAsync(Buffer.concat([cipherOnce.update(new Buffer(JSON.stringify(conncetOk))), cipherOnce.final()]));
                let cipher = crypto.createCipher(cipherAlgorithm, this.cipherKey);
                let decipher = crypto.createDecipher(cipherAlgorithm, this.cipherKey);
                proxySocket.pipe(cipher).pipe(clientSocket);
                clientSocket.pipe(decipher).pipe(proxySocket);
            }));
            proxySocket.on('error', (err) => disposeSocket());
            clientSocket.on('error', (err) => disposeSocket());
            proxySocket.on('end', () => disposeSocket());
            clientSocket.on('end', () => disposeSocket());
        });
    }
}
module.exports = LightSwordSocks5;
//# sourceMappingURL=lightsword.js.map