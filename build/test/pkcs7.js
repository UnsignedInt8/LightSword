//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
const kinq = require('kinq');
const pkcs7 = require('../lib/pkcs7');
const assert = require('assert');
kinq.enable();
describe('test pkcs7', () => {
    it('should be 16 bytes', () => {
        assert(pkcs7.pad([0x2]).length === 16);
        assert(pkcs7.pad([]).length === 16);
    });
    it('should be 32 bytes', () => {
        let bytes = pkcs7.pad(new Buffer(17).fill(3));
        assert(bytes.length === 32);
        assert(kinq.toLinqable(bytes).skip(17).all(i => i === 15));
    });
    it('should be 1 bytes', () => {
        let padded = pkcs7.pad([1]);
        assert(pkcs7.unpad(padded).length === 1);
    });
});
