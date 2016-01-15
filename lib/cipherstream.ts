//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------

'use strict'

import * as stream from 'stream';
import * as crypto from 'crypto';

export class CipherStream extends stream.Transform {
  encrypt = false;
  algorithm = '';
  key: Buffer;
  iv: Buffer;
  segmentSize: number;
  
  constructor(encryptOrDecrypt: boolean, algorithm: string, key: Buffer, iv: Buffer, segmentSize: number) {
    super();
    
    this.encrypt = encryptOrDecrypt;
    this.algorithm = algorithm;
    this.key = key;
    this.iv = iv;
    this.segmentSize = segmentSize;
  }
  
  _transform(chunk: Buffer, encoding, done) {
    let me = this;
    
    
    let cipher = crypto.createCipheriv(me.algorithm, me.key, me.iv);
    
  }
}