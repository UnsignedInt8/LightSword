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
var path = require('path');
var ipc = require('../../lib/ipc');
var child = require('child_process');
program
    .version('0.6.0')
    .option('-s, --server <Address>', 'Next Node Address', String)
    .option('-p, --port <Number>', 'Next Node Server Port', Number.parseInt)
    .option('-l, --listenport <Number>', 'Local Port', Number.parseInt)
    .option('-d, --daemon <command>', 'Daemon Control', String)
    .option('-f, --fork', 'Run as Daemon')
    .parse(process.argv);
var args = program;
var options = {
    dstAddr: args.server,
    dstPort: args.port,
    localPort: args.listenport
};
if (args.daemon && !process.env.__daemon) {
    ipc.sendCommand('bridge', args.daemon, (code) => process.exit(code));
    return;
}
if (!options.dstAddr) {
    console.error('Server Address not found.\n');
    console.info('Example: lsbridge -s 127.0.0.1 -p 443\n');
    process.exit(1);
}
if (args.fork && !process.env.__daemon) {
    console.info('Run as daemon');
    process.env.__daemon = true;
    var cp = child.spawn(process.argv[1], process.argv.skip(2).toArray(), { detached: true, stdio: 'ignore', env: process.env, cwd: process.cwd() });
    cp.unref();
    console.info('Child PID: ' + cp.pid);
    process.exit(0);
}
if (process.env.__daemon) {
    ipc.IpcServer.start('bridge');
}
new app_1.App(options);
process.title = process.env.__daemon ? path.basename(process.argv[1]) + 'd' : 'LightSword Bridge';
