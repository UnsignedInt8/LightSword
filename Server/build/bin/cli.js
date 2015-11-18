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
var logger = require('winston');
var child = require('child_process');
program
    .option('-p, --port [number]', 'Server Listening Port', Number.parseInt)
    .option('-k, --password [password]', 'Cipher Password', String)
    .option('-m, --method [algorithm]', 'Cipher Algorithm', String)
    .option('-c, --config <path>', 'Configuration File Path', String)
    .option('-f, --fork', 'Run as background')
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
        logger.warn('Configuration file error');
        logger.warn(ex.message);
    }
}
var fileOptions = parseFile(args.config) || {};
var argsOptions = {
    port: args.port,
    password: args.password,
    cipherAlgorithm: args.method
};
if (args.fork && !process.argv.contains('isFork')) {
    logger.info('Run as daemon');
    process.argv.push('isFork');
    child.fork('./build/bin/cli', process.argv);
    process.exit(0);
}
Object.getOwnPropertyNames(argsOptions).forEach(n => argsOptions[n] = argsOptions[n] || fileOptions[n]);
process.title = 'LightSword Server';
new app_1.App(argsOptions);
//# sourceMappingURL=cli.js.map