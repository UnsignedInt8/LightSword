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
var driver_1 = require('./socks5/driver');
var dispatchQueue_1 = require('./lib/dispatchQueue');
var consts = require('./socks5/consts');
var ipHelper_1 = require('./lib/ipHelper');
var plugin_1 = require('./socks5/plugin');
class App {
    constructor(options) {
        this.localPlugin = null;
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
        this.bypassLocal = options.bypassLocal === undefined ? true : options.bypassLocal;
        let isLocalProxy = this.isLocalProxy = ['localhost', '127.0.0.1', '', undefined, null].contains(options.serverAddr.toLowerCase());
        if (isLocalProxy)
            options.plugin = 'local';
        this.pluginPivot = new plugin_1.PluginPivot(options.plugin);
        dispatchQueue_1.defaultQueue.register(consts.REQUEST_CMD.CONNECT, this);
        new localServer_1.LocalServer(options).start();
    }
    receive(msg, args) {
        let isLocalProxy = this.isLocalProxy;
        let plugin = this.pluginPivot;
        // If dstAddr is local area address, bypass it.
        if (ipHelper_1.IpHelper.isLocalAddress(args.dstAddr) && this.bypassLocal && !this.isLocalProxy) {
            if (!this.localPlugin)
                this.localPlugin = new plugin_1.PluginPivot('local');
            plugin = this.localPlugin;
            isLocalProxy = true;
        }
        if (isLocalProxy) {
            args.serverAddr = args.dstAddr;
            args.serverPort = args.dstPort;
        }
        let connect = this.pluginPivot.getSocks5(msg);
        new driver_1.Socks5Driver(plugin, msg, args);
    }
}
exports.App = App;
if (!module.parent) {
    process.title = 'LightSword Client Debug Mode';
    new App({ serverAddr: '::1', port: 2002, });
}
//# sourceMappingURL=app.js.map