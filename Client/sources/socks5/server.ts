//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
// import * as async from 'async-node';
import * as kinq from 'kinq';

namespace LightSword.Client.Socks5 {
  
  export class Server {
    public addr = 'localhost';
    public port = 1080;
    public password = 'lightsword';
    public cipherAlgoirthm = 'aes-256-cfb';
    public remoteAddr = '';
    public remotePort = 23333;
    public timeout = 60;
    private _server: net.Server;
    
    public start(): boolean {
      let server = net.createServer((socket) => {
        
      });
      
      server.listen(this.port, this.addr);
      this._server = server;
      
      return server !== null;
    }
    
    public stop(): boolean {
      if (this._server === null) return false;
      
      this._server.close();
      return true;
    }
  }
  
}

module.exports = LightSword.Client.Socks5.Server;