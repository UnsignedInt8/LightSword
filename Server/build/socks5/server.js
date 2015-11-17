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
class Server {
    constructor(options) {
        let _this = this;
        ['cipherAlgorithm', 'password', 'port'].forEach(n => _this[n] = options[n]);
        this.plugin = require(`../plugins/${options.plugin}`);
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
                        _this.plugin.negotiate(options, (success, reason) => {
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
            // Step 2: Process requests.
            _this.plugin.transport(options);
        }));
        server.listen(this.port);
        server.on('error', (err) => logger.error(err.message));
        this.server = server;
    }
    stop() {
        if (!this.server)
            return;
        this.server.removeAllListeners();
        this.server.close();
        this.server.destroy();
        this.server = null;
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map