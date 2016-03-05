//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
const stream = require('stream');
const crypto = require('crypto');
class CipherStream extends stream.Transform {
    constructor(encryptOrDecrypt, algorithm, key, iv, segmentSize) {
        super();
        this.encrypt = false;
        this.algorithm = '';
        this.encrypt = encryptOrDecrypt;
        this.algorithm = algorithm;
        this.key = key;
        this.iv = iv;
        this.segmentSize = segmentSize;
    }
    _transform(chunk, encoding, done) {
        let me = this;
        let cipher = crypto.createCipheriv(me.algorithm, me.key, me.iv);
    }
}
exports.CipherStream = CipherStream;
