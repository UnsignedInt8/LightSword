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
var ipaddr = require('ipaddr.js');
var consts = require('./consts');
const hostname = os.hostname();
let ip;
let ipFamily;
function lookupHostIPAsync() {
    return __awaiter(this, void 0, Promise, function* () {
        if (ip) {
            return new Promise(resolve => resolve(ip));
        }
        return new Promise((resolve, reject) => {
            dns.lookup(hostname, (err, addr, family) => {
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
let socks5;
function buildDefaultSocks5Reply() {
    return __awaiter(this, void 0, Promise, function* () {
        if (socks5) {
            return new Promise(resolve => {
                let duplicate = new Buffer(socks5.length);
                socks5.copy(duplicate);
                resolve(duplicate);
            });
        }
        yield lookupHostIPAsync();
        let bndAddr = ipaddr.parse(ip).toByteArray();
        let atyp = ipFamily === 4 ? consts.ATYP.IPV4 : consts.ATYP.IPV6;
        const bytes = [0x05, 0x0, 0x0, atyp].concat(bndAddr).concat([0x0, 0x0]);
        socks5 = new Buffer(bytes);
        let duplicate = new Buffer(bytes.length);
        socks5.copy(duplicate);
        return duplicate;
    });
}
exports.buildDefaultSocks5Reply = buildDefaultSocks5Reply;
