//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as program from 'commander';
import * as App from '../app'

// Same as Shadowsocks https://shadowsocks.com/doc.html
program.version('0.0.1')
  .usage('[options]')
  .option('-s, --server <addr|domain>', 'Server Address', String)
  .option('-p, --port <number>', 'Server Port Number', Number.parseInt)
  .option('-l, --localport <number>', 'Local Port Number', Number.parseInt)
  .option('-m, --method <algorithm>', 'Cipher Algorithm', String)
  .option('-k, --password <password>', 'Password', String)
  .option('-c, --config <path>', 'Configuration file path', String)
  .option('-a, --any', 'Listen Any Connection')
  .option('-t, --timeout [number]', 'Timeout (second)')
  .option('-f, --fork', 'Run as Cluster')
  .option('-u, --socsk5username', 'Socks5 Proxy Username', String)
  .option('-w, --socks5password', 'Socks5 Proxy Password', String)
  .parse(process.argv);
  
let args = <any>program;
let options = {
  addr: args.any ? '*' : 'localhost',
  port: args.localport,
  serverAddr: args.server,
  serverPort: args.port,
  cipherAlgorithm: args.method,
  password: args.password,
  socks5Username: args.socks5username,
  socks5Password: args.socks5password,
  timeout: args.timeout
}

