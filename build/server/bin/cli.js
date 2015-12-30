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
var ipc = require('../../lib/ipc');
var fs = require('fs');
var path = require('path');
var child = require('child_process');
var cluster_1 = require('../cluster');
program
    .version('0.3')
    .option('-p, --port [number]', 'Server Listening Port', Number.parseInt)
    .option('-k, --password [password]', 'Cipher Password', String)
    .option('-m, --method [algorithm]', 'Cipher Algorithm', String)
    .option('-c, --config <path>', 'Configuration File Path', String)
    .option('-u, --users <path>', 'Mutli-users File Path', String)
    .option('-t, --timeout [number]', 'Timeout', Number.parseInt)
    .option('-f, --fork', 'Run as Daemon')
    .option('-d, --daemon <command>', 'Daemon Control', String)
    .option('-r, --cluster', 'Run as Cluster Mode')
    .option('-a, --management', 'HTTP Management')
    .parse(process.argv);
var args = program;
function parseOptions(path) {
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
var fileOptions = parseOptions(args.config) || {};
function parseUsers(path) {
    if (!path)
        return [];
    if (!fs.existsSync(path))
        return [];
    var content = fs.readFileSync(path).toString();
    return content.split('\n').select(l => {
        var info = l.split(' ');
        return { port: Number(info[0]), password: info[1], cipherAlgorithm: info[2] };
    }).toArray();
}
var users = parseUsers(args.users);
var argsOptions = {
    port: args.port,
    password: args.password,
    cipherAlgorithm: args.method,
    timeout: args.timeout
};
Object.getOwnPropertyNames(argsOptions).forEach(n => argsOptions[n] = argsOptions[n] || fileOptions[n]);
if (!users.length)
    users.push(argsOptions);
if (args.fork && !process.env.__daemon) {
    console.info('Run as daemon');
    process.env.__daemon = true;
    var cp = child.spawn(process.argv[1], process.argv.skip(2).toArray(), { cwd: process.cwd(), stdio: 'ignore', env: process.env, detached: true });
    cp.unref();
    console.info('Child PID: ' + cp.pid);
    process.exit(0);
}
function listenDaemonCommands() {
    if (process.env.__daemon) {
        ipc.IpcServer.start('server');
    }
}
if (args.daemon && !process.env.__daemon) {
    ipc.sendCommand('server', args.daemon, (code) => process.exit(code));
}
else {
    if (args.cluster) {
        cluster_1.runAsClusterMode(users, listenDaemonCommands);
    }
    else {
        users.forEach(u => new app_1.App(u));
        listenDaemonCommands();
        if (args.management)
            require('../management/index');
    }
    process.title = process.env.__daemon ? path.basename(process.argv[1]) + 'd' : 'LightSword Server';
    process.on('uncaughtException', (err) => { console.error(err); process.exit(1); });
}
