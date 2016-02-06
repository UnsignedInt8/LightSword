//-----------------------------------
// Copyright(c) 2015 Neko
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
var util = require('util');
const illegalAddresses = ['127.0.0.1', '::1', '0.0.0.0', '::0', os.hostname()];
const illegalPrefix = ['192.168.', '10.', '172.168.', 'fe80:'];
function isIllegalAddress(addr) {
    return illegalAddresses.any(a => a === addr) || illegalPrefix.any(a => addr.startsWith(a));
}
exports.isIllegalAddress = isIllegalAddress;
function ntoa(data) {
    let ipVer = data.length;
    switch (ipVer) {
        case 4:
            return util.format('%d.%d.%d.%d', data[0], data[1], data[2], data[3]);
        case 6:
            return util.format('%s%s:%s%s:%s%s:%s%s:%s%s:%s%s:%s%s:%s%s', data[0].toString(16), data[1].toString(16), data[2].toString(16), data[3].toString(16), data[4].toString(16), data[5].toString(16), data[6].toString(16), data[7].toString(16), data[8].toString(16), data[9].toString(16), data[10].toString(16), data[11].toString(16), data[12].toString(16), data[13].toString(16), data[14].toString(16), data[15].toString(16));
    }
}
exports.ntoa = ntoa;
