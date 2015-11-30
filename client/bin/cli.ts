#!/usr/bin/env node

//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

import * as program from 'commander';
import { App } from '../app'
import * as fs from 'fs';
import * as path from 'path';
import * as child from 'child_process';

program
  .usage('[options]')
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
  .parse(process.argv);
  
var args = <any>program;

function parseFile(path: string) {
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

var fileOptions = parseFile(args.config) || {};
  
var argsOptions = {
  listenAddr: args.any ? '' : 'localhost',
  listenPort: args.listenport,
  serverAddr: args.server,
  serverPort: args.port,
  cipherAlgorithm: args.method,
  password: args.password,
  timeout: args.timeout,
  bypassLocal: args.dontbypasslocal ? false : true
}

if (args.fork && !process.env.__daemon) {
  console.info('Run as daemon');
  process.env.__daemon = true;
  var cp = child.spawn(process.argv[1], process.argv.skip(2).toArray(), { detached: true, stdio: 'ignore', env: process.env, cwd: process.cwd() });
  cp.unref();
  console.log('Child PID: ', cp.pid);
  process.exit(0);
}

Object.getOwnPropertyNames(argsOptions).forEach(n => argsOptions[n] = argsOptions[n] === undefined ? fileOptions[n] : argsOptions[n]);
new App(argsOptions);

process.title = process.env.__daemon ? path.basename(process.argv[1]) + 'd' : 'LightSword Client';