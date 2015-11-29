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
var util = require('util');
var socks5Constant_1 = require('./socks5Constant');
// +----+-----+-------+------+----------+----------+
// |VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
// +----+-----+-------+------+----------+----------+
// | 1  |  1  | X'00' |  1   | Variable |    2     |
// +----+-----+-------+------+----------+----------+
// +----+------+------+----------+----------+----------+
// |RSV | FRAG | ATYP | DST.ADDR | DST.PORT |   DATA   |
// +----+------+------+----------+----------+----------+
// | 2  |  1   |  1   | Variable |    2     | Variable |
// +----+------+------+----------+----------+----------+
function refineDestination(rawData) {
    let cmd = rawData[1];
    let atyp = rawData[3];
    let port = rawData.readUInt16BE(rawData.length - 2);
    let addr = '';
    let dnLength = 0;
    switch (atyp) {
        case socks5Constant_1.ATYP.DN:
            dnLength = rawData[4];
            addr = rawData.toString('utf8', 5, 5 + dnLength);
            break;
        case socks5Constant_1.ATYP.IPV4:
            dnLength = 4;
            addr = rawData.skip(4).take(4).aggregate((c, n) => c.length > 1 ? c + util.format('.%d', n) : util.format('%d.%d', c, n));
            break;
        case socks5Constant_1.ATYP.IPV6:
            dnLength = 16;
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
    return { cmd: cmd, addr: addr, port: port, headerSize: 4 + (atyp === socks5Constant_1.ATYP.DN ? 1 : 0) + dnLength + 2 };
}
exports.refineDestination = refineDestination;
// +----+-----+-------+------+----------+----------+
// |VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
// +----+-----+-------+------+----------+----------+
// | 1  |  1  | X'00' |  1   | Variable |    2     |
// +----+-----+-------+------+----------+----------+
function buildSocks5Reply(rep, atyp, fullAddr, port) {
    let tuple = parseAddrToBytes(fullAddr);
    let type = tuple.type;
    let addr = tuple.addrBytes;
    let reply = [0x05, rep, 0x00, atyp];
    if (type === socks5Constant_1.ATYP.DN)
        reply.push(addr.length);
    reply = reply.concat(addr).concat([0x00, 0x00]);
    let buf = new Buffer(reply);
    buf.writeUInt16BE(port, buf.length - 2);
    return buf;
}
exports.buildSocks5Reply = buildSocks5Reply;
// +----+------+------+----------+----------+----------+
// |RSV | FRAG | ATYP | DST.ADDR | DST.PORT |   DATA   |
// +----+------+------+----------+----------+----------+
// | 2  |  1   |  1   | Variable |    2     | Variable |
// +----+------+------+----------+----------+----------+
function buildSocks5UdpReply(dstAddr, dstPort) {
    let tuple = parseAddrToBytes(dstAddr);
    let type = tuple.type;
    let addr = tuple.addrBytes;
    let reply = [0x0, 0x0, 0x0, type];
    if (type === socks5Constant_1.ATYP.DN)
        reply.push(addr.length);
    reply = reply.concat(addr).concat([0x00, 0x00]);
    let buf = new Buffer(reply);
    buf.writeUInt16BE(dstPort, buf.length - 2);
    return buf;
}
exports.buildSocks5UdpReply = buildSocks5UdpReply;
function parseAddrToBytes(fullAddr) {
    let type = net.isIP(fullAddr);
    let addrBytes = [];
    switch (type) {
        case 4:
            addrBytes = fullAddr.split('.').select(s => Number.parseInt(s)).toArray();
            break;
        case 6:
            addrBytes = fullAddr.split(':').select(s => [Number.parseInt(s.substr(0, 2), 16), Number.parseInt(s.substr(2, 2), 16)]).aggregate((c, n) => c.concat(n));
            break;
        case 0:
            fullAddr.each((c, i) => addrBytes.push(fullAddr.charCodeAt(i)));
            break;
    }
    return { addrBytes: addrBytes, type: type ? (type === 4 ? socks5Constant_1.ATYP.IPV4 : socks5Constant_1.ATYP.IPV6) : socks5Constant_1.ATYP.DN };
}
