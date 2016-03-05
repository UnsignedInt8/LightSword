//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const fs = require('fs');
const net = require('net');
const path = require('path');
const util = require('util');
const child = require('child_process');
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
        let server = net.createServer((client) => __awaiter(this, void 0, void 0, function* () {
            let data = yield client.readAsync();
            let msg = '';
            let mem;
            switch (data[0]) {
                case COMMAND.STOP:
                    msg = `${path.basename(process.argv[1])}d (PID: ${process.pid}) is going to quit.`;
                    yield client.writeAsync(new Buffer(msg));
                    process.exit(0);
                    break;
                case COMMAND.RESTART:
                    let cp = child.spawn(process.argv[1], process.argv.skip(2).toArray(), { detached: true, stdio: 'ignore', env: process.env, cwd: process.cwd() });
                    cp.unref();
                    process.exit(0);
                    break;
                case COMMAND.STATUS:
                    mem = process.memoryUsage();
                    msg = `${path.basename(process.argv[1])}d (PID: ${process.pid}) is running.`;
                    msg = util.format('%s\nHeap total: %sMB, heap used: %sMB, rss: %sMB', msg, (mem.heapTotal / 1024 / 1024).toPrecision(2), (mem.heapUsed / 1024 / 1024).toPrecision(2), (mem.rss / 1024 / 1024).toPrecision(2));
                    yield client.writeAsync(new Buffer(msg));
                    client.dispose();
                    break;
                case COMMAND.STATUSJSON:
                    mem = process.memoryUsage();
                    let obj = {
                        process: path.basename(process.argv[1]) + 'd',
                        pid: process.pid,
                        heapTotal: mem.heapTotal,
                        heapUsed: mem.heapUsed,
                        rss: mem.rss
                    };
                    yield client.writeAsync(new Buffer(JSON.stringify(obj)));
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
    let socket = net.createConnection(path, () => __awaiter(this, void 0, void 0, function* () {
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
