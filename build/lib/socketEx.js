//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
const net = require('net');
net.Socket.prototype.dispose = function () {
    this.removeAllListeners();
    this.end();
    this.destroy();
};
