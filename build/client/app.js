//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
require('../lib/socketEx');
require('kinq').enable();
require('async-node');
const constant_1 = require('../common/constant');
const localProxyServer_1 = require('./socks5/localProxyServer');
const remoteProxyServer_1 = require('./socks5/remoteProxyServer');
let localAddrs = ['127.0.0.1', 'localhost', undefined, null];
class App {
    constructor(options) {
        let defaultOptions = {
            listenAddr: 'localhost',
            listenPort: 1080,
            serverAddr: 'localhost',
            serverPort: constant_1.defaultServerPort,
            cipherAlgorithm: constant_1.defaultCipherAlgorithm,
            password: 'lightsword.neko',
            timeout: 60,
            bypassLocal: true
        };
        options = options || defaultOptions;
        Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] === undefined ? defaultOptions[n] : options[n]);
        let isLocalProxy = localAddrs.contains(options.serverAddr);
        let server = isLocalProxy ? new localProxyServer_1.LocalProxyServer(options) : new remoteProxyServer_1.RemoteProxyServer(options);
        server.start();
    }
}
exports.App = App;
if (!module.parent) {
    process.title = 'LightSword Client Debug Mode';
    new App({ serverAddr: '::1', listenPort: 2002, bypassLocal: false });
}
else {
    localAddrs.push('::1');
}
