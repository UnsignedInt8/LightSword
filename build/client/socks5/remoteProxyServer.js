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
var crypto = require('crypto');
var cryptoEx = require('../../lib/cipher');
var constant_1 = require('../../lib/constant');
var socks5Server_1 = require('./socks5Server');
var localProxyServer_1 = require('./localProxyServer');
var socks5Helper = require('../../lib/socks5Helper');
var socks5Constant_1 = require('../../lib/socks5Constant');
class RemoteProxyServer extends socks5Server_1.Socks5Server {
    handleRequest(client, request) {
        let me = this;
        let req = socks5Helper.refineDestination(request);
        if (this.localArea.any((a) => a.startsWith(req.addr.toLowerCase())) && this.bypassLocal) {
            if (req.cmd === socks5Constant_1.REQUEST_CMD.CONNECT)
                return localProxyServer_1.LocalProxyServer.connectServer(client, { addr: req.addr, port: req.port }, request, this.timeout);
            if (req.cmd === socks5Constant_1.REQUEST_CMD.UDP_ASSOCIATE)
                return localProxyServer_1.LocalProxyServer.udpAssociate(client, { addr: req.addr, port: req.port });
        }
        let proxySocket = net.createConnection(this.serverPort, this.serverAddr, () => __awaiter(this, void 0, Promise, function* () {
            let encryptor = cryptoEx.createCipher(me.cipherAlgorithm, me.password);
            let cipher = encryptor.cipher;
            let iv = encryptor.iv;
            let pl = Number((Math.random() * 0xff).toFixed());
            let et = cipher.update(new Buffer([constant_1.VPN_TYPE.SOCKS5, pl]));
            let pa = crypto.randomBytes(pl);
            let er = cipher.update(request);
            yield proxySocket.writeAsync(Buffer.concat([iv, et, pa, er]));
            let data = yield proxySocket.readAsync();
            if (!data)
                return proxySocket.dispose();
            let riv = new Buffer(iv.length);
            data.copy(riv, 0, 0, iv.length);
            let decipher = cryptoEx.createDecipher(me.cipherAlgorithm, me.password, riv);
            let rlBuf = new Buffer(1);
            data.copy(rlBuf, 0, iv.length, iv.length + 1);
            let paddingSize = decipher.update(rlBuf)[0];
            let reBuf = new Buffer(data.length - iv.length - 1 - paddingSize);
            data.copy(reBuf, 0, iv.length + 1 + paddingSize, data.length);
            let reply = decipher.update(reBuf);
            switch (req.cmd) {
                case socks5Constant_1.REQUEST_CMD.CONNECT:
                    console.info(`connected: ${req.addr}:${req.port}`);
                    yield client.writeAsync(reply);
                    client.pipe(cipher).pipe(proxySocket);
                    proxySocket.pipe(decipher).pipe(client);
                    break;
                case socks5Constant_1.REQUEST_CMD.UDP_ASSOCIATE:
                    let udpReply = socks5Helper.refineDestination(reply);
                    me.udpAssociate(client, { addr: udpReply.addr, udpPort: udpReply.port }, me.cipherAlgorithm, me.password);
                    break;
            }
        }));
        function dispose(err) {
            if (err)
                console.info(err.message);
            client.dispose();
            proxySocket.dispose();
        }
        proxySocket.on('end', () => dispose);
        proxySocket.on('error', () => dispose);
        client.on('end', () => dispose);
        client.on('error', () => dispose);
        proxySocket.setTimeout(this.timeout);
    }
    udpAssociate(client, server, cipherAlgorithm, password) {
        let udpType = 'udp' + (net.isIP(server.addr) || 4);
        let transitUdp = dgram.createSocket(udpType);
        transitUdp.bind();
        transitUdp.unref();
        transitUdp.once('listening', () => __awaiter(this, void 0, Promise, function* () {
            let udpAddr = transitUdp.address();
            let reply = socks5Helper.createSocks5TcpReply(0x0, udpAddr.family === 'IPv4' ? socks5Constant_1.ATYP.IPV4 : socks5Constant_1.ATYP.IPV6, udpAddr.address, udpAddr.port);
            yield client.writeAsync(reply);
        }));
        let udpSet = new Set();
        transitUdp.on('message', (msg, rinfo) => __awaiter(this, void 0, Promise, function* () {
            let proxyUdp = dgram.createSocket(udpType);
            proxyUdp.unref();
            let encryptor = cryptoEx.createCipher(cipherAlgorithm, password);
            let cipher = encryptor.cipher;
            let iv = encryptor.iv;
            let decipher = cryptoEx.createDecipher(cipherAlgorithm, password, iv);
            let pl = Number((Math.random() * 0xff).toFixed());
            let rp = crypto.randomBytes(pl);
            let el = cipher.update(new Buffer([pl]));
            let em = cipher.update(msg);
            let data = Buffer.concat([iv, el, rp, em]);
            proxyUdp.send(data, 0, data.length, server.udpPort, server.addr);
            proxyUdp.on('message', (rMsg) => {
                let reply = decipher.update(rMsg);
                let header = socks5Helper.createSocks5UdpHeader(rinfo.address, rinfo.port);
                let data = Buffer.concat([header, reply]);
                transitUdp.send(data, 0, data.length, rinfo.port, rinfo.address);
            });
            proxyUdp.on('error', () => { proxyUdp.removeAllListeners(); proxyUdp.close(); udpSet.delete(proxyUdp); });
        }));
        function dispose() {
            transitUdp.removeAllListeners();
            transitUdp.close();
            transitUdp.unref();
            udpSet.each(udp => {
                udp.removeAllListeners();
                udp.close();
                udpSet.delete(udp);
            });
        }
        client.once('error', dispose);
        client.once('end', dispose);
        transitUdp.on('error', dispose);
        transitUdp.on('close', dispose);
    }
}
exports.RemoteProxyServer = RemoteProxyServer;
