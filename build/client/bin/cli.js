#!/usr/bin/env node
"use strict";
const program = require('commander');
const app_1 = require('../app');
const fs = require('fs');
const path = require('path');
const ipc = require('../../common/ipc');
const child = require('child_process');
program
    .version('0.6.0')
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
if (fileOptions)
    Object.getOwnPropertyNames(fileOptions).forEach(n => args[n] = args[n] === undefined ? fileOptions[n] : args[n]);
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
    ipc.sendCommand('client', args.daemon, (code) => process.exit(code));
}
else {
    Object.getOwnPropertyNames(argsOptions).forEach(n => argsOptions[n] = argsOptions[n] === undefined ? fileOptions[n] : argsOptions[n]);
    if (!program.args.contains('service'))
        new app_1.App(argsOptions);
    process.title = process.env.__daemon ? path.basename(process.argv[1]) + 'd' : 'LightSword Client';
}
