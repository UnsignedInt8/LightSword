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
var events_1 = require('events');
var cryptoEx = require('../lib/cipher');
var constant_1 = require('../lib/constant');
var index_1 = require('./socks5/index');
var index_2 = require('./osxcl5/index');
class LsServer extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.disableSelfProtection = false;
        this.blacklist = new Map();
        this.requestHandlers = new Map();
        let me = this;
        Object.getOwnPropertyNames(options).forEach(n => me[n] = options[n]);
        this.requestHandlers.set(constant_1.VPN_TYPE.SOCKS5, index_1.handleSocks5);
        this.requestHandlers.set(constant_1.VPN_TYPE.OSXCL5, index_2.handleOSXSocks5);
    }
    start() {
        let me = this;
        let server = net.createServer((client) => __awaiter(this, void 0, Promise, function* () {
            if (me.blacklist.has(client.remoteAddress) && me.blacklist.get(client.remoteAddress).size > 20)
                return client.dispose();
            let data = yield client.readAsync();
            if (!data)
                return client.dispose();
            let meta = cryptoEx.SupportedCiphers[me.cipherAlgorithm];
            let ivLength = meta[1];
            if (data.length < ivLength) {
                console.warn(client.remoteAddress, 'Malicious Access');
                return me.addToBlacklist(client);
            }
            let iv = data.slice(0, ivLength);
            let decipher = cryptoEx.createDecipher(me.cipherAlgorithm, me.password, iv);
            let et = data.slice(ivLength, data.length);
            let dt = decipher.update(et);
            if (dt.length < 2) {
                console.warn(client.remoteAddress, 'Malicious Access');
                return me.addToBlacklist(client);
            }
            let vpnType = dt[0];
            let paddingSize = dt[1];
            let options = {
                decipher,
                password: me.password,
                cipherAlgorithm: me.cipherAlgorithm,
                timeout: me.timeout,
                xorNum: paddingSize
            };
            let request = dt.slice(2 + paddingSize, data.length);
            let handler = me.requestHandlers.get(vpnType);
            if (!handler)
                return me.addToBlacklist(client);
            let handled = handler(client, request, options);
            if (handled)
                return;
            me.addToBlacklist(client);
        }));
        this.server = server;
        server.listen(this.port);
        server.on('error', (err) => {
            console.error(err.message);
            me.stop();
        });
        this.blacklistIntervalTimer = setInterval(() => me.blacklist.clear(), 10 * 60 * 1000);
        this.blacklistIntervalTimer.unref();
        this.startExpireTimer();
    }
    stop() {
        this.server.end();
        this.server.close();
        this.server.destroy();
        this.stopExpireTimer();
        this.emit('close');
        this.blacklist.clear();
        if (this.blacklistIntervalTimer)
            clearInterval(this.blacklistIntervalTimer);
        this.blacklistIntervalTimer = undefined;
    }
    addToBlacklist(client) {
        if (this.disableSelfProtection)
            return;
        let ports = this.blacklist.get(client.remoteAddress);
        if (!ports) {
            ports = new Set();
            this.blacklist.set(client.remoteAddress, ports);
        }
        ports.add(client.remotePort);
        client.dispose();
    }
    startExpireTimer() {
        if (!this.expireTime)
            return;
        this.stopExpireTimer();
        let me = this;
        this.expireTimer = setTimeout(() => me.stop(), me.expireTime);
        this.expireTimer.unref();
    }
    stopExpireTimer() {
        if (!this.expireTimer)
            return;
        clearTimeout(this.expireTimer);
        this.expireTimer = null;
    }
}
exports.LsServer = LsServer;
