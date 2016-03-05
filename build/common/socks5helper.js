//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
const net = require('net');
const util = require('util');
const socks5constant_1 = require('./socks5constant');
//
// TCP
// +----+-----+-------+------+----------+----------+
// |VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
// +----+-----+-------+------+----------+----------+
// | 1  |  1  | X'00' |  1   | Variable |    2     |
// +----+-----+-------+------+----------+----------+
//
// UDP
// +----+------+------+----------+----------+----------+
// |RSV | FRAG | ATYP | DST.ADDR | DST.PORT |   DATA   |
// +----+------+------+----------+----------+----------+
// | 2  |  1   |  1   | Variable |    2     | Variable |
// +----+------+------+----------+----------+----------+
function refineDestination(rawData) {
    if (rawData.length < 5) {
        return null;
    }
    let cmd = rawData[1];
    let atyp = rawData[3];
    let addr = '';
    let dnLength = 0;
    switch (atyp) {
        case socks5constant_1.ATYP.DN:
            dnLength = rawData[4];
            addr = rawData.toString('utf8', 5, 5 + dnLength);
            break;
        case socks5constant_1.ATYP.IPV4:
            dnLength = 4;
            addr = rawData.skip(4).take(4).aggregate((c, n) => c.length > 1 ? c + util.format('.%d', n) : util.format('%d.%d', c, n));
            break;
        case socks5constant_1.ATYP.IPV6:
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
    let headerSize = 4 + (atyp === socks5constant_1.ATYP.DN ? 1 : 0) + dnLength + 2;
    let port = rawData.readUInt16BE(headerSize - 2);
    return { cmd: cmd, addr: addr, port: port, headerSize: headerSize };
}
exports.refineDestination = refineDestination;
// +----+-----+-------+------+----------+----------+
// |VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
// +----+-----+-------+------+----------+----------+
// | 1  |  1  | X'00' |  1   | Variable |    2     |
// +----+-----+-------+------+----------+----------+
function createSocks5TcpReply(rep, atyp, fullAddr, port) {
    let tuple = parseAddrToBytes(fullAddr);
    let type = tuple.type;
    let addr = tuple.addrBytes;
    let reply = [0x05, rep, 0x00, atyp];
    if (type === socks5constant_1.ATYP.DN)
        reply.push(addr.length);
    reply = reply.concat(addr).concat([0x00, 0x00]);
    let buf = new Buffer(reply);
    buf.writeUInt16BE(port, buf.length - 2);
    return buf;
}
exports.createSocks5TcpReply = createSocks5TcpReply;
// +----+------+------+----------+----------+----------+
// |RSV | FRAG | ATYP | DST.ADDR | DST.PORT |   DATA   |
// +----+------+------+----------+----------+----------+
// | 2  |  1   |  1   | Variable |    2     | Variable |
// +----+------+------+----------+----------+----------+
function createSocks5UdpHeader(dstAddr, dstPort) {
    let tuple = parseAddrToBytes(dstAddr);
    let type = tuple.type;
    let addr = tuple.addrBytes;
    let reply = [0x0, 0x0, 0x0, type];
    if (type === socks5constant_1.ATYP.DN)
        reply.push(addr.length);
    reply = reply.concat(addr).concat([0x00, 0x00]);
    let buf = new Buffer(reply);
    buf.writeUInt16BE(dstPort, buf.length - 2);
    return buf;
}
exports.createSocks5UdpHeader = createSocks5UdpHeader;
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
    return { addrBytes: addrBytes, type: type ? (type === 4 ? socks5constant_1.ATYP.IPV4 : socks5constant_1.ATYP.IPV6) : socks5constant_1.ATYP.DN };
}
