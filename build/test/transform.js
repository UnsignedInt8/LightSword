//-----------------------------------
// Copyright(c) 2015 猫王子
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
require('kinq').enable();
var fs = require('fs');
var assert = require('assert');
var ms = require('memory-stream');
var xorStream_1 = require('../server/osxcl5/xorStream');
describe('test XorStream', () => {
    it('Compare XorStream', (done) => {
        let mems = new ms();
        let xor1Stream = new xorStream_1.XorStream(5);
        let xor2Stream = new xorStream_1.XorStream(5);
        mems.on('finish', () => {
            let fc = fs.readFileSync('./README.md').toString();
            assert(mems.toString() === fc);
            done();
        });
        fs.createReadStream('./README.md').pipe(xor1Stream).pipe(xor2Stream).pipe(mems);
    });
});
