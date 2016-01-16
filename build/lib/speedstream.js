//-----------------------------------
// Copyright(c) 2016 Neko
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
class SpeedStream extends stream.Transform {
    /**
     * speed: KB/s
     */
    constructor(speed) {
        super();
        this.bytesPerSecond = 0;
        this.sentBytes = 0;
        this.chunkCount = 0;
        this.interval = 0;
        if (speed < 1)
            throw Error('can be negative speed');
        this.bytesPerSecond = speed * 1024;
    }
    _transform(chunk, encoding, done) {
        let me = this;
        if (!me.writable)
            return;
        setTimeout(() => {
            if (!me.writable) {
                me.interval = 0;
                me.sentBytes = 0;
                me.chunkCount = 0;
                return;
            }
            me.push(chunk, encoding);
            done();
            if (me.sentBytes > me.bytesPerSecond) {
                let avgChunkSize = me.sentBytes / me.chunkCount;
                me.interval = avgChunkSize / me.bytesPerSecond * 1000;
                me.sentBytes = 0;
                me.chunkCount = 0;
            }
        }, me.interval).unref();
        me.sentBytes += chunk.length;
        me.chunkCount++;
    }
}
exports.SpeedStream = SpeedStream;
