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
var child = require('child_process');
program
    .option('-p, --port [number]', 'Server Listening Port', Number.parseInt)
    .option('-k, --password [password]', 'Cipher Password', String)
    .option('-m, --method [algorithm]', 'Cipher Algorithm', String)
    .option('-c, --config <path>', 'Configuration File Path', String)
    .option('-u, --users <path>', 'Mutli-users File Path', String)
    .option('-t, --timeout [number]', 'Timeout', Number.parseInt)
    .option('-f, --fork', 'Run as Daemon')
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
Object.getOwnPropertyNames(argsOptions).forEach(n => argsOptions[n] = argsOptions[n] || fileOptions[n]);
process.title = process.env.__daemon ? path.basename(process.argv[1]) + 'd' : 'LightSword Server';
process.on('uncaughtException', (err) => fs.writeFileSync('~/lightsword.dump', err.toString()));
users.forEach(u => new app_1.App(u));
