//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as stream from 'stream';

export class XorStream extends stream.Duplex {
  xor: number;
  xorBytes: number[] = [];
  
  constructor(x: number) {
    super()
    this.xor = x;
  }
  
  _write(chunk: any, encoding: string, callback: Function): void {
    if (Buffer.isBuffer(chunk)) {
      let data = <Buffer>chunk;
      this.xorBytes = this.xorBytes.concat(data.select(n => n ^ this.xor).toArray())
      console.log('xor', data.length);
    }
    
    callback();
  }
  
  _read(size: number) {
    while (this.xorBytes.length) {
      if (!this.push(this.xorBytes.shift())) {
        break;
      }
    }
  }
}