//--------------------------------------------- 
// Copyright(c) 2015 Neko
//--------------------------------------------- 
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
require('async-node');
require('kinq').enable();
require('../lib/socketEx');
const server_1 = require('../server/server');
const remoteProxyServer_1 = require('../client/socks5/remoteProxyServer');
const assert = require('assert');
const socks = require('socks');
const net = require('net');
describe('socks5 server', () => {
    let serverPort = 10000;
    let proxyPort = 8900;
    let algorithm = 'rc4';
    let pw = '19';
    let serverOpts = {
        cipherAlgorithm: algorithm,
        password: pw,
        port: serverPort,
        timeout: 60
    };
    let proxyOpts = {
        listenAddr: 'localhost',
        listenPort: proxyPort,
        serverAddr: 'localhost',
        serverPort: serverPort,
        cipherAlgorithm: algorithm,
        password: pw,
        timeout: 60,
        bypassLocal: true
    };
    let clientOpts = {
        timeout: 60000,
        proxy: {
            ipaddress: "localhost",
            port: proxyPort,
            command: 'connect',
            type: 5 // (4 or 5)
        },
        target: {
            host: "google.com",
            port: 80
        }
    };
    let server = new server_1.LsServer(serverOpts);
    server.start();
    let rpServer = new remoteProxyServer_1.RemoteProxyServer(proxyOpts);
    rpServer.start();
    it('status test', (done) => __awaiter(this, void 0, void 0, function* () {
        socks.createConnection(clientOpts, (err, socket, info) => __awaiter(this, void 0, void 0, function* () {
            if (err)
                return assert.fail(err, null, err.message);
            assert(net.isIP(socket.remoteAddress));
            done();
        }));
    }));
});
