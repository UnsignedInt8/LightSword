#!/usr/bin/env node
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
var fs = require('fs');
var path = require('path');
var ipc = require('../../lib/ipc');
var child = require('child_process');
program
    .option('-s, --server <addr|domain>', 'Server Address', String)
    .option('-p, --port <number>', 'Server Port Number', Number.parseInt)
    .option('-l, --listenport <number>', 'Local Listening Port Number', Number.parseInt)
    .option('-m, --method <algorithm>', 'Cipher Algorithm', String)
    .option('-k, --password <password>', 'Password', String)
    .option('-c, --config <path>', 'Configuration File Path', String)
    .option('-a, --any', 'Listen Any Connection')
    .option('-t, --timeout [number]', 'Timeout (second)')
    .option('-f, --fork', 'Run as Daemon')
    .option('-b, --dontbypasslocal', "DON'T Bypass Local Address")
    .option('-d, --daemon <command>', 'Daemon Control', String)
    .parse(process.argv);
var args = program;
function parseFile(path) {
    if (!path)
        return;
    if (!fs.existsSync(path))
        return;
    var content = fs.readFileSync(path).toString();
    try {
        return JSON.parse(content);
    }
    catch (ex) {
        console.warn('Configuration file error');
        console.warn(ex.message);
    }
}
var fileOptions = parseFile(args.config) || {};
var argsOptions = {
    listenAddr: args.any ? '' : 'localhost',
    listenPort: args.listenport,
    serverAddr: args.server,
    serverPort: args.port,
    cipherAlgorithm: args.method,
    password: args.password,
    timeout: args.timeout,
    bypassLocal: args.dontbypasslocal ? false : true
};
if (args.fork && !process.env.__daemon) {
    console.info('Run as daemon');
    process.env.__daemon = true;
    var cp = child.spawn(process.argv[1], process.argv.skip(2).toArray(), { detached: true, stdio: 'ignore', env: process.env, cwd: process.cwd() });
    cp.unref();
    console.log('Child PID: ', cp.pid);
    process.exit(0);
}
if (process.env.__daemon) {
    ipc.IpcServer.start('client');
}
if (args.daemon && !process.env.__daemon) {
    return ipc.sendCommand('client', args.daemon, (code) => process.exit(code));
}
Object.getOwnPropertyNames(argsOptions).forEach(n => argsOptions[n] = argsOptions[n] === undefined ? fileOptions[n] : argsOptions[n]);
if (!program.args.contains('service'))
    new app_1.App(argsOptions);
process.title = process.env.__daemon ? path.basename(process.argv[1]) + 'd' : 'LightSword Client';
