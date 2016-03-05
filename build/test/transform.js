//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
require('kinq').enable();
const fs = require('fs');
const assert = require('assert');
const ms = require('memory-stream');
const xorstream_1 = require('../lib/xorstream');
describe('test XorStream', () => {
    it('Compare XorStream', (done) => {
        let mems = new ms();
        let xor1Stream = new xorstream_1.XorStream(5);
        let xor2Stream = new xorstream_1.XorStream(5);
        mems.on('finish', () => {
            let fc = fs.readFileSync('./README.md').toString();
            assert(mems.toString() === fc);
            done();
        });
        fs.createReadStream('./README.md').pipe(xor1Stream).pipe(xor2Stream).pipe(mems);
    });
});
