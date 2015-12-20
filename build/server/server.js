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
var crypto = require('../lib/cipher');
var constant_1 = require('../lib/constant');
var index_1 = require('./socks5/index');
var index_2 = require('./osxcl5/index');
class LsServer {
    constructor(options) {
        this.blacklist = new Set();
        let _this = this;
        Object.getOwnPropertyNames(options).forEach(n => _this[n] = options[n]);
    }
    start() {
        let me = this;
        let server = net.createServer((client) => __awaiter(this, void 0, Promise, function* () {
            if (me.blacklist.has(client.remoteAddress))
                return client.dispose();
            let data = yield client.readAsync();
            if (!data)
                return client.dispose();
            let meta = crypto.SupportedCiphers[me.cipherAlgorithm];
            let ivLength = meta[1];
            let iv = data.slice(0, ivLength);
            let decipher = crypto.createDecipher(me.cipherAlgorithm, me.password, iv);
            let et = data.slice(ivLength, ivLength + 2);
            let dt = decipher.update(et);
            let vpnType = dt[0];
            let paddingSize = dt[1];
            let options = {
                decipher,
                password: me.password,
                cipherAlgorithm: me.cipherAlgorithm,
                timeout: me.timeout
            };
            let request = data.slice(ivLength + 2 + paddingSize, data.length);
            let handled = false;
            switch (vpnType) {
                case constant_1.VPN_TYPE.SOCKS5:
                    request = decipher.update(request);
                    handled = index_1.handleSocks5(client, request, options);
                    break;
                case constant_1.VPN_TYPE.OSXCL5:
                    handled = index_2.handleOSXSocks5(client, request, options);
                    break;
            }
            if (handled)
                return;
            me.blacklist.add(client.remoteAddress);
            client.dispose();
        }));
        server.listen(this.port);
        server.on('error', (err) => console.error(err.message));
        this.server = server;
        setInterval(() => me.blacklist.clear(), 10 * 60 * 1000);
    }
    stop() {
        this.server.end();
        this.server.close();
        this.server.destroy();
    }
}
exports.LsServer = LsServer;
