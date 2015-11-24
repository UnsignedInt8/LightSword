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
var dns = require('dns');
var util = require('util');
var ipaddr = require('ipaddr.js');
var consts = require('./consts');
let ip;
let ipFamily;
function lookupHostIPAsync() {
    return __awaiter(this, void 0, Promise, function* () {
        if (ip) {
            return new Promise(resolve => resolve(ip));
        }
        return new Promise((resolve, reject) => {
            dns.lookup(os.hostname(), (err, addr, family) => {
                if (err)
                    reject(null);
                ip = addr;
                ipFamily = family;
                resolve(addr);
            });
        });
    });
}
exports.lookupHostIPAsync = lookupHostIPAsync;
let socks5Buf;
function buildDefaultSocks5ReplyAsync() {
    return __awaiter(this, void 0, Promise, function* () {
        if (socks5Buf) {
            return new Promise(resolve => {
                let duplicate = new Buffer(socks5Buf.length);
                socks5Buf.copy(duplicate);
                resolve(duplicate);
            });
        }
        yield lookupHostIPAsync();
        let bndAddr = ipaddr.parse(ip).toByteArray();
        let atyp = ipFamily === 4 ? consts.ATYP.IPV4 : consts.ATYP.IPV6;
        const bytes = [0x05, 0x0, 0x0, atyp].concat(bndAddr).concat([0x0, 0x0]);
        socks5Buf = new Buffer(bytes);
        let duplicate = new Buffer(bytes.length);
        socks5Buf.copy(duplicate);
        return duplicate;
    });
}
exports.buildDefaultSocks5ReplyAsync = buildDefaultSocks5ReplyAsync;
function refineATYP(rawData) {
    let addr = '';
    let atyp = rawData[3];
    let addrByteLength = 0;
    switch (atyp) {
        case consts.ATYP.DN:
            let dnLength = rawData[4];
            addrByteLength = dnLength;
            addr = rawData.toString('utf8', 5, 5 + dnLength);
            break;
        case consts.ATYP.IPV4:
            addrByteLength = 4;
            addr = rawData.skip(4).take(4).aggregate((c, n) => c.length > 1 ? c + util.format('.%d', n) : util.format('%d.%d', c, n));
            break;
        case consts.ATYP.IPV6:
            addrByteLength = 16;
            let bytes = rawData.skip(4).take(16).toArray();
            for (let i = 0; i < 8; i++) {
                addr += (new Buffer(bytes.skip(i * 2).take(2).toArray()).toString('hex') + (i < 7 ? ':' : ''));
            }
            break;
        default:
            console.log('break default null');
            return null;
    }
    let portOffest = atyp === consts.ATYP.DN ? addrByteLength + 1 : addrByteLength;
    let port = rawData.readUInt16BE(4 + portOffest);
    let headerLength = 4 + portOffest + 2;
    return { addr: addr, port: port, addrByteLength: addrByteLength, headerLength: headerLength };
}
exports.refineATYP = refineATYP;
//# sourceMappingURL=util.js.map