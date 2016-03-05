//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const net = require('net');
const dgram = require('dgram');
const socks5Server_1 = require('./socks5Server');
const socks5constant_1 = require('../../common/socks5constant');
const socks5Helper = require('../../common/socks5helper');
class LocalProxyServer extends socks5Server_1.Socks5Server {
    handleRequest(client, request) {
        let dst = socks5Helper.refineDestination(request);
        switch (dst.cmd) {
            case socks5constant_1.REQUEST_CMD.CONNECT:
                LocalProxyServer.connectServer(client, dst, request, this.timeout);
                break;
            case socks5constant_1.REQUEST_CMD.UDP_ASSOCIATE:
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
        serverUdp.on('listening', () => __awaiter(this, void 0, void 0, function* () {
            let udpAddr = serverUdp.address();
            let reply = socks5Helper.createSocks5TcpReply(0x0, udpAddr.family === 'IPv4' ? socks5constant_1.ATYP.IPV4 : socks5constant_1.ATYP.IPV6, udpAddr.address, udpAddr.port);
            yield client.writeAsync(reply);
        }));
        let udpSet = new Set();
        serverUdp.on('message', (msg, rinfo) => {
            let socketId = `${rinfo.address}:${rinfo.port}`;
            let dst = socks5Helper.refineDestination(msg);
            let proxyUdp = dgram.createSocket(udpType);
            proxyUdp.unref();
            proxyUdp.on('message', (msg) => {
                let header = socks5Helper.createSocks5UdpHeader(rinfo.address, rinfo.port);
                let data = Buffer.concat([header, msg]);
                serverUdp.send(data, 0, data.length, rinfo.port, rinfo.address);
            });
            proxyUdp.on('error', (err) => console.log(err.message));
            proxyUdp.send(msg, dst.headerSize, msg.length - dst.headerSize, dst.port, dst.addr);
            udpSet.add(proxyUdp);
        });
        function dispose() {
            client.dispose();
            serverUdp.removeAllListeners();
            serverUdp.close();
            udpSet.forEach(udp => {
                udp.close();
                udp.removeAllListeners();
            });
            udpSet.clear();
        }
        serverUdp.on('error', dispose);
        client.on('error', dispose);
        client.on('end', dispose);
    }
    static connectServer(client, dst, request, timeout) {
        let proxySocket = net.createConnection(dst.port, dst.addr, () => __awaiter(this, void 0, void 0, function* () {
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
