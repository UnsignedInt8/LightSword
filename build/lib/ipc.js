//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------
'use strict';
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
var fs = require('fs');
var net = require('net');
var path = require('path');
var util = require('util');
var child = require('child_process');
(function (COMMAND) {
    COMMAND[COMMAND["STOP"] = 2] = "STOP";
    COMMAND[COMMAND["RESTART"] = 3] = "RESTART";
    COMMAND[COMMAND["STATUS"] = 101] = "STATUS";
    COMMAND[COMMAND["STATUSJSON"] = 102] = "STATUSJSON";
})(exports.COMMAND || (exports.COMMAND = {}));
var COMMAND = exports.COMMAND;
class IpcServer {
    static start(tag) {
        let unixPath = util.format('/tmp/lightsword-%s.sock', tag);
        if (fs.existsSync(unixPath))
            fs.unlinkSync(unixPath);
        let server = net.createServer((client) => __awaiter(this, void 0, Promise, function* () {
            let data = yield client.readAsync();
            let msg = '';
            switch (data[0]) {
                case COMMAND.STOP:
                    msg = `${path.basename(process.argv[1])}d (PID: ${process.pid}) is going to exit.`;
                    yield client.writeAsync(new Buffer(msg));
                    process.exit(0);
                    break;
                case COMMAND.RESTART:
                    let cp = child.spawn(process.argv[1], process.argv.skip(2).toArray(), { detached: true, stdio: 'ignore', env: process.env, cwd: process.cwd() });
                    cp.unref();
                    process.exit(0);
                    break;
                case COMMAND.STATUS:
                    let mem = process.memoryUsage();
                    msg = `${path.basename(process.argv[1])}d (PID: ${process.pid}) is running.`;
                    msg = util.format('%s\nHeap total: %sMB, heap used: %sMB, rss: %sMB', msg, (mem.heapTotal / 1024 / 1024).toPrecision(2), (mem.heapUsed / 1024 / 1024).toPrecision(2), (mem.rss / 1024 / 1024).toPrecision(2));
                    yield client.writeAsync(new Buffer(msg));
                    client.dispose();
                    break;
                case COMMAND.STATUSJSON:
                    let obj = {
                        process: process.argv[1] + 'd',
                        pid: process.pid,
                        heapTotal: mem.heapTotal,
                        heapUsed: mem.heapUsed,
                        rss: mem.rss
                    };
                    yield client.writeAsync(JSON.stringify(obj));
                    client.dispose();
                    break;
            }
        }));
        server.listen(unixPath);
        server.on('error', (err) => console.error(err.message));
    }
}
exports.IpcServer = IpcServer;
function sendCommand(tag, cmd, callback) {
    let cmdMap = {
        'stop': COMMAND.STOP,
        'restart': COMMAND.RESTART,
        'status': COMMAND.STATUS,
        'statusjson': COMMAND.STATUSJSON,
    };
    let command = cmdMap[cmd.toLowerCase()];
    if (!command) {
        console.error('Command is not supported');
        return callback(1);
    }
    let path = util.format('/tmp/lightsword-%s.sock', tag);
    let socket = net.createConnection(path, () => __awaiter(this, void 0, Promise, function* () {
        yield socket.writeAsync(new Buffer([command]));
        let msg = yield socket.readAsync();
        console.info(msg.toString('utf8'));
        socket.destroy();
        callback(0);
    }));
    socket.on('error', (err) => { console.info(`${tag} is not running or unix socket error.`); callback(1); });
    socket.setTimeout(5 * 1000);
}
exports.sendCommand = sendCommand;
