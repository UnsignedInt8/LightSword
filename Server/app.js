//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

'use strict'

require('kinq')();
const LightSwordServer = require('./core/server');

let options = {};
let server = new LightSwordServer(options);
server.start();

process.title = 'LightSword';

module.exports = server;