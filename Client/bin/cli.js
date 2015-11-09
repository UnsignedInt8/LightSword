#!/usr/bin/env node

const program = require('commander');
const app = require('../app');

program.version('0.0.1')
  .usage('[options]')
  .option('-s, --server <addr|domain>', 'Server address')
  .option('-p, --port <number>', 'Server port number', Number.parseInt)
  .option('-m, --method <algorithm>', 'Ciher algorithm')
  .option('-k, --password <password>', 'Password')
  .option('-c, --config <path>', 'Configuration file path')
  .option('-l, --local <addr>', 'Local IP')
  .option('-o, --localport <number>', 'Local port number', Number.parseInt)
  .option('-t, --timeout [number]', 'Timeout (second)')
  .option('-f, --fork', 'Run as background')
  .parse(process.argv);
  
app({ 
  lsAddr: program.server, 
  lsPort: program.port, 
  cipherAlgorithm: program.method,
  password: program.password,
  addr: program.local,
  port: program.localport,
  timeout: program.timeout
});