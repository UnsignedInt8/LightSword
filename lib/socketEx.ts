//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------

'use strict'

import * as net from 'net';

net.Socket.prototype.dispose = function() {
  this.removeAllListeners();
  this.end();
  this.destroy();
}
