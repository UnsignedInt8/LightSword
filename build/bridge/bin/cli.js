#!/usr/bin/env node
"use strict";
const program = require('commander');
const app_1 = require('../app');
const path = require('path');
const ipc = require('../../common/ipc');
const child = require('child_process');
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
