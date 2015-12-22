//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as stream from 'stream';

export class XorStream extends stream.Transform {
  xor: number;
  xorBytes: number[] = [];
  
  constructor(x: number) {
    super()
    this.xor = x;
  }
  
  _transform(chunk, encoding, done) {
    if (Buffer.isBuffer(chunk)) {
      let data = <Buffer>chunk;
      this.push(new Buffer(data.select(n => n ^ 7).toArray()));
    }
    done();
  }
  
}