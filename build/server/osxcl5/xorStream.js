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
var stream = require('stream');
class XorStream extends stream.Duplex {
    constructor(x) {
        super();
        this.xorBytes = [];
        this.xor = x;
    }
    _write(chunk, encoding, callback) {
        if (Buffer.isBuffer(chunk)) {
            let data = chunk;
            this.xorBytes = this.xorBytes.concat(data.select(n => n ^ this.xor).toArray());
            console.log('xor', data.length);
        }
        callback();
    }
    _read(size) {
        while (this.xorBytes.length) {
            if (!this.push(this.xorBytes.shift())) {
                break;
            }
        }
    }
}
exports.XorStream = XorStream;
