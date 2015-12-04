#!/usr/bin/env node
//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

import * as program from 'commander';
import { App } from '../app';
import * as ipc from '../../lib/ipc';
import * as fs from 'fs';
import * as path from 'path';
import * as child from 'child_process';

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
  .parse(process.argv);
  
var args = <any>program;

function parseOptions(path: string) {
  if (!path) return;
  if (!fs.existsSync(path)) return;
  
  var content = fs.readFileSync(path).toString();
  
  try {
    return JSON.parse(content);
  } catch(ex) {
    console.warn('Configuration file error');
    console.warn(ex.message);
  }
}

var fileOptions = parseOptions(args.config) || {};

function parseUsers(path: string): {port: number, password: string, cipherAlgorithm: string, plugin?: string}[] {
  if (!path) return [];
  if (!fs.existsSync(path)) return [];
  
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
}

if (!users.length) users.push(argsOptions);

if (args.fork && !process.env.__daemon) {
  console.info('Run as daemon');
  process.env.__daemon = true;
  var cp = child.spawn(process.argv[1], process.argv.skip(2).toArray(), { cwd: process.cwd(), stdio: 'ignore', env: process.env, detached: true });
  cp.unref();
  console.info('Child PID: ' + cp.pid);
  process.exit(0);
}

if (process.env.__daemon) {
  ipc.IpcServer.start('server');
}

if (args.daemon && !process.env.__daemon) {
  ipc.sendCommand('server', args.daemon, (code) => process.exit(code));
} else {
  Object.getOwnPropertyNames(argsOptions).forEach(n => argsOptions[n] = argsOptions[n] || fileOptions[n]);
  
  process.title = process.env.__daemon ? path.basename(process.argv[1]) + 'd' : 'LightSword Server';
  process.on('uncaughtException', (err) => fs.writeFileSync('~/lightsword.dump', err.toString()));
  
  users.forEach(u => new App(u));  
}
