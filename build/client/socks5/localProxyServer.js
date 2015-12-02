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
var dgram = require('dgram');
var socks5Server_1 = require('./socks5Server');
var socks5Constant_1 = require('../../lib/socks5Constant');
var socks5Helper = require('../../lib/socks5Helper');
class LocalProxyServer extends socks5Server_1.Socks5Server {
    handleRequest(client, request) {
        let dst = socks5Helper.refineDestination(request);
        switch (dst.cmd) {
            case socks5Constant_1.REQUEST_CMD.CONNECT:
                LocalProxyServer.connectServer(client, dst, request, this.timeout);
                break;
            case socks5Constant_1.REQUEST_CMD.UDP_ASSOCIATE:
                LocalProxyServer.udpAssociate(client, dst);
                break;
            default:
                return false;
        }
        return true;
    }
    static bind(client, dst) {
    }
    static udpAssociate(client, dst) {
        let udpType = 'udp' + (net.isIP(dst.addr) || 4);
        let serverUdp = dgram.createSocket(udpType);
        serverUdp.bind();
        serverUdp.unref();
        serverUdp.on('listening', () => __awaiter(this, void 0, Promise, function* () {
            let udpAddr = serverUdp.address();
            let reply = socks5Helper.createSocks5TcpReply(0x0, udpAddr.family === 'IPv4' ? socks5Constant_1.ATYP.IPV4 : socks5Constant_1.ATYP.IPV6, udpAddr.address, udpAddr.port);
            yield client.writeAsync(reply);
        }));
        let udpTable = new Set();
        serverUdp.on('message', (msg, rinfo) => {
            let dst = socks5Helper.refineDestination(msg);
            let proxyUdp = dgram.createSocket(udpType);
            proxyUdp.unref();
            udpTable.add(proxyUdp);
            proxyUdp.send(msg, dst.headerSize, msg.length - dst.headerSize, dst.port, dst.addr);
            proxyUdp.on('message', (msg) => {
                let header = socks5Helper.createSocks5UdpHeader(rinfo.address, rinfo.port);
                let data = Buffer.concat([header, msg]);
                serverUdp.send(data, 0, data.length, rinfo.port, rinfo.address);
            });
            proxyUdp.on('error', () => { proxyUdp.removeAllListeners(); proxyUdp.close(); udpTable.delete(proxyUdp); });
        });
        function dispose() {
            client.dispose();
            serverUdp.removeAllListeners();
            serverUdp.close();
            udpTable.each(udp => {
                udp.removeAllListeners();
                udp.close();
                udpTable.delete(udp);
            });
        }
        serverUdp.on('error', dispose);
        client.on('error', dispose);
        client.on('end', dispose);
    }
    static connectServer(client, dst, request, timeout) {
        let proxySocket = net.createConnection(dst.port, dst.addr, () => __awaiter(this, void 0, Promise, function* () {
            let reply = new Buffer(request.length);
            request.copy(reply);
            reply[0] = 0x05;
            reply[1] = 0x00;
            yield client.writeAsync(reply);
            proxySocket.pipe(client);
            client.pipe(proxySocket);
        }));
        function dispose() {
            proxySocket.dispose();
            client.dispose();
        }
        proxySocket.on('end', dispose);
        proxySocket.on('error', dispose);
        client.on('end', dispose);
        client.on('error', dispose);
        proxySocket.setTimeout(timeout);
        client.setTimeout(timeout);
    }
}
exports.LocalProxyServer = LocalProxyServer;
