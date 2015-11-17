//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as program from 'commander';
import { App } from '../app';

program
  .options('-p, --port [number]', 'Server Listening Port', Number.parseInt)
  .options('-k, --password [password]', 'Cipher Password', String)
  .options('-m, --method [algorithm]', 'Cipher Algorithm', String)
  .options('-c, --config <path>', 'Configuration File Path', String)
  .parse(progress.argv);
  
let args = <any>program;

function parseFile(path: string) {
  if (!path) return;
  if (!fs.existsSync(path)) return;
  
  let content = fs.readFileSync(path).toString();
  
  try {
    return JSON.parse(content);
  } catch(ex) {
    logger.warn('Configuration file error');
    logger.warn(ex.message);
  }
}

let fileOptions = parseFile(args.config) || {};

let argsOptions = {
  port: args.port,
  password: args.password,
  cipherAlgorithm: args.method
}

Object.getOwnPropertyNames(argsOptions).forEach(n => argsOptions[n] = argsOptions[n] || fileOptions[n]);

process.title = 'LightSword Server';

new App(argsOptions);