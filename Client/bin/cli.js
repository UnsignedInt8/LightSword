#!/usr/bin/env node

const program = require('commander');

program.version('0.0.1')
  .option('-s --server', 'Server address')
  .option('-p, --port', 'Server port number')
  .option('-m, --method', 'Ciher algorithm')
  .option('-k, --password', 'Password')
  .option('-c, --config', 'Configuration file path')
  .option('-l, --local', 'Local IP')
  .option('-o, --localport', 'Local port number')
  .option('-t, --timeout', 'Timeout (second)')
  .option('-f, --fork', 'Run as background')
  .parse(process.argv);