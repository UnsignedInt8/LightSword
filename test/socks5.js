//--------------------------------------------- 
// Copyright(c) 2015 猫王子
//--------------------------------------------- 

'use strict'

let LsServer = require('./build/server/server').LsServer;
let LocalProxyServer = require('./build/client/socks5/localProxyServer').LocalProxyServer;
let RemoteProxyServer = require('./build/client/socks5/remoteProxyServer').RemoteProxyServer;
let assert = require('assert');

describe('socks5 server', () => {
  let serverPort = 10000;
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
    listenPort: 10801,
    serverAddr: 'localhost',
    serverPort: serverPort,
    cipherAlgorithm: algorithm,
    password: pw,
    timeout: 60,
    bypassLocal: true
  };
    
  it('status test', () => {
    let server = new LsServer(serverOpts);
    server.start();
    
    let rpServer = new RemoteProxyServer(proxyOpts);
    rpServer.start();
    
    
  });
});