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
var stream = require('stream');
var ms = require('memory-stream');
// import { XorStream } from '../server/osxcl5/xorStream';
function _transform(chunk, encoding, done) {
    if (Buffer.isBuffer(chunk)) {
        let data = chunk;
        console.log(data.length);
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
    });
});
