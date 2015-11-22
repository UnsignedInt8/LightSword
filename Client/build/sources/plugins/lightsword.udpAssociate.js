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
var lightsword_1 = require('./lightsword');
class LightSwordUdpAssociate {
    constructor() {
        this.vNum = 0;
    }
    negotiate(options, callback) {
        return __awaiter(this, void 0, Promise, function* () {
            let result = yield lightsword_1.negotiateAsync(options);
            let success = result.success;
            let reason = result.reason;
            this.cipherKey = result.cipherKey;
            this.vNum = result.vNum;
            callback(success, reason);
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
//# sourceMappingURL=lightsword.udpAssociate.js.map