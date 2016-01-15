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
var chacha20_1 = require('./chacha20');
var stream = require('stream');
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
