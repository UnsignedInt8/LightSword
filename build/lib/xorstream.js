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
var stream = require('stream');
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
