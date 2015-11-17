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
var logger = require('winston');
var main_1 = require('../plugins/main');
class Server {
    constructor(options) {
        let _this = this;
        Object.getOwnPropertyNames(options).forEach(n => _this[n] = options[n]);
        this._pluginPivot = new main_1.PluginPivot(options.plugin);
    }
    start() {
        let _this = this;
        let server = net.createServer((socket) => __awaiter(this, void 0, Promise, function* () {
            function disposeSocket() {
                socket.removeAllListeners();
                socket.end();
                socket.destroy();
            }
            let options = {
                cipherAlgorithm: _this.cipherAlgorithm,
                password: _this.password,
                clientSocket: socket
            };
            // Step 1: Negotiate with Client.
            function negotiateAsync() {
                return __awaiter(this, void 0, Promise, function* () {
                    return new Promise(resolve => {
                        _this._pluginPivot.negotiate(options, (success, reason) => {
                            if (!success)
                                logger.info(reason);
                            resolve(success);
                        });
                    });
                });
            }
            let negotiated = yield negotiateAsync();
            if (!negotiated)
                return disposeSocket();
            _this._pluginPivot.transport(options);
            // let data = await socket.readAsync();
            // if (!data) return socket.destroy();
            // Step 1: Negotiate with client.
            // let decipher = crypto.createDecipher(_this.cipherAlgorithm, _this.password);
            // let negotiationBuf = Buffer.concat([decipher.update(data), decipher.final()]);
            // try {
            //   let msg = JSON.parse(negotiationBuf.toString('utf8'));
            // } catch(ex) {
            //   socket.end();
            //   return socket.destroy();
            // }
        }));
        server.listen(this.port);
        server.on('error', (err) => logger.error(err.message));
        this._server = server;
    }
    stop() {
        if (!this._server)
            return;
        this._server.removeAllListeners();
        this._server.close();
        this._server.destroy();
        this._server = null;
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map