//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------

'use strict'

import * as stream from 'stream';

export class XorStream extends stream.Transform {
  xor: number;
  
  constructor(x: number) {
    super()
    this.xor = x;
  }
  
  _transform(chunk, encoding, done) {
    let me = this;
    
    if (Buffer.isBuffer(chunk)) {
      let data = <Buffer>chunk;
      this.push(new Buffer(data.select(n => n ^ me.xor).toArray()));
    } else {
      this.push(chunk);
    }
    done();
  }
  
}