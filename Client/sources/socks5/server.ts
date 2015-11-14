//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import { defaultQueue } from '../lib/dispatchQueue';
import * as consts from './consts';
import * as util from 'util';

export class Server {
  public addr = 'localhost';
  public port = 1080;
  public password = 'lightsword';
  public cipherAlgoirthm = 'aes-256-cfb';
  public remoteAddr = '';
  public remotePort = 23333;
  public timeout = 60;
  public socks5Username = '';
  public socks5Password = '';
  private _server: net.Server;
  private static SupportedNegotiatonMethods = [consts.AUTHENTICATION.NOAUTH, consts.AUTHENTICATION.USERPASS];
  private static SupportedVersions = [consts.SOCKS_VER.V5, consts.SOCKS_VER.V4];
  
  public start(): boolean {
    let _this = this;
    let server = net.createServer(async (socket) => {
      let data = await socket.readAsync();
      if (!data) return socket.destroy();
      
      // Step1: Negotitate with client.
      let res = <number[]>[consts.SOCKS_VER.V5];
      res.push(_this.handleHandshake(data));
      await socket.writeAsync(new Buffer(res));
      
      // Step2: Autenticate with client.
      if (res[1] === consts.AUTHENTICATION.NONE) return socket.destroy();
      if (res[1] === consts.AUTHENTICATION.USERPASS) {
        data = await socket.readAsync();
        let success = _this.handleAuthentication(data);
        if (!success) return socket.destroy();
      }
      
      // Step3: Refine requests.
      data = await socket.readAsync();
      let request = _this.refineRequest(data);
      if (!request) return socket.destroy();
      
      // Step4: Dispatch request
      defaultQueue.publish(request.cmd.toString(), { request, socket });
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
  
  private handleHandshake(data: Buffer): consts.AUTHENTICATION {
    if (!Server.SupportedVersions.any(i => i === data[0])) return consts.AUTHENTICATION.NONE;
    
    let methodCount = data[1];
    let methods = data.skip(2).take(methodCount).toArray();
    
    if (methods.contains(consts.AUTHENTICATION.NOAUTH)) {
      return consts.AUTHENTICATION.NOAUTH;
    } else if (methods.contains(consts.AUTHENTICATION.USERPASS)) {
      return consts.AUTHENTICATION.USERPASS;
    } else if (methods.contains(consts.AUTHENTICATION.GSSAPI)) {
      // TO DO: implement GSSAPI authentication
    }
    
    return consts.AUTHENTICATION.NONE;
  }
  
  private handleAuthentication(data: Buffer): boolean {
    if (!data || data[0] !== 0x01) return false;
    
    let userLength = data[1];
    let username = data.toString('utf8', 2, 2 + userLength);
    let passLength = data[2 + userLength]
    let password = data.toString('utf8', 2 + userLength + 1, 2 + userLength + 1 + passLength);
    
    return username == this.socks5Username && password == this.socks5Password;
  }
  
  private refineRequest(data: Buffer): { cmd: consts.REQUEST_CMD, addr: string, port: number } {
    if (!data || data[0] === consts.SOCKS_VER.V5) return null;
    
    let cmd = data[1];
    let atyp = data[3];
    let addr = '';
    let port = data.readUInt16BE(data.length - 2);
    
    switch(atyp) {
      case consts.ATYP.DN:
        let dnLength = data[4];
        addr = data.toString('utf8', 5, 5 + dnLength);
        break;
        
      case consts.ATYP.IPV4:
        addr = data.skip(4).take(4).aggregate((c: string, n) => c.length > 1 ? c + util.format('.%d', n) : util.format('%d.%d', c, n));
        break;
        
      case consts.ATYP.IPV6: 
        let bytes = data.skip(4).take(16).toArray();
        for (let i = 0; i < 8; i++) {
          addr += (new Buffer(bytes.skip(i * 2).take(2).toArray()).toString('hex') + (i < 7 ? ':' : ''));
        }
        break;
        
      default:
        return null;
    }
    
    return { cmd, addr, port };
  }
}
