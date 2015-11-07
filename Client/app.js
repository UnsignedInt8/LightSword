'use strict'

//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

require('kinq')();
const Socks5Server = require('./core/socks5Server');

let server = new Socks5Server();
server.start();

module.exports = server;
