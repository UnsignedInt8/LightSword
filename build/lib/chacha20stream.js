//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
const chacha20_1 = require('./chacha20');
const stream = require('stream');
class Chacha20Stream extends stream.Transform {
    constructor(key, iv, counter) {
        super();
        this.chacha20 = new chacha20_1.Chacha20(key, iv, counter);
    }
    _transform(chunk, encoding, done) {
        let me = this;
        this.push(me.chacha20.update(chunk));
        done();
    }
    update(raw) {
        return this.chacha20.update(raw);
    }
    final() {
        return new Buffer(0);
    }
}
exports.Chacha20Stream = Chacha20Stream;
