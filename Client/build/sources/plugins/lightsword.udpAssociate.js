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
var lightsword_1 = require('./lightsword');
class LightSwordUdpAssociate {
    constructor() {
        this.vNum = 0;
    }
    disposeSocket(error, from) {
        this.transitSocket.removeAllListeners();
        this.transitSocket.end();
        this.transitSocket.destroy();
        this.transitSocket = null;
    }
    negotiate(options, callback) {
        return __awaiter(this, void 0, Promise, function* () {
            let _this = this;
            this.transitSocket = net.createConnection(options.dstPort, options.dstAddr, () => __awaiter(this, void 0, Promise, function* () {
                let result = yield lightsword_1.negotiateAsync(_this.transitSocket, options);
                let success = result.success;
                let reason = result.reason;
                _this.transitSocket.removeAllListeners('error');
                _this.cipherKey = result.cipherKey;
                _this.vNum = result.vNum;
                callback(success, reason);
            }));
            this.transitSocket.on('error', (err) => _this.disposeSocket(err, 'connect'));
        });
    }
    sendCommand(options, callback) {
        return __awaiter(this, void 0, Promise, function* () {
        });
    }
    transport(options) {
        return __awaiter(this, void 0, Promise, function* () {
        });
    }
}
module.exports = LightSwordUdpAssociate;
//# sourceMappingURL=lightsword.udpAssociate.js.map