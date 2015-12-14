//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';
import * as util from 'util';
import * as child from 'child_process';

export enum COMMAND {
  STOP = 2,
  RESTART = 3,
  STATUS = 101,
  STATUSJSON = 102,
}

export class IpcServer {
  
  static start(tag: string) {
    let unixPath = util.format('/tmp/lightsword-%s.sock', tag);
    if (fs.existsSync(unixPath)) fs.unlinkSync(unixPath);
    
    let server = net.createServer(async (client) => {
      let data = await client.readAsync();
      let msg = '';
      let mem: { rss: number, heapTotal: number, heapUsed: number };
      
      switch(data[0]) {
        case COMMAND.STOP:
          msg = `${path.basename(process.argv[1])}d (PID: ${process.pid}) is going to exit.`;
          await client.writeAsync(new Buffer(msg));
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
          await client.writeAsync(new Buffer(msg));
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
          await client.writeAsync(new Buffer(JSON.stringify(obj)));
          client.dispose();
          break;
      }
    });
    
    server.listen(unixPath);
    server.on('error', (err) => console.error(err.message));
  }
}

export function sendCommand(tag: string, cmd: string, callback: (code) => void) {
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
  let socket = net.createConnection(path, async () => {
    await socket.writeAsync(new Buffer([command]));
    let msg = await socket.readAsync();
    console.info(msg.toString('utf8'));
    socket.destroy();
    callback(0);
  });
  
  socket.on('error', (err: Error) => { console.info(`${tag} is not running or unix socket error.`); callback(1); });
  socket.setTimeout(5 * 1000);
}