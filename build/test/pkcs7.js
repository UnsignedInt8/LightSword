//-----------------------------------
// Copyright(c) 2015 Neko
//-----------------------------------
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, Promise, generator) {
    return new Promise(function (resolve, reject) {
        generator = generator.call(thisArg, _arguments);
        function cast(value) { return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); }); }
        function onfulfill(value) { try { step("next", value); } catch (e) { reject(e); } }
        function onreject(value) { try { step("throw", value); } catch (e) { reject(e); } }
        function step(verb, value) {
            var result = generator[verb](value);
            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);
        }
        step("next", void 0);
    });
};
var kinq = require('kinq');
var pkcs7 = require('../lib/pkcs7');
var assert = require('assert');
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
