//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

require('kinq').enable();
import * as fs from 'fs';
import * as assert from 'assert';
import * as stream from 'stream';
import * as ms from 'memory-stream';
// import { XorStream } from '../server/osxcl5/xorStream';


function _transform(chunk, encoding, done) {
  if (Buffer.isBuffer(chunk)) {
    let data = <Buffer>chunk;
    this.push(new Buffer(data.select(n => n ^ 7).toArray()));
  }
  done();
}

describe('test XorStream', () => {
  
  it('tow xor', (done) => {
    
    let mems = new ms();
    let xor1Stream = new stream.Transform();
    xor1Stream._transform = _transform;
    let xor2Stream = new stream.Transform();
    xor2Stream._transform = _transform;
    
    mems.on('finish', () => {
      let fc = fs.readFileSync('./README.md').toString();
      assert(mems.toString() === fc);
      done();
    });
    
    fs.createReadStream('./README.md').pipe(xor1Stream).pipe(xor2Stream).pipe(mems);
  })
});