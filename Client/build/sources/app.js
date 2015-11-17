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
require('kinq').enable();
require('async-node');
var localServer_1 = require('./socks5/localServer');
var connect_1 = require('./socks5/connect');
var dispatchQueue_1 = require('./lib/dispatchQueue');
var consts = require('./socks5/consts');
var main_1 = require('./plugins/main');
class App {
    constructor(options) {
        let defaultOptions = {
            addr: 'localhost',
            port: 1080,
            serverAddr: 'localhost',
            serverPort: 23333,
            cipherAlgorithm: 'aes-256-cfb',
            password: 'lightsword.neko',
            socks5Username: '',
            socks5Password: '',
            plugin: 'lightsword',
            timeout: 60
        };
        options = options || defaultOptions;
        Object.getOwnPropertyNames(defaultOptions).forEach(n => options[n] = options[n] || defaultOptions[n]);
        let isLocalProxy = this.isLocalProxy = ['localhost', '', undefined, null].contains(options.serverAddr.toLowerCase());
        if (isLocalProxy)
            options.plugin = 'local';
        this.pluginPivot = new main_1.PluginPivot(options.plugin);
        let msgMapper = new Map();
        msgMapper.set(consts.REQUEST_CMD.CONNECT, connect_1.Socks5Connect);
        this.msgMapper = msgMapper;
        dispatchQueue_1.defaultQueue.register(consts.REQUEST_CMD.CONNECT, this);
        new localServer_1.LocalServer(options).start();
    }
    receive(msg, args) {
        let compoent = this.msgMapper.get(msg);
        if (!compoent)
            return;
        if (this.isLocalProxy) {
            args.serverAddr = args.dstAddr;
            args.serverPort = args.dstPort;
        }
        new compoent(this.pluginPivot, args, this.isLocalProxy);
    }
}
exports.App = App;
if (!module.parent) {
    process.title = 'LightSword Client Debug Mode';
    new App({ serverAddr: '::1' });
}
//# sourceMappingURL=app.js.map