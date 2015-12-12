//--------------------------------------------- 
// Copyright(c) 2015 猫王子
//--------------------------------------------- 
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
require('async-node');
require('kinq').enable();
require('../lib/socketEx');
var server_1 = require('../server/server');
var remoteProxyServer_1 = require('../client/socks5/remoteProxyServer');
var assert = require('assert');
var socks = require('socks');
var net = require('net');
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
            host: "ip.cn",
            port: 80
        }
    };
    let server = new server_1.LsServer(serverOpts);
    server.start();
    let rpServer = new remoteProxyServer_1.RemoteProxyServer(proxyOpts);
    rpServer.start();
    it('status test', (done) => __awaiter(this, void 0, Promise, function* () {
        socks.createConnection(clientOpts, (err, socket, info) => __awaiter(this, void 0, Promise, function* () {
            if (err)
                return assert.fail(err, null, err.message);
            assert(net.isIP(socket.remoteAddress));
            done();
        }));
    }));
});
