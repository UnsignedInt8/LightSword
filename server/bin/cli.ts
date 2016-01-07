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
import { runAsClusterMode } from '../cluster';

program
  .version('0.5')
  .option('-p, --port [number]', 'Server Listening Port', Number.parseInt)
  .option('-k, --password [password]', 'Cipher Password', String)
  .option('-m, --method [algorithm]', 'Cipher Algorithm', String)
  .option('-c, --config <path>', 'Configuration File Path', String)
  .option('-u, --users <path>', 'Mutli-users File Path', String)
  .option('-t, --timeout [number]', 'Timeout', Number.parseInt)
  .option('-f, --fork', 'Run as a Daemon')
  .option('-d, --daemon <command>', 'Daemon Control', String)
  .option('-r, --cluster', 'Run as Cluster Mode')
  .option('-a, --management', 'Enable HTTP Management')
  .option('-x, --user <username>', 'Run Under Specified Privilege')
  .option('--disableSelfProtection', 'Disable Self-Protection')
  .parse(process.argv);
  
var args = <any>program;

function parseOptions(path: string) {
  if (!path) return;
  if (!fs.existsSync(path)) return;
  
  var content = fs.readFileSync(path).toString();
  
  try {
    var configs = JSON.parse(content);
    return {
      port: configs.port,
      password: configs.password,
      cipherAlgorithm: configs.method,
      fork: configs.fork,
      cluster: configs.cluster,
      timeout: configs.timeout,
      management: configs.management,
    }
  } catch(ex) {
    console.warn('Configuration file error');
    console.warn(ex.message);
  }
}

var fileOptions = parseOptions(args.config) || {};
if (fileOptions) Object.getOwnPropertyNames(fileOptions).forEach(n => args[n] = args[n] === undefined ? fileOptions[n] : args[n]);

function parseUsers(path: string): { port: number, password: string, cipherAlgorithm: string, expireDate?: string, disableSelfProtection?: boolean }[] {
  if (!path) return [];
  if (!fs.existsSync(path)) return [];

  var content: string = fs.readFileSync(path).toString();
  return content.split('\n').where((l: string) => l.length > 0 && !l.trim().startsWith('#')).select((l: string) => {
    var info = l.trim().split(' ');
    return { port: Number(info[0]), password: info[1], cipherAlgorithm: info[2], expireDate: info[3], disableSelfProtection: args.disableSelfProtection };
  }).toArray();
}

var users = parseUsers(args.users);

var argsOptions = {
  port: args.port,
  password: args.password,
  cipherAlgorithm: args.method,
  timeout: args.timeout,
  disableSelfProtection: args.disableSelfProtection
}

if (fileOptions) Object.getOwnPropertyNames(argsOptions).forEach(n => argsOptions[n] = argsOptions[n] === undefined ? fileOptions[n] : argsOptions[n]);

if (!users.length) users.push(argsOptions);
users = users.distinct((u1, u2) => u1.port === u2.port).toArray();

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
} else {
  if (args.cluster) {
    var clusterOptions = { 
      users, 
      management: args.management, 
      user: args.user
    };
    
    runAsClusterMode(clusterOptions, listenDaemonCommands);
  } else {
    users.forEach(u => new App(u));
    listenDaemonCommands();
    
    if (args.management) require('../management/index');
    if (args.user) try { process.setuid(args.user); } catch(ex) { console.error(ex.message); }
  }
  
  process.title = process.env.__daemon ? path.basename(process.argv[1]) + 'd' : 'LightSword Server';
  process.on('uncaughtException', (err) => { console.error(err); process.exit(1); });
}
