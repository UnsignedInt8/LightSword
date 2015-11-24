//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as net from 'net';
import * as dgram from 'dgram';
import * as crypto from 'crypto';
import { ISocks5, INegotiationOptions, ICommandOptions, IStreamTransportOptions } from '../socks5/plugin';
import { negotiateAsync } from './lightsword';

class LightSwordUdpAssociate implements ISocks5 {
  cipherKey: string;
  vNum: number = 0;
  
  async negotiate(options: INegotiationOptions, callback: (success: boolean, reason?: string) => void) {
    let result = await negotiateAsync(options);
    
    let success = result.success;
    let reason = result.reason;
    
    this.cipherKey = result.cipherKey;
    this.vNum = result.vNum;
    callback(success, reason);
  }
  
  async sendCommand(options: ICommandOptions, callback: (success: boolean, reason?: string) => void) {
    
  }
  
  async transport(options: IStreamTransportOptions) {
    
  }
}

module.exports = LightSwordUdpAssociate;