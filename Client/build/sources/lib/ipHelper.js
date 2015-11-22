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
var os = require('os');
class IpHelper {
    static isLocalAddress(addr) {
        let localIps = ['127.0.0.1', 'localhost', '192.168.', '10.', '::1', '172.16.', os.hostname()];
        return localIps.any(a => addr.toLowerCase().startsWith(a));
    }
}
exports.IpHelper = IpHelper;
//# sourceMappingURL=ipHelper.js.map