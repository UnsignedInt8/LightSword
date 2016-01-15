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
var crypto = require('crypto');
class CipherStream extends stream.Transform {
    constructor(encryptOrDecrypt, algorithm, key, iv, segmentSize) {
        super();
        this.encrypt = false;
        this.algorithm = '';
        this.encrypt = encryptOrDecrypt;
        this.algorithm = algorithm;
        this.key = key;
        this.iv = iv;
        this.segmentSize = segmentSize;
    }
    _transform(chunk, encoding, done) {
        let me = this;
        let cipher = crypto.createCipheriv(me.algorithm, me.key, me.iv);
    }
}
exports.CipherStream = CipherStream;
