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
const events_1 = require('events');
const cryptoEx = require('../common/cipher');
const constant_1 = require('../common/constant');
const index_1 = require('./socks5/index');
const index_2 = require('./osxcl5/index');
const index_3 = require('./aplvpn/index');
class LsServer extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.disableSelfProtection = false;
        this.blackIPs = new Set();
        this.blacklist = new Map();
        this.requestHandlers = new Map();
        let me = this;
        Object.getOwnPropertyNames(options).forEach(n => me[n] = options[n]);
        this.requestHandlers.set(constant_1.VPN_TYPE.APLVPN, index_3.handleAppleVPN);
        this.requestHandlers.set(constant_1.VPN_TYPE.SOCKS5, index_1.handleSocks5);
        this.requestHandlers.set(constant_1.VPN_TYPE.OSXCL5, index_2.handleOSXSocks5);
    }
    start() {
        let me = this;
        let server = net.createServer((client) => __awaiter(this, void 0, void 0, function* () {
            if (me.blacklist.has(client.remoteAddress) && me.blacklist.get(client.remoteAddress).size > 20)
                return client.dispose();
            let data = yield client.readAsync();
            if (!data)
                return client.dispose();
            let meta = cryptoEx.SupportedCiphers[me.cipherAlgorithm];
            if (!meta)
                meta = cryptoEx.SupportedCiphers[constant_1.defaultCipherAlgorithm];
            let ivLength = meta[1];
            if (data.length < ivLength) {
                console.warn(client.remoteAddress, 'Malicious Access');
                return me.addToBlacklist(client);
            }
            let iv = data.slice(0, ivLength);
            let decipher = cryptoEx.createDecipher(me.cipherAlgorithm, me.password, iv);
            let et = data.slice(ivLength, data.length);
            let dt = Buffer.concat([decipher.update(et), decipher.final()]);
            if (dt.length < 2) {
                console.warn(client.remoteAddress, 'Malicious Access');
                return me.addToBlacklist(client);
            }
            let vpnType = dt[0];
            let paddingSize = dt[1];
            let options = {
                iv: iv,
                password: me.password,
                cipherAlgorithm: me.cipherAlgorithm,
                timeout: me.timeout,
                xorNum: paddingSize,
                speed: me.speed,
                ivLength: ivLength,
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
        setInterval(() => me.blackIPs.clear(), 24 * 60 * 60 * 1000).unref();
        this.startRemainingTimer();
    }
    stop() {
        if (!this.server)
            return;
        this.server.removeAllListeners();
        this.server.close();
        this.server = undefined;
        this.stopRemainingTimer();
        this.emit('close');
        this.blacklist.clear();
        if (this.blacklistIntervalTimer)
            clearInterval(this.blacklistIntervalTimer);
        this.blacklistIntervalTimer = undefined;
    }
    updateConfiguration(options) {
        this.disableSelfProtection = options.disableSelfProtection;
        this.expireDate = options.expireDate;
        this.startRemainingTimer();
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
        this.blackIPs.add(client.remoteAddress);
    }
    startRemainingTimer() {
        let me = this;
        this.remainingTime = this.expireDate ? ((new Date(this.expireDate)) - new Date()) : undefined;
        if (!this.remainingTime)
            return me.stopRemainingTimer();
        if (this.remainingTime <= 0) {
            return process.nextTick(() => {
                console.info(`${me.port} expired. ${me.expireDate} ${me.remainingTime}`);
                me.stop();
            });
        }
        this.stopRemainingTimer();
        this.remainingTimer = setInterval(() => {
            me.remainingTime -= LsServer.expireRefreshInterval;
            if (me.remainingTime > 0)
                return;
            console.info(`${me.port} expired. ${me.expireDate} ${me.remainingTime}`);
            me.stop();
        }, LsServer.expireRefreshInterval);
        this.remainingTimer.unref();
    }
    stopRemainingTimer() {
        if (!this.remainingTimer)
            return;
        clearInterval(this.remainingTimer);
        this.remainingTimer = undefined;
    }
}
LsServer.expireRefreshInterval = 60 * 60 * 1000;
exports.LsServer = LsServer;
