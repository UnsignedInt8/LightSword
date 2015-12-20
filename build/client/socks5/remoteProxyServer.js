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
var socks5Server_1 = require('./socks5Server');
var constant_1 = require('../../lib/constant');
var localProxyServer_1 = require('./localProxyServer');
var socks5Helper = require('../../lib/socks5Helper');
var socks5Constant_1 = require('../../lib/socks5Constant');
class RemoteProxyServer extends socks5Server_1.Socks5Server {
    handleRequest(client, request) {
        let me = this;
        let req = socks5Helper.refineDestination(request);
        if (this.localArea.any((a) => req.addr.toLowerCase().startsWith(a)) && this.bypassLocal) {
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
            let et = new Buffer([constant_1.VPN_TYPE.SOCKS5, pl]);
            let pa = crypto.randomBytes(pl);
            let er = cipher.update(Buffer.concat([et, pa, request]));
            yield proxySocket.writeAsync(Buffer.concat([iv, er]));
            let data = yield proxySocket.readAsync();
            if (!data)
                return proxySocket.dispose();
            let riv = data.slice(0, iv.length);
            let decipher = cryptoEx.createDecipher(me.cipherAlgorithm, me.password, riv);
            let rlBuf = data.slice(iv.length, iv.length + 1);
            let paddingSize = decipher.update(rlBuf)[0];
            let reBuf = data.slice(iv.length + 1 + paddingSize, data.length);
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
                    me.udpAssociate(client, { addr: udpReply.addr, port: udpReply.port }, me.cipherAlgorithm, me.password);
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
    udpAssociate(client, udpServer, cipherAlgorithm, password) {
        let udpType = 'udp' + (net.isIP(udpServer.addr) || 4);
        let listeningUdp = dgram.createSocket(udpType);
        listeningUdp.bind();
        listeningUdp.unref();
        listeningUdp.once('listening', () => __awaiter(this, void 0, Promise, function* () {
            let udpAddr = listeningUdp.address();
            let reply = socks5Helper.createSocks5TcpReply(0x0, udpAddr.family === 'IPv4' ? socks5Constant_1.ATYP.IPV4 : socks5Constant_1.ATYP.IPV6, udpAddr.address, udpAddr.port);
            yield client.writeAsync(reply);
        }));
        listeningUdp.on('message', (msg, cinfo) => __awaiter(this, void 0, Promise, function* () {
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
            proxyUdp.send(data, 0, data.length, udpServer.port, udpServer.addr);
            proxyUdp.on('message', (sMsg, sinfo) => {
                let reply = decipher.update(sMsg);
                let header = socks5Helper.createSocks5UdpHeader(cinfo.address, cinfo.port);
                let data = Buffer.concat([header, reply]);
                listeningUdp.send(data, 0, data.length, cinfo.port, cinfo.address);
            });
            proxyUdp.on('error', () => { proxyUdp.removeAllListeners(); proxyUdp.close(); });
        }));
        function dispose() {
            listeningUdp.removeAllListeners();
            listeningUdp.close();
            listeningUdp.unref();
        }
        client.once('error', dispose);
        client.once('end', dispose);
        listeningUdp.on('error', dispose);
        listeningUdp.on('close', dispose);
    }
}
exports.RemoteProxyServer = RemoteProxyServer;
