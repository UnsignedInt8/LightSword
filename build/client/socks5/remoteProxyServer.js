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
const crypto = require('crypto');
const cryptoEx = require('../../common/cipher');
const socks5Server_1 = require('./socks5Server');
const constant_1 = require('../../common/constant');
const localProxyServer_1 = require('./localProxyServer');
const socks5Helper = require('../../common/socks5helper');
const socks5constant_1 = require('../../common/socks5constant');
class RemoteProxyServer extends socks5Server_1.Socks5Server {
    handleRequest(client, request) {
        let me = this;
        let req = socks5Helper.refineDestination(request);
        if (this.localArea.any((a) => req.addr.toLowerCase().startsWith(a)) && this.bypassLocal) {
            if (req.cmd === socks5constant_1.REQUEST_CMD.CONNECT)
                return localProxyServer_1.LocalProxyServer.connectServer(client, { addr: req.addr, port: req.port }, request, this.timeout);
            if (req.cmd === socks5constant_1.REQUEST_CMD.UDP_ASSOCIATE)
                return localProxyServer_1.LocalProxyServer.udpAssociate(client, { addr: req.addr, port: req.port });
        }
        let proxySocket = net.createConnection(this.serverPort, this.serverAddr, () => __awaiter(this, void 0, void 0, function* () {
            let encryptor = cryptoEx.createCipher(me.cipherAlgorithm, me.password);
            let handshakeCipher = encryptor.cipher;
            let iv = encryptor.iv;
            let pl = Number((Math.random() * 0xff).toFixed());
            let et = new Buffer([constant_1.VPN_TYPE.SOCKS5, pl]);
            let pa = crypto.randomBytes(pl);
            let er = Buffer.concat([handshakeCipher.update(Buffer.concat([et, pa, request])), handshakeCipher.final()]);
            yield proxySocket.writeAsync(Buffer.concat([iv, er]));
            let data = yield proxySocket.readAsync();
            if (!data)
                return proxySocket.dispose();
            let riv = data.slice(0, iv.length);
            let handshakeDecipher = cryptoEx.createDecipher(me.cipherAlgorithm, me.password, riv);
            let rlBuf = Buffer.concat([handshakeDecipher.update(data.slice(iv.length, data.length)), handshakeDecipher.final()]);
            let paddingSize = rlBuf[0];
            let reply = rlBuf.slice(1 + paddingSize, rlBuf.length);
            switch (req.cmd) {
                case socks5constant_1.REQUEST_CMD.CONNECT:
                    console.info(`connected: ${req.addr}:${req.port}`);
                    yield client.writeAsync(reply);
                    let cipher = cryptoEx.createCipher(me.cipherAlgorithm, me.password, iv).cipher;
                    let decipher = cryptoEx.createDecipher(me.cipherAlgorithm, me.password, riv);
                    client.pipe(cipher).pipe(proxySocket);
                    proxySocket.pipe(decipher).pipe(client);
                    break;
                case socks5constant_1.REQUEST_CMD.UDP_ASSOCIATE:
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
        listeningUdp.once('listening', () => __awaiter(this, void 0, void 0, function* () {
            let udpAddr = listeningUdp.address();
            let reply = socks5Helper.createSocks5TcpReply(0x0, udpAddr.family === 'IPv4' ? socks5constant_1.ATYP.IPV4 : socks5constant_1.ATYP.IPV6, udpAddr.address, udpAddr.port);
            yield client.writeAsync(reply);
        }));
        let udpSet = new Set();
        listeningUdp.on('message', (msg, cinfo) => __awaiter(this, void 0, void 0, function* () {
            let proxyUdp = dgram.createSocket(udpType);
            proxyUdp.unref();
            let encryptor = cryptoEx.createCipher(cipherAlgorithm, password);
            let cipher = encryptor.cipher;
            let iv = encryptor.iv;
            let decipher = cryptoEx.createDecipher(cipherAlgorithm, password, iv);
            let pl = Number((Math.random() * 0xff).toFixed());
            let el = new Buffer([pl]);
            let rp = crypto.randomBytes(pl);
            let em = cipher.update(Buffer.concat([el, rp, msg]));
            let data = Buffer.concat([iv, em]);
            proxyUdp.send(data, 0, data.length, udpServer.port, udpServer.addr);
            proxyUdp.on('message', (sMsg, sinfo) => {
                let reply = decipher.update(sMsg);
                let header = socks5Helper.createSocks5UdpHeader(cinfo.address, cinfo.port);
                let data = Buffer.concat([header, reply]);
                listeningUdp.send(data, 0, data.length, cinfo.port, cinfo.address);
            });
            proxyUdp.on('error', (err) => console.log(err.message));
            udpSet.add(proxyUdp);
        }));
        function dispose() {
            listeningUdp.removeAllListeners();
            listeningUdp.close();
            listeningUdp.unref();
            udpSet.forEach(udp => {
                udp.close();
            });
        }
        client.once('error', dispose);
        client.once('end', dispose);
        listeningUdp.on('error', dispose);
        listeningUdp.on('close', dispose);
    }
}
exports.RemoteProxyServer = RemoteProxyServer;
