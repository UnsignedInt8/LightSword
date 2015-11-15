#!/usr/bin/env node'use strict';
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
var program = require('commander');
var app_1 = require('../app');
// Same as Shadowsocks https://shadowsocks.com/doc.html
program.version('0.0.1')
    .usage('[options]')
    .option('-s, --server <addr|domain>', 'Server Address', String)
    .option('-p, --port <number>', 'Server Port Number', Number.parseInt)
    .option('-l, --localport <number>', 'Local Port Number', Number.parseInt)
    .option('-m, --method <algorithm>', 'Cipher Algorithm', String)
    .option('-k, --password <password>', 'Password', String)
    .option('-c, --config <path>', 'Configuration file path', String)
    .option('-a, --any', 'Listen Any Connection')
    .option('-t, --timeout [number]', 'Timeout (second)')
    .option('-f, --fork', 'Run as Cluster')
    .option('-u, --socsk5username', 'Socks5 Proxy Username', String)
    .option('-w, --socks5password', 'Socks5 Proxy Password', String)
    .parse(process.argv);
let args = program;
let options = {
    addr: args.any ? '*' : 'localhost',
    port: args.localport,
    serverAddr: args.server,
    serverPort: args.port,
    cipherAlgorithm: args.method,
    password: args.password,
    socks5Username: args.socks5username,
    socks5Password: args.socks5password,
    timeout: args.timeout
};
new app_1.App(options);
process.title = 'LightSword Client';
//# sourceMappingURL=cli.js.map