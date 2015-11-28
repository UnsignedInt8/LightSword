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
require('../lib/socketEx');
require('kinq').enable();
require('async-node');
var localProxyServer_1 = require('./socks5/localProxyServer');
var remoteProxyServer_1 = require('./socks5/remoteProxyServer');
let localAddrs = ['127.0.0.1', 'localhost', undefined, null];
class App {
    constructor(options) {
        let defaultOptions = {
            listenAddr: 'localhost',
            listenPort: 1080,
            serverAddr: 'localhost',
            serverPort: 2015,
            cipherAlgorithm: 'aes-256-cfb',
            password: 'lightsword.neko',
            timeout: 60
        };
        options = options || defaultOptions;
        Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] || defaultOptions[n]);
        let isLocalProxy = localAddrs.contains(options.serverAddr);
        let server = isLocalProxy ? new localProxyServer_1.LocalProxyServer(options) : new remoteProxyServer_1.RemoteProxyServer(options);
        server.start();
    }
}
exports.App = App;
if (!module.parent) {
    process.title = 'LightSword Client Debug Mode';
    new App({ serverAddr: '::1', listenPort: 2002 });
}
else {
    localAddrs.push('::1');
}
