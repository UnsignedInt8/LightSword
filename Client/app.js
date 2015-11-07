'use strict'

//--------------------------------------------- 
// Copyright(c) 2015 SunshinyNeko Written by VSCode
//--------------------------------------------- 

require('kinq')();
const Socks5Server = require('./core/socks5Server');

let server = new Socks5Server('localhost', 2002);
server.start();

process.title = 'LightSword';

module.exports = server;
