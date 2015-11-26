#!/usr/bin/env node
require('kinq').enable();
var program = require('commander');
var path = require('path');
var child = require('child_process');
var app_1 = require('../app');
program
    .option('-s, --server <Address>', 'Next Node Address', String)
    .option('-p, --port <Number>', 'Next Node Server Port', Number.parseInt)
    .option('-l, --localport <Number>', 'Local Port', Number.parseInt)
    .option('-f, --fork', 'Run as Daemon')
    .parse(process.argv);
var args = program;
var options = {
    dstAddr: args.server,
    dstPort: args.port,
    localPort: args.localport
};
if (!options.dstAddr) {
    console.error('Server Address not found.\n');
    console.info('Example: lsbridge -s 127.0.0.1 -p 443\n');
    process.exit(1);
}
if (args.fork && !process.env.__daemon) {
    console.info('Run as daemon');
    process.env.__daemon = true;
    var cp = child.spawn(process.argv[1], process.argv.skip(2).toArray(), { detached: true, stdio: 'ignore', env: process.env, cwd: process.cwd() });
    console.info('Child PID: ' + cp.pid);
    process.exit(0);
}
new app_1.App(options);
process.title = process.env.__daemon ? path.basename(process.argv[1]) + 'd' : 'LightSword Bridge';
