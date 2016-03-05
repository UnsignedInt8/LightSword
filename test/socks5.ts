//--------------------------------------------- 
// Copyright(c) 2015 Neko
//--------------------------------------------- 

'use strict'

require('async-node');
require('kinq').enable();
require('../lib/socketEx');
import { LsServer } from '../server/server';
import { LocalProxyServer } from '../client/socks5/localProxyServer';
import { RemoteProxyServer } from '../client/socks5/remoteProxyServer';
import * as assert from 'assert';
import * as socks from 'socks';
import * as net from 'net';


describe('socks5 server', () => {
  
  let serverPort = 10000;
  let proxyPort = 8900;
  let algorithm = 'rc4';
  let pw = '19';
    
  let serverOpts = {
    cipherAlgorithm: algorithm,
    password: pw,
    port: serverPort,
    timeout: 60
  };
  
  let proxyOpts = {
    listenAddr: 'localhost',
    listenPort: proxyPort,
    serverAddr: 'localhost',
    serverPort: serverPort,
    cipherAlgorithm: algorithm,
    password: pw,
    timeout: 60,
    bypassLocal: true
  };
  
  let clientOpts = {
    timeout: 60000,
    
    proxy: {
      ipaddress: "localhost",
      port: proxyPort,
      command: 'connect',
      type: 5  // (4 or 5)
    },

    target: {
      host: "google.com", // (google.com)
      port: 80
    }
  };

  let server = new LsServer(serverOpts);
  server.start();
  
  let rpServer = new RemoteProxyServer(proxyOpts);
  rpServer.start();
  
  it('status test', async (done) => {
    socks.createConnection(clientOpts, async (err, socket, info) => {
      if (err) return assert.fail(err, null, err.message);
      assert(net.isIP(socket.remoteAddress));
      done();
    });
  });
});