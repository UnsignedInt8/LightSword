//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------

'use strict'

import { Chacha20 } from './chacha20';
import * as stream from 'stream';

export class Chacha20Stream extends stream.Transform {
  private chacha20: Chacha20;
  
  constructor(key: Buffer, iv: Buffer, counter?: number) {
    super()
    this.chacha20 = new Chacha20(key, iv, counter);
  }
  
  _transform(chunk: Buffer, encoding, done: Function) {
    let me = this;
    
    this.push(me.chacha20.update(chunk));
    done();
  }
  
  update(raw: Buffer): Buffer {
    return this.chacha20.update(raw);
  }
  
  final(): Buffer {
    return new Buffer(0);
  }
}
