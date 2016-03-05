//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
const stream = require('stream');
class XorStream extends stream.Transform {
    constructor(x) {
        super();
        this.xor = x;
    }
    _transform(chunk, encoding, done) {
        let me = this;
        if (Buffer.isBuffer(chunk)) {
            let data = chunk;
            this.push(new Buffer(data.select(n => n ^ me.xor).toArray()));
        }
        else {
            this.push(chunk);
        }
        done();
    }
}
exports.XorStream = XorStream;
