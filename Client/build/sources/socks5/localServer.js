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
var dispatchQueue_1 = require('../lib/dispatchQueue');
var consts = require('./consts');
var util = require('util');
class LocalServer {
    constructor() {
        this.addr = 'localhost';
        this.port = 1080;
        this.password = 'lightsword';
        this.cipherAlgorithm = 'aes-256-cfb';
        this.serverAddr = '';
        this.serverPort = 23333;
        this.timeout = 60;
        this.socks5Username = '';
        this.socks5Password = '';
    }
    start() {
        let _this = this;
        let server = net.createServer((socket) => __awaiter(this, void 0, Promise, function* () {
            let data = yield socket.readAsync();
            if (!data)
                return socket.destroy();
            // Step1: Negotitate with client.
            let res = [consts.SOCKS_VER.V5];
            res.push(_this.handleHandshake(data));
            yield socket.writeAsync(new Buffer(res));
            // Step2: Autenticate with client.
            if (res[1] === consts.AUTHENTICATION.NONE)
                return socket.destroy();
            if (res[1] === consts.AUTHENTICATION.USERPASS) {
                data = yield socket.readAsync();
                let success = _this.handleAuthentication(data);
                if (!success)
                    return socket.destroy();
            }
            // Step3: Refine requests.
            data = yield socket.readAsync();
            let request = _this.refineRequest(data);
            if (!request)
                return socket.destroy();
            // Step4: Dispatch request
            let requestOptions = {
                socket: socket,
                dstAddr: request.addr,
                dstPort: request.port,
                serverAddr: _this.serverAddr,
                serverPort: _this.serverPort,
                cipherAlgorithm: _this.cipherAlgorithm,
                password: _this.password,
                timeout: _this.timeout
            };
            dispatchQueue_1.defaultQueue.publish(request.cmd.toString(), requestOptions);
        }));
        server.listen(this.port, this.addr);
        this._server = server;
        return server !== null;
    }
    stop() {
        if (this._server === null)
            return false;
        this._server.close();
        return true;
    }
    handleHandshake(data) {
        if (!LocalServer.SupportedVersions.any(i => i === data[0]))
            return consts.AUTHENTICATION.NONE;
        let methodCount = data[1];
        let methods = data.skip(2).take(methodCount).toArray();
        if (methods.contains(consts.AUTHENTICATION.NOAUTH)) {
            return consts.AUTHENTICATION.NOAUTH;
        }
        else if (methods.contains(consts.AUTHENTICATION.USERPASS)) {
            return consts.AUTHENTICATION.USERPASS;
        }
        else if (methods.contains(consts.AUTHENTICATION.GSSAPI)) {
        }
        return consts.AUTHENTICATION.NONE;
    }
    handleAuthentication(data) {
        if (!data || data[0] !== 0x01)
            return false;
        let userLength = data[1];
        let username = data.toString('utf8', 2, 2 + userLength);
        let passLength = data[2 + userLength];
        let password = data.toString('utf8', 2 + userLength + 1, 2 + userLength + 1 + passLength);
        return username == this.socks5Username && password == this.socks5Password;
    }
    refineRequest(data) {
        if (!data || data[0] === consts.SOCKS_VER.V5)
            return null;
        let cmd = data[1];
        let atyp = data[3];
        let addr = '';
        let port = data.readUInt16BE(data.length - 2);
        switch (atyp) {
            case consts.ATYP.DN:
                let dnLength = data[4];
                addr = data.toString('utf8', 5, 5 + dnLength);
                break;
            case consts.ATYP.IPV4:
                addr = data.skip(4).take(4).aggregate((c, n) => c.length > 1 ? c + util.format('.%d', n) : util.format('%d.%d', c, n));
                break;
            case consts.ATYP.IPV6:
                let bytes = data.skip(4).take(16).toArray();
                for (let i = 0; i < 8; i++) {
                    addr += (new Buffer(bytes.skip(i * 2).take(2).toArray()).toString('hex') + (i < 7 ? ':' : ''));
                }
                break;
            default:
                return null;
        }
        return { cmd: cmd, addr: addr, port: port };
    }
}
LocalServer.SupportedVersions = [consts.SOCKS_VER.V5, consts.SOCKS_VER.V4];
exports.LocalServer = LocalServer;
