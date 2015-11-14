//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------
'use strict';
var net = require('net');
var LightSword;
(function (LightSword) {
    var Client;
    (function (Client) {
        var Socks5;
        (function (Socks5) {
            class Server {
                constructor() {
                    this.addr = 'localhost';
                    this.port = 1080;
                    this.password = 'lightsword';
                    this.cipherAlgoirthm = 'aes-256-cfb';
                    this.remoteAddr = '';
                    this.remotePort = 23333;
                    this.timeout = 60;
                }
                start() {
                    let server = net.createServer((socket) => {
                    });
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
            }
            Socks5.Server = Server;
        })(Socks5 = Client.Socks5 || (Client.Socks5 = {}));
    })(Client = LightSword.Client || (LightSword.Client = {}));
})(LightSword || (LightSword = {}));
module.exports = LightSword.Client.Socks5.Server;
