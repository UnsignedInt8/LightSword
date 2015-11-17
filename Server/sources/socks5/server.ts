//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as crypto from 'crypto';
import * as logger from 'winston';
import { defaultQueue } from '../lib/dispatchQueue';
import { PluginPivot, INegotiationOptions, ICommandOptions, Socks5CommandType } from '../plugins/main';

export class Server {
  cipherAlgorithm: string;
  password: string;
  port: number;
  
  _server: net.Server;
  _pluginPivot: PluginPivot;
  
  constructor(options: { cipherAlgorithm: string, password: string, port: number, plugin: string }) {
    let _this = this;
    Object.getOwnPropertyNames(options).forEach(n => _this[n] = options[n]);
    this._pluginPivot = new PluginPivot(options.plugin);
  }
  
  start() {
    let _this = this;
    
    let server = net.createServer(async (socket) => {
      
      function disposeSocket() {
        socket.removeAllListeners();
        socket.end();
        socket.destroy();
      }
      
      let negotiationOptions: INegotiationOptions = {
        cipherAlgorithm: _this.cipherAlgorithm,
        password: _this.password,
        clientSocket: socket
      };
      
      // Step 1: Negotiate with Client.
      async function negotiateAsync(): Promise<boolean> { 
        return new Promise<boolean>(resolve => {
          _this._pluginPivot.negotiate(negotiationOptions, (success, reason) => {
            if (!success) logger.info(reason);
            resolve(success);
          })
        });
      }
      
      let negotiated = await negotiateAsync();
      if (!negotiated) return disposeSocket();
      
      // Step 2: Resolving command type.
      async function resolveCommandType(): Promise<{resolved: boolean, cmdType: Socks5CommandType, cmdData: any}> {
        return new Promise<{resolved: boolean, cmdType: Socks5CommandType, cmdData: any}>(resolve => {
          _this._pluginPivot.resolveCommandType(negotiationOptions, (success, cmdType, data, reason) => {
            if (!success) logger.info(reason);
            resolve({ resolved: success, cmdType, cmdData: data });
          });
        });
      }
      
      let { resolved, cmdType, cmdData } = await resolveCommandType();
      if (!resolved) return disposeSocket();
      
      // Step 3: Process command
      async function processCommandAsync(): Promise<boolean> {
        let cmdOpts: ICommandOptions = {
          data: cmdData,
          cipherAlgorithm: _this.cipherAlgorithm,
          password: _this.password,
          clientSocket: socket
        };
        
        return new Promise<boolean>(resolve => {
          _this._pluginPivot.processCommand(cmdOpts, (success, reason) => {
            if (!success) logger.info(reason);
            resolve(success);
          });
        });
      }
      
      let cmdProcessed = await processCommandAsync();
      if (!cmdProcessed) return disposeSocket();
      
      
      // let data = await socket.readAsync();
      // if (!data) return socket.destroy();
      
      // Step 1: Negotiate with client.
      // let decipher = crypto.createDecipher(_this.cipherAlgorithm, _this.password);
      // let negotiationBuf = Buffer.concat([decipher.update(data), decipher.final()]);
      
      // try {
      //   let msg = JSON.parse(negotiationBuf.toString('utf8'));
      // } catch(ex) {
      //   socket.end();
      //   return socket.destroy();
      // }
      
    });
    
    server.listen(this.port);
    server.on('error', (err) => logger.error(err.message));

    this._server = server;
  }
  
  stop() {
    if (!this._server) return;
    
    this._server.removeAllListeners();
    this._server.close();
    this._server.destroy();
    this._server = null;
  }
}