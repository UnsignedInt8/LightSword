//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

require('kinq').enable();
import * as fs from 'fs';
import * as assert from 'assert';
import * as stream from 'stream';
import * as ms from 'memory-stream';
import { XorStream } from '../lib/xorstream';

describe('test XorStream', () => {
  
  it('Compare XorStream', (done) => {
    
    let mems = new ms();
    let xor1Stream = new XorStream(5);
    let xor2Stream = new XorStream(5);
    
    mems.on('finish', () => {
      let fc = fs.readFileSync('./README.md').toString();
      assert(mems.toString() === fc);
      done();
    });
    
    fs.createReadStream('./README.md').pipe(xor1Stream).pipe(xor2Stream).pipe(mems);
  })
});