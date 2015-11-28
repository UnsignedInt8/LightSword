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
var util = require('util');
var socks5Constant_1 = require('./socks5Constant');
// +----+-----+-------+------+----------+----------+
// |VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
// +----+-----+-------+------+----------+----------+
// | 1  |  1  | X'00' |  1   | Variable |    2     |
// +----+-----+-------+------+----------+----------+
function refineDestination(rawData) {
    let atyp = rawData[3];
    let port = rawData.readUInt16BE(rawData.length - 2);
    let addr = '';
    switch (atyp) {
        case socks5Constant_1.ATYP.DN:
            let dnLength = rawData[4];
            addr = rawData.toString('utf8', 5, 5 + dnLength);
            break;
        case socks5Constant_1.ATYP.IPV4:
            addr = rawData.skip(4).take(4).aggregate((c, n) => c.length > 1 ? c + util.format('.%d', n) : util.format('%d.%d', c, n));
            break;
        case socks5Constant_1.ATYP.IPV6:
            let bytes = rawData.skip(4).take(16).toArray();
            let ipv6 = '';
            for (let b of bytes) {
                ipv6 += ('0' + b.toString(16)).substr(-2);
            }
            addr = ipv6.substr(0, 4);
            for (let i = 1; i < 8; i++) {
                addr = util.format('%s:%s', addr, ipv6.substr(4 * i, 4));
            }
            break;
    }
    return { addr: addr, port: port };
}
exports.refineDestination = refineDestination;
